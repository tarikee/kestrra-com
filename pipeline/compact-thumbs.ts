/**
 * Rewrites the placeholders already in data/generated as lossless WebP,
 * without re-running the image pipeline. Same pixels; the pipeline itself
 * writes this format from now on (see thumb.ts).
 *
 *   npx tsx pipeline/compact-thumbs.ts
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { compactDataURL } from "./thumb";

const GEN = join(__dirname, "..", "data", "generated");

async function compact(node: unknown): Promise<[number, number]> {
  let before = 0;
  let after = 0;
  if (Array.isArray(node)) {
    for (const n of node) {
      const [b, a] = await compact(n);
      before += b;
      after += a;
    }
  } else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    for (const [k, v] of Object.entries(o)) {
      if (k === "thumb" && typeof v === "string" && v.startsWith("data:image/png")) {
        o[k] = await compactDataURL(v);
        before += v.length;
        after += (o[k] as string).length;
      } else {
        const [b, a] = await compact(v);
        before += b;
        after += a;
      }
    }
  }
  return [before, after];
}

async function main() {
  for (const name of ["images.json", "orbit.json"]) {
    const path = join(GEN, name);
    const data = JSON.parse(await readFile(path, "utf8"));
    const [before, after] = await compact(data);
    await writeFile(path, JSON.stringify(data, null, 1));
    console.log(`${name}: placeholders ${before.toLocaleString()} → ${after.toLocaleString()} chars`);
  }
}

main();
