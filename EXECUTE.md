# Execute — Website 1 · kestrra.com

**Invocation:** "execute website 1" → **Fable builds it, full stack.** Design decisions,
animation, architecture and skill usage are all Fable's. See `../CLAUDE.md` → Model routing.

## Preflight — read before writing any code

1. `../CLAUDE.md` — model routing, git rules, the grade rule, design north star
2. `DESIGN.md` — **the locked design direction.** Build against it. If something isn't
   covered there, stop and ask rather than improvising.
3. `data/image-analysis.md` — per-image descriptions, palettes, depth flags, set clusters.
   Expensive to regenerate; do not re-run a vision pass.
4. `data/image-survey.json` — dimensions, aspect ratios, ICC, EXIF for all 63 archive images

## Assets — all staged, nothing lives in Downloads

```
../_assets-intake/
  gora-polaroids/          19 · 5:4 · the funeral journey set
  archive/                 44 · personal work, clustered in image-analysis.md
  events/
    laura-wedding-2025/    17 · the only wedding
    matura/                25 · graduation (check: spans two dates)
    fon/                   11
    doa/                   10
    karamba/                9 · ISO to 4000, real low light
    2hot4stage/
      picks/               10 · Kestrra's selection
      studio/              23 · "studijske neke"
      showroom1/           17
      detalji-showroom2/   76
      3d/                   6 .mov camera orbits — see DESIGN.md §7b
  brand/
    2h4s-logo.svg          traced, 7.2KB, pure white on alpha. Min display width 140px
../_design-refs/
  fbm-domain-warp-reference.png
```

All source images are **sRGB, 26–32MP, Canon EOS M6 Mark II**, EXIF intact on 61/63.

## Build order

1. **Scaffold** — Next.js 15, React 19, TS, Tailwind v4, Motion. Self-hosted fonts via
   `next/font`, metric overrides for zero CLS.
2. **Asset pipeline — write a script, do not use a model.** Read from `_assets-intake/`,
   emit AVIF + WebP responsive sets into `public/`. **Carry ICC through, never convert
   colour space, verify a before/after pixel round-trip.** Generate thumbhash LQIP. Strip
   GPS, keep camera/lens/exposure. See `../CLAUDE.md` → *Never touch the grade*.
3. **Design system** — darkroom tokens (§2), type scale and roles (§3), motion tokens from
   `transitions-dev`. No ad-hoc durations anywhere in the codebase.
4. **Wordmark** — draw "kestrra" as custom SVG from the Most Wasted mark, build the glitch
   from real vector geometry (§4). Licence is Kestrra's problem; do not raise it.
5. **Sets index and set views** — sets are the unit; each declares `format` and `mode`
   (`grid` | `sequence`) (§8). No category navigation.
6. **Gora Polaroids sequence** (§8) — the emotional core. Read that section carefully,
   including the forbidden list.
7. **Scroll-driven orbit** (§7b) — frames not video, lit-aperture treatment.
8. **fbm medium** (§7) — hero and Digital Art only.
9. **Inquiry** — primary surface, real states.
10. **Performance and a11y** (§11, §12) — zero CLS, LCP < 2.0s, focus choreography through
    shared-element transitions, everything reduced-motion aware.
11. **Review** — `impeccable` and `design-review` before calling anything done.

## Open — needs Tarik, ask at the right moment, don't block the whole build

| # | Item |
|---|---|
| 1 | ~~2Hot4Stage studio picks~~ — **done**, see `data/selections.md`. One thing left: `DSC04498` is filed in both `detalji-showroom2/` and `showroom1/` — confirm which category before writing metadata. |
| 2 | ~~Gora sequence order~~ — **done.** 14 frames, ordered, in `data/selections.md`. Delegated by Tarik and approved to ship as-is. |
| 3 | ~~Gora cut~~ — **done**, 19 → 14. Cuts listed in `data/selections.md`. |
| 4 | ~~Protest faces~~ — **decided: publish as shot, no blurring.** Tarik's call, made explicitly. **Do not raise this again.** |
| 5 | **Set titles and dates** for the archive clusters. Only "Gora Polaroids" is final. |
| 6 | **Typefaces not yet chosen** — §3 specifies roles, not faces. Needs true optical sizes, a real mono companion, licence clean for commercial use. |
| 7 | `matura` spans May 20 and Jun 15 — two events? `doa` is also May 20. Sets must be real jobs. |
| 8 | **Audio assets don't exist** — glitch SFX and distant kestrel call (§9). Ships off by default; cut if not supplied. |
| 9 | More Laura frames would strengthen the only wedding considerably — prep, ceremony, dark reception. |

## Definition of done

Zero CLS · LCP under 2.0s on the image-heavy pages · full keyboard navigation of every set ·
focus returns to the originating frame on exit from a detail view · every animation
interruptible and reduced-motion aware · colour round-trip verified against originals ·
`impeccable` and `design-review` clean.

## Git

New repo, **author Tarik only, no Claude authorship line, ever.** Ask before running any git
command.
