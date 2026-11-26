"use client";

/**
 * The first thing a share tap opens: where the link goes. Copy it, send it
 * to WhatsApp, Viber or Telegram, or make a story image for Instagram (the
 * Light Table). The web has no address that posts to Instagram, so the story
 * image is the honest way there.
 *
 * A sheet from the bottom on a phone, a small panel on a desk. Hairline
 * glyphs, no round buttons: the same quiet controls as the rest of the site.
 */
import { useEffect, useRef, useState } from "react";
import { useDict } from "@/components/lang";
import type { ShareFrame } from "./light-table";

type Target = {
  id: string;
  label: string;
  glyph: React.ReactNode;
  href?: string;
  act?: () => void;
};

const G = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GLYPH = {
  link: G("M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"),
  story: G("M7 3h10a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16.8 6.6h.01"),
  whatsapp: G("M4 20l1.2-3.6A8 8 0 1 1 8 19.2L4 20ZM9.2 8.6c0 3.4 2.8 6.2 6.2 6.2l1-1.4-1.8-.9-.9.8a4.6 4.6 0 0 1-2.4-2.4l.8-.9-.9-1.8-1.4 1Z"),
  viber: G("M12 3c4.6 0 8 1.6 8 7.2 0 5.4-3.4 7-8 7-.7 0-1.4 0-2-.1L7 20v-3.4C5 15.6 4 13.7 4 10.2 4 4.6 7.4 3 12 3ZM9.4 8c0 2.9 2.3 5.2 5.2 5.2l.9-1.2-1.5-.8-.8.7a3.9 3.9 0 0 1-2-2l.7-.8-.8-1.5L9.4 8Z"),
  telegram: G("M21 4 3 11l6 2.2M21 4l-3 16-9-6.8M21 4 9 13.2V19l3-3.4"),
  mail: G("M4 6h16v12H4zM4 6l8 7 8-7"),
  x: G("M5 4l14 16M19 4 5 20"),
  more: G("M6 12h.01M12 12h.01M18 12h.01"),
};

export function ShareSheet({
  frame,
  onClose,
  onStory,
}: {
  frame: ShareFrame;
  onClose: () => void;
  onStory: () => void;
}) {
  const t = useDict().piece.share;
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  const [phone, setPhone] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const url =
    typeof window === "undefined"
      ? ""
      : frame.url
        ? new URL(frame.url, window.location.origin).href
        : window.location.href;
  const text = [frame.context, frame.position].filter(Boolean).join(" · ") || "Kestrra";

  useEffect(() => {
    setNative(typeof navigator !== "undefined" && typeof navigator.share === "function");
    setPhone(window.matchMedia("(pointer: coarse)").matches);
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", key);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const u = encodeURIComponent(url);
  const m = encodeURIComponent(`${text} ${url}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const a = document.createElement("textarea");
      a.value = url;
      document.body.appendChild(a);
      a.select();
      document.execCommand("copy");
      a.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const targets: Target[] = [
    { id: "copy", label: copied ? t.copied : t.copy, glyph: GLYPH.link, act: copy },
    { id: "story", label: t.story, glyph: GLYPH.story, act: onStory },
    { id: "whatsapp", label: "WhatsApp", glyph: GLYPH.whatsapp, href: `https://wa.me/?text=${m}` },
    ...(phone ? [{ id: "viber", label: "Viber", glyph: GLYPH.viber, href: `viber://forward?text=${m}` }] : []),
    { id: "telegram", label: "Telegram", glyph: GLYPH.telegram, href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(text)}` },
    { id: "x", label: "X", glyph: GLYPH.x, href: `https://x.com/intent/post?url=${u}&text=${encodeURIComponent(text)}` },
    { id: "mail", label: t.email, glyph: GLYPH.mail, href: `mailto:?subject=${encodeURIComponent(text)}&body=${u}` },
    ...(native
      ? [{ id: "more", label: t.more, glyph: GLYPH.more, act: () => navigator.share({ title: text, url }).catch(() => {}) }]
      : []),
  ];

  return (
    <div className="share-sheet-scrim" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        className="share-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="share-sheet-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${frame.base}/w640.avif`} alt="" width={frame.w} height={frame.h} className="share-sheet-thumb" />
          <div className="min-w-0">
            <p className="type-meta-sm text-hi">{t.title}</p>
            <p className="type-meta-sm truncate text-low">{text}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="type-meta-sm share-sheet-close t-color">
            {t.close}
          </button>
        </div>
        <ul className="share-sheet-grid">
          {targets.map((x) => (
            <li key={x.id}>
              {x.href ? (
                <a href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="share-target" onClick={() => setTimeout(onClose, 300)}>
                  {x.glyph}
                  <span className="type-meta-sm">{x.label}</span>
                </a>
              ) : (
                <button type="button" className="share-target" onClick={x.act} aria-live={x.id === "copy" ? "polite" : undefined}>
                  {x.glyph}
                  <span className="type-meta-sm">{x.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
