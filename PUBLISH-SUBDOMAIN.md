# Publishing a page to a kestrra.com subdomain

Handoff runbook. Everything needed to put a static page on
`<something>.kestrra.com`, from a machine that has never done it before.

One tool only: the **Cloudflare Wrangler CLI**. No dashboard, no MCP server,
no build step. A folder of files + one `wrangler.toml` + `wrangler deploy`.

The live example of this pattern is `pokloncic.kestrra.com` (Worker `mina19`,
in `~/Desktop/mina19/` on Tarik's MacBook). Copy its shape.

---

## 1. Prerequisites on the new machine

```sh
bun --version     # or node + npm; either works
```

Wrangler is **not** installed globally — it is always run as `bunx wrangler`
(or `npx wrangler`). Do not `npm i -g wrangler`.

## 2. Authenticate

```sh
bunx wrangler login          # opens a browser once
bunx wrangler whoami         # confirm the right account
```

The OAuth token caches to `~/Library/Preferences/.wrangler/config/default.toml`
on macOS. **Auth does not transfer by copying files** — run `login` on each
machine against the same Cloudflare account.

Headless alternative (CI, or a machine with no browser):

```sh
export CLOUDFLARE_API_TOKEN=...   # needs Workers Scripts:Edit + that zone's DNS:Edit
```

## 3. The project

A directory containing the page and a `wrangler.toml`:

```toml
name = "my-page"                    # becomes the Worker name; must be unique
compatibility_date = "2026-01-01"
workers_dev = true                  # free backup URL: my-page.<subdomain>.workers.dev

[assets]
directory = "./"
not_found_handling = "single-page-application"

# ⚠️ ONE hostname, exact. NEVER a wildcard on this zone. See §6.
[[routes]]
pattern = "something.kestrra.com"
custom_domain = true                # creates the DNS record automatically
```

Then, next to it, an `.assetsignore` — **load-bearing**, see §6:

```
.wrangler/
wrangler.toml
.assetsignore
tools/
*.md
```

## 4. Deploy

```sh
bunx wrangler deploy
```

Only changed assets upload. `bunx wrangler rollback` reverts instantly;
Cloudflare keeps every version.

## 5. Verify

```sh
curl -sI https://something.kestrra.com/ | head -5
```

Check: `200`, and that any `_headers` rules actually applied — headers are the
part that fails silently.

---

## 6. The three things that bite

**1. `custom_domain = true` creates a DNS record.**
Per `CLAUDE.md`, DNS and routing changes are never made without asking Tarik.
Confirm the hostname before the *first* deploy of a new subdomain. Redeploys of
an existing one touch no DNS.

**2. Never a wildcard route on `kestrra.com`.**
The zone carries a private tunnel subdomain (`gkv1`) in active use. A route of
`*.kestrra.com/*`, or any zone-wide pattern, puts the Worker in front of that
tunnel and silently breaks it — and the breakage is **invisible** from the
site's own QA. Every route on this zone is one exact hostname.

**3. `directory = "./"` uploads everything.**
Without `.assetsignore`, you ship wrangler's own `.wrangler/` cache as public
assets. This already happened once on mina19 — `no-op-worker.js` and
`wrangler-account.json` went public on the first deploy.

## 7. If the page should not be indexed

Three layers, because any one of them can fail alone:

- `<meta name="robots" content="noindex">` in the HTML
- `robots.txt` with `Disallow: /`
- `X-Robots-Tag` via `_headers`

The header is the one that fails silently — verify with `curl -sI` after
every deploy.

## 8. Cache-busting

If the page has its own JS/CSS and you edit it, bump the `?v=N` query on every
`<script>` and `<link>` together. Returning phones serve stale code otherwise.

---

## Not in scope here

This is for **static pages on their own Worker**. The main `kestrra.com` site is
a different thing — Next.js via `@opennextjs/cloudflare`, with its own build and
test pipeline. See `CLAUDE.md` § "Updating the site" for that one, and never
fold a subdomain page into the `kestrra-com` Worker.
