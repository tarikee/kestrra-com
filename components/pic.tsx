import type { WorkImage } from "@/lib/work";

/**
 * The only way an image ships. Pre-encoded AVIF/WebP responsive sets from the
 * pipeline (ICC intact — never Next's optimizer), thumbhash placeholder so
 * nothing ever flashes grey, explicit dimensions so CLS stays at zero.
 *
 * The img box is locked to the frame's true aspect ratio, so the thumbhash
 * always sits exactly under the pixels — no placeholder bleed into letterbox
 * bars when a size constraint bites.
 *
 * `maxH` is how a frame gets height-constrained. Never do it with
 * `width: auto; max-height: …` — an author `width: auto` beats the width
 * attribute, so a lazy frame has no intrinsic size to derive a height from
 * and reserves a 0×0 box until it decodes. Giving the *picture* a definite
 * width instead — the widest it may be at that height — keeps the ratio, the
 * centring and the reserved space, loaded or not.
 *
 * `cap` and `placeholder` exist for the Gallery wall and nowhere else. One
 * frame's full markup — five AVIF widths, three WebP, and a 4–5 kB thumbhash
 * data URI — is nothing on a set page and 1.3 MB of HTML across 125 frames,
 * which is worse for first paint than any placeholder could ever be worth.
 * On the wall a frame is never larger than about 40vw, so the big widths are
 * dead weight, and below the fold a dominant-colour swatch stops the flash
 * just as well as a thumbhash does at that size.
 */
export function Pic({
  img,
  sizes,
  priority = false,
  className,
  imgClassName,
  style,
  vtName,
  maxH,
  cap,
  placeholder = "thumbhash",
}: {
  img: WorkImage;
  /** real sizes attr — required, no lazy defaults */
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  /** shared-element view-transition name (grid → piece choreography) */
  vtName?: string;
  /** cap the frame's height — any CSS length, e.g. "84svh" */
  maxH?: string;
  /** drop srcset entries wider than this, keeping at least one */
  cap?: number;
  placeholder?: "thumbhash" | "dominant";
}) {
  const trim = (widths: number[]) => {
    if (!cap) return widths;
    const kept = widths.filter((w) => w <= cap);
    return kept.length ? kept : widths.slice(0, 1);
  };
  const avif = trim(img.avif);
  const webp = trim(img.webp);
  const avifSrcSet = avif.map((w) => `${img.base}/w${w}.avif ${w}w`).join(", ");
  const webpSrcSet = webp.map((w) => `${img.base}/w${w}.webp ${w}w`).join(", ");
  const fallback = `${img.base}/w${webp[webp.length - 1] ?? avif[0]}.webp`;
  const under =
    placeholder === "dominant"
      ? { backgroundColor: img.dominant }
      : { backgroundImage: `url(${img.thumb})`, backgroundSize: "cover" as const };

  return (
    <picture
      className={className}
      style={
        maxH
          ? {
              // picture is inline by default — a width on it would do nothing
              display: "block",
              width: `min(100%, calc(${maxH} * ${img.w} / ${img.h}))`,
              ...style,
            }
          : style
      }
    >
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallback}
        alt={img.alt}
        width={img.w}
        height={img.h}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={maxH ? `h-auto w-full ${imgClassName ?? ""}` : imgClassName}
        style={{
          aspectRatio: `${img.w} / ${img.h}`,
          ...under,
          ...(vtName ? ({ viewTransitionName: vtName } as React.CSSProperties) : null),
        }}
      />
    </picture>
  );
}
