"use client";

/**
 * The one control that emits light instead of taking it.
 *
 * Everything interactive on this site answers the pointer by taking more
 * light — type gains weight, a mat lifts, a frame haloes. That grammar is
 * about *response*, and it needs the pointer to already be there, so it
 * cannot draw the eye to something you have not found yet.
 *
 * So this is the exception, and it is the only one: an elliptical halo keyed
 * to the room's own --spill, breathing very slowly underneath the word.
 *
 * It is a glyph, not a word. Two earlier passes were both wrong in the same
 * way: 12px metadata read as a caption, and promoting it to display type put
 * a chunky sans word next to the mono rig line where it competed with the
 * metadata and looked bolted on. A mark solves what neither did — it is
 * recognised without being read, it carries no typographic voice to clash
 * with the label, and it can sit tight to the picture at any size.
 *
 * Drawn as a tray with the frame leaving it: hairline stroke, the same weight
 * as every rule on the site.
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
        className={`share-button ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="share-halo" aria-hidden="true" />
        <svg
          className="share-glyph"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* the tray, open at the top — the frame the picture leaves by */}
          <path
            className="share-tray"
            d="M6.4 11.6v6.2a1.6 1.6 0 0 0 1.6 1.6h8a1.6 1.6 0 0 0 1.6-1.6v-6.2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
          />
          {/* and the frame leaving it */}
          <path
            className="share-out"
            d="M12 14.4V4.6M12 4.6 8.5 8.1M12 4.6l3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
        <span className="sr-only">Share this frame</span>
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
