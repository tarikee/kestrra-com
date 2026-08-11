"use client";

/**
 * One quiet, always-reachable way back. Lives on every page below the home
 * surface; the Gora sequence hides it and keeps its own exit.
 */
import { usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";

export function FloatingBack() {
  const pathname = usePathname();
  const router = useTransitionRouter();
  if (pathname === "/") return null;

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push("/#work");
  };

  return (
    <button
      type="button"
      onClick={back}
      aria-label="Back"
      className="floating-back t-color fixed left-5 z-40 flex h-11 w-11 cursor-pointer items-center justify-center border border-hairline-strong bg-[rgb(8_9_10/0.72)] text-mid backdrop-blur-sm hover:text-hi"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <span className="type-meta" aria-hidden="true">
        ←
      </span>
    </button>
  );
}
