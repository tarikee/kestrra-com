import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Get in touch",
  description:
    "Write to Tarik Ramadani (Kestrra) in Belgrade. Photography and film across Europe, and websites, apps and software.",
};

export default function InquiryPage() {
  return (
    <main className="mx-[var(--margin)] pt-[13svh] md:pt-[17svh]">
      <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-7">
          <p className="type-meta-sm text-low" data-lit>
            Inquiry
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            Write to me.
          </LetterLight>
        </MetaLight>
        <MetaLight className="max-w-[40ch] md:col-span-4 md:col-start-9 md:self-end">
          <p className="type-body text-mid [text-wrap:pretty]">
            A shoot, a film, or something you need built. A few lines are
            enough. I&rsquo;ll ask about the rest.
          </p>
          <p className="type-meta-sm mt-5 text-low" data-lit>
            <span className="whitespace-nowrap">I reply as soon as possible</span>{" "}
            <span className="whitespace-nowrap">· English or Serbian</span>
          </p>
        </MetaLight>
      </header>

      <div className="mt-[8svh] md:grid md:grid-cols-12 md:gap-x-[2.5vw]">
        <div className="md:col-span-7">
          <InquiryForm />
        </div>
      </div>
    </main>
  );
}
