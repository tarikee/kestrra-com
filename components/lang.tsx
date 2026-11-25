"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { langFromPath, path, type Lang } from "@/lib/i18n";
import { dict } from "@/dictionaries";

/** the page language, read from the address so every client component agrees
    with what the server rendered */
export const useLang = (): Lang => langFromPath(usePathname());

/** the strings for the page language */
export const useDict = () => dict(useLang());

/** an English-structured path -> the link for the page language */
export function useHref() {
  const lang = useLang();
  return useCallback((enPath: string) => path(lang, enPath), [lang]);
}
