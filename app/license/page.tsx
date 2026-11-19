import type { Metadata } from "next";
import Link from "next/link";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Image licensing",
  description:
    "All photographs on kestrra.com are © Tarik Ramadani, all rights reserved. How to request a license.",
  alternates: { canonical: "/license" },
};

const rows: { head: string; body: React.ReactNode }[] = [
  {
    head: "Copyright",
    body: "All photographs on kestrra.com are by Tarik Ramadani, working as Kestrra, and are protected by copyright.",
  },
  {
    head: "Permitted use",
    body: "Linking to and sharing pages of this site.",
  },
  {
    head: "License required",
    body: "Any reproduction, publication, editing or commercial use of the photographs, including in advertising, products or AI training, requires a written license.",
  },
  {
    head: "Commissioned work",
    body: "Photographs from a commissioned job are used under the terms agreed for that job.",
  },
  {
    head: "Requesting a license",
    body: (
      <>
        Send the image link, the intended use, where it will appear and for how long through the{" "}
        <Link data-selectable href="/inquiry" className="dev-link t-color">
          inquiry form
        </Link>{" "}
        or to{" "}
        <a data-selectable href="mailto:hello@kestrra.com" className="dev-link t-color">
          hello@kestrra.com
        </a>
        . Terms are quoted per image and use.
      </>
    ),
  },
  {
    head: "Credit",
    body: "Photo: Tarik Ramadani · Kestrra",
  },
];

export default function LicensePage() {
  return (
    <main className="mx-[var(--margin)] pt-[12svh] md:pt-[15svh]">
      <header>
        <MetaLight>
          <p className="type-meta-sm text-low" data-lit>
            Licensing
          </p>
          <LetterLight as="h1" className="type-d1 mt-4 text-hi">
            Image licensing
          </LetterLight>
          <p className="type-meta mt-6 text-mid" data-lit>
            © Tarik Ramadani · All rights reserved
          </p>
        </MetaLight>
      </header>
      <MetaLight>
        <dl className="mt-[7svh] max-w-[880px]">
          {rows.map((r) => (
            <div key={r.head} className="grid gap-y-2 border-t border-hairline py-6 md:grid-cols-[14rem_1fr] md:gap-x-[2.5vw]">
              <dt className="type-meta-sm text-low" data-lit>
                {r.head}
              </dt>
              <dd className="type-body max-w-[60ch] text-mid" data-selectable>
                {r.body}
              </dd>
            </div>
          ))}
        </dl>
      </MetaLight>
    </main>
  );
}
