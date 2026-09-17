/**
 * Getting a card off the page — a still, or a loop.
 *
 * Everything runs in the browser. No upload, no round trip, no Worker
 * invocation, which keeps the free tier free and means the photograph never
 * leaves the machine to be turned into a share card.
 *
 * `mp4-muxer` is imported dynamically and only when a loop is actually
 * requested, so nothing here reaches the bundle that serves /gallery.
 */
import type { CardRenderer } from "./compose";

export const LOOP_SECONDS = 6;
export const LOOP_FPS = 30;

/** The still. One draw at full resolution, at rest. */
export async function exportStill(
  r: CardRenderer,
  canvas: HTMLCanvasElement,
  W: number,
  H: number
): Promise<Blob> {
  r.resize(W, H);
  r.draw(0);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
  if (!blob) throw new Error("the browser would not encode the card");
  return blob;
}

/**
 * H.264 profile/level strings, widest support first. A level too low for the
 * frame size is rejected outright by the encoder rather than degrading, so
 * this probes rather than assumes — 1080×1920 needs level 4 and up, which
 * the baseline 3.1 string most examples use cannot carry.
 */
const CODECS = ["avc1.640834", "avc1.4d0034", "avc1.640028", "avc1.42002a"];

async function pickCodec(width: number, height: number, framerate: number) {
  for (const codec of CODECS) {
    try {
      const { supported, config } = await VideoEncoder.isConfigSupported({
        codec, width, height, framerate, bitrate: 10_000_000,
      });
      if (supported && config) return config;
    } catch {
      /* try the next */
    }
  }
  return null;
}

export function canExportLoop(): boolean {
  return typeof VideoEncoder !== "undefined" && typeof VideoFrame !== "undefined";
}

/**
 * The loop. The ground drifts out and back rather than cutting — the field is
 * fbm noise and is not periodic, so playing it forward and reversing is what
 * makes the loop genuinely seamless instead of jumping at the wrap. The site
 * already reads moving images this way: components/orbit-loop.tsx is a
 * stop-motion boomerang for exactly the same reason.
 *
 * At the ground's own drift rate the turn is imperceptible; what you see is a
 * slow breath. The rate is deliberately not raised for export — a louder
 * background would be a different design, not a louder version of this one.
 */
export async function exportLoop(
  r: CardRenderer,
  canvas: HTMLCanvasElement,
  W: number,
  H: number,
  onProgress?: (fraction: number) => void
): Promise<Blob> {
  if (!canExportLoop()) throw new Error("this browser cannot encode video");

  const total = LOOP_SECONDS * LOOP_FPS;
  const config = await pickCodec(W, H, LOOP_FPS);
  if (!config) throw new Error("no supported H.264 configuration for this size");

  const { Muxer, ArrayBufferTarget } = await import("mp4-muxer");
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({
    target,
    video: { codec: "avc", width: W, height: H, frameRate: LOOP_FPS },
    fastStart: "in-memory", // the file is played from disk, not streamed
  });

  let failure: Error | null = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => { failure = e instanceof Error ? e : new Error(String(e)); },
  });
  encoder.configure({ ...config, bitrate: 10_000_000, latencyMode: "quality" });

  r.resize(W, H);

  try {
    for (let i = 0; i < total; i++) {
      if (failure) throw failure;
      // out and back — 0 → LOOP_SECONDS → 0 across the whole clip
      const phase = i / total;
      const t = (phase < 0.5 ? phase * 2 : (1 - phase) * 2) * LOOP_SECONDS;
      r.draw(t);

      const frame = new VideoFrame(canvas, {
        timestamp: Math.round((i * 1e6) / LOOP_FPS),
        duration: Math.round(1e6 / LOOP_FPS),
      });
      encoder.encode(frame, { keyFrame: i % (LOOP_FPS * 2) === 0 });
      frame.close();

      // hand the main thread back often enough that the panel can repaint its
      // progress and the tab never reads as hung
      if (i % 6 === 0) {
        onProgress?.(i / total);
        await new Promise((res) => setTimeout(res, 0));
        // don't let the encoder queue run away with memory on a slow machine
        while (encoder.encodeQueueSize > 12) await new Promise((res) => setTimeout(res, 8));
      }
    }

    await encoder.flush();
    if (failure) throw failure;
    muxer.finalize();
    onProgress?.(1);
    return new Blob([target.buffer], { type: "video/mp4" });
  } finally {
    if (encoder.state !== "closed") encoder.close();
  }
}

/** A filename that says what it is a year from now. */
export function cardFilename(context: string | null, id: string, ratio: string, ext: string) {
  const slug = (context ?? "kestrra")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `kestrra-${slug}-${id}-${ratio.replace(":", "x")}.${ext}`;
}

/** Hand the file to the browser. Same-origin blob, so a plain anchor is the
    whole mechanism — no library, no popup. */
export function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // revoke late — Safari has been known to cancel a download whose object URL
  // is released in the same tick
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
