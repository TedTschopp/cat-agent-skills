import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { applyAssetConsolidations, consolidationRedirects, parseAssetConsolidations } from "../src/lib/asset-consolidations.mjs";
import { readAssetConsolidations, reconcileConsolidatedAssets } from "./asset-consolidations.mjs";
import { buildLibraryAssetSnapshot } from "./library-assets-json.ts";

const legacy = "preserved original download\n";
const digest = `sha256:${createHash("sha256").update(legacy).digest("hex")}`;
function entry(overrides: Record<string, unknown> = {}) {
  return {
    slug: "old-prompt", kind: "prompt-template", name: "Old Prompt", replacementSlug: "current-skill", replacementKind: "skill",
    legacyPaths: ["/prompts/older-prompt/"], legacyDownloads: [{ path: "bundles/old-prompt.prompt.md", sha256: digest }],
    reason: "The requested mode is maintained in Current Skill.",
    source: { commit: "a".repeat(40), path: "submissions/old-prompt", author: "Original Author" }, ...overrides,
  };
}
function registry(entries = [entry()]) { return { schemaVersion: 1, entries }; }
function write(root: string, path: string, content: string) {
  const full = join(root, path); mkdirSync(dirname(full), { recursive: true }); writeFileSync(full, content);
}

test("consolidation registry rejects unsafe paths, duplicate identities, and redirect chains", () => {
  for (const invalid of [
    entry({ slug: "../escape" }), entry({ replacementSlug: "old-prompt" }),
    entry({ legacyPaths: ["https://elsewhere.example/"] }),
    entry({ legacyDownloads: [{ path: "bundles/../outside.md", sha256: digest }] }),
    entry({ legacyDownloads: [{ path: "bundles/old-prompt.prompt.md", sha256: "not-a-hash" }] }),
  ]) assert.throws(() => parseAssetConsolidations(registry([invalid])));
  assert.throws(() => parseAssetConsolidations(registry([entry(), entry()])), /duplicate/);
  assert.throws(() => parseAssetConsolidations(registry([
    entry(), entry({ slug: "current-skill", replacementSlug: "third-skill", source: { commit: "b".repeat(40), path: "submissions/current-skill", author: "Other Author" }, legacyDownloads: [{ path: "bundles/current-skill.zip", sha256: digest }] }),
  ])), /chains/);
});

test("retired routes resolve directly to a published replacement across asset kinds", () => {
  const entries = parseAssetConsolidations(registry());
  assert.deepEqual([...consolidationRedirects(entries)], [
    ["/prompts/old-prompt/", "/skills/current-skill/"],
    ["/prompts/older-prompt/", "/skills/current-skill/"],
  ]);
  const assets = [
    { slug: "old-prompt", kind: "prompt-template", publicationStatus: "published" },
    { slug: "current-skill", kind: "skill", publicationStatus: "published", keywords: ["voice"], relatedAssetIds: ["prompt:old-prompt", "skill:unrelated"] },
    { slug: "unrelated", kind: "skill", publicationStatus: "published", relatedAssetIds: ["prompt:old-prompt"], series: [{ previousAssetId: "prompt:old-prompt", nextAssetId: null }] },
  ];
  const active = applyAssetConsolidations(assets, entries);
  assert.deepEqual(active.map((a) => a.slug), ["current-skill", "unrelated"]);
  assert.ok(active[0].keywords.includes("Old Prompt"));
  assert.ok(active[0].searchTerms.includes("old-prompt"));
  assert.deepEqual(active[0].relatedAssetIds, ["skill:unrelated"]);
  assert.deepEqual(active[1].relatedAssetIds, ["skill:current-skill"]);
  assert.equal(active[1].series[0].previousAssetId, "skill:current-skill");
  assert.throws(() => applyAssetConsolidations([], entries), /published/);
  assert.throws(() => applyAssetConsolidations([{ ...assets[1], publicationStatus: "blocked-pending-artwork" }], entries), /published/);
  assert.throws(() => applyAssetConsolidations([{ ...assets[1], kind: "prompt-template" }], entries), /published/);
});

test("import reconciliation preserves downloads and unrelated files while pruning retired generated entries", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-consolidation-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const entries = parseAssetConsolidations(registry());
  write(root, "submissions/current-skill/SKILL.md", "maintained source\n");
  write(root, "public/bundles/old-prompt.prompt.md", legacy);
  write(root, "src/content/prompts/old-prompt.md", "retired generated page\n");
  write(root, "src/content/guides/old-prompt.md", "retired generated guide\n");
  write(root, "src/content/prompts/unrelated.md", "keep this page\n");
  reconcileConsolidatedAssets(root, entries, { checkOnly: true });
  assert.ok(existsSync(join(root, "src/content/prompts/old-prompt.md")));
  write(root, "public/bundles/old-prompt.prompt.md", "changed legacy bytes\n");
  assert.throws(() => reconcileConsolidatedAssets(root, entries), /missing or changed/);
  assert.ok(existsSync(join(root, "src/content/prompts/old-prompt.md")));
  write(root, "public/bundles/old-prompt.prompt.md", legacy);
  reconcileConsolidatedAssets(root, entries);
  assert.equal(existsSync(join(root, "src/content/prompts/old-prompt.md")), false);
  assert.equal(existsSync(join(root, "src/content/guides/old-prompt.md")), false);
  assert.equal(readFileSync(join(root, "src/content/prompts/unrelated.md"), "utf8"), "keep this page\n");
  assert.equal(readFileSync(join(root, "public/bundles/old-prompt.prompt.md"), "utf8"), legacy);
  write(root, "submissions/old-prompt/old-prompt.prompt.md", "attempted resurrection\n");
  assert.throws(() => reconcileConsolidatedAssets(root, entries), /would be republished/);
});

test("catalog generation removes stale retired records even before importer pruning", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-consolidated-catalog-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  write(root, "src/data/asset-consolidations.json", JSON.stringify(registry([
    entry({ slug: "old-skill", kind: "skill", legacyPaths: [], source: { commit: "a".repeat(40), path: "submissions/old-skill", author: "Test Author" }, legacyDownloads: [{ path: "bundles/old-skill.zip", sha256: digest }] }),
  ])));
  for (const slug of ["current-skill", "old-skill"]) {
    write(root, `src/content/skills/${slug}.md`, `---\nname: ${slug}\ndescription: Test content for consolidation.\nplatforms: [Scout]\ntags: [writing]\nauthor: Test Author\n---\nInstructions.\n`);
  }
  const assets = buildLibraryAssetSnapshot(root);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].slug, "current-skill");
  assert.ok(assets[0].legacyPaths.includes("/skills/old-skill/"));
  assert.equal(readAssetConsolidations(root).length, 1);
});
