"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface InquiryState {
  status: "idle" | "sent" | "invalid" | "failed";
  errors?: Partial<Record<"name" | "email" | "message", string>>;
}

/** the structured Email Service binding — see wrangler.jsonc `send_email` */
interface SendEmailBinding {
  send(message: {
    to: string | string[];
    from: string;
    subject: string;
    text?: string;
    html?: string;
    replyTo?: string;
  }): Promise<{ messageId: string }>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** the address the Worker sends *as*. Must be on a Cloudflare Email Routing
    domain — that is what makes the send free to a verified destination. */
const FROM = "inquiry@kestrra.com";

export async function sendInquiry(
  _prev: InquiryState,
  form: FormData
): Promise<InquiryState> {
  // honeypot — bots fill it, humans never see it
  if ((form.get("company") as string)?.length) return { status: "sent" };

  const name = ((form.get("name") as string) ?? "").trim();
  const email = ((form.get("email") as string) ?? "").trim();
  const when = ((form.get("when") as string) ?? "").trim();
  const place = ((form.get("place") as string) ?? "").trim();
  const message = ((form.get("message") as string) ?? "").trim();

  const errors: InquiryState["errors"] = {};
  if (name.length < 2) errors.name = "a name, so the reply has one";
  if (!EMAIL_RE.test(email)) errors.email = "a reachable address";
  if (message.length < 10) errors.message = "a line or two about the day";
  if (Object.keys(errors).length) return { status: "invalid", errors };

  // header injection: a newline in a field would otherwise reach the subject
  const subject = `Inquiry — ${clean(name)}${when ? ` · ${clean(when)}` : ""}`;
  // null drops the line; "" is a deliberate blank one, so `filter(Boolean)`
  // would flatten the mail into a single paragraph
  const body = [
    `From: ${name} <${email}>`,
    when ? `When: ${when}` : null,
    place ? `Where: ${place}` : null,
    "",
    message,
    "",
    "— sent from kestrra.com/inquiry",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");

  if (await viaBinding({ subject, body, email })) return { status: "sent" };
  if (await viaResend({ subject, body, email })) return { status: "sent" };
  return { status: "failed" };
}

/**
 * Cloudflare Email Service.
 *
 * Free on the Workers free plan for as long as every recipient is a *verified
 * destination address* on the account — which INQUIRY_TO is. Sends to
 * verified destinations do not touch the Email Sending quota, and no third
 * party ever holds the mail. The one rule is that FROM must be on a domain
 * with Email Routing enabled, hence @kestrra.com.
 */
async function viaBinding(m: {
  subject: string;
  body: string;
  email: string;
}): Promise<boolean> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const binding = (env as unknown as { SEND_EMAIL?: SendEmailBinding })
      .SEND_EMAIL;
    const to = (env as unknown as { INQUIRY_TO?: string }).INQUIRY_TO;
    if (!binding || !to) return false;

    await binding.send({
      from: FROM,
      to,
      replyTo: m.email, // hitting reply answers the client, not the site
      subject: m.subject,
      text: m.body,
    });
    return true;
  } catch (e) {
    console.error("inquiry: send_email failed", e);
    return false;
  }
}

/** optional second transport. Unset in production; here so a transport
    outage is one secret away from being routed around. */
async function viaResend(m: {
  subject: string;
  body: string;
  email: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  if (!key || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM ?? `Kestrra <${FROM}>`,
        to: [to],
        reply_to: m.email,
        subject: m.subject,
        text: m.body,
      }),
    });
    if (!res.ok) console.error("inquiry: resend failed", res.status);
    return res.ok;
  } catch (e) {
    console.error("inquiry: resend threw", e);
    return false;
  }
}

/** one line, no control characters — anything header-bound is sanitised */
function clean(s: string): string {
  return s.replace(/[\r\n\t]+/g, " ").slice(0, 120).trim();
}
