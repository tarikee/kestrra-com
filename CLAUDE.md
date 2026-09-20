# kestrra.com

The site for **Kestrra** ([@kestrra](https://instagram.com/kestrra)) — Photo · Video.
Positioning is **client-fishing**: a portfolio that converts to business inquiries.

**This site is LIVE and in real use.** It is not a build in progress. Every change here
goes to a site people are looking at, so the default is care: read, verify, then ship.

Stack: Next.js 15 · React 19 · TypeScript · Tailwind v4 · Motion · Lenis, deployed to
**Cloudflare Workers (free plan)** via `@opennextjs/cloudflare`. Worker `kestrra-com`.

---

## Read these before touching anything

| File | What it is |
|---|---|
| `DESIGN.md` | The locked design direction. Resolve design questions against it. |
| `BUILD-NOTES.md` | The decision log, revision by revision — **why** things are the way they are, and every sanctioned deviation from DESIGN.md. Read before changing a system. |
| `TODO.md` | What is *not* done. The single open-items list. |
| `EXECUTE.md` | Build/pipeline conventions. |

If a design question is not answered by `DESIGN.md`, stop and settle it with Tarik rather
than inventing an answer.

---

## Updating the site

"Let's update kestrra.com" plus a described change is standing authorisation to carry it
**all the way to production in one pass** — no check-ins between steps:

1. Make the change.
2. `bun run typecheck` then `bunx opennextjs-cloudflare build`.
3. `bunx opennextjs-cloudflare populateCache local`, then `bunx wrangler dev --port <port>`.
   **Test against workerd, not `next dev`** — workerd is the deploy target and differs.
   Skipping `populateCache local` makes every prerendered `/work/*` route 404 locally and
   looks exactly like a real regression.
4. `bunx opennextjs-cloudflare deploy`. Only changed assets upload.
5. Verify the live domain — routes, mobile, console errors.
   `wrangler rollback` reverts instantly; Cloudflare keeps every version.
6. Report once, at the end.

**Cleaning up dev servers:** kill by port (`lsof -ti:PORT | xargs -r kill -9`).
`pkill -f "wrangler dev"` matches **nothing** — the real command line is
`wrangler-dist/cli.js dev`. That mistake once left six servers alive until the machine
ran out of memory.

### Never, without asking

- **DNS or routing changes.** `kestrra.com` carries a private tunnel subdomain. A
  wildcard route (`*.kestrra.com/*`) would silently break it, invisibly from this site's
  own QA. The two routes are exact and must stay exact.
- **Anything that costs money.** Free tier only: no KV, R2, D1, Durable Objects, Images
  or Polish. Check headroom if the bundle grows.

---

## 🚫 Never touch the grade

**The colour is authored work. It is final.** No auto-levels, no contrast curves, no
saturation, no white-balance correction, no "enhancement", no filters — not even subtle
ones, and not even when an image looks flat or dark beside its neighbours. If images sit
badly together that is a *sequencing* problem, never a grading one.

This is a technical obligation too, not just restraint:

- **Never strip the ICC profile.** Carry it through every derivative.
- **Never blind-convert to sRGB.** A naive conversion silently alters the intended colour
  — a colour edit by negligence.
- Encode AVIF/WebP with the correct colour primaries and transfer characteristics.
- Verify the round trip: sample pixels before and after and confirm they match.

It extends to the interface: hover states never dim, blur or desaturate a photograph.
Every response is light *around* the frame. Permitted image work is resizing, cropping
within an agreed frame, format conversion, responsive sets, depth-layer separation,
masking, and LQIP/thumbhash generation.

---

## Assets

Originals live in **`../_assets-intake/`** (a sibling of this folder — `pipeline/config.ts`
resolves `../_assets-intake`, so the two must stay siblings or that path needs updating).
Nothing there ships; processed derivatives are written into `public/`. GPS is stripped
from everything that ships; camera/lens/exposure EXIF may be surfaced in UI.

**Adding frames means re-running both** `bun run pipeline/measure-light.ts` (or the Gallery
silently drops them) **and** `bun run pipeline/cover-colors.ts` (or the set's colour strip
stays stale). Neither errors when skipped; both just quietly go wrong.

**Asset transcoding is a script, not a model task.** Resizing, encoding, responsive sets,
frame extraction, LQIP — write and run code. Never spend a model on it.

Tooling available: `ffmpeg`, `cwebp`, `sips`, Pillow, `rg`, `ast-grep`, `bun`.

---

## Model routing

| Model | Owns |
|---|---|
| **Fable** | **Everything visible.** Architecture, every component, all design and typographic decisions, all motion, content and copy, performance and accessibility. Effort **high or above**, always. |
| **Sonnet** | Bulk work with no design judgement — long mechanical refactors, repetitive content entry, test scaffolding. |
| **Opus** | Review only, on request — `impeccable`, `design-review`, `review-animations`. Does not build. |
| **Haiku** | Trivial lookups. |

Never hand a design or motion decision to a smaller model. If it is visible, it is Fable's.
Delegate to subagents whenever it protects context.

---

## Design north star

**Breathtaking, not decorative.** Clean to the point of severity, then one or two moments
that are genuinely extraordinary. Restraint everywhere else is what makes those land.

`_design-refs/fbm-domain-warp-reference.png` — directional inspiration only; the real thing
must look far more refined than the reference.

Avoid templated AI-slop patterns: no Inter-plus-purple-gradient, no nested cards, no grey
text on coloured fills. The `impeccable` skill exists to catch exactly this — use it.

---

## Git

- **Author is Tarik only.** No `Co-Authored-By`, no Claude authorship line, ever.
- Finished work is committed and pushed without asking. **Ask before rewriting history**
  (rebase, amend of pushed commits, force-push).
- Repo: `https://github.com/tarikee/kestrra-com` (private).
