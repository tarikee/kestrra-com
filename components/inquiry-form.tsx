"use client";

import { useActionState } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions/inquiry";
import { InstagramMark } from "@/components/instagram-mark";

const initial: InquiryState = { status: "idle" };

/** the fallback shown only when the transport is down. TODO: becomes
    inquiry@kestrra.com once Email Routing carries the custom addresses —
    see BUILD-NOTES.md. */
const INQUIRY_EMAIL = "kestrraa@gmail.com";

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
          <a href="https://instagram.com/kestrra" rel="noopener" className="t-color underline decoration-[rgb(255_255_255/0.28)] underline-offset-4 hover:text-hi">
            @kestrra
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
          className="type-meta t-color cursor-pointer text-hi underline decoration-[rgb(255_255_255/0.28)] underline-offset-[6px] hover:decoration-[rgb(255_255_255/0.7)] disabled:opacity-50"
        >
          {pending ? "sending…" : "send inquiry →"}
        </button>
        {/* the second way in. The form is the primary path, but a good share
            of this audience will always rather open a DM than fill a form —
            so it is a real invitation with the mark on it, not a footnote. */}
        <p className="type-meta text-low">
          or see the work and write on{" "}
          <a
            href="https://instagram.com/kestrra"
            rel="noopener"
            className="ig-link ig-link-lead t-color text-mid hover:text-hi"
          >
            <InstagramMark className="ig-glyph" />
            @kestrra
          </a>
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
            {"  ·  "}
            <a href="https://instagram.com/kestrra" rel="noopener" className="t-color underline decoration-[rgb(255_255_255/0.28)] underline-offset-4 hover:text-hi">
              DM @kestrra
            </a>
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
