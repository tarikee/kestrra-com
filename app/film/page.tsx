import type { Metadata } from "next";
import { filmYears, getAllFilms } from "@/lib/film";
import { FilmRow, LOG_NOTE } from "@/components/film-row";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Music video colour grading",
  description: "Music videos I graded, shot or edited, each with a log view and the grade side by side.",
};

export default function FilmPage() {
  const films = getAllFilms();
  const count = String(films.length).padStart(2, "0");

  return (
    <main className="pt-[18svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          Photo &amp; film
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Film
        </LetterLight>
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {count} music videos
        </p>
        <p className="type-caption mt-3 max-w-[60ch] text-low">{LOG_NOTE}</p>
      </MetaLight>

      <section id="film" aria-label="Music videos" className="relative mt-[10svh]">
        <MetaLight className="mx-[var(--margin)] flex items-baseline justify-between border-b border-hairline pb-4">
          <h2 className="type-meta-sm text-low" data-lit>
            Film — music videos
          </h2>
          <p className="type-meta-sm text-low" data-lit>
            {filmYears(films)}
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
