/**
 * When each page in the sitemap last changed, from git: the date of the last
 * commit that touched the files the page is made of. Runs before every build
 * (npm "prebuild") and writes data/generated/lastmod.json for app/sitemap.ts.
 *
 *   node pipeline/lastmod.mjs
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function lastChange(paths) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    return out ? new Date(out).toISOString() : null;
  } catch {
    return null;
  }
}

const pages = {
  "/": ["app/page.tsx", "content"],
  "/work": ["app/work/page.tsx", "content/sets.ts"],
  "/dev": ["app/dev", "components/dev-projects.ts"],
  "/film": ["app/film", "content/film.ts"],
  "/inquiry": ["app/inquiry"],
  "/about": ["app/about"],
};

// what a page says and shows, not how it is laid out: a spacing change is not
// news to a search engine. A set's date is when its photos last changed.
const sets = readFileSync(join(ROOT, "content/sets.ts"), "utf8");
for (const m of sets.matchAll(/slug: "([^"]+)",\s*pool: "([^"]+)"/g)) {
  pages[`/work/${m[1]}`] = [`public/img/${m[2]}`];
}

const out = Object.fromEntries(
  Object.entries(pages)
    .map(([route, paths]) => [route, lastChange(paths)])
    .filter(([, date]) => date)
);
writeFileSync(join(ROOT, "data/generated/lastmod.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`lastmod: ${Object.keys(out).length} pages dated`);
