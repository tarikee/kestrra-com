"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { counterpart, langFromPath } from "@/lib/i18n";

const KEY = "kestrra:lang-hint";
const SERBO_CROATIAN = /^(sr|hr|bs|sh|cnr)(-|$)/i;

/** English pages only: a one-line, dismissible offer in Serbian for readers
    whose first browser language is Serbo-Croatian. Never redirects. */
export function LangHint() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const first = navigator.languages?.[0] ?? navigator.language ?? "";
      if (!SERBO_CROATIAN.test(first)) return;
      if (localStorage.getItem(KEY)) return;
      setShow(true);
    } catch {
      // no storage or languages: no hint
    }
  }, []);

  if (!show || langFromPath(pathname) !== "en") return null;

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // dismissal lasts this page view only
    }
  };

  return (
    <div
      lang="sr-Latn"
      className="type-meta fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-hairline bg-ground px-[var(--margin)] py-3"
    >
      <a href={counterpart(pathname)} hrefLang="sr" className="tap t-color text-hi">
        Ova stranica postoji i na srpskom →
      </a>
      <button type="button" aria-label="Zatvori" onClick={close} className="tap t-color min-h-11 min-w-11 text-mid hover:text-hi">
        ×
      </button>
    </div>
  );
}
