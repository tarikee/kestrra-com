# Build notes — kestrra.com

Built 2026-08-11 against DESIGN.md. This file records what was decided during the
build, what deviated (and why), and what still needs Tarik.

## Revision 3 — same day, per Tarik

- **Glitch cadence up**: a burst every 1.6–3.7s (was 3–8s), still only
  while the hero is on screen.
- **The mark is now the room's light source**: smaller (62vw/720px max),
  with a breathing halo that stutters when the signal does, a blurred
  second-exposure ghost hanging deeper behind it, and a soft drop glow.
- **Pointer parallax across the hero**: mark, ghost, and all six teasers
  sit in depth planes and ease (never glue) toward the pointer; the two
  mid-edge teasers sit behind the depth of field (blurred, barely moving).
- **The ground lives now**: `components/ground.tsx` — the fbm domain-warp
  shader runs fullscreen under the whole site at ambient level, drifting
  slowly, tinted by the current set's spill, nudged by the pointer.
  Desktop only; the baked AVIF stays as poster + mobile/reduced-motion/
  no-WebGL fallback (`html[data-ground="live"]` hides it).
- **Index depth planes**: near satellites drift ±6–8vh sharp; far slots
  drift ±2.5–3vh behind a 1.3px depth-of-field blur (blur only — no
  tonal change, the grade stays untouched).

## Revision 2 — same day, per Tarik

- **Hero un-scrubbed**: landing mid-glitch read wrong. The mark now lands
  clean and still; every 3–8s a half-second glitch burst hits and recovers
  (never while off-screen/hidden; reduced-motion never glitches). Six frames
  hang around the mark from the start, each linking into its set — hover
  names the collection (mobile shows two, labels always visible).
- **Ground is now baked, not gradients**: `pipeline/render_ground.py`
  renders a zero-chroma fbm domain-warp field (smoke-veils lit from two
  directions, 2560×1440, peaks ~#1E) → 2KB AVIF, drifting over 140s.
  Layering: field (z1) → spill (z2, still the only colour) → grain (z3),
  all under content — grade untouched.
- **Renames**: Laura → **Engagement** (slug + alt-text pass), Karamba →
  **Cocktail Night**, Matura Garden → **Graduation**, Night Assembly →
  **Night Protests**. Slugs follow the titles (keyword URLs).
- **Merged**: Matura Terrace + DOA → one set **Portraits** (same subject,
  same evening; EXIF agrees). `FrameDef.pool` override added; palettes
  interleave the two pools.
- **Orbit**: only the first third of the footage ships (the actual
  rotation); now a 10fps stop-motion boomerang loop inline among the
  2Hot4Stage satellites — the standalone full-height section is gone.
  Frames 25–73 pruned (360KB remain); build-orbit.ts trims at source.
- **Digital Art block moved off-site** → saved for site 3 in
  `_saved-for-site-3/` (component + CPU replica + section JSX). Practice
  copy no longer mentions generative work — reads client-first
  ("weddings, engagements, events, campaigns … shot and graded in-house").
- **Inquiry copy**: "Making something?" → home teaser "Planning a wedding,
  an event, a campaign?" / inquiry page "Work with Kestrra".
- **Set pages**: visible "← all sets" at the top of the header (floating
  back stays). **Piece pages**: description is alt-text only now — visible
  caption removed, EXIF line stays.
- **Index density up**: five satellite slots per side (was three); every
  set carries 4–5 satellites.

## Revision — same day, per Tarik

- **Hero intro reworked to a pinned scroll scrub** (`components/hero-intro.tsx`,
  280vh pin): the glitch advances frame by frame with scroll — 28 deterministic
  states, so scrubbing back replays identically — resolves at ~62%, holds a
  still beat, then four event frames develop in around the resolved mark
  before the pin releases into the index. Click skips to the resolved state.
  Landing state is intensity-capped so the held frame stays legible.
- **Ground is a room, not a void**: zero-chroma luminance topology (two soft
  falloffs + centre lift) plus film-grain texture (SVG turbulence, screen
  blend, ~5%) fixed *under* all content — never over photos, grade untouched.
  Light spill raised 0.05 → 0.10 (Gora 0.13) so the room takes more of the
  work's colour.
- **EXIF lines now carry the rig**: camera body + lens prepended to the
  settings on every piece view.
- **Orbit moved to the home page**, directly after the 2Hot4Stage index block
  (credited in its caption); removed from the set view.
- **Floating back button** on all sub-pages (bottom-left, hidden inside the
  Gora sequence which keeps its own exit); footers pad past it.

## What shipped

- **Stack**: Next.js 15.5 · React 19 · TS · Tailwind v4 · next-view-transitions.
  140 static pages. First-load JS 125KB. CLS 0 measured, LCP elements paint
  immediately (static HTML + priority hints + thumbhash placeholders).
- **11 sets**: laura, 2hot4stage (+scroll orbit), karamba, matura-garden,
  winter-case, matura-terrace, doa · riviera, night-assembly, zagreb,
  gora-polaroids (sequence). Alt text authored for every frame.
- **Wordmark**: exact vector geometry extracted from Mostwasted.ttf
  (`pipeline/extract_wordmark.py`), glitch = RGB channel separation + quantised
  slice displacement + sample-hold stutter, resolves to stillness ≤4.2s or on
  scroll/intent, once per session, reduced-motion cross-fades.
- **Type**: Overused Grotesk VF (OFL) + Fragment Mono (OFL), self-hosted,
  metric overrides. Optical program = per-size weight/tracking switching.
- **Pipeline** (`bun run assets`): AVIF 5 widths + WebP 3 widths per frame,
  source ICC carried **byte-identical** onto every derivative, all other
  metadata stripped (GPS gone; EXIF ships via manifest only). Round-trip
  verified on all 135 images: worst mean Δ 1.13/255 (codec noise), report in
  `data/generated/roundtrip.json`. Orbit: 74 AVIF frames, 900KB total.
- **Motion**: transitions-dev token scale; exposure-event semantics
  (`--exposure-*`); Gora retimes them in a scoped block (the one sanctioned
  break). No ad-hoc durations. Bounce easings omitted — nothing here bounces.
- **Light spill**: per-set hue from build-time palette extraction, driven by
  IntersectionObserver, ~0.05 opacity, slow linear drift. Gora override
  #4a5f58 per the analysis.

## Deviations from DESIGN.md (all justified in-line)

1. **No discipline filter UI.** With this corpus nearly every discipline has
   exactly one set — a filter would be an index of one-item categories, which
   §0 itself forbids. Discipline lives in each set's meta line. Revisit when
   the body grows.
2. **matura split into two sets** (garden/Jun 15 · terrace/May 20) — EXIF
   proves two separate jobs; §8 says sets must be real jobs.
3. **Sequence ending**: the last frame holds and the quiet exit appears under
   it (literal reading of §8) rather than fading to black first.
4. **No audio** — assets don't exist (open item #8); a mute affordance without
   audio would be a lie. Wire-up is trivial once files land.

## Curation (beyond selections.md)

- laura: 16 of 17 (cut 0159, weakest of three gift-table frames).
- matura-garden: 11 of 16 · matura-terrace: 6 of 9 (near-dupes cut).
- fon → "Winter Case Tournament": 10 of 11 (cut m0475).
- doa: 8 of 10 (walk-cycle + bench dupes cut).
- Personal: riviera 18 (dusk+harbour+cars+underwater, one trip by EXIF),
  night-assembly 8, zagreb 10. Held back, unprocessed: 4085, 4291, 5230,
  5864, 8402 (loose standouts with no body to sit in).
- Unshipped derivatives pruned from public/; re-encode any via
  `bun run assets --only <set>`.

## Needs Tarik

| # | Item |
|---|---|
| 1 | **Set titles** — provisional: "Matura — Garden", "Matura — Terrace", "Winter Case Tournament", "DOA", "Riviera", "Night Assembly", "Zagreb". Only "Gora Polaroids" + client-named sets are final. |
| 2 | **Inquiry transport** — set `RESEND_API_KEY` + `INQUIRY_TO` (see .env.example). Until then the form shows the direct-contact fallback on submit. Also confirm `inquiry@kestrra.com` as the public address. |
| 3 | **DSC04498** filed in both showroom folders — it shows the 2H4S neon, so it's presented as showroom; confirm. |
| 4 | **doa** — is "DOA" a client brand (credit + link?) or a personal-brand shoot? |
| 5 | **Audio** — glitch SFX + kestrel call still wanted? Ships silent now. |
| 6 | **Gora dates** — EXIF says 17–18 Jan 2025 (analysis said Feb). Site says "Winter 2025". |
| 7 | **Laura frames** — more prep/ceremony/reception frames would strengthen the only wedding (open item #9). |
| 8 | **Deploy** — needs a Node host (server action). Vercel recommended; DNS not yet pointed. |
| 9 | **Depth-separated parallax** (§10) — deferred as an enhancement; candidates 2473/2542/2538. Sonnet does the masking when wanted. |
| 10 | **/design-review (Opus pass)** — impeccable audit + detector ran clean; the formal Opus review pass is available on request per the model-routing table. |
