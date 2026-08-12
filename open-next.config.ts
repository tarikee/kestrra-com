import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Every page here is prerendered — 139 of them — and nothing revalidates: no
 * ISR, no `use cache`, no on-demand revalidation. The only dynamic thing on
 * the site is the inquiry action, which sends an email and renders nothing.
 *
 * So the prerendered HTML is served straight out of Workers static assets,
 * read-only. That is free and unmetered, and it is the override OpenNext
 * documents for exactly this shape of site. A KV or R2 incremental cache
 * would be a writable store backing a cache nothing ever writes to.
 *
 * Without an incremental cache configured at all, the server function has
 * nowhere to read the prerendered pages from and every /work/* route 404s —
 * which is what happened on the first preview build.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
