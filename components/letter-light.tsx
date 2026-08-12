"use client";

/**
 * Type takes the light where you hold it.
 *
 * Two components, one metaphor and one engine. The pointer is a light source;
 * type responds by taking more of it, never by moving out of the way.
 *
 *   LetterLight — display type. Overused Grotesk is variable, so the response
 *     is density: the letters gain weight on the wght axis and stand a
 *     fraction taller. Ink that takes more light gets heavier on a print.
 *
 *   MetaLight — the small type. Fragment Mono ships as a single weight, with
 *     no axis to open and no faux-bold worth having, so the response there is
 *     luminance: the label brightens toward white under the pointer and falls
 *     off along the line. Same light, different material.
 *
 * Both draw a pool that is far wider than it is tall — light rakes *along* a
 * line of type, and lighting three wrapped lines at once stops reading as
 * light and starts reading as "the text goes bold on hover".
 *
 * Off entirely under reduced motion and on coarse pointers: without a pointer
 * there is nothing to answer, and the split would only cost.
 */

import { useEffect, useRef } from "react";
import { onPointer } from "@/lib/pointer";

/* ── the pool ──────────────────────────────────────────────────────────── */

/** display type: radii in ems of the type's own size */
const D_RADIUS_X_EM = 2.2;
const D_RADIUS_Y_EM = 1.15;
/** weight added at the centre of the pool, on top of the resting weight */
const D_GAIN = 150;
/** how much a letter stands up at the centre */
const D_RISE = 0.05;

/** small type: the pool is a phrase wide and a line tall, in px */
const M_RADIUS_X = 132;
const M_RADIUS_Y = 26;
/** the alpha a lit letter reaches — just above `text-hi`, never past it far */
const M_PEAK_ALPHA = 0.95;

const SETTLE_MS = 420;

/** flat-shouldered falloff, so it reads as a pool and not as a spot */
function pool(dx: number, dy: number) {
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d >= 1) return 0;
  const u = 1 - d;
  return u * u * (3 - 2 * u);
}

function guard() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/* ── display type ──────────────────────────────────────────────────────── */

export function LetterLight({
  as = "h2",
  children,
  className,
}: {
  as?: "h1" | "h2" | "p";
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  // every branch of the union takes the same ref and the same props; narrowing
  // keeps JSX from having to reconcile three element types
  const Tag = as as "h2";
  const text = children;

  useEffect(() => {
    const el = ref.current;
    if (!el || !guard()) return;

    const cs = getComputedStyle(el);
    const base = Math.round(parseFloat(cs.fontWeight)) || 400;
    const size = parseFloat(cs.fontSize);
    const gain = Math.min(900, base + D_GAIN) - base;
    const RX = D_RADIUS_X_EM * size;
    const RY = D_RADIUS_Y_EM * size;

    // ── split ────────────────────────────────────────────────────────────
    // Words get a nowrap wrapper so the inline-block letters can only break
    // at the real spaces between words, never mid-word. The spaces stay
    // plain text nodes so they still collapse at a line end.
    const letters: HTMLSpanElement[] = [];
    const frag = document.createDocumentFragment();
    let word: HTMLSpanElement | null = null;
    for (const ch of text) {
      if (ch === " ") {
        word = null;
        frag.appendChild(document.createTextNode(" "));
        continue;
      }
      if (!word) {
        word = document.createElement("span");
        word.style.display = "inline-block";
        word.style.whiteSpace = "nowrap";
        frag.appendChild(word);
      }
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.display = "inline-block";
      // the glyph grows out of the middle of its pinned box and up off its
      // own baseline, so neither neighbour is pushed and the line holds
      s.style.textAlign = "center";
      s.style.transformOrigin = "50% 79%";
      word.appendChild(s);
      letters.push(s);
    }

    // Split letters read unreliably — inline-block boxes make some screen
    // readers announce word (or letter) boundaries that are not there. So the
    // spans are marked decorative and the real string is carried alongside
    // them. Not `aria-label` on the element itself: ARIA prohibits naming a
    // paragraph, and one of these is a paragraph.
    const said = document.createElement("span");
    said.className = "sr-only";
    said.textContent = text;
    const ink = document.createElement("span");
    ink.setAttribute("aria-hidden", "true");
    ink.appendChild(frag);
    el.replaceChildren(said, ink);

    // Pin the resting boxes — one batched read, then one batched write. The
    // face gains 3–6% width between 470 and 650, which over a wrapping title
    // is enough to re-wrap it; with the boxes fixed, only the ink inside them
    // changes and the tracking closes fractionally where the density peaks.
    const w = letters.map((s) => s.getBoundingClientRect().width);
    letters.forEach((s, i) => {
      s.style.width = w[i].toFixed(3) + "px";
    });

    const last = new Array(letters.length).fill(base);
    return field({
      root: el,
      nodes: letters,
      rx: RX,
      ry: RY,
      write(i, k) {
        const wt = Math.round(base + gain * k);
        if (wt === last[i]) return;
        // re-rasterising a glyph is the expensive part — only the letters
        // actually inside the pool are ever touched
        last[i] = wt;
        letters[i].style.fontVariationSettings = `"wght" ${wt}`;
        letters[i].style.transform = k > 0.002 ? `scale(${(1 + D_RISE * k).toFixed(4)})` : "";
      },
      rest(i) {
        last[i] = base;
        letters[i].style.fontVariationSettings = `"wght" ${base}`;
        letters[i].style.transform = "";
      },
      settle: `font-variation-settings ${SETTLE_MS}ms var(--ease-smooth-out), transform ${SETTLE_MS}ms var(--ease-smooth-out)`,
    });
  }, [text]);

  return (
    <Tag ref={ref} className={className} suppressHydrationWarning>
      {text}
    </Tag>
  );
}

/* ── small type ────────────────────────────────────────────────────────── */

/**
 * Lights every `[data-lit]` element inside it from one loop — a region, not a
 * line, so a whole plate answers the pointer as a single surface.
 *
 * The letters are plain inline spans: only their colour changes, so there is
 * no box to pin, nothing that can re-wrap, and no inline-block boundary for a
 * screen reader to trip on. Each frame the *element's* own colour is read
 * fresh and the letters are interpolated from it, so anything the cascade is
 * already doing to that element — a `group-hover` change, a transition — is
 * picked up rather than overridden.
 */
export function MetaLight({
  children,
  className,
  rx = M_RADIUS_X,
  ry = M_RADIUS_Y,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  rx?: number;
  ry?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !guard()) return;

    type Lit = { host: HTMLElement; el: HTMLSpanElement; last: number };
    const lits: Lit[] = [];

    for (const host of Array.from(root.querySelectorAll<HTMLElement>("[data-lit]"))) {
      // walk text nodes only, so element children (an arrow, a link) survive
      const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
      const texts: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) texts.push(n as Text);
      for (const t of texts) {
        if (!t.textContent || !t.textContent.trim()) continue;
        // One wrapper per text node, letters inside it. A bare text node in a
        // flex or grid parent is an anonymous item; loose letter spans would
        // each become an item of their own and pick up the row's `gap`, which
        // is exactly what happened to "open set →". One inline span keeps the
        // run as the single box it already was.
        const run = document.createElement("span");
        for (const ch of t.textContent) {
          if (ch === " ") {
            run.appendChild(document.createTextNode(" "));
            continue;
          }
          const s = document.createElement("span");
          s.textContent = ch;
          run.appendChild(s);
          lits.push({ host, el: s, last: -1 });
        }
        t.replaceWith(run);
      }
    }
    if (!lits.length) return;

    // one colour read per lit element per frame, not one per letter
    const hosts = Array.from(new Set(lits.map((l) => l.host)));
    const rgba = new Map<HTMLElement, [string, number]>();

    return field({
      root,
      nodes: lits.map((l) => l.el),
      rx,
      ry,
      before() {
        for (const h of hosts) {
          const c = getComputedStyle(h).color;
          const m = c.match(/[\d.]+/g);
          if (!m) continue;
          rgba.set(h, [`${m[0]} ${m[1]} ${m[2]}`, m.length > 3 ? parseFloat(m[3]) : 1]);
        }
      },
      write(i, k) {
        const l = lits[i];
        const c = rgba.get(l.host);
        if (!c) return;
        const a = c[1] + (M_PEAK_ALPHA - c[1]) * k;
        const q = Math.round(a * 100);
        if (q === l.last) return;
        l.last = q;
        // back to inherited at rest, so the cascade owns the letter again
        l.el.style.color = k < 0.004 ? "" : `rgb(${c[0]} / ${(q / 100).toFixed(2)})`;
      },
      rest(i) {
        lits[i].last = -1;
        lits[i].el.style.color = "";
      },
      settle: `color ${SETTLE_MS}ms var(--ease-smooth-out)`,
    });
  }, [rx, ry]);

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  );
}

/* ── the engine ────────────────────────────────────────────────────────── */

/**
 * One rAF proximity loop over a set of nodes inside `root`.
 *
 * Centres are cached relative to the root: the nodes are either pinned boxes
 * or plain inline spans, so nothing about them moves once measured, and the
 * loop needs a single rect read per frame rather than one per node. It sleeps
 * the moment the pointer leaves the pool, and does not run at all while the
 * root is off screen — there are ten of these down the index.
 */
function field({
  root,
  nodes,
  rx,
  ry,
  before,
  write,
  rest,
  settle,
}: {
  root: HTMLElement;
  nodes: HTMLElement[];
  rx: number;
  ry: number;
  before?: () => void;
  write: (i: number, k: number) => void;
  rest: (i: number) => void;
  settle: string;
}) {
  let ox: number[] = [];
  let oy: number[] = [];
  const measure = () => {
    const r = root.getBoundingClientRect();
    ox = [];
    oy = [];
    for (const s of nodes) {
      const b = s.getBoundingClientRect();
      ox.push(b.left + b.width / 2 - r.left);
      oy.push(b.top + b.height / 2 - r.top);
    }
  };
  measure();

  let mx = -9999;
  let my = -9999;
  let raf = 0;
  let running = false;
  let lit = false;
  let onScreen = false;
  let settleT = 0;

  const off = () => {
    lit = false;
    clearTimeout(settleT);
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].style.transition = settle;
      rest(i);
    }
    settleT = window.setTimeout(() => {
      for (const s of nodes) s.style.transition = "";
    }, SETTLE_MS + 60);
  };

  const frame = () => {
    const r = root.getBoundingClientRect();
    const near = mx > r.left - rx && mx < r.right + rx && my > r.top - ry && my < r.bottom + ry;
    if (!near) {
      running = false;
      if (lit) off();
      return;
    }
    if (!lit) {
      // no ramp on the way in — the settle transition would otherwise make the
      // light lag the pointer for its whole first sweep
      lit = true;
      clearTimeout(settleT);
      for (const s of nodes) s.style.transition = "";
    }
    before?.();
    for (let i = 0; i < nodes.length; i++) {
      write(i, pool((mx - (r.left + ox[i])) / rx, (my - (r.top + oy[i])) / ry));
    }
    raf = requestAnimationFrame(frame);
  };

  const wake = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  };

  const unsub = onPointer((px, py) => {
    if (!onScreen) return;
    mx = px;
    my = py;
    wake();
  });

  let resizeT = 0;
  const onResize = () => {
    clearTimeout(resizeT);
    resizeT = window.setTimeout(measure, 200);
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen && lit) off();
    },
    { rootMargin: "20% 0px" }
  );
  io.observe(root);
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(settleT);
    clearTimeout(resizeT);
    io.disconnect();
    unsub();
    window.removeEventListener("resize", onResize);
  };
}
