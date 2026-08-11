import type { WorkImage } from "@/lib/work";

/**
 * The only way an image ships. Pre-encoded AVIF/WebP responsive sets from the
 * pipeline (ICC intact — never Next's optimizer), thumbhash placeholder so
 * nothing ever flashes grey, explicit dimensions so CLS stays at zero.
 *
 * The img box is locked to the frame's true aspect ratio, so the thumbhash
 * always sits exactly under the pixels — no placeholder bleed into letterbox
 * bars when a size constraint bites.
 */
export function Pic({
  img,
  sizes,
  priority = false,
  className,
  imgClassName,
  style,
  vtName,
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
}) {
  const avifSrcSet = img.avif.map((w) => `${img.base}/w${w}.avif ${w}w`).join(", ");
  const webpSrcSet = img.webp.map((w) => `${img.base}/w${w}.webp ${w}w`).join(", ");
  const fallback = `${img.base}/w${img.webp[img.webp.length - 1] ?? img.avif[0]}.webp`;

  return (
    <picture className={className} style={style}>
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
        className={imgClassName}
        style={{
          aspectRatio: `${img.w} / ${img.h}`,
          backgroundImage: `url(${img.thumb})`,
          backgroundSize: "cover",
          ...(vtName ? ({ viewTransitionName: vtName } as React.CSSProperties) : null),
        }}
      />
    </picture>
  );
}
