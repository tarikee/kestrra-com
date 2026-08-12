import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Inquiry",
  description:
    "Start a business inquiry with Kestrra — weddings, events, clothing, and commissioned work across Europe.",
};

export default function InquiryPage() {
  return (
    <main className="mx-[var(--margin)] pt-[20svh]">
      <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-7">
          <p className="type-meta-sm text-low" data-lit>
            Inquiries
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            Work with Kestrra
          </LetterLight>
        </MetaLight>
        <p className="type-body max-w-[40ch] text-mid md:col-span-4 md:col-start-9 md:self-end">
          A wedding, an event, a drop, a day that needs photographing the way
          it actually felt. Say what it is — Kestrra replies directly.
        </p>
      </header>

      <div className="mt-[12svh] max-w-[880px]">
        <InquiryForm />
      </div>
    </main>
  );
}
