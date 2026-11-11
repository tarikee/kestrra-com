"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./screen-view.module.css";

const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const OPEN = { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)" };
const SHUT = { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)" };

/**
 * A framed screenshot, taken out of its frame and held up close.
 *
 * The picture grows out of the small frame it sat in and goes back into it
 * on close; the page behind is dimmed and blurred, the way the gallery's plate
 * holds the room. Under it: the name, the address, and the way out to the
 * work itself (the live site, the public code, or both). Escape, the close
 * control or a click beside the picture puts it back.
 *
 * Under reduced motion the picture doesn't travel; it only fades.
 */
export function ScreenView({
  name,
  address,
  live,
  cta = "visit the site",
  code,
  image,
  glow,
  from,
  onClose,
}: {
  name: string;
  address: string;
  live?: string;
  cta?: string;
  code?: string;
  image: { src: string; w: number; h: number; alt: string };
  glow: string;
  /** the small picture this one grows from and returns to */
  from: () => HTMLElement | null;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const shot = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  /** the small picture's place, written as a transform on the large one */
  const offset = useCallback(() => {
    const a = from()?.getBoundingClientRect();
    const b = shot.current?.getBoundingClientRect();
    if (!a || !b || !a.width || !b.width) return null;
    const x = a.left + a.width / 2 - (b.left + b.width / 2);
    const y = a.top + a.height / 2 - (b.top + b.height / 2);
    return `translate(${x}px, ${y}px) scale(${a.width / b.width})`;
  }, [from]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    // the same hold on the room as an open plate: smooth scroll stands down,
    // the page under the blur stays where it is
    document.body.dataset.plate = "true";
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    d.showModal();
    const t = offset();
    if (t && !still()) shot.current?.animate([{ transform: t }, { transform: "none" }], OPEN);
    return () => {
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.plate;
    };
  }, [offset]);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const d = dialog.current;
    const done = () => {
      d?.close();
      onClose();
    };
    if (!d) return done();
    d.dataset.closing = "";
    const t = offset();
    if (t && !still() && shot.current) {
      shot.current
        .animate([{ transform: "none" }, { transform: t }], { ...SHUT, fill: "forwards" })
        .finished.then(done, done);
    } else {
      window.setTimeout(done, 140);
    }
  }, [offset, onClose]);

  /** a click beside the picture closes; the second click of a double click
      that opened it does not */
  const beside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && e.detail < 2) close();
  };

  return createPortal(
    <dialog
      ref={dialog}
      className={styles.view}
      aria-label={`${name}, screenshot`}
      style={{ ["--glow" as string]: glow, ["--ratio" as string]: String(image.w / image.h) }}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={() => {
        if (!closing.current) onClose();
      }}
      onClick={beside}
    >
      <button type="button" onClick={close} className={`room-exit type-meta ${styles.exit}`}>
        ← close
      </button>

      <div className={styles.stage} onClick={beside}>
        <figure className={styles.figure}>
          <div ref={shot} className={styles.shot}>
            <Image
              src={image.src}
              width={image.w}
              height={image.h}
              alt={image.alt}
              sizes="(min-width: 768px) 82vw, 94vw"
              className={styles.img}
              draggable={false}
            />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.name}>
              <span className="type-meta text-hi">{name}</span>
              <span className="type-meta-sm text-low">{address}</span>
            </span>
            {(live || code) && (
              <span className={styles.actions}>
                {live && (
                  <a href={live} target="_blank" rel="noopener" className="btn">
                    <span className="btn-label">{cta}</span>
                    <span className="btn-arrow" aria-hidden="true">
                      <span>↗</span>
                    </span>
                  </a>
                )}
                {code && (
                  <a href={code} target="_blank" rel="noopener" className="btn">
                    <span className="btn-label">{code.includes("github.com") ? "github" : "code"}</span>
                    <span className="btn-arrow" aria-hidden="true">
                      <span>↗</span>
                    </span>
                  </a>
                )}
              </span>
            )}
          </figcaption>
        </figure>
      </div>
    </dialog>,
    document.body
  );
}
