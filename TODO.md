# TODO — kestrra.com

The single open-items list for site 1. `BUILD-NOTES.md` records what was *done* and why;
this records what is *not done yet*. Last swept 2026-08-21.

---

## Email — custom addresses on the domain

Email Routing is live on the zone and the inquiry form sends and delivers. What is left is
moving off the placeholder Gmail. Forwarding is free and needs no further DNS: the MX,
SPF and DKIM records are already in place.

- [ ] **Routing rule `inquiry@kestrra.com` → `kestrraa@gmail.com`.** One API call, no DNS
      write. Everything below depends on it.
- [ ] **Verify `inquiry@kestrra.com` as a destination address in its own right**, then
      repoint `send_email.destination_address` and `vars.INQUIRY_TO` in `wrangler.jsonc`
      at it. Needs a redeploy. Keep it pinned to one address — an unpinned binding is a
      relay.
- [ ] **Flip `INQUIRY_EMAIL` in `components/inquiry-form.tsx`** to `inquiry@kestrra.com`.
      This is the only visible one: the address printed on `/inquiry` when the transport
      is down is currently a Gmail, on a site whose whole job is to look like it charges
      properly for the work.
- [ ] **Catch-all rule**, so a mistyped `inquiries@` / `hello@` / `contact@` still arrives
      rather than bouncing.
- [ ] **Decide whether Kestrra needs to *send* as `inquiry@kestrra.com`.** Routing is
      forwarding, not a mailbox — replies to form inquiries are already correct because
      `replyTo` carries the client's address, but writing *first* from that address needs
      SMTP credentials: Cloudflare Email Sending (paid, ~$0 at this volume but a paid
      plan) or a mailbox provider. Not needed for the form; needed if Kestrra wants to
      cold-email a venue from a domain address.
- [ ] **Watch spam placement.** The first sends from a brand-new domain often land in
      Promotions or Spam. If it happens, a DMARC TXT at `_dmarc.kestrra.com` is the fix —
      Cloudflare wrote SPF and DKIM but not DMARC.

## Content — needs Tarik's answers

- [ ] **Set titles.** Provisional: "Matura — Garden", "Matura — Terrace", "Winter Case
      Tournament", "DOA", "Riviera", "Night Assembly", "Zagreb". Only "Gora Polaroids" and
      the client-named sets are final.
- [ ] **DOA** — client brand (credit + link?) or a personal-brand shoot?
- [ ] **DSC04498** is filed in both showroom folders and shows the 2H4S neon, so it is
      presented as showroom. Confirm.
- [ ] **Gora dates** — EXIF says 17–18 Jan 2025, the original analysis said Feb, the site
      says "Winter 2025". The site is safe either way; worth settling.
- [ ] **Laura frames** — more prep / ceremony / reception frames would strengthen the only
      wedding on the site, which is the set most likely to convert a wedding inquiry.
- [ ] **Audio** — glitch SFX + kestrel call. Ships silent; still wanted?

## Build — deferred, not blocked

- [ ] **Depth-separated parallax** (DESIGN.md §10). Candidates 2473 / 2542 / 2538. The
      masking is mechanical once the frames are chosen.
- [ ] **More frames for the Gallery.** `content/gallery.ts` holds loose frames that are
      encoded but in no set; ten manifest entries still have no derivatives on disk and are
      dropped from the wall rather than guessed at. Re-run `bun run assets` after any
      intake.
- [ ] **Formal `/design-review` Opus pass.** The `impeccable` audit and the slop detector
      both ran clean; the model-routing table reserves the formal review pass for request.

## Video — the positioning is ahead of the portfolio

The site says **Photo · Video** as of 2026-08-21 (Digital Art dropped). The published work
is photography only, so half the claim is currently unbacked.

- [ ] **Publish real video work.** Which pieces, and are they client or personal? Needed
      before anything else here can be specced.
- [ ] **Decide how video is presented.** The brief has always said video is a first-class
      discipline, not a gallery with video bolted on — so this is an architecture question,
      not a matter of dropping `<video>` into the frame grid. The one moving-image thing
      built so far, `components/orbit-loop.tsx`, is a 10fps canvas boomerang, not a player:
      controls, poster frame, bandwidth and the free-tier asset budget all need an answer.
- [ ] **`DESIGN.md` and `EXECUTE.md` still describe a Digital Art section** (§7, the fbm
      medium, the page-order list). Stale as a description of the live site.

## Discovery — none of it exists yet

The site has no discovery or measurement layer of any kind. Verified 2026-08-21.

- [ ] **`/gallery` is missing from `sitemap.xml`.** 134 URLs live and the gallery wall is
      not one of them. A real bug, independent of any strategy decision — fix regardless.
- [ ] **No structured data anywhere.** Zero JSON-LD / schema.org. For a bookable local
      business this is the largest purely technical gap.
- [ ] **No analytics at all**, so there is currently no way to know whether any of this
      works. Must stay lightweight — a heavy script would be resented on this site.
- [ ] **Google Business Profile.** For a Europe-based photographer taking bookings this is
      the most direct feed into the inquiry path. Verification usually wants a DNS TXT:
      a single scoped record at the apex only — **never wildcard that zone**, it carries a
      private tunnel subdomain.
- [ ] **Managed WordPress — settle what it means first.** Headless WP as a CMS so copy and
      sets are editable without a deploy, or an existing managed WP hosting account the
      site attaches to or moves onto? Completely different work, and the second conflicts
      with the current Workers deploy. It is also a paid product: Tarik's spend call.
- [ ] **GEO / SEO — settle which.** Geographic/local SEO (what normally sits beside a
      Business Profile) or Generative Engine Optimization? Both read naturally from how it
      was asked.
- [ ] **The analysis pass is still owed.** SEO, business-strategy and marketing/acquisition
      agents were launched on 2026-08-21 and all three died on the account session limit
      before producing anything. Re-run them **one at a time** — three in parallel is what
      exhausted it. Do not re-derive the baseline above; it is already verified.

Not a gap: per-page metadata is genuinely good. Every route type sets it and piece pages
generate unique titles with the alt text as description. Leave it alone.

---

Done and no longer open: deploy (live on Cloudflare Workers), inquiry transport (sends via
the `send_email` binding), Gora sequence rework, the Gallery and its mobile composition,
Lenis smooth scroll (`lerp 0.22`), and dropping Digital Art from the positioning.
