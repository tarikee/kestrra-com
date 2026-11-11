"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { DevHover } from "./dev-projects";
import { ScreenView } from "./screen-view";
import styles from "./work-frame.module.css";

/** a double or triple click opens the work once, not in three tabs */
const once = (e: React.MouseEvent) => {
  if (e.detail > 1) e.preventDefault();
};

/**
 * The rest of a row or card around a frame, opening the same work — the
 * hero's picture does the same for its set. Hidden from keyboards and screen
 * readers, which get the frame and the links.
 */
export function RowHit({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      tabIndex={-1}
      aria-hidden="true"
      onClick={once}
      className="absolute inset-0"
    />
  );
}

/**
 * The work, framed on the smoke.
 *
 * The screenshot at full strength, untouched: a hairline edge round it, the
 * project's own light on the smoke behind and below, and four crop marks just
 * outside the corners. Reached for, the marks close in and brighten, the edge
 * comes up, the light grows a little and the frame lifts ~2px; pressed, it
 * sinks back for ~120 ms (pointer, Enter or Space). The click holds the
 * screenshot up close (ScreenView), with the way out to the work from there.
 *
 * The picture itself only ever changes through the project's own hover: a
 * swap to a second state, a slow scroll down the whole page, or a slow push
 * in. Its image is fetched when the row or card is first reached for, never
 * with the page. Nothing happens on hover on touch screens; under reduced
 * motion the frame never moves, a swap is instant, scroll and push are off.
 */
export function WorkFrame({
  name,
  live,
  cta,
  code,
  image,
  hover,
  sizes,
  glow,
  address,
  zone,
  className = "",
}: {
  name: string;
  /** the live site, if there is one */
  live?: string;
  /** the label of the live button in the close-up, "visit the site" by default */
  cta?: string;
  /** the public code, if there is one */
  code?: string;
  image: { src: string; w: number; h: number; alt: string };
  hover?: DevHover;
  sizes: string;
  /** the project's spill colour, thrown on the smoke round the frame */
  glow: string;
  /** the address in the caption */
  address: string;
  /** on wide screens, the shape of the space the frame stands at the foot
      of, so frames of different shapes share one baseline (e.g. "16 / 10") */
  zone?: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const pic = useRef<HTMLSpanElement>(null);
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);

  const layer = hover && hover.kind !== "zoom" ? hover : null;
  const layerSrc = layer?.src;

  // the second image is fetched when the row or card is first reached for
  useEffect(() => {
    if (!layerSrc) return;
    const host = ref.current?.closest("article") ?? ref.current;
    if (!host) return;
    const arm = (e: PointerEvent) => {
      if (e.pointerType !== "touch") setArmed(true);
    };
    host.addEventListener("pointerenter", arm);
    return () => host.removeEventListener("pointerenter", arm);
  }, [layerSrc]);

  const style: Record<string, string> = { "--glow": glow };
  if (hover?.kind === "zoom") style["--at"] = hover.at;
  if (layer?.kind === "scroll") {
    // how far the long page travels: everything below the first screen,
    // as a share of its own height
    style["--travel"] = `${-(1 - image.h / image.w / (layer.h / layer.w)) * 100}%`;
  }

  return (
    <figure className={`${styles.holder} ${className}`}>
      <span
        className={styles.zone}
        data-zone={zone ? "" : undefined}
        style={zone ? { ["--zone" as string]: zone } : undefined}
      >
        <button
          ref={ref}
          type="button"
          aria-haspopup="dialog"
          aria-label={`${name}, view the screenshot larger`}
          className={styles.frame}
          data-pressed={pressed ? "" : undefined}
          data-hover={hover?.kind}
          data-ready={ready ? "" : undefined}
          style={style}
          onClick={() => {
            setPressed(false);
            setOpen(true);
          }}
          onFocus={() => setArmed(true)}
          onPointerDown={(e) => {
            if (e.button === 0) setPressed(true);
          }}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onBlur={() => setPressed(false)}
          onKeyDown={(e) => {
            if (!e.repeat && (e.key === " " || e.key === "Enter")) setPressed(true);
          }}
          onKeyUp={() => setPressed(false)}
        >
          <span className={styles.lift}>
            <span ref={pic} className={styles.pic}>
              <Image
                src={image.src}
                width={image.w}
                height={image.h}
                alt={image.alt}
                sizes={sizes}
                className={styles.shot}
                draggable={false}
              />
              {layer && armed && (
                <Image
                  src={layer.src}
                  width={layer.w}
                  height={layer.h}
                  alt=""
                  aria-hidden="true"
                  sizes={sizes}
                  loading="eager"
                  className={layer.kind === "swap" ? styles.swap : styles.scroll}
                  draggable={false}
                  onLoad={() => setReady(true)}
                />
              )}
            </span>
            <span className={styles.marks} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
          </span>
        </button>
      </span>
      <figcaption className={`${styles.address} type-meta-sm text-low`} data-selectable>
        {address}
      </figcaption>
      {open && (
        <ScreenView
          name={name}
          address={address}
          live={live}
          cta={cta}
          code={code}
          image={image}
          glow={glow}
          from={() => pic.current}
          onClose={() => {
            setOpen(false);
            ref.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </figure>
  );
}
