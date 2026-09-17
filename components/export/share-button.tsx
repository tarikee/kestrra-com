"use client";

/**
 * The one control that emits light instead of taking it.
 *
 * Everything interactive on this site answers the pointer by taking more
 * light — type gains weight, a mat lifts, a frame haloes. That grammar is
 * about *response*, and it needs the pointer to already be there, so it
 * cannot draw the eye to something you have not found yet.
 *
 * So this is the exception, and it is the only one: a small elliptical halo
 * keyed to the room's own --spill, breathing very slowly underneath the word.
 * It is emphasis built out of the site's own material rather than stuck on
 * top of it — no accent colour, no fill, no border, no shadow. It should read
 * as a thing that is lit, not a button that is shouting.
 *
 * Under reduced motion the breath stops and the halo simply sits there, which
 * is the same emphasis without the animation.
 *
 * The Light Table itself is loaded on click. It carries a WebGL renderer, an
 * OKLab clusterer and (on demand) an MP4 muxer, and none of that belongs in
 * the bundle that has to paint /gallery.
 */
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import type { ShareFrame } from "./light-table";

const LightTable = dynamic(() => import("./light-table").then((m) => m.LightTable), {
  ssr: false,
});

export function ShareButton({
  frame,
  className = "",
}: {
  frame: ShareFrame;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`tap type-meta-sm t-color share-button ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="share-halo" aria-hidden="true" />
        <span className="share-word">share ↗</span>
      </button>
      {/* Portalled to <body> rather than rendered in place. The room hides the
          site's chrome with `body[data-export] footer { visibility: hidden }`,
          and on the piece page this button lives *in* that footer — rendered
          as a child it would hide itself the moment it opened. A fixed overlay
          has no business being owned by the element that triggered it anyway:
          out here it also cannot be trapped by an ancestor's stacking context,
          which is the same trap #main's z-10 already sets for the plate. */}
      {open &&
        mounted &&
        createPortal(<LightTable frame={frame} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

export type { ShareFrame };
