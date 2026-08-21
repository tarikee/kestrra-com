import type { Metadata } from "next";
import { collect, buildWall } from "@/lib/gallery";
import { exifLine } from "@/lib/exif";
import { GalleryWall, type SlimFrame } from "@/components/gallery-wall";
import { Pic } from "@/components/pic";
import { LetterLight, MetaLight } from "@/components/letter-light";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Every frame Kestrra has shipped, in one room — ordered by light, from the darkest exposures to the most blown.",
};

export default function GalleryPage() {
  const wall = buildWall(collect());

  // what crosses to the client: no thumbhash, no srcset arrays, one
  // pre-formatted rig line. See the note in components/gallery-wall.tsx.
  const slim: SlimFrame[] = wall.frames.map((f) => ({
    base: f.img.base,
    w: f.img.w,
    h: f.img.h,
    alt: f.img.alt,
    context: f.context,
    slug: f.slug,
    spill: f.spill,
    rig: exifLine(f.img, { lens: false }),
  }));

  return (
    <main className="pt-[18svh]">
      <MetaLight className="mx-[var(--margin)]">
        <p className="type-meta-sm text-low" data-lit>
          Archive
        </p>
        <LetterLight as="h1" className="type-d1 mt-4 text-hi">
          Gallery
        </LetterLight>
        {/* the ordering is the page, so it is the one thing worth saying */}
        <p className="type-meta mt-6 max-w-[52ch] text-mid" data-lit>
          {wall.frames.length} frames · ordered by light, darkest first
        </p>
      </MetaLight>

      <GalleryWall frames={slim}>
        {wall.rows.map((row, ri) => (
          <div
            key={ri}
            className={`wall-row ${row.align === "right" ? "ml-auto" : ""}`}
            style={{
              width: `${(row.cols / 12) * 100}%`,
              gap: `${row.gapVw}vw`,
              marginBottom: `${row.gapVw}vw`,
              ["--mgap" as string]: `${row.mGapRem}rem`,
              // the desktop estimate and the phone's are different by several
              // times over; a wrong one costs both layout shift and a
              // scrollHeight that is nonsense until everything has rendered
              ["--ih" as string]: `${Math.round(row.heightRatio * (row.cols / 12) * 90)}vw`,
              ["--mih" as string]: `calc(${row.mHeightVw}vw + ${row.mGapRem * (row.mSubRows - 1)}rem)`,
            }}
            data-cv={ri > 2 ? "" : undefined}
          >
            {row.frames.map(({ frame, widthPct, wm, mn }) => (
              <button
                key={frame.img.base}
                type="button"
                data-frame={frame.n}
                className="wall-frame"
                style={
                  {
                    width: `${widthPct}%`,
                    "--wm": wm,
                    "--mn": mn,
                  } as React.CSSProperties
                }
                aria-label={`${frame.context} — ${frame.img.alt}`}
              >
                <Pic
                  img={frame.img}
                  sizes={`${Math.max(6, Math.round((widthPct / 100) * (row.cols / 12) * 100))}vw`}
                  priority={ri === 0}
                  cap={1080}
                  placeholder={ri < 2 ? "thumbhash" : "dominant"}
                  imgClassName="block h-auto w-full"
                />
              </button>
            ))}
          </div>
        ))}
      </GalleryWall>
    </main>
  );
}
