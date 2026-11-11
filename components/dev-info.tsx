"use client";

import { useId, useState } from "react";

/**
 * The details of a project, there when asked for: `info +` opens a small
 * slip under the row (role, stack, year, code), `info −` folds it away. The
 * slip opens on its height and develops in; under reduced motion it simply
 * appears.
 */
export function DevInfo({
  lead,
  name,
  children,
}: {
  /** the links that sit beside the toggle */
  lead?: React.ReactNode;
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="mt-7">
      <div className="type-meta flex flex-wrap items-baseline gap-x-7 gap-y-3">
        {lead}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="dev-info-toggle tap t-color pointer-events-auto text-low hover:text-hi"
        >
          <span data-lit>info</span>
          <span className="sr-only"> about {name}</span>{" "}
          <span aria-hidden="true" className="inline-block w-[1ch] text-center">
            {open ? "−" : "+"}
          </span>
        </button>
      </div>
      <div id={id} className="dev-info" data-open={open ? "" : undefined} inert={!open}>
        <div>{children}</div>
      </div>
    </div>
  );
}
