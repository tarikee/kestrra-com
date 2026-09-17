"use client";

/**
 * The Light Table — where a frame becomes something you can post.
 *
 * A light table is where a photographer lays frames out and decides; the name
 * is the brief. Four controls and a live card, and the card you are looking at
 * is rendered by the same code that writes the file, so the preview cannot
 * drift from the export.
 *
 * It takes the room the way the plate and the sequence do — `body[data-export]`
 * — rather than trying to out-z-index anything. #main carries z-10 and is a
 * stacking context, so a modal that tries to climb over the nav loses; taking
 * the room is both the established pattern here and simply the right answer,
 * since nothing else is worth reading while you are doing this.
 *
 * Design language is the site's, deliberately: mono metadata type, hairlines,
 * no fills, no radii, no accent colour. A control is selected by *taking more
 * light* — text-low lifting to text-hi — which is the same grammar every other
 * interactive thing on this site uses. Nothing here pops off.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CardRenderer, fontsReady } from "@/lib/export/compose";
import { readTones } from "@/lib/export/palette";
import {
  canExportLoop,
  cardFilename,
  exportLoop,
  exportStill,
  save,
} from "@/lib/export/encode";
import {
  CARD_STYLES,
  CREDIT_MODES,
  RATIOS,
  TONE_NAMES,
  type CardSpec,
  type CardStyle,
  type CreditMode,
  type RatioId,
  type ToneCandidate,
} from "@/lib/export/types";

export interface ShareFrame {
  id: string;
  base: string;
  w: number;
  h: number;
  alt: string;
  rig: string | null;
  context: string | null;
  position: string | null;
  date: string | null;
}

type Job = null | { kind: "still" | "loop"; progress: number };

export function LightTable({ frame, onClose }: { frame: ShareFrame; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CardRenderer | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [style, setStyle] = useState<CardStyle>("plate");
  const [ratio, setRatio] = useState<RatioId>("9:16");
  const [credit, setCredit] = useState<CreditMode>("handle");
  const [tones, setTones] = useState<ToneCandidate[]>([]);
  const [toneId, setToneId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [job, setJob] = useState<Job>(null);
  const [error, setError] = useState<string | null>(null);

  const R = RATIOS.find((r) => r.id === ratio)!;
  const spill = tones.find((t) => t.id === toneId)?.spill ?? "#5b544d";

  const spec = useCallback(
    (): CardSpec => ({
      style,
      ratio,
      spill,
      credit,
      rig: frame.rig,
      context: frame.context,
      position: frame.position,
      date: frame.date,
    }),
    [style, ratio, spill, credit, frame]
  );

  /* ── the room ─────────────────────────────────────────────────────── */
  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.export = "true";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.export;
    };
  }, [onClose]);

  /* ── load the frame, read its colours, start the renderer ─────────── */
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    (async () => {
      await fontsReady();
      const img = new Image();
      img.decoding = "async";
      // a shipped derivative, never an original — 1600px is more than a
      // 1080-wide card can show, and it is already on disk
      img.src = `${frame.base}/w1600.avif`;
      try {
        await img.decode();
      } catch {
        if (!cancelled) setError("this frame would not decode");
        return;
      }
      if (cancelled) return;

      const found = readTones(img, img.naturalWidth, img.naturalHeight);
      const r = new CardRenderer(canvas);
      r.setPhoto(img, img.naturalWidth, img.naturalHeight);
      rendererRef.current = r;
      setTones(found);
      setToneId(found[0]?.id ?? "neutral");
      setReady(true);
    })();

    return () => {
      cancelled = true;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, [frame.base]);

  /* ── the preview loop ─────────────────────────────────────────────── */
  useEffect(() => {
    const r = rendererRef.current;
    const canvas = canvasRef.current;
    if (!ready || !r || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let stop = false;
    const t0 = performance.now();

    const fit = () => {
      const stage = stageRef.current;
      if (!stage) return;
      // clientWidth/Height include padding, and the stage has a lot of it —
      // measuring the padding box would size the card to overlap its own air
      const cs = getComputedStyle(stage);
      const aw = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const ah = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const k = Math.min(aw / R.w, ah / R.h);
      const dw = Math.max(80, Math.floor(R.w * k));
      const dh = Math.max(80, Math.floor(R.h * k));
      canvas.style.width = `${dw}px`;
      canvas.style.height = `${dh}px`;
      // render at real device pixels, capped — the export does full res
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      r.resize(Math.round(dw * dpr), Math.round(dh * dpr));
      r.setSpec(spec());
    };

    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);

    const frameLoop = (now: number) => {
      if (stop) return;
      raf = requestAnimationFrame(frameLoop);
      r.draw(reduced ? 0 : (now - t0) / 1000);
      if (reduced) stop = true; // one frame is the whole animation
    };
    raf = requestAnimationFrame(frameLoop);

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [ready, ratio, R.w, R.h, spec]);

  /* ── export ───────────────────────────────────────────────────────── */
  const run = async (kind: "still" | "loop") => {
    const r = rendererRef.current;
    const canvas = canvasRef.current;
    if (!r || !canvas || job) return;
    setError(null);
    setJob({ kind, progress: 0 });
    try {
      r.resize(R.w, R.h);
      r.setSpec(spec());
      const blob =
        kind === "still"
          ? await exportStill(r, canvas, R.w, R.h)
          : await exportLoop(r, canvas, R.w, R.h, (p) => setJob({ kind, progress: p }));
      save(blob, cardFilename(frame.context, frame.id, ratio, kind === "still" ? "png" : "mp4"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "the export failed");
    } finally {
      setJob(null);
      // hand the canvas back to the preview at its on-screen size
      const stage = stageRef.current;
      if (stage) {
        const k = Math.min(stage.clientWidth / R.w, stage.clientHeight / R.h);
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        r.resize(Math.round(R.w * k * dpr), Math.round(R.h * k * dpr));
        r.setSpec(spec());
      }
    }
  };

  const busy = job !== null;

  return (
    <div className="export-room" role="dialog" aria-modal="true" aria-label={`Share — ${frame.alt}`}>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="tap type-meta-sm t-color export-close text-low hover:text-hi"
      >
        ← close
      </button>

      <div className="export-stage" ref={stageRef}>
        <canvas ref={canvasRef} className="export-card" aria-label="Card preview" />
      </div>

      <aside className="export-panel">
        <div className="export-panel-inner">
          <p className="type-meta-sm export-title text-low">light table</p>

          <Group label="composition">
            {CARD_STYLES.map((s) => (
              <Opt key={s.id} on={style === s.id} onClick={() => setStyle(s.id)} note={s.note}>
                {s.name}
              </Opt>
            ))}
          </Group>

          <Group label="ratio">
            {RATIOS.map((r) => (
              <Opt key={r.id} on={ratio === r.id} onClick={() => setRatio(r.id)} note={r.note}>
                {r.id}
              </Opt>
            ))}
          </Group>

          <Group label="colour">
            <div className="export-swatches">
              {tones.map((t) => {
                const meta = TONE_NAMES.find((n) => n.id === t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setToneId(t.id)}
                    className={`export-swatch ${toneId === t.id ? "is-on" : ""}`}
                    aria-pressed={toneId === t.id}
                    title={meta?.note}
                  >
                    <span className="export-chip" style={{ background: t.swatch }} />
                    <span className="type-meta-sm">{meta?.name ?? t.id}</span>
                  </button>
                );
              })}
            </div>
          </Group>

          <Group label="credit">
            {CREDIT_MODES.map((c) => (
              <Opt key={c.id} on={credit === c.id} onClick={() => setCredit(c.id)}>
                {c.name}
              </Opt>
            ))}
          </Group>

          <div className="export-actions">
            <button
              type="button"
              className="export-do type-meta"
              onClick={() => run("still")}
              disabled={busy || !ready}
            >
              {job?.kind === "still" ? "writing…" : "export still"}
            </button>
            {canExportLoop() && (
              <button
                type="button"
                className="export-do type-meta"
                onClick={() => run("loop")}
                disabled={busy || !ready}
              >
                {job?.kind === "loop"
                  ? `encoding ${Math.round(job.progress * 100)}%`
                  : "export loop"}
              </button>
            )}
            <p className="type-meta-sm export-note text-low">
              {R.w}×{R.h} · {R.note}
              {error ? <span className="export-error"> · {error}</span> : null}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="export-group">
      <h2 className="type-meta-sm export-label text-low">{label}</h2>
      <div className="export-opts">{children}</div>
    </section>
  );
}

function Opt({
  on,
  onClick,
  note,
  children,
}: {
  on: boolean;
  onClick: () => void;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={note}
      className={`export-opt type-meta ${on ? "is-on" : ""}`}
    >
      {children}
    </button>
  );
}
