# kestrra.com — Design Direction

## Authority — read this first

This document has two kinds of content, and Fable should treat them differently.

**FIXED — Tarik's calls. Do not override.**
- Darkroom ground, near-black, zero chroma in the UI (§2)
- Grotesk + technical mono as the type direction (§3)
- **Light is the headline, not motion**
- Positioning: colour is the product; commissioned work is one body, no category
  navigation (§0)
- "Gora Polaroids" — the title, the `sequence` mode, the emotional register and its
  forbidden list (§8)
- The grade is untouchable (`../CLAUDE.md`)
- Client credits at set level, never a logo wall (§8b)

**OPEN — Fable's craft. Everything about how this actually looks and feels.**

**All layout, position and composition is Fable's, without exception.** Where anything sits
on the page, grid and column structure, margins, gutters, scale relationships, what is
full-bleed and what is inset, how a set view is arranged, the shape of every screen. None of
that is specified anywhere in this document and none of it should be inferred from the order
sections happen to appear in.

Also Fable's: the specific typefaces (§3 gives roles, not faces), the full type scale,
tracking and optical sizing, luminance steps beyond the base tokens, all motion timing and
easing, how the exposure transitions actually feel, the wordmark drawing and its glitch, the
fbm shader, the lit-aperture treatment, the light spill, component design, copy and voice.

Note the distinction in §8: *sets are the unit* is information architecture — what things
are. How any of it is laid out on screen is not addressed there and is entirely open.

**The rest of this document is a strong recommendation from Opus, not a specification.**
The concept (§1), structure (§8), and technical requirements (§10–12) are reasoned and
should be followed unless Fable has a better idea — in which case take it, and say what
changed and why. Fable is the stronger design model; this brief exists to remove ambiguity,
not to constrain judgement. Where it conflicts with Fable's eye, Fable's eye wins, except
on anything marked FIXED above.

---

Locked before build. If a question comes up that isn't answered here and isn't Fable's to
decide, stop and settle it rather than improvising.

Stack: Next.js 15 · React 19 · TypeScript · Tailwind v4 · Motion
Purpose: portfolio and work showcase that converts to client inquiries.

## 0. Positioning — decided

**Kestrra sells wedding and event photography. Colour is the signature.**

Everything else follows from that:

- **Colour is the product, not a property of the images.** The grade is what a client is
  actually buying. The site's job is to make colour maximal, and the zero-chroma UI (§2) is
  precisely how — total neutrality around the work is what makes the colour land hardest.
- **Commissioned work is one body, not two.** Weddings and events are not separate
  categories. Same job shape: one day, people, ceremony, low light, candid and posed.
  Six jobs sit together — Laura (wedding, Aug 2025), matura, fon, doa, 2hot4stage, karamba
  (Jan–Jul 2026). Splitting them would invent a taxonomy whose only function is to expose
  that there is one wedding.
- **No category navigation. Discipline lives in per-set metadata.** Each set carries its own
  name, client, discipline and year in mono (`Laura — wedding · 2025`), and discipline drives
  the secondary filter from §8. Nothing is asserted in navigation that the work doesn't
  already say. **Never build a category that contains one item.**
- **This scales without a rebuild.** More weddings simply join the body and shift the
  weighting. No structural change, ever.
- **Personal documentary is the depth, not the pitch.** Gora, the protests, Zagreb, the
  Riviera work — this is what proves an eye rather than a shutter, and couples increasingly
  hire on authored style. It earns credibility; it does not open the site.
- **Video is present, not co-equal.** Demoted from the earlier "three first-class
  disciplines" reading of the Instagram bio. Photography and colour carry the site.
- **Digital art stays** as the one place the fbm medium is earned (§7), and no further.

### Colour signature per set

Because colour is the product, each set surfaces its own extracted palette — a restrained
strip with mono hex labels, derived from the actual images, never invented. It doubles as
the source for the light spill (§6). This is honest information for a colourist's client,
not decoration. Keep it small and quiet; if it starts to look like a swatch library, cut it.

---

## 1. Concept — The Windhover

A kestrel hunts by *windhovering*: it holds its head absolutely, unnaturally still while
its wings work hard against the wind. Total stillness at the centre, everything else in
motion. That is the site's organising behaviour and it is also what a photographer does.

It gives us one rule that resolves almost every layout and motion question:

> **The focal element is still. Everything around it moves.**

Scroll moves the world past a locked subject rather than moving the subject. Grids drift,
the focused frame does not. This is the opposite of the default parallax reflex, and it is
why the site will not read as templated.

Secondary texture, for detail copy and easter eggs rather than headline claims: kestrels
are believed to see into ultraviolet — light we can't. Well cited, but contested in later
literature, so it stays poetic and never gets stated as fact on the page.

Literary anchor, public domain, and genuinely about light: Gerard Manley Hopkins,
*The Windhover* (1877).

---

## 2. Ground — Darkroom

The work is the only light source on the page. Nothing else emits.

```
--ground      #08090A     page
--surface-1   #0E0F11     raised
--surface-2   #16171A     controls
--hairline    #FFFFFF @ 8%
--text-hi     #FFFFFF @ 92%
--text-mid    #FFFFFF @ 64%
--text-low    #FFFFFF @ 40%
```

**Hard rule: the UI carries zero chroma.** Every colour on the site comes out of Kestrra's
own work. Neutrals are true neutrals — no blue-tinted "cool grey", no warm charcoal.

Two sanctioned exceptions, and no others:
1. **Light spill** (§6) — hue sampled from the focused piece.
2. **The glitch** (§4) — RGB channel separation. Since glitch *is* chroma, it is the only
   place the interface produces colour on its own. That scarcity is what makes it land.

No light mode. Decided: it would always be the weaker theme for video, and it doubles
QA surface for no gain on a portfolio.

---

## 3. Typography — Grotesk + technical mono

One grotesk carries wordmark-adjacent display through to caption. One mono carries
metadata only.

| Role | Face | Notes |
|---|---|---|
| Display | Grotesk, single weight, tight negative tracking | 1 weight only — discipline |
| UI / body | Same family, optical sizing | |
| Metadata | Mono | `24mm · f/1.4 · 1/2000 · ISO 400` |

Metadata is a real asset here — pulled from EXIF, it gives the technical texture that
separates a studio from a hobbyist. Surface it; don't decorate with it.

Self-host via `next/font`. No external font CDN — it costs a connection and breaks the CSP
posture. Final faces chosen at build start; candidates evaluated on: true optical sizes,
a genuine mono companion, and licence clean for commercial use.

Scale is a ratio, not a set of magic numbers. Caption 12 → display 160+, with real
optical-size switching, not just scaling one master.

---

## 4. The wordmark and the glitch

Existing identity: **"kestrra"** set in *Most Wasted* (Magique Fonts / typesgal, dafont).
Every Kestrra video opens with that wordmark glitching in and out with a glitch SFX.
That's an established signature and the site should extend it, not replace it.

### Licensing

Most Wasted is listed "Free for personal use" on dafont (Magique Fonts / typesgal).
**Kestrra is handling the licence himself.** Out of scope for the build — don't block on it,
don't re-raise it.

### Delivery: SVG, not a webfont

Independent of licensing, the mark ships as **custom SVG**, for engineering reasons:

- Seven characters. Loading an entire display face for one word is wasteful.
- Vector gives per-glyph control over the glitch — real geometry displacement instead of
  faking it with CSS filters over rasterised text.
- Sharp at any size, no FOUT on the highest-profile element on the page.
- The mark stops being a font dependency and becomes an asset.

Drawn from the existing wordmark so the identity carries over from the videos unchanged.

### Glitch behaviour

Not a CSS filter cliché. Built from the mark's own vector geometry:
- RGB channel separation on displacement — the sanctioned chroma moment
- Horizontal slice displacement on a quantised grid, not smooth noise
- Scanline/sample-hold stutter — snap between discrete states, never interpolate
- Resolves to a perfectly clean, still mark. **The stillness after the glitch is the point.**

Fires once on first load per session. Never on repeat navigation. Respects
`prefers-reduced-motion` by cross-fading to the resolved mark instead.

---

## 5. The intro — scroll-driven 3D

The wordmark sequence resolves across the first scroll rather than playing as a timed
animation the visitor has to wait out. Scroll is the transport; the visitor is never
blocked, and the mark resolves to still as the first work comes into view.

Guardrails, because this is the LCP surface:
- Must not delay LCP. The first real content paints regardless of intro state.
- Fully skippable — any scroll, key, or click resolves it immediately.
- Once per session.
- Reduced-motion: static resolved mark, no sequence.

---

## 6. Motion — light, not movement

Motion serves light. If an effect reads as "something moved," it's wrong; if it reads as
"the light changed," it's right.

- **Transitions are exposure events.** Work develops in — luminance ramps, aperture-shaped
  reveals, focus pulls. Nothing slides.
- **Light spill — keyed to the set, not the frame.** The room takes its colour from the
  body of work you're inside. Hue is extracted at build time (no runtime main-thread cost)
  and averaged across the *set*, so moving between frames within a set holds steady and the
  room only shifts when you move between sets. Per-frame sampling was the original plan and
  it was wrong: unrelated palettes made the room strobe. Per-set, it becomes a slow drift
  between worlds — which is the version that's actually beautiful.
  Applied as a wide, very low-opacity radial bloom. This is the extraordinary moment, and it
  must be *barely* perceptible. If it's obvious, it's broken.
- **Windhover scroll.** Focal frame locked and still, surroundings drift.
- Grid → detail uses shared-element transition on the actual frame. Must survive
  interruption — reversing mid-transition cannot break it.
- Timing and easing come from `transitions-dev` motion tokens. No ad-hoc durations anywhere.
- Every animation honours `prefers-reduced-motion`.

---

## 7. The fbm medium — rationed

A domain-warped fractal-Brownian-motion field, WebGL. Reference:
`_design-refs/fbm-domain-warp-reference.png` — direction only; the built version must look
substantially more refined than the reference.

**Appears in exactly two places:** the hero, and the Digital Art section. Everywhere else it
is wallpaper, and wallpaper is what makes expensive sites look cheap. In the Digital Art
section it is thematically earned, because that section *is* generative work.

Constraints: paused when off-screen, capped frame rate, static gradient fallback for
reduced-motion and for machines without WebGL, and it never delays first paint.

---

## 7b. Scroll-driven orbit — the 2Hot4Stage 3D clips

Six stop-motion camera orbits around dancers, `_assets-intake/events/2hot4stage/3d/`.
Decoded to frames and **advanced one frame per scroll increment** — the subject appears to
be orbited under the visitor's control. Narrow arc, not a full turntable, which is what makes
it read as depth rather than gimmick.

- **Use `iva3d_v3`** (147 frames, consistent motion). `zajedno3d_v1` and `andrijaledja` have
  long static holds and will stall under scroll — trim to the moving portion or skip.
- **Frames, not video.** Frame-accurate video seeking is unreliable across browsers. Decode
  to an AVIF sequence, draw to `<canvas>`, preload everything before the interaction arms.
- **Halve to ~74 frames.** The orbit is subtle enough to lose nothing, and it takes the
  payload from ~5MB to ~1.3–1.5MB at display resolution.
- Scroll-linked, never autoplaying. Reduced-motion falls back to a single still frame.

⚠️ **The backdrop is grey, not white** — a 214–240 gradient with zero pixels above 245. A
luma key or white-to-alpha matte will fringe on hair and costume across every frame, and
per-frame segmentation across six clips is real quality risk for no gain.

**Do not matte it out. Present it as a lit studio aperture** — a bright panel cut into the
near-black page with the dancer orbiting inside it. On-concept (the work is the only light
source), honest to the material, and free. A slightly bad matte would look far worse than an
honest frame.

## 8. Structure — sets are the unit

**Supersedes the earlier "one flat stream" idea.** Kestrra works in *sets* — coherent
sessions with their own subject, place, time and process (e.g. a winter landscape session
shot polaroid-like). The site is organised around sets, not individual frames.

This is the right unit for three reasons:

- **It resolves coherence vs range at two levels.** Treatment is unified *inside* a set;
  range shows *across* sets. Nothing has to be compromised for the other.
- **Sets mix media naturally.** One session can hold photo, video and a digital piece
  derived from it. That proves Kestrra is one practice far better than a discipline filter
  ever could — the range is demonstrated rather than labelled.
- **Clients brief in sets.** Nobody says "I want image 14." They say "something like that
  winter series." The site should speak the language the inquiry will arrive in.

```
1. Intro / hero            wordmark resolve, fbm medium
2. Sets index              the primary surface — bodies of work, not a photo grid
3. Set view                the set's own world; sequence is authored, not chronological
4. Piece view              full-bleed, EXIF, adjacent navigation within the set
5. Digital Art             the one place the medium returns
6. Practice                Europe-based, one paragraph, no bio bloat
7. Inquiry                 real form, real states, reachable from anywhere
```

Client-fishing is the job, so inquiry is a primary surface, not a footer link.

**Each set respects its own native format.** The polaroid session displays at polaroid
proportions with its own matting; a widescreen set gets widescreen treatment. The site
adapts to the work rather than forcing every set through one grid. This is the single
biggest thing that will separate it from a template — and it is only affordable *because*
sets are the unit. Guard against gimmick: format is inherited from the work, never invented
for decoration.

**Each set also declares its own presentation.** Not every body of work wants a grid.
A set carries a `mode` and the set view renders accordingly:

- `grid` — simultaneous, comparative. For sets where the eye should roam.
- `sequence` — one frame at a time, ordered, deliberate. For sets with a narrative.

### "Gora Polaroids" — `sequence`

Title is final: **Gora Polaroids**.

Shot at the family village of **Gora, near Dragash**, during a funeral. The order is a real
journey: the drive, the view from fogged car windows, arrival, the village, the mountains,
the minaret. A grid would let the eye jump and the journey would evaporate. It is presented
one frame at a time.

**This set must carry emotional weight.** That is a requirement, not a mood note — and the
way to hit it is restraint, pacing and space, never added sentiment. Specifically:

- **Slower than anywhere else on the site.** Longer transitions, longer holds. The pace is
  the feeling. This set is permitted to break the global motion timings — the only one that is.
- **More space than anywhere else.** Generous margins, nothing competing in the frame's field.
- **Silence.** No audio in this set, even when audio ships elsewhere on the site.
- **Entry is a threshold, not a click.** Crossing into the set should feel deliberate —
  distinct from opening any other set.
- **The ending is the whole thing.** It must not dump back to a grid. The last frame holds,
  nothing is offered for a beat, and only then does one quiet way out appear. Most galleries
  talk over their own ending; this one stops.
- **The light spill does the emotional work** — the pale teal of the fog washing the room.
  Nothing needs to be said on top of it.

**Forbidden here, absolutely:** fade-to-black with a quote, music, sepia or any grade shift,
vignettes, dates ticking up, "in memory of", handwriting fonts, slow zooms on faces. Every one
of these is the obvious move and every one would cheapen it. If it feels like it is *asking*
for emotion, it is wrong. The images already have it; the design's only job is to get out of
the way and let them land.

Mechanics:
- **Forward and back, explicitly.** Arrow keys, on-screen affordances, swipe. Discrete steps,
  never free scrolling. The visitor advances deliberately, one frame per intent.
- Frame transitions are exposure events (§6), not slides. The windhover holds: the frame is
  locked and still, the world changes within it.
- Next and previous frames preloaded so advancing is instantaneous. A wait would break it.
- Position shown as restrained mono (`07 / 12`). No progress bar, no dots, no thumbnails
  strip — those invite skipping and skipping is the thing to prevent.
- Every frame deep-linkable and back-button correct.
- The four low-key car-interior frames are the breathing points; sequence alternates
  interior and exterior so the set has a pulse rather than nineteen bright rectangles.
- No autoplay, no timed advance. The visitor sets the pace. Always.

**Tone.** The mechanic is a procession, not a game. Deliberate pacing and discrete steps are
exactly right; scoring, playfulness, reward feedback, and any sense of achievement are not.
Restraint is the whole register here.

**Placement.** This set does not belong in a thumbnail row beside supercars and yachts. It
gets its own entry point and its own space in the index.

Discipline filtering stays, but secondary — a client explicitly looking for video should
find it, without it becoming the primary axis.

Video is native in the stream, not a modal afterthought: poster frames, no player chrome
until intent, muted autoplay only where it earns it.

---

## 8b. Client credits — no logo wall

A row of client logos is the most templated trust signal on the web. Do not build one.

**Credit at the set level.** A commissioned set carries the client name, discipline and year
(`2Hot4Stage — clothing, 2025`) with the client's mark small alongside, linked out. Crediting
a client *on the work they commissioned* proves the job; a detached logo strip only asserts
the relationship.

**Marks render in luminance only** — white at reduced opacity, never brand colour. Holds the
zero-chroma rule of §2 and reads as more expensive. SVG only; a raster mark will look soft
against everything else on the page.

Outbound client links are normal followed links — the courtesy is the point, and reciprocal
links back to kestrra.com are worth real authority on a new domain.

**Known client:** [2Hot4Stage](https://2hot4stage.com) — Belgrade dance crew, ~10 professional
dancers, runs 2H4S Fest (largest regional hip-hop festival). Also sells wedding, family and
corporate event services, so the customer overlap with Kestrra is direct.

---

## 8c. The Gallery — one wall, ordered by light

Added 2026-08-12 on Tarik's brief: a page holding **every frame that ships**, "big masonry
inspired — inspired only", senior-graphic-designer level, dynamic and responsive, and
explicitly *not* randomly placed. It sits in the top-right nav beside Work, Practice and
Inquire. 125 frames today; the page is built to absorb more without re-authoring.

Sets remain the unit of the *practice* (§8). The Gallery is the unit of the *archive* — the
whole corpus in one room, which is a different question and deserves a different answer.
It must never become a second Work index.

### The spine: exposure, darkest first

Masonry orders by nothing. That is what makes it generic, and it is the one thing this page
cannot afford. **The wall is ordered by measured luminance** — a continuous ramp from the
near-black frames to the blown-out ones. Scrolling it is one long exposure, opening up.

This is the only ordering the site can honestly claim: light is the headline (§1, §6), so
the archive sorts by light. Everything else — date, set, colour — was considered and is
weaker here. Date is a record, not a composition. Set repeats the Work index. Colour fights
§2's zero-chroma rule and reads as a swatch chart.

The number is measured, never guessed: `pipeline/measure-light.ts` reads each shipped
derivative and writes mean relative luminance in **linear light**, blown-highlight fraction,
and spread to `data/generated/luminance.json`. The sort key weights highlights heavily
(0.45) against a cube-rooted mean (0.55), because what the eye calls bright is the
highlights, and because two thirds of this archive lives in the dark tail. Gamma-encoded
means were tried first and sorted every night frame as mid-key.

Consequence worth stating: the sets shuffle completely. The night protests and the
underwater grotto open the page; Gora's snow and the Monaco haze close it. Frames that have
never been near each other end up adjacent because they hold the same amount of light. That
collision *is* the page.

### The wall breathes

Not a uniform grid. Rows are justified — every frame at its own true proportions, the row
filling its measure — but two things vary continuously along the ramp:

- **Density.** Rows are tall and hold two or three frames at the dark end, tighten to four
  or five through the mid-key middle, and open out again at the bright end. Dark frames need
  isolation to read at all against a near-black ground; blown highlights are the loudest
  things on the page and crowding them is what makes contact sheets shout.
- **Gutter.** Widest at the two ends, tightest through the middle, moving with the density.

The wall's edge is **stepped, not ragged**: each row spans a whole number of a twelve-column
field — nine at the ends, twelve through the middle — alternating its alignment left and
right. Disciplined asymmetry. Nothing is nudged by hand and nothing is random; the whole
composition falls out of the ramp.

### The extraordinary moment: your hand is the light

The site's signature is that the pointer is a light source (Revision 6). At 125 frames it
finally gets the room it deserves: a wall of photographs in the dark, and a pool of light
travelling across it under your hand. Frames lift and halo with proximity, falling off with
distance — the contact-sheet response of §8, at the scale it was always waiting for.

**The room takes the colour of what you are standing in front of.** The spill's hue drifts
to the pool of the frame nearest the pointer. §6 rejected per-frame sampling because
unrelated palettes made the room strobe — that judgement stands and this does not break it:
the hue is per *pool*, already averaged at build time, and it drifts over the full
`--spill-drift`. §6 calls that "a slow drift between worlds — which is the version that's
actually beautiful"; the Gallery is the one page where you can actually walk between them.

**The exposure rail** is the page's only chrome: a hairline black-to-white scale in the
right margin with a marker at your scroll position. It states the ordering without a
sentence of copy, and it is zero-chroma by construction.

### Reading a frame

No labels at rest — the wall is uninterrupted. Under your hand, the frame's set, id and rig
appear in **one fixed slot in the bottom-left margin**, never beside the frame, so nothing
jitters as the pointer crosses the sheet.

Clicking **opens the frame in place over the dimmed wall**, as a plate — the same mat,
hairline, halo and wall label the Gora sequence uses, because they are the same object: a
print in a dark room. Arrow keys step through all 125 in ramp order. One quiet line links
out to the set the frame belongs to. The gallery is never navigated away from by accident.

### Non-negotiables here

- **The grade is untouchable.** No `filter`, `opacity` or blend is ever applied to a
  photograph to make a neighbour stand out — not on hover, not on scroll, not to focus
  attention. Every response is light *around* the frame: mat, halo, spill, exactly as on
  the set pages. The open plate's scrim is a layer over the whole room, the ordinary
  behaviour of a dialog; it alters no frame's own rendering.
- **125 frames must not cost the page its performance.** 640/960px derivatives on the wall,
  thumbhash placeholders, exact boxes from the first paint (zero CLS), `content-visibility`
  past the second row, full-size fetched only when a plate opens.
- No filter chips, no sort dropdown, no infinite scroll, no hover captions floating beside
  the cursor. Every one of those is the templated move.

## 9. Audio

Available, off by default, never automatic. Browsers block autoplay audio and visitors
resent it — and a client landing on a muted-by-default page loses nothing.

- Glitch SFX on the intro mark, and a distant kestrel call
- Single persistent, visible mute/unmute affordance; state remembered
- Nothing plays before an explicit gesture
- Preloaded only after opt-in — zero audio bytes for the majority who never enable it

If it doesn't clearly elevate the intro during build, it gets cut. Tarik's call, on the real thing.

---

## 10. Image pipeline and depth

### The grade is untouchable

See `CLAUDE.md` → *Never touch the grade*. The colour is authored work. The pipeline's job
is to deliver it **unaltered** to the screen, which is an engineering obligation:
ICC preserved through every derivative, Display P3 shipped with sRGB fallback rather than
blind-converted, correct primaries and transfer characteristics on every AVIF/WebP encode,
and a verified before/after pixel round-trip. A naive sRGB conversion is a colour edit.

### Depth separation

Selected pieces are split into foreground / midground / background planes so they can be
driven in real 3D — genuine perspective transforms, not a flat translate pretending to be
depth. Sonnet does the separation and masking; the grade is never touched in the process.

The windhover rule governs it: **the focal plane is locked and still; the other planes
drift.** Pointer and scroll both drive it, with the same easing so they feel like one system.

Not every image gets this. Depth treatment is reserved for the hero and a small number of
pieces that genuinely have foreground/background separation to exploit — applied broadly it
becomes a novelty and cheapens everything around it.

Kestrra's named favourites, and the first candidates for hero and depth treatment:
**2473, 2542, 2539.** Evaluate these first when the folder lands.

## 11. The senior signal

Concrete engineering choices that distinguish this from a well-styled template. These are
requirements, not aspirations.

- **Colour-managed end to end.** P3 with sRGB fallback, profiles intact. Almost nobody does
  this, and on a photography site it is the most respectful possible treatment of the work.
- **View Transitions API** for real cross-document transitions — not a router faking it.
- **CSS scroll-driven animations** (`animation-timeline: scroll()`) where supported, so the
  windhover runs off the main thread. JS fallback only where it must.
- **Thumbhash LQIP**, not blurred thumbnails — placeholders that already carry the right
  colour, so nothing ever flashes grey.
- **A real fbm shader** — actual domain warping with temporal coherence, hand-tuned. Not a
  scrolling noise texture.
- **Focus choreography through shared-element transitions.** Focus lands correctly on the
  detail view and returns to the originating frame on exit. Almost always broken elsewhere;
  a senior reviewer checks it within thirty seconds.
- **Interruptible motion throughout.** Reverse anything mid-flight and it resolves cleanly.
- **Font metric overrides** (`size-adjust`, `ascent-override`) so swap causes zero shift.
- **`content-visibility`** on long set views for cheap off-screen skipping.
- **Zero CLS. LCP under 2.0s** on a photography-heavy page — the hard version of the problem.

## 12. Non-negotiables

**Performance.** Images are the payload: AVIF with WebP fallback, responsive sets, LQIP
placeholders, lazy below the fold, explicit dimensions so CLS stays at zero. The fbm shader
and audio never block first paint.

**Accessibility.** Real focus management on the grid→detail transition. Full keyboard
navigation of the work stream. Every animation reduced-motion aware. Alt text is written,
not auto-filled. Contrast holds against the darkroom ground.

**Anti-slop.** Run `impeccable` and `design-review` before anything is called done. No
nested cards, no grey-on-colour, no default shadows, no purple gradient, no Inter.

---

## 13. Open — resolves when images land

- **Aspect ratios.** Uniform 3:2, or mixed? Decides masonry vs justified-rows vs fixed-cell.
  Retrofitting this is expensive; it's the first thing I check.
- Colour profile of the exports — sRGB or tagged P3.
- Ratio of photo to video to digital art, which sets the weight of the work stream.
- Whether any client work is under NDA or otherwise can't be shown.
