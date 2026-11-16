import sharp from "sharp";
import { thumbHashToRGBA } from "thumbhash";

/** A thumbhash drawn as a data URI for the placeholder under a frame.
 *
 *  thumbhash's own thumbHashToDataURL writes its PNG without compression, so
 *  every placeholder costs ~4–5 kB of base64 in the page, twice over (once in
 *  the markup, once in the RSC payload). The same pixels as lossless WebP come
 *  to about a quarter of that and decode identically. */
export async function thumbDataURL(hash: Uint8Array): Promise<string> {
  const { w, h, rgba } = thumbHashToRGBA(hash);
  return webpDataURL(
    await sharp(Buffer.from(rgba), { raw: { width: w, height: h, channels: 4 } })
      .webp({ lossless: true, effort: 6 })
      .toBuffer()
  );
}

/** Re-encode an existing placeholder data URI (any format sharp reads) as
 *  lossless WebP: same pixels, smaller page. */
export async function compactDataURL(uri: string): Promise<string> {
  const [, b64 = ""] = uri.split(",", 2);
  return webpDataURL(await sharp(Buffer.from(b64, "base64")).webp({ lossless: true, effort: 6 }).toBuffer());
}

function webpDataURL(buf: Buffer): string {
  return `data:image/webp;base64,${buf.toString("base64")}`;
}
