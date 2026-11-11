"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./monitor.module.css";

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
 * the pointer, Enter or Space. The click opens the work in a new tab.
 *
 * Under reduced motion it never moves; only the screen's brightness answers.
 */
export function Monitor({
  href,
  label,
  image,
  sizes,
  glow,
  chin,
  className = "",
}: {
  href: string;
  /** the accessible name, e.g. "Frames, the live site (opens in a new tab)" */
  label: string;
  image: { src: string; w: number; h: number; alt: string };
  sizes: string;
  /** the screen's spill colour */
  glow: string;
  /** the address printed on the chin */
  chin: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const held = useRef(false);
  const [pressed, setPressed] = useState(false);

  const press = (on: boolean) => {
    held.current = on;
    setPressed(on);
  };

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={label}
      className={`${styles.monitor} ${className}`}
      data-pressed={pressed ? "" : undefined}
      style={{ ["--glow" as string]: glow }}
      onClick={once}
      onPointerDown={(e) => {
        if (e.button === 0) press(true);
      }}
      onPointerUp={() => press(false)}
      onPointerLeave={() => press(false)}
      onPointerCancel={() => press(false)}
      onBlur={() => press(false)}
      onKeyDown={(e) => {
        if (e.repeat) return;
        if (e.key === " ") {
          // a link scrolls the page on Space; this one presses instead
          e.preventDefault();
          press(true);
        } else if (e.key === "Enter") {
          // the browser follows the link on keydown — just show the press
          press(true);
          window.setTimeout(() => press(false), 120);
        }
      }}
      onKeyUp={(e) => {
        if (e.key !== " ") return;
        e.preventDefault();
        if (!held.current) return;
        press(false);
        ref.current?.click();
      }}
    >
      <span className={styles.rig}>
        <span className={styles.bezel}>
          <span className={styles.screen}>
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
    </a>
  );
}
