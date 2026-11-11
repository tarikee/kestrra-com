"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./monitor.module.css";
import { ScreenView } from "./screen-view";

/** a double or triple click opens the work once, not in three tabs */
const once = (e: React.MouseEvent) => {
  if (e.detail > 1) e.preventDefault();
};

/**
 * The rest of a row or card around a monitor, opening the same work — the
 * hero's picture does the same for its set. Hidden from keyboards and screen
 * readers, which get the monitor and the links.
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
 * A small screen standing on the smoke, with the work on it.
 *
 * Not a product render and not a browser: a thin dark bezel with hairline
 * edges, a chin carrying the address in mono, a slim stand, and a pool of the
 * project's own light under it. At rest the screen is dimmed; reached for, it
 * wakes (a short develop up to full brightness) and the whole thing lifts a
 * few pixels off the floor. Pressed, it sinks back for ~120 ms, the same with
 * the pointer, Enter or Space. The click holds the screenshot up close
 * (ScreenView), with the way out to the live site or the code from there.
 *
 * Under reduced motion it never moves; only the screen's brightness answers.
 */
export function Monitor({
  name,
  live,
  cta,
  code,
  image,
  sizes,
  glow,
  chin,
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
  sizes: string;
  /** the screen's spill colour */
  glow: string;
  /** the address printed on the chin */
  chin: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const screen = useRef<HTMLSpanElement>(null);
  const [pressed, setPressed] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-haspopup="dialog"
        aria-label={`${name}, view the screenshot larger`}
        className={`${styles.monitor} ${className}`}
        data-pressed={pressed ? "" : undefined}
        style={{ ["--glow" as string]: glow }}
        onClick={() => {
          setPressed(false);
          setOpen(true);
        }}
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
        <span className={styles.rig}>
          <span className={styles.bezel}>
            <span ref={screen} className={styles.screen}>
              <Image
                src={image.src}
                width={image.w}
                height={image.h}
                alt={image.alt}
                sizes={sizes}
                className={styles.shot}
                draggable={false}
              />
              <span className={styles.glass} aria-hidden="true" />
            </span>
            <span className={styles.chin} aria-hidden="true">
              <span className={styles.address}>{chin}</span>
              <span className={styles.led} />
            </span>
          </span>
          <span className={styles.stand} aria-hidden="true">
            <span className={styles.neck} />
            <span className={styles.foot} />
          </span>
        </span>
        <span className={styles.floor} aria-hidden="true" />
      </button>
      {open && (
        <ScreenView
          name={name}
          chin={chin}
          live={live}
          cta={cta}
          code={code}
          image={image}
          glow={glow}
          from={() => screen.current}
          onClose={() => {
            setOpen(false);
            ref.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </>
  );
}
