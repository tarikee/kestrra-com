"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { counterpart, langFromPath } from "@/lib/i18n";
import { useDict } from "./lang";

/** EN · SR. The other language is a plain link: a full page load, so
    <html lang> follows. The query string is kept. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const t = useDict().common.lang;
  const cur = langFromPath(pathname);
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(location.search), [pathname]);
  const href = counterpart(pathname) + search;

  const here = (l: string) => (
    <span aria-current="true" className="text-hi">{l}</span>
  );
  const other = (l: string, code: "sr" | "en") => (
    <a
      href={href}
      hrefLang={code}
      lang={code === "sr" ? "sr-Latn" : "en"}
      className="tap t-color text-mid hover:text-hi"
    >
      {l}
    </a>
  );

  return (
    <span className={`type-meta inline-flex items-baseline gap-2 whitespace-nowrap ${className}`} role="group" aria-label={t.aria}>
      {cur === "en" ? here(t.en) : other(t.en, "en")}
      <span aria-hidden="true" className="text-low">·</span>
      {cur === "sr" ? here(t.sr) : other(t.sr, "sr")}
    </span>
  );
}
