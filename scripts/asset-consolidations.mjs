import { createHash } from "node:crypto";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parseAssetConsolidations } from "../src/lib/asset-consolidations.mjs";

export function readAssetConsolidations(root) {
  const path = join(root, "src/data/asset-consolidations.json");
  return existsSync(path)
    ? parseAssetConsolidations(JSON.parse(readFileSync(path, "utf8")))
    : [];
}

/** Validate all preservation conditions before removing only retired content. */
export function reconcileConsolidatedAssets(root, entries, { checkOnly = false } = {}) {
  for (const entry of entries) {
    if (existsSync(join(root, "submissions", entry.slug))) {
      throw new Error(`retired submission would be republished: ${entry.slug}`);
    }
    if (!existsSync(join(root, "submissions", entry.replacementSlug))) {
      throw new Error(`consolidation replacement source is missing: ${entry.replacementSlug}`);
    }
    for (const download of entry.legacyDownloads) {
      const path = join(root, "public", download.path);
      if (!existsSync(path) || `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}` !== download.sha256) {
        throw new Error(`legacy download is missing or changed: ${download.path}`);
      }
    }
  }
  if (checkOnly) return;
  for (const entry of entries) {
    for (const collection of ["skills", "prompts", "artifacts", "guides"]) {
      rmSync(join(root, "src/content", collection, `${entry.slug}.md`), { force: true });
    }
    for (const extension of ["json", "md"]) {
      rmSync(join(root, "src/content/artifact-payloads", `${entry.slug}.${extension}`), { force: true });
    }
  }
}
