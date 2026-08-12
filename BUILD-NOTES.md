# Build notes — kestrra.com

Built 2026-08-11 against DESIGN.md. This file records what was decided during the
build, what deviated (and why), and what still needs Tarik.

## Revision 5 — 2026-08-12, per Tarik

Six notes: the scroll cue, the index text, the blurred frames, a way back
up, the Gora block, and hover/pointer response below the hero.

- **Scroll cue centred and given a light.** It sat in a `justify-between`
  row, so it was centred on the gap between two labels of unequal width,
  not on the page — a three-column grid on desktop now. The cue is an
  exposure event, not a moving arrow: a hairline the light travels down,
  and a chevron that catches it. Dropped below `md` — it was landing on a
  teaser's name and a touch screen does not need telling to scroll.
- **The set plate.** The index text column was plain stacked paragraphs.
  It is a darkroom plate now: number + a rule that draws as the block
  arrives + commissioned/personal; the title, which takes *light* on
  approach rather than moving; a ruled lab slip (discipline / shot /
  frames); the **edge printing** — `KESTRRA · SET · DATE · N FRAMES` down
  the sprocket margin, which is what makes the block read as film rather
  than as a web page; and a travelling arrow on `open set`.
- **`PointerField`** — nothing below the hero responded to the pointer.
  Eased normalised coordinates as CSS vars, every plane reading them at
  its own rate: near frames 22px, far 9px, plate 7px, set light 10px, and
  the focal **−4px** — the windhover is the one thing holding still while
  the room leans. Compositor transforms only; sleeps off-screen and once
  the pointer settles.
- **Blur is a depth cue, not a barrier.** `.depth-far` clears on hover and
  focus-within. The two far hero teasers carried the blur on the whole
  link, so the set's name was unreadable exactly when you reached for it.
- **The way back up** (`components/to-top.tsx`) — a glass puck, bottom
  right. `backdrop-filter`, so it refracts the ground and takes the colour
  of the set you are standing in rather than carrying its own. It fills as
  the page runs under you; the curved top border is the meniscus and is
  the part you actually read. Hidden until the hero is behind you,
  untabbable while hidden, hidden inside the sequence.
- **Gora reconnected.** Still a threshold, no longer adrift: plate grammar,
  its own light like every other block, three frames from inside the
  sequence hanging far behind it, and a hairline running down out of the
  index, through it, and on. 140svh of mostly nothing → 104svh with
  something in it.
- `--color-low` 0.40 → 0.52 and the plate header moved to the mid tier:
  the brighter ground had taken the quiet type to 3.4:1 and the header to
  4.49:1. Worst case is 4.67:1 now, measured against the actual ground
  behind each label.

## Revision 4 — 2026-08-12, per Tarik — colour and texture in the ground

- **The room is toned like a print.** The field was zero-chroma and read as
  grey on grey. The key light now carries the corpus hue (every set's
  spill averaged in linear light — `corpusSpill()`), the fill carries its
  reciprocal, and the base black stays a true neutral. Colour in the room,
  living only in the light, hue only ever from the work. Chroma *amount*
  is fixed and only the hue varies, so a strongly-coloured set never
  shouts louder than a quiet one.
- **Texture**: grit riding on the veils, a raking striation across the
  light, veil coverage widened 0.44 → 0.30 so there is structure
  everywhere instead of a few rare crests. Lights flattened (0.92/0.82
  peak, 0.36 ambient) to keep hot corners off the quiet type.
- **No grain in the bake.** AVIF spends its whole budget on grain and then
  destroys it anyway, blotching the veils (verified: q70 ate it entirely,
  q92 cost 479KB for maxΔ 6). It is laid on in the browser instead — in
  the shader for the live field, and as a background layer of
  `body::before` for the baked one. **`mix-blend-mode` was tried first and
  crushed the ground to black**: it has to read the page's backdrop, which
  is compositor-dependent. `background-blend-mode` never leaves the
  element and does the same thing everywhere.
- **Portrait crop** (`ground-portrait.*`) — `cover` on a phone threw away
  most of a 16:9 field, and the still is the only ground there is on
  mobile.
- Live and baked verified to match: mean 43.4 vs 42.8 with identical
  chroma distribution, sampled layer-isolated.
- **CLS fix, and a correction to Revision 3's "CLS 0".** That measurement
  was wrong — the observer was created after the scroll sweep and
  `buffered: true` does not replay layout-shift entries. Real CLS was
  0.1397. Cause: `Pic`'s height cap was `w-auto + max-h`, and an author
  `width: auto` beats the width attribute, so a lazy frame had no
  intrinsic size to derive a height from. With images blocked, seven of
  nine index covers reserved a **0×0 box**. `Pic` now takes `maxH` and
  puts a definite width on the picture (and `display: block` — a width on
  an inline box does nothing). Every focal frame now reserves its exact
  final box unloaded; CLS is 0 under the jump pattern that exposed it.

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
- **Index blocks recomposed for depth and mass** (layout is Fable's per
  DESIGN.md "Authority"):
  - Focal frame enlarged — 8 columns instead of 7, max 84svh (was 76svh).
    It was too small to read as a held centre, which is most of why the
    page felt empty.
  - Three planes: the set's own light furthest back, frames drifting
    *behind* the focal (2.2px defocus, small drift), frames passing *in
    front* of it (sharp, large drift, bleeding off the page edge). The
    occlusion is what makes the depth real.
  - Front frames are held to the outer edges so they break the focal's
    frame rather than floating over the middle of a photograph.
  - **SetLight**: three soft washes built from the set's extracted
    palette, blurred to light, breathing over 19s — fills the dead
    quadrants with the colour the work is actually made of. No
    photograph is altered; nothing but blur and the existing palette.
  - Fixed: `position: sticky` creates a stacking context, so the "behind"
    frames were painting over the focal. Sticky container is now z-10
    explicitly (behind = z-1, front = z-20).
  - `overflow-x: clip` on the block so frames may bleed off the page edge
    without ever opening a horizontal scrollbar (clip, not hidden —
    hidden would break the sticky pin).
- **Nav scrim deepened** so the row stays legible where a photograph runs
  under it (mobile set views).
- Verified: CLS 0, zero horizontal overflow desktop and mobile, no
  console errors, 139 pages.

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
