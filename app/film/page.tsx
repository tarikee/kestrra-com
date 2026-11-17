import type { Metadata } from "next";
import { getAllFilms } from "@/lib/film";
import { FilmRow } from "@/components/film-row";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Music video colorist and color grading, Belgrade",
  description:
    "Music video color grading by a colorist in Belgrade, Serbia: Bubili, Nanogica and Loša kopija, each with the log footage and the grade side by side.",
};

export default function FilmPage() {
  const films = getAllFilms();

  return (
    <main className="pt-[12svh] md:pt-[15svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          Photo &amp; film
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Film
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          Selected music videos I color graded
        </p>
      </MetaLight>

      <section id="film" aria-label="Music videos" className="relative mt-[7svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            Film · music videos
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            selected work
          </p>
        </MetaLight>
        <div>
          {films.map((f, i) => (
            <FilmRow key={f.def.slug} film={f} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
