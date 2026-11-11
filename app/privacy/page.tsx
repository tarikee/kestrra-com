import type { Metadata } from "next";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Kestrra collects through the inquiry form, why, for how long, and who handles it.",
  alternates: { canonical: "/privacy" },
};

const rows: { head: string; body: React.ReactNode }[] = [
  {
    head: "Who",
    body: (
      <>
        Tarik Ramadani, trading as Kestrra, Belgrade, Serbia.{" "}
        <a data-selectable href="mailto:hello@kestrra.com" className="t-color underline decoration-[rgb(255_255_255/0.28)] underline-offset-4 hover:text-hi">
          hello@kestrra.com
        </a>
      </>
    ),
  },
  {
    head: "What is collected",
    body: "Only what you type into the inquiry form: your name, email address, what the job is for, an optional date and place, and your message. The site sets no tracking cookies.",
  },
  {
    head: "Why",
    body: "To answer your inquiry. It is not used for anything else and is not sold or shared for marketing.",
  },
  {
    head: "How long",
    body: "Up to 12 months, unless the inquiry turns into work. Then it is kept as long as the work and its records need.",
  },
  {
    head: "Who handles it",
    body: "The form is sent as an email through Cloudflare's email service, and Cloudflare also hosts the site. If that route is down, the message can go through Resend, a mail delivery service. Neither uses it for its own purposes.",
  },
  {
    head: "Your rights",
    body: "Write to the address above to see what is held about you, or to have it deleted. This follows Serbia's Law on Personal Data Protection (ZZPL) and the GDPR.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-[var(--margin)] pt-[20svh]">
      <header>
        <MetaLight>
          <p className="type-meta-sm text-low" data-lit>
            Privacy
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            What happens to your inquiry
          </LetterLight>
        </MetaLight>
      </header>
      <dl className="mt-[10svh] max-w-[880px]">
        {rows.map((r) => (
          <div key={r.head} className="grid gap-y-2 border-t border-hairline py-6 md:grid-cols-[14rem_1fr] md:gap-x-[2.5vw]">
            <dt className="type-meta-sm text-low">{r.head}</dt>
            <dd className="type-body max-w-[60ch] text-mid">{r.body}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
