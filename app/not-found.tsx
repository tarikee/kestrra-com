import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="mx-[var(--margin)] min-h-[70svh] pt-[12svh] md:pt-[15svh]">
      <MetaLight>
        <p className="type-meta-sm text-low" data-lit>
          404
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Nothing here
        </LetterLight>
        <p className="type-lead mt-6 max-w-[40ch] text-mid">
          This page doesn&rsquo;t exist, or it moved. The work is still all here.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/" className="btn">
            <span className="btn-label">back home</span>
            <span className="btn-arrow" aria-hidden="true">
              <span>→</span>
            </span>
          </Link>
          <span className="flex flex-wrap gap-x-7 gap-y-3">
            <Link href="/sets" className="dev-link t-color type-meta" data-lit>
              sets →
            </Link>
            <Link href="/film" className="dev-link t-color type-meta" data-lit>
              film →
            </Link>
            <Link href="/inquiry" className="dev-link t-color type-meta" data-lit>
              write to me →
            </Link>
          </span>
        </div>
      </MetaLight>
    </main>
  );
}
