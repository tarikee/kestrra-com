"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendInquiry, type InquiryState } from "@/app/actions/inquiry";
import { MetaLight } from "@/components/letter-light";
import { SocialLink } from "@/components/social";

const initial: InquiryState = { status: "idle" };

/** the fallback shown only when the transport is down */
const INQUIRY_EMAIL = "hello@kestrra.com";

const KINDS = [
  { value: "photo", label: "photo / film / color" },
  { value: "web", label: "website / app / software" },
  { value: "both", label: "both" },
];

export function InquiryForm() {
  const [state, action, pending] = useActionState(sendInquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);

  // a form that did not send says so where the eye is, and takes the visitor
  // to the first thing to fix
  useEffect(() => {
    if (state.status !== "invalid") return;
    const first = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"] input');
    first?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div className="develop border-t border-hairline pt-10" role="status">
        <p className="type-d3 text-hi">Sent.</p>
        <p className="type-body mt-4 max-w-[46ch] text-mid">
          Thanks, I got your message. I&rsquo;ll reply as soon as possible.
        </p>
        <p className="type-meta-sm mt-8 text-low">
          in a hurry? DM{" "}
          <SocialLink kind="instagram" className="tap t-color text-mid hover:text-hi" />
          {" · or email "}
          <a
            data-selectable
            href={`mailto:${INQUIRY_EMAIL}`}
            className="dev-link t-color"
          >
            {INQUIRY_EMAIL}
          </a>
        </p>
        <p className="type-meta-sm w-full text-low">
          What you send is used only to reply.{" "}
          <a href="/privacy" className="dev-link t-color">
            Privacy →
          </a>
        </p>
      </div>
    );
  }

  const err = state.status === "invalid" ? state.errors : undefined;
  // React clears a form after every send; what was typed comes back from the
  // server and refills it, so nothing is lost to a short message
  const v = state.status === "invalid" || state.status === "failed" ? state.values : undefined;
  const missing = err ? Object.keys(err).length : 0;

  return (
    <form ref={formRef} action={action} noValidate className="grid gap-y-9 md:grid-cols-2 md:gap-x-[2.5vw]">
      <Field label="Name" error={err?.name}>
        <input
          name="name"
          type="text"
          autoCapitalize="words"
          autoComplete="name"
          enterKeyHint="next"
          required
          minLength={2}
          defaultValue={v?.name}
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
          enterKeyHint="next"
          required
          defaultValue={v?.email}
          aria-invalid={!!err?.email}
          className="field"
          placeholder=" "
        />
      </Field>
      {/* the choice is three small doors: each takes the light like a link */}
      <MetaLight className="md:col-span-2">
        <fieldset className="m-0 min-w-0 border-0 p-0" data-invalid={!!err?.kind} aria-describedby={err?.kind ? "kind-error" : undefined}>
          <legend className="flex w-full items-baseline justify-between p-0">
            <span className="type-meta-sm text-mid">What is it for?</span>
            {err?.kind && (
              <span id="kind-error" className="type-meta-sm text-hi" role="alert">
                {err.kind}
              </span>
            )}
          </legend>
          <div className={`mt-2 grid grid-cols-1 gap-y-1 sm:flex sm:flex-wrap sm:gap-x-8 border-b border-hairline pb-3 ${err?.kind ? "field-error" : ""}`}>
            {KINDS.map((k) => (
              <label key={k.value} className="type-meta t-color group inline-flex cursor-pointer items-baseline gap-2 py-2.5 text-mid has-[:checked]:text-hi has-[:focus-visible]:text-hi hover:text-hi">
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  required
                  defaultChecked={v?.kind === k.value}
                  className="peer sr-only"
                />
                <span aria-hidden="true" className="relative top-[0.05em] inline-block size-[0.8rem] self-center rounded-full border border-[rgb(241_239_236/0.6)] transition-colors duration-[var(--duration-fast)] group-hover:border-[var(--color-hi)] peer-checked:border-[var(--color-hi)] peer-checked:bg-[var(--color-hi)]" />
                <span className="peer-checked:underline peer-checked:decoration-[rgb(255_255_255/0.5)] peer-checked:underline-offset-4 peer-focus-visible:underline" data-lit>
                  {k.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </MetaLight>
      <Field label="When (date or season)" hint="optional">
        <input name="when" type="text" enterKeyHint="next" className="field" placeholder=" " defaultValue={v?.when} />
      </Field>
      <Field label="Where" hint="optional">
        <input name="place" type="text" enterKeyHint="next" className="field" placeholder=" " defaultValue={v?.place} />
      </Field>
      <div className="md:col-span-2">
        <Field label="Your message" error={err?.message}>
          <textarea
            name="message"
            rows={6}
            required
            minLength={10}
            defaultValue={v?.message}
            aria-invalid={!!err?.message}
            className="field resize-none"
            placeholder=" "
          />
        </Field>
      </div>

      {/* honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          leave this empty
          <input name="kx_check" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {missing > 0 && (
        <p className="type-meta md:col-span-2 text-hi" role="alert">
          {missing === 1 ? "Not sent yet. Check the field above." : `Not sent yet. Check the ${missing} fields above.`}
        </p>
      )}
      <div className="md:col-span-2 flex flex-wrap items-baseline justify-start gap-8 border-t border-hairline pt-8">
        <button
          type="submit"
          disabled={pending}
          className="btn"
        >
          <span className="btn-label">{pending ? "sending…" : "send"}</span>
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
            The form did not send. Email me instead:
          </p>
          <p className="type-meta mt-3 text-mid">
            <a data-selectable href={`mailto:${INQUIRY_EMAIL}`} className="dev-link t-color">
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
    <label className="field-label block">
      <span className="flex flex-wrap items-baseline justify-between">
        <span className="type-meta-sm text-mid">{label}</span>
        {hint && <span className="type-meta-sm text-mid/70">{hint}</span>}
        {error ? (
          <span className="type-meta-sm text-hi mt-1 basis-full md:mt-0 md:basis-auto" role="alert">
            {error}
          </span>
        ) : (
          !hint && (
            // said as soon as a required field is left wrong, not only after sending
            <>
              <span className="field-need-empty type-meta-sm text-hi">needed</span>
              <span className="field-need-fix type-meta-sm text-hi">check this</span>
            </>
          )
        )}
      </span>
      <span className={`mt-2 block ${error ? "field-error" : ""}`}>{children}</span>
    </label>
  );
}
