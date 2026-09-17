# Build notes — kestrra.com

Built 2026-08-11 against DESIGN.md. This file records what was decided during the
build, what deviated (and why), and what still needs Tarik.

## Deployed — 2026-08-12, Cloudflare Workers

Live at **https://kestrra.com** and **https://www.kestrra.com**, on the Workers
**free** plan, via `@opennextjs/cloudflare`. Worker name `kestrra-com`, account
`bcd3fcef226f0532101d05e27b9f5c2e`. Deploy with `bun run deploy`.

### ⚠️ Never widen the routes to a wildcard

`kestrra.com` carries a **private subdomain used for tunnelling**. `wrangler.jsonc`
binds two exact hostnames and nothing else. A route of `*.kestrra.com/*` would put
this Worker in front of that tunnel and silently break it — and the breakage would be
invisible from this site's own QA. Both hostnames were empty before the deploy (no A,
AAAA, CNAME, MX or TXT); no other record on the zone was read or changed.

### Free-tier headroom, measured

| | this site | Free limit |
|---|---|---|
| Worker bundle | **1.29 MB** gzipped | 3 MB |
| Static asset files | **1,195** | 20,000 |
| Largest asset | **1.4 MiB** | 25 MiB |
| Requests | static assets are free and unlimited; the Worker runs for page HTML and the inquiry action only | 100,000/day |
| Workers Logs | `observability.enabled` | included, 200k events/day |

No KV, R2, D1, Durable Objects or Images — `open-next.config.ts` uses the
**static-assets incremental cache** specifically so no billable resource exists. The
Free plan has hard limits rather than overage billing, so it cannot generate a charge.

### Two things that cost time

1. **Prerendered pages 404'd** on the first preview. OpenNext does not write prerendered
   HTML into `assets/`; it writes it to `.open-next/cache`, and the server function
   reads it back through whatever incremental cache is configured. With
   `defineCloudflareConfig()` and no cache, there is nowhere to read from and every
   `/work/*` route 404s. `staticAssetsIncrementalCache` fixes it — and note that the
   cache is only copied into assets by `populateCache`, which `preview` and `deploy`
   run but a bare `wrangler dev` does not.
2. **`compatibility_date` cannot be today's date.** The bundled `workerd` refuses to
   boot against a date newer than the binary supports.

### Verified live

All routes 200 on both hostnames, valid TLS, worker startup 24 ms, mobile overflow 0,
no console errors, ground shader running, both fonts loaded. A served AVIF hashes
**byte-identical** to the local file with its `colr` box intact — Cloudflare is not
re-encoding the imagery. (If the plan is ever upgraded, leave **Polish** off: it
re-encodes images and strips metadata, which would take the ICC profile off the files.
It is Pro-only, so it cannot bite on Free.)

### Still to do

*(superseded — see "Revision 8: the form actually sends" below)*

## Revision 6 — 2026-08-12, per Tarik

Four notes: the titles should respond to the pointer the way "Analyser" does on
lab.valjdakosta.com, the blurred frames below the hero were still not clearing
on hover, the small type should answer too, and the set pages should be more
responsive.

### The titles take the light — `components/letter-light.tsx`

The reference splits its title into per-letter spans and runs a cursor-proximity
loop over a variable weight axis. Same technique here, opposite direction and a
different metaphor: the reference *thins* the letters toward the cursor; here
they gain weight, because on this site the pointer is a light source and ink
that takes more light gets denser. Base weight +150 at the centre of the pool,
plus a 5% rise off the baseline (transform only — it can't affect layout).

Applied to `.set-title` on both index block kinds, the set-page `h1`, the
inquiry `h1`, and the home inquiry CTA. Not to the sequence viewer's title —
the pointer is already driving the sequence there.

Three things this had to get right:

1. **The line can never move.** Overused Grotesk gains 3.4–6.4% width between
   470 and 650 (measured, all ten titles), which over a wrapping title is tens
   of pixels — enough to re-wrap "Winter Case Tournament". So each letter's box
   is pinned to the width it has *at rest* before anything moves, and the glyph
   is centred in it. Only the ink inside the box changes; the tracking closes
   fractionally where the density peaks, which is what heavier ink actually
   does on a print. Measured drift under a full sweep: **0.85px max, no line
   count changes.** Words also get a `nowrap` wrapper so the inline-block
   letters can only break at the real spaces.
2. **The pool is an ellipse, 2.2em × 1.15em.** A round radius wide enough to
   read as a pool on one line lights all three lines of a wrapped title at
   once, and that stops being light and becomes "the heading goes bold on
   hover". Vertically it now falls to ~4% by the next line.
3. **Split letters read badly.** Inline-block boxes make some screen readers
   announce boundaries that aren't there, so the spans are `aria-hidden` and
   the real string rides alongside them in an `sr-only` span. Not `aria-label`
   on the element — ARIA prohibits naming a paragraph, and the home CTA is a
   paragraph. Verified against the actual accessibility tree: all ten set
   titles and both `h1`s announce as single strings.

Off entirely under reduced motion and on coarse pointers — the split never
happens, the markup stays plain text. SSR ships the plain string, so the
duplicate copy only exists once JS has run.

### The far frames were never receiving the hover

`.depth-far` cleared its blur on `:hover` and had `pointer-events-auto`, and
still never fired below the hero. The sticky layer holding the photograph and
the plate is full-bleed (`h-svh`, full width) and sits at `z-10` above the
frames drifting behind at `z-1` — so it swallowed every hover meant for them.
It's transparent to the pointer now (`md:pointer-events-none`), handing
hit-testing back only to the photograph and the plate. Same fix on the Gora
threshold.

Nothing was lost: the block is still one click target (the `<a>` and the
pointer field beneath were never the problem), and hovering the photograph or
the plate still lights the whole group.

Verified by probing every far frame on the index at 31 scroll positions: **43
of 44 sharp on hover or legitimately occluded by the photograph in front of
them**; the one holdout is a headless artifact — a partially clipped frame
whose transition clock stalls under SwiftShader and resolves correctly after
2.5s. `CLS 0`, `overflow 0`, 0 console errors, 139 pages.

### The small type answers in luminance — `MetaLight`

Fragment Mono ships as a single weight. There is no axis to open and the
browser synthesises nothing (measured: identical advance at 400 and 700), so
the small type cannot do what the display type does. It answers in **light**
instead — the label brightens from its resting alpha to 0.95 under the pointer
and falls off along the line. Same metaphor, different material.

`MetaLight` lights a whole region from one loop rather than one component per
label: the index plate, the set-page header, the home section kickers and the
practice slip, the inquiry header. 99 lit elements on the home page, one loop
per region.

Three decisions worth keeping:

- **The letters are plain inline spans.** Only colour changes, so there is no
  box to pin, nothing that can re-wrap, and no inline-block boundary for a
  screen reader to trip on. Verified by diffing every `[data-lit]` element's
  geometry between a reduced-motion context (nothing splits) and a live one:
  **0 of 104 changed** across the three page types.
- **One wrapper span per text node, letters inside it.** A bare text node in a
  flex parent is an anonymous flex item; loose letter spans each became an item
  of their own and picked up the row's `gap` — which is what turned
  "open set →" into "o p e n s e t". One inline span keeps the run as the box
  it already was.
- **The element's own colour is read fresh each frame** and the letters are
  interpolated from it, so a `group-hover` change or a transition on that
  element is picked up rather than overridden. Hovering anywhere in an index
  block still takes "open set →" to `text-hi`, and the pointer light rides on
  top of it.

Reading copy is deliberately not lit — a travelling light across a blurb fights
the reading.

### The contact sheet answers your hand — `SheetLight`

Set pages get none of the index's travelling planes; the job there is reading
the work, not being shown it. So the response is the smallest true one: the
frame under your hand rises 5px off the sheet and spills light around its edge,
and its neighbours catch a little of the same, falling off over 150px outside
each frame's box. The header leans in a `PointerField` like an index plate,
its two columns at opposing rates.

**Both are outside the photograph.** Nothing a cursor does touches the picture —
verified by sampling the decoded pixels of a lit frame against an unlit one.
The existing `brightness-110` on actual hover is unchanged and stays binary.

One shared `pointermove` listener now feeds every field on the site
(`lib/pointer.ts`) — ten index blocks, a title and a plate on each, and a
contact sheet on every set page had been binding their own.

Verified: `--near` reaches 1.00 on the hovered frame with four neighbours part
lit, the view transition into a piece still fires from a lifted frame, `CLS 0`,
`overflow 0` desktop and mobile, 0 console errors, and nothing splits at all
under reduced motion or on a coarse pointer.

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

## Revision 7 — 2026-08-12 · Gora reworked, and the Gallery

Two notes from Tarik: the Gora polaroids were "really underwhelming" for what
are the most emotional frames in the archive, their settings didn't exist, and
he wanted a Gallery page holding everything.

**Gora Polaroids — the print, not the projection** (`components/sequence.tsx`)

The diagnosis was a sizing mistake compounded by the grade. §8 asks this set
for *more* space than anywhere else on the site; the first build gave it less
— 86vw × 74svh. These twelve frames carry a heavy burned-in vignette, so at
full bleed their edges dissolved into a near-black ground and the picture had
no edge at all. A picture with no edge is a wallpaper, which is exactly what
"underwhelming" was describing.

- **The plate.** The print is now 62svh on a mat (`--color-surface-1`, a hairline
  at its outer edge). §8's "own matting", in the palette, zero chroma. The
  vignette now ends somewhere and the frame becomes an object in a dark room.
- **It answers the hand.** The mat takes light from the shared `--near` driver
  (SheetLight) and the room's fog leans with the pointer on a compositor
  transform. The plate itself never moves — the windhover holds, only the
  light changes. Nothing touches the photograph.
- **The twelve authored beats finally render.** They were written into
  `content/sets.ts` on day one and had never once been on screen, along with
  `breathing`. Both are now used: the beat and the frame's settings print as a
  wall label *after* the picture has landed alone, and breathing frames
  develop slower and hold their label back — the pulse is in the timing.
- **The settings existed nowhere and now do.** Sequence mode bypasses the piece
  page, so `exifLine` had never been called for this set. It moved to
  `lib/exif.ts` (client-safe; `lib/work.ts` is `server-only`) and gained a
  `lens: false` short form — on a prime the lens name restates the focal and
  aperture already in the line.
- **Slower**: exposure-in 720 → 960ms, out 455 → 560, hold 270 → 360. §8 asks
  for the pace to be the feeling; the first pass was only a third slower than
  the rest of the site.
- Threshold now carries the place (`Gora, near Dragash`, new `SetDef.place`).
  The funeral is deliberately not mentioned — §8 forbids anything that *asks*.

**The Gallery** (DESIGN.md §8c — written and agreed before the build)

125 frames in one room, **ordered by measured luminance**, darkest to most
blown. `pipeline/measure-light.ts` reads each shipped derivative and writes
mean luminance in linear light, blown-highlight fraction and spread to
`data/generated/luminance.json`; the sort key weights highlights 0.45 against
a cube-rooted mean 0.55. Gamma-encoded means were tried first and sorted every
night frame as mid-key.

- **The wall breathes** (`lib/gallery.ts`): justified rows whose density,
  gutter and measure all move with `sin(pi·t)` along the ramp — 4 frames at 23%
  height and a 1.8vw gutter at the ends, 6–7 at 13.6% and 0.35vw through the
  middle. The measure steps 9 → 12 → 9 of twelve columns, alternating margins,
  so the wall's edge is stepped rather than a rectangle.
- **Your hand is the light**: SheetLight at 125 frames, plus the room's spill
  drifting to the pool of the frame nearest the pointer (per *pool*, never per
  frame — §6's strobe finding stands). One fixed reading slot bottom-left; a
  caption chasing the cursor would make the whole wall twitch.
- **The exposure rail** — black-to-white hairline scale, right margin, marker
  at your scroll position. States the ordering with no copy at all.
- Clicking opens the frame as **the same plate object the sequence uses** —
  `.plate`/`.plate-mat`/`.plate-window` are shared with `.seq-*`. Arrow keys
  step all 125; the label links out to the set.
**Mobile — reworked same day, and it needed it**

The first pass collapsed the wall to one column on a phone. Tarik called it
underwhelming and he was right: it was a fallback, not a design. Every idea on
the page was switched off — no composition (all rows 100%), no pointer light
(coarse pointer), no reading slot (hover-driven, so it never appeared), no
exposure rail (`display: none`), no hue drift — leaving 125 photographs in a
30,000px column with nothing saying why they were in that order. A camera roll.

- **The arc survives the phone** (`packMobile`). Each desktop row sub-packs
  into mobile rows on the same density curve: one frame at the two ends, two
  through the middle, three at the peak. `--wm` is a frame's justified share
  of its sub-row and `--mn` how many share it, so each sub-row fills the
  measure exactly and the next wraps by itself — one DOM, two compositions.
  **21.5k px instead of 30k**, and it reads as a contact sheet again.
- **The viewport is the light** (`ViewportLight`). No pointer, so the frame
  nearest the viewport's optical centre takes the light and its neighbours
  take less — the same `--near` CSS, a different driver. This is what brings
  back the reading slot and the hue drift too, both of which were hover-only.
  Geometry is read only for frames an IntersectionObserver says are on screen.
  Still runs under reduced motion (it is information); only the lift stops.
- **The rail stays on mobile**, thinner and wordless. On a wall this long a
  position on the ramp matters more, not less.
- **The reading slot is permanent there** rather than hover-revealed — the set
  name is the context the wall otherwise never gives you.
- CLS 0.0148 → **0.0022**. Two causes: the `contain-intrinsic-size` estimate
  was a desktop number and wrong by several times on a phone (each row now
  carries `--ih` and `--mih`, and the settled scroll height comes within 1% of
  the estimate); and the reading slot's `<p>`s were zero-high until the first
  frame was read, so the slot grew and pushed its own second line. Line boxes
  are reserved now.

Gora's own mobile view was left alone deliberately: a 5:4 landscape print
centred on a portrait phone with its label beneath *is* the composition, and
the space around it is §8's "more space than anywhere else", not waste.

Three frames ship that belong to no set (`content/gallery.ts`), with their own
alt text. Ten manifest entries have no encoded derivatives and are excluded.

**Performance work this forced**

- The wall's HTML was 1.3 MB and React warned about painting it. Cause was the
  RSC boundary: handing 125 resolved images to a client component serialises
  every 4–5 kB thumbhash. Fixed by rendering the wall on the *server* and
  passing it as `children`, with a slim frame list (no thumbhash, no srcset
  arrays, one pre-formatted rig line) crossing for the plate and reading slot.
  Interaction is delegated from one root listener. **360 kB, CLS 0.0006.**
- `Pic` gained `cap` and `placeholder` for the wall only: a frame there is
  never wider than ~40vw, so the 1600/2200/2880 entries were dead weight, and
  below the second row a dominant-colour swatch stops the flash as well as a
  thumbhash does at that size.
- **SheetLight now caches geometry in document space** instead of measuring
  every frame every animation frame. Sixteen frames could afford the reads;
  125 could not. Re-measures on resize, on a ResizeObserver of the root, and
  as lazy frames decode, and wakes on scroll as well as pointer move.

**Two bugs worth remembering**

- `--mat` and the plate's width calc were scoped to `[data-sequence]`. The
  Gallery opens the same plate outside a sequence, so both silently resolved
  to nothing and the plate rendered at ~half size with no matting. Plate
  variables now live on `.plate`/`.seq-plate` themselves.
- `#main` carries `z-10` and is therefore a stacking context — no `z-index` on
  the plate can climb out of it to cover the fixed nav. The plate sets
  `body[data-plate]` and takes the room, exactly as the sequence does.
- Rows flushed early by a panorama were being *justified*, stretching one or
  two frames across the full measure into rows four times their neighbours'
  height. They flush unjustified now, and a row left holding a single frame is
  given back to the row above rather than stranded.

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

Moved to **`TODO.md`** — one list, swept 2026-08-13. Two rows from the old table here are
now closed rather than moved: the inquiry transport (it sends; see Revision 8) and the
deploy (live on Cloudflare Workers, not the Node host this table originally assumed).


---

## Revision 8 — 2026-08-13 · the inquiry form actually sends

The form was wired to Resend and had no key, so every submission fell through to the
"write directly instead" panel — and the address that panel offered, `inquiry@kestrra.com`,
did not exist either. Two dead ends dressed as a contact path.

### Transport: Cloudflare, not a third party

`app/actions/inquiry.ts` now sends through the Cloudflare **Email Service** `send_email`
binding. The reason this is the right transport and not just a convenient one:

- **It is free on the Workers Free plan**, permanently, with no quota — provided every
  recipient is a *verified destination address* on the account. Email *Sending* to
  arbitrary recipients is a paid product; sends to verified destinations are explicitly
  exempt from it, "including when only Email Routing is configured".
- **No third party ever holds the mail.** No Resend account, no API key to rotate, no
  vendor in the path between a client and Kestrra.
- The binding is pinned with `destination_address`, so the Worker can send to exactly one
  inbox and cannot be turned into a relay if the form is ever abused.

Resend survives as an optional *second* transport, tried only if the binding is absent or
throws. Unset in production. If both are unavailable the form still shows the honest
fallback rather than claiming to have sent.

Also fixed in passing: `replyTo` is set to the enquirer, so hitting reply answers the
client; `\r\n` is stripped from anything reaching the subject line; and the body's blank
separator lines survive (the old `.filter(Boolean)` flattened the mail to one paragraph).

### Account state — done, and what it wrote

Email Routing was enabled on the zone on 2026-08-13 (`status: ready`) and
`kestrraa@gmail.com` verified as a destination address. Before that, the live action
reached Cloudflare's mail service and was refused with exactly one error —
`could not find account config of sending domain` — which is the signature of an
unconfigured sending zone, not a code fault. Worth knowing: that error was invisible to
`wrangler tail --format pretty` and only appeared under `--format json`.

Enabling wrote **five** records, diffed against a snapshot taken immediately before:

```
+ MX  kestrra.com                      -> route1/2/3.mx.cloudflare.net
+ TXT kestrra.com                      -> "v=spf1 include:_spf.mx.cloudflare.net ~all"
+ TXT cf2024-1._domainkey.kestrra.com  -> "v=DKIM1; ..."
```

Nothing was removed and `gkv1.kestrra.com` — the private tunnel CNAME — was verified
byte-identical afterwards. Cloudflare marks those five read-only so mail routing cannot be
broken by accident; the lock is on those records only, not on the zone.
`POST /zones/{id}/email/routing/disable` removes exactly them and nothing else.

### Verified live

A real submission to `https://kestrra.com/inquiry` returns `{"status":"sent"}`, renders the
"Received." panel, and logs no errors. Mail lands in `kestrraa@gmail.com`.

### Still on the placeholder address

`kestrraa@gmail.com` is doing two jobs it should not keep doing: it is the destination the
Worker sends to, and it is the address printed on `/inquiry` when the transport is down. A
Gmail on a portfolio that sells work is the one un-premium thing on the site.

Email Routing gives custom addresses for free, as *forwarding* rather than mailboxes, and
the DNS for it is already written — so `inquiry@kestrra.com` is now one routing rule away.
The steps, and the one thing forwarding does **not** buy (sending *as* that address, which
needs SMTP credentials), are tracked in **`TODO.md`**.

---

## Revision 9 — 2026-09-17 · the Light Table, and honest colour

Two things, connected by one new module.

### The Light Table — share cards from any frame

A `share ↗` control on all three photo surfaces opens a window that composes the frame
into something postable: the photograph on the site's own fbm ground, the rig line, and
the mark. Four controls, no more — **composition, ratio, colour, credit**. Deliberately
not a photo editor: nothing crops, grades, filters or retouches.

- **Composition** — `plate` (the print on its mat, the same object the Gora sequence and
  the Gallery lightbox open), `label` (a full wall label: set, frame number, date, rule,
  rig), `full` (the frame, one whisper of type).
- **Ratio** — 9:16, 4:5, 1:1, 4:3, 16:9. Landscape ratios move the label into a column
  beside the picture rather than squashing the portrait layout; `lib/export/layout.ts`
  holds the table and everything derives from the card's short edge.
- **Colour** — a few swatches read out of the photograph, never a hue wheel. §6 says the
  room's hue only ever comes from the work, and a spectrum would break that.
- **Credit** — mark, defaulting to mark + `@kestrra`.

Output is PNG, or a 6s H.264 loop encoded in-browser through `VideoEncoder` + `mp4-muxer`
(dynamically imported, so `/gallery` is unchanged at 4.2 kB). The ground drifts out and
back rather than cutting: the field is fbm noise and is not periodic, so a boomerang is
what makes the loop seamless — the same reason `components/orbit-loop.tsx` boomerangs.

**One draw path.** The live preview, the still and every frame of the video all go through
`CardRenderer.draw()`. A preview running different code from the export is a preview that
eventually lies about what you are posting.

**The shader was extracted, not copied.** `render_ground.py` and `ground.tsx` are already
deliberate bit-for-bit ports and this file says change both or neither. A third hand-copy
for the exporter would have made three; `lib/ground-shader.ts` now holds the single source
and both mount it. `ground.tsx` went 288 → 151 lines with identical behaviour.

**The grade is verified, not asserted.** Two exports of one card differing only in tone
isolate the photo's pixels (everything the ground painted changes; everything the
photograph painted does not), and those pixels are compared against the shipped
derivative. Max channel deviation **0.22/255** — resampling noise, nothing more.

### The colour strips were wrong, and are fixed

`palettes.json`'s per-set strips came from median cut in **RGB**, each box collapsed to its
arithmetic **mean**. Both halves are wrong for photographs: RGB distance is a poor model of
"these look alike", and the mean of a box spanning several hues lands near the grey axis —
average a red dress against green foliage and you get mud, a colour in no part of the frame,
printed under the set as a colourist's signature.

Now clustered in OKLab (`lib/color/oklab.ts`, shared with the Light Table's picker so the
two can never disagree). Getting the *selection* right took three attempts, recorded because
each failure is instructive:

1. **Heaviest cells win** → five barely-different darks. Most of a photograph is shadow.
2. **Band by tonal mass** → worse; even the brightest fifth of the mass sits in mid-shadow,
   so the strips lost their light end entirely.
3. **Band by lightness *range*** → correct. What the eye calls the highlights is a small
   number of pixels carrying most of the impression, which is the same reasoning
   `measure-light.ts` already applies when it ranks the wall.

Recomputed across the corpus by `pipeline/recolor-strips.ts`, which is read-only over
pixels exactly like `measure-light.ts`: it reads shipped derivatives, never opens an
original, never re-encodes. **`spill` is untouched** — that hex tones the live ground, the
bake and `CORPUS_SPILL`, and changing it would be a change to the colour of the whole site.

### Three bugs worth recording

- **The card grew until it overflowed the window.** `grid-template-columns: 1fr` is
  `minmax(auto, 1fr)`, so the canvas could push the stage wider, which made `fit()` measure
  a larger stage, which grew the canvas. `minmax(0, 1fr)` on both axes.
- **The window hid itself.** `body[data-export] footer { visibility: hidden }` hides site
  chrome, and on the piece page the button lives *in* that footer — so the overlay rendered
  as its child disappeared the moment it opened. It is portalled to `<body>` now, which also
  keeps it clear of `#main`'s z-10 stacking context.
- **The rig line ran off the card.** Its length is not fixed — the gallery passes a short
  form, the piece page the full one with a zoom's model name. It is measured and wrapped at
  separators now, and a two-line break is balanced rather than greedy so `ISO 100` does not
  hang alone under a full row.

### Known, not fixed here

`/favicon.ico` 404s. Pre-existing, unrelated to this work, and left alone.

---

## Revision 10 — 2026-09-17, same day, on Tarik's review

Revision 9 shipped and he used it. Everything below came out of that.

### The card

- **Landscape ratios were bad, and for one reason.** The layout reserved a text column
  against the *card's* margin and centred the picture in whatever width was left. A
  portrait frame uses barely a third of that, so the picture sat stranded at one edge
  with the column a void away at the other. Picture and text are one object now,
  centred together, the caption level with the top of the frame and the signature on
  its bottom edge — the column is bounded by the photograph rather than floating.
- **The caption is centred on the picture**, with more air above it, and measures
  against the card's content width. The picture is centred, so its centre *is* the
  card's centre; the wider measure only stops a narrow frame truncating its own
  exposure. The landscape column takes three lines for the same reason.
- **Type read as one block** — settings looked like part of the watermark, and the
  mark and handle were a single lockup. Proximity does the grouping now: caption near
  the picture, signature on the floor with three times that air, mark and credit on
  one baseline at opposite ends.
- **Share is a glyph.** Two passes were wrong in the same direction: 12px metadata
  read as a caption, and display type put a chunky sans word beside the mono rig line
  where it competed with the metadata. A mark is recognised without being read.
- **The ground runs 8× on a card.** The room's rate suits minutes; a story gets two
  seconds, where 0.014 units/sec is motionless. Tempo only — and the preview applies
  it too, or it stops telling the truth about the export.
- **The date printed as a raw EXIF timestamp.** Second precision under a photograph
  reads as a leak. `shootMonth()` gives the short form the authored `when` strings use.
- **The loop control no longer vanishes without WebCodecs** — it says why instead.

### Colour, twice more

The OKLab rewrite was still wrong in a way a photograph makes obvious: **area beat
colour**. A frame built around an orange neon ring returned grey, grey, brown, teal,
black. Chroma runs ~0.02–0.15, so a `1 + chroma × 1.5` bonus is worth ~18% against a
wall with ten times the pixels. Weighting chroma hard enough to fix it then turned a
foliage-heavy set into five greens with no light value — the same mistake reversed. A
palette has **roles**: a light anchor, a dark anchor, and character hues scored with
area compressed to a fractional power.

Then the strips moved onto the **cover frame** (`pipeline/cover-colors.ts`, keyed by
set slug). Pooling across a set is defensible for a set page and wrong where the strip
actually appears — beside one photograph, describing frames the viewer cannot see.

### The site, not the feature

- **Exits were being missed**, including by Tarik. `.room-exit` keeps the room's type
  size, takes real contrast, and carries a standing hairline. Still typographic.
- **Selection is off by default.** Almost every string here is chrome, and the I-beam
  over all of it made the site read as copy waiting to be highlighted. Back on for
  form fields and the inquiry address.
- **Back-to-top was a glass puck** — the only radius, the only shadow and the only
  simulated material on the site. It is a hairline that fills with distance travelled.
- **Hero satellites got bands.** Only width was specified, so height came from
  whichever photograph landed in the slot and portraits collided with neighbours. The
  composition was a property of the content, which is why it looked accidental.
- **Instagram got a mark** — hairline stroke, never the brand gradient; the aperture
  takes light. The handle was already in five places and none of them read as
  Instagram.
- The scrollbar was hidden, then restored on request.

### Measured, not assumed

Scroll holds a locked 60fps on the real GPU — median 16.7ms, worst frame 16.8ms, zero
frames over 20ms. The "less smooth" report is the LAN proxy buffering images, not the
site. Lenis timing deliberately untouched.

### The check that failed

The share control shipped at **x: −69**, off-screen, past a QA suite asserting the
element existed and its halo animated. Both true. Presence is not visibility — the
assertion is now geometry, and it fails on the old build.
