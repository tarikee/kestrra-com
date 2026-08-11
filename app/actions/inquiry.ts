"use server";

export interface InquiryState {
  status: "idle" | "sent" | "invalid" | "failed";
  errors?: Partial<Record<"name" | "email" | "message", string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO;
  if (!key || !to) return { status: "failed" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM ?? "Kestrra <inquiry@kestrra.com>",
        to: [to],
        reply_to: email,
        subject: `Inquiry — ${name}${when ? ` · ${when}` : ""}`,
        text: [
          `From: ${name} <${email}>`,
          when && `When: ${when}`,
          place && `Where: ${place}`,
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });
    if (!res.ok) return { status: "failed" };
    return { status: "sent" };
  } catch {
    return { status: "failed" };
  }
}
