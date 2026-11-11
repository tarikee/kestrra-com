"use client";

import { useActionState } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions/inquiry";
import { MetaLight } from "@/components/letter-light";
import { SocialLink } from "@/components/social";

const initial: InquiryState = { status: "idle" };

/** the fallback shown only when the transport is down */
const INQUIRY_EMAIL = "hello@kestrra.com";

const KINDS = [
  { value: "photo", label: "photo / film" },
  { value: "web", label: "website / app" },
  { value: "both", label: "both" },
];

export function InquiryForm() {
  const [state, action, pending] = useActionState(sendInquiry, initial);

  if (state.status === "sent") {
    return (
      <div className="develop border-t border-hairline pt-10" role="status">
        <p className="type-d3 text-hi">Received.</p>
        <p className="type-body mt-4 max-w-[46ch] text-mid">
          Your inquiry is in. You will hear back from Kestrra directly —
          usually within a couple of days.
        </p>
        <p className="type-meta-sm mt-8 text-low">
          in a hurry? DM{" "}
          <SocialLink kind="instagram" className="tap t-color text-mid hover:text-hi" />
          {" · or email "}
          <a
            data-selectable
            href={`mailto:${INQUIRY_EMAIL}`}
            className="t-color text-mid hover:text-hi"
          >
            {INQUIRY_EMAIL}
          </a>
        </p>
        <p className="type-meta-sm w-full text-low">
          What you send is used only to reply.{" "}
          <a href="/privacy" className="t-color text-mid underline decoration-[rgb(255_255_255/0.28)] underline-offset-4 hover:text-hi">
            Privacy →
          </a>
        </p>
      </div>
    );
  }

  const err = state.status === "invalid" ? state.errors : undefined;

  return (
    <form action={action} noValidate className="grid gap-y-9 md:grid-cols-2 md:gap-x-[2.5vw]">
      <Field label="Name" error={err?.name}>
        <input
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={!!err?.name}
          className="field"
          placeholder=" "
        />
      </Field>
      <Field label="Email" error={err?.email}>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!err?.email}
          className="field"
          placeholder=" "
        />
      </Field>
      {/* the choice is three small doors: each takes the light like a link */}
      <MetaLight className="md:col-span-2">
        <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={err?.kind ? "kind-error" : undefined}>
          <legend className="flex w-full items-baseline justify-between p-0">
            <span className="type-meta-sm text-mid">What is it for?</span>
            {err?.kind && (
              <span id="kind-error" className="type-meta-sm text-hi" role="alert">
                — {err.kind}
              </span>
            )}
          </legend>
          <div className={`mt-2 flex flex-wrap gap-x-8 gap-y-3 border-b border-hairline pb-3 ${err?.kind ? "field-error" : ""}`}>
            {KINDS.map((k) => (
              <label key={k.value} className="type-meta t-color group inline-flex cursor-pointer items-baseline gap-2 text-mid has-[:checked]:text-hi has-[:focus-visible]:text-hi hover:text-hi">
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  required
                  className="peer sr-only"
                />
                <span aria-hidden="true" className="relative top-[0.05em] inline-block size-[0.6rem] self-center rounded-full border border-[rgb(255_255_255/0.5)] transition-colors duration-[var(--duration-fast)] group-hover:border-[var(--color-hi)] peer-checked:border-[var(--color-hi)] peer-checked:bg-[var(--color-hi)]" />
                <span className="peer-checked:underline peer-checked:decoration-[rgb(255_255_255/0.5)] peer-checked:underline-offset-4 peer-focus-visible:underline" data-lit>
                  {k.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </MetaLight>
      <Field label="When — date or season" hint="optional">
        <input name="when" type="text" className="field" placeholder=" " />
      </Field>
      <Field label="Where" hint="optional">
        <input name="place" type="text" className="field" placeholder=" " />
      </Field>
      <div className="md:col-span-2">
        <Field label="What are you making?" error={err?.message}>
          <textarea
            name="message"
            rows={5}
            required
            aria-invalid={!!err?.message}
            className="field resize-y"
            placeholder=" "
          />
        </Field>
      </div>

      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="md:col-span-2 flex flex-wrap items-baseline justify-between gap-6 border-t border-hairline pt-8">
        <button
          type="submit"
          disabled={pending}
          className="btn"
        >
          <span className="btn-label">{pending ? "sending…" : "send inquiry"}</span>
          <span className="btn-arrow" aria-hidden="true">
            <span>→</span>
          </span>
        </button>
        {/* the second way in. The form is the primary path, but a good share
            of this audience will always rather open a DM than fill a form —
            so it is a real invitation with the mark on it, not a footnote. */}
        <p className="type-meta text-low">
          or DM{" "}
          <SocialLink kind="instagram" className="tap t-color text-mid hover:text-hi" />
        </p>
      </div>

      {state.status === "failed" && (
        <div className="md:col-span-2" role="alert">
          <p className="type-body text-hi">
            The form could not send just now — write directly instead:
          </p>
          <p className="type-meta mt-3 text-mid">
            <a data-selectable href={`mailto:${INQUIRY_EMAIL}`} className="t-color underline decoration-[rgb(255_255_255/0.28)] underline-offset-4 hover:text-hi">
              {INQUIRY_EMAIL}
            </a>
            {"  ·  DM "}
            <SocialLink kind="instagram" className="tap t-color hover:text-hi" />
          </p>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="type-meta-sm text-mid">{label}</span>
        {hint && <span className="type-meta-sm text-low">{hint}</span>}
        {error && (
          <span className="type-meta-sm text-hi" role="alert">
            — {error}
          </span>
        )}
      </span>
      <span className={`mt-2 block ${error ? "field-error" : ""}`}>{children}</span>
    </label>
  );
}
