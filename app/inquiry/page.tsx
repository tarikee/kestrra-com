import type { Metadata } from "next";
import { InquiryForm } from "@/components/inquiry-form";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Inquiry",
  description:
    "Get in touch with Kestrra: a shoot in mind, a project to build, or an idea you're trying to figure out. Photography and film across Europe; websites, apps and software.",
};

export default function InquiryPage() {
  return (
    <main className="mx-[var(--margin)] pt-[20svh]">
      <header className="grid gap-y-8 md:grid-cols-12 md:gap-x-[2.5vw]">
        <MetaLight className="md:col-span-7">
          <p className="type-meta-sm text-low" data-lit>
            Get in touch
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            Let&rsquo;s make something happen.
          </LetterLight>
        </MetaLight>
        <MetaLight className="max-w-[40ch] md:col-span-4 md:col-start-9 md:self-end">
          <p className="type-body text-mid">
            Whether you have a shoot in mind, a project to build, or just an
            idea you&rsquo;re trying to figure out, I&rsquo;d love to hear
            about it. Tell me a little about what you&rsquo;re working on.
          </p>
          <p className="type-meta-sm mt-5 text-low" data-lit>
            <span className="whitespace-nowrap">replies within a couple of days</span> ·{" "}
            <span className="whitespace-nowrap">English or Serbian</span>
          </p>
        </MetaLight>
      </header>

      <div className="mt-[12svh] max-w-[880px]">
        <InquiryForm />
      </div>
    </main>
  );
}
