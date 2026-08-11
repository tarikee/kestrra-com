"use client";

/**
 * The 2Hot4Stage stop-motion loop — the first third of the camera orbit
 * (per Tarik: the rest of the footage is cut), playing as a small
 * stop-motion boomerang inline among the set's satellite frames. The white
 * studio is the one bright element in the block — a lit aperture in the
 * dark page, still presented honestly, never matted.
 *
 * 10fps forward-then-back so there is no jump cut. Runs only while on
 * screen; reduced motion holds the first frame.
 */
import { useEffect, useRef, useState } from "react";
import orbitManifest from "@/data/generated/orbit.json";

const KEEP = Math.ceil((orbitManifest.frames as number) / 3);
const W = orbitManifest.w as number;
const H = orbitManifest.h as number;
const PAD = orbitManifest.pad as number;
const FPS = 10;

const src = (i: number) =>
  (orbitManifest.pattern as string).replace("{i}", String(i).padStart(PAD, "0"));

export function OrbitLoop() {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let bitmaps: ImageBitmap[] | null = null;
    let loading = false;
    let disposed = false;
    let raf = 0;
    let playing = false;
    let last = 0;
    let frame = 0;
    let dir = 1;

    const tick = (t: number) => {
      raf = playing ? requestAnimationFrame(tick) : 0;
      if (!bitmaps || t - last < 1000 / FPS) return;
      last = t;
      ctx.drawImage(bitmaps[frame], 0, 0, W, H);
      if (frame + dir < 0 || frame + dir >= KEEP) dir = -dir;
      frame += dir;
    };

    const play = () => {
      if (playing || !bitmaps) return;
      playing = true;
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      playing = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const load = async () => {
      if (loading) return;
      loading = true;
      try {
        const results = await Promise.all(
          Array.from({ length: KEEP }, async (_, i) => {
            const res = await fetch(src(i));
            return createImageBitmap(await res.blob());
          })
        );
        if (disposed) {
          results.forEach((b) => b.close());
          return;
        }
        bitmaps = results;
        setArmed(true);
        play();
      } catch {
        /* the still first frame remains — the block still reads */
      }
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          load();
          play();
        } else pause();
      },
      { rootMargin: "60% 0%" }
    );
    io.observe(box);

    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      pause();
      bitmaps?.forEach((b) => b.close());
    };
  }, []);

  return (
    <div ref={boxRef}>
      <div
        className="relative overflow-hidden border border-hairline-strong"
        style={{ aspectRatio: `${W} / ${H}` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src(0)}
          alt=""
          width={W}
          height={H}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ backgroundImage: `url(${orbitManifest.thumb})`, backgroundSize: "cover" }}
        />
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="t-opacity absolute inset-0 h-full w-full"
          style={{ opacity: armed ? 1 : 0 }}
        />
      </div>
      <p className="type-meta-sm mt-2 text-low">stop-motion</p>
    </div>
  );
}
