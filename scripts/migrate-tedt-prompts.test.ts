import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { promptSchema } from "../src/lib/library-asset-schema.ts";
import type { PromptInventoryManifest } from "./inventory-tedt-prompts.ts";
import { readAssetConsolidations } from "./asset-consolidations.mjs";
import {
  APPROVED_MANIFEST_SHA256,
  APPROVED_SOURCE_COMMIT,
  applyApprovedPromptBodyEdits,
  decodeLegacySerializedPromptText,
  loadApprovedManifest,
  materializeApprovedPrompts,
  parseMigrationCliArgs,
  preserveArtworkOverlay,
} from "./migrate-tedt-prompts.ts";

const ROOT = join(import.meta.dirname, "..");
const MANIFEST_PATH = join(ROOT, "docs", "migrations", "tedt-prompts-inventory.json");
const consolidations = readAssetConsolidations(ROOT);
const retired = new Map(consolidations.map((entry) => [entry.slug, entry]));
const maintained = new Set(consolidations.map((entry) => entry.replacementSlug));

function digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function promptPath(slug: string): string {
  const legacy = retired.get(slug)?.legacyDownloads.find((download) => download.path.endsWith(".prompt.md"));
  if (legacy) return join(ROOT, "public", legacy.path);
  return join(ROOT, "submissions", slug, `${slug}.prompt.md`);
}

function metadata(slug: string): Record<string, any> {
  const legacy = retired.get(slug);
  if (legacy) return { ...legacy.source.catalog, provenance: legacy.source.provenance };
  return JSON.parse(readFileSync(join(ROOT, "submissions", slug, "metadata.json"), "utf8"));
}

test("migration CLI is strict and supports deterministic check/output locations", () => {
  assert.deepEqual(
    parseMigrationCliArgs(
      ["--source=/source", "--manifest", "/manifest.json", "--output-root=/output", "--check"],
      "/repo",
    ),
    {
      source: "/source",
      manifest: "/manifest.json",
      outputRoot: "/output",
      checkOnly: true,
    },
  );
  assert.throws(() => parseMigrationCliArgs([], "/repo"), /--source.*required/);
  assert.throws(() => parseMigrationCliArgs(["--source", "/repo", "--wat"], "/repo"), /unknown/);
});

test("the generator is bound to the byte-exact approved inventory and source commit", () => {
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  assert.equal(manifest.source.commit, APPROVED_SOURCE_COMMIT);
  assert.equal(manifest.records.length, 56);
  assert.equal(
    digest(readFileSync(MANIFEST_PATH, "utf8")),
    APPROVED_MANIFEST_SHA256,
  );
});

test("historical migration cannot recreate retired entries or overwrite a merged keeper", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-retired-migration-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  const keeper = "product-requirements-document-prd-template";
  mkdirSync(join(root, "submissions", keeper), { recursive: true });
  writeFileSync(join(root, "submissions", keeper, `${keeper}.prompt.md`), "Maintained merged behavior.\n");
  mkdirSync(join(root, "src/data"), { recursive: true });
  writeFileSync(join(root, "src/data/asset-consolidations.json"), JSON.stringify({ schemaVersion: 1, entries:
    manifest.records.filter((record) => record.canonicalSlug !== keeper).map((record) => ({
      slug: record.canonicalSlug, kind: "prompt-template", name: record.canonicalSlug,
      replacementSlug: keeper, replacementKind: "prompt-template", reason: "Consolidated fixture.", legacyPaths: [],
      legacyDownloads: [{ path: `bundles/${record.canonicalSlug}.prompt.md`, sha256: record.promptSha256 }],
      source: { commit: APPROVED_SOURCE_COMMIT, path: `submissions/${record.canonicalSlug}`, author: "Test Author" },
    })),
  }));
  const result = materializeApprovedPrompts({ source: join(root, "unavailable-history"), manifest: MANIFEST_PATH, outputRoot: root, checkOnly: false });
  assert.deepEqual(result, { prompts: 0, files: 0, changed: 0 });
  assert.equal(readFileSync(join(root, "submissions", keeper, `${keeper}.prompt.md`), "utf8"), "Maintained merged behavior.\n");
  for (const record of manifest.records) {
    if (record.canonicalSlug !== keeper) assert.equal(existsSync(join(root, "submissions", record.canonicalSlug)), false);
  }
});

test("all 56 migrated sources retain provenance through active entries or permanent retirements", () => {
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  const slugs = new Set<string>();
  for (const record of manifest.records) {
    const meta = metadata(record.canonicalSlug);
    const retirement = retired.get(record.canonicalSlug);
    if (!retirement) assert.doesNotThrow(() => promptSchema.parse(meta), record.canonicalSlug);
    assert.equal(meta.slug, record.canonicalSlug);
    assert.equal(meta.kind, "prompt-template");
    assert.ok(["blocked-pending-artwork", "published"].includes(meta.publicationStatus));
    assert.deepEqual(meta.payloadPaths, [record.proposedEntrypoint]);
    assert.equal(meta.provenance.sourceCommit, APPROVED_SOURCE_COMMIT);
    assert.equal(meta.provenance.sourceFileSha256, record.sourceFileSha256);
    assert.equal(meta.provenance.rawFrontmatterSha256, record.rawFrontmatterSha256);
    assert.deepEqual(meta.provenance.legacyPaths, [record.legacyPath]);
    assert.deepEqual(meta.provenance.legacyMetadata, record.legacyMetadata);
    assert.deepEqual(meta.provenance.legacyImage, record.legacyImage);

    const prompt = readFileSync(promptPath(record.canonicalSlug), "utf8");
    if (retirement) {
      assert.equal(existsSync(join(ROOT, "submissions", record.canonicalSlug)), false);
      assert.equal(digest(prompt), record.promptSha256, record.canonicalSlug);
      assert.equal(digest(prompt), meta.provenance.importedPromptSha256);
      assert.equal(meta.provenance.importedGuideSha256, record.guideSha256);
      assert.ok(!slugs.has(record.canonicalSlug));
      slugs.add(record.canonicalSlug);
      continue;
    }
    const guide = readFileSync(
      join(ROOT, "submissions", record.canonicalSlug, "README.md"),
      "utf8",
    );
    assert.equal(digest(prompt), meta.provenance.importedPromptSha256);
    assert.equal(digest(guide), meta.provenance.importedGuideSha256);
    if (maintained.has(record.canonicalSlug)) {
      assert.ok(meta.provenance.appliedRepairs.includes("consolidate-duplicate-entrypoints-2026-10-18"));
      assert.equal(meta.provenance.sourcePromptSha256, record.promptSha256);
      assert.equal(meta.provenance.sourceGuideSha256, record.guideSha256);
    } else {
      assert.equal(digest(guide), record.guideSha256);
    }
    if (!maintained.has(record.canonicalSlug) && record.id !== "prompt:academic-critique-content") {
      assert.equal(digest(prompt), record.promptSha256, record.canonicalSlug);
    }
    assert.ok(!slugs.has(record.canonicalSlug));
    slugs.add(record.canonicalSlug);
  }
  assert.equal(slugs.size, 56);
});

test("migration reruns preserve only a complete derived artwork overlay", () => {
  const generated = {
    ...metadata("prd-generator"),
    publicationStatus: "blocked-pending-artwork",
  };
  for (const key of Object.keys(generated)) {
    if (key.startsWith("coverImage")) delete generated[key];
  }
  assert.deepEqual(preserveArtworkOverlay(generated, null), generated);
  assert.throws(
    () => preserveArtworkOverlay(generated, { ...generated, coverImage: "skill-art/prd-generator.webp" }),
    /incomplete artwork publication overlay/,
  );

  const current = {
    ...generated,
    publicationStatus: "published",
    coverImage: "skill-art/prd-generator.webp",
    coverImageAlt: "Abstract editorial cover artwork for the PRD generator prompt.",
    coverImagePrompt:
      "Use case: stylized-concept. Composition and framing: exact 16:10 landscape. Create an abstract editorial scene for a PRD generator. Constraints: no paw imagery, no cats, no text, no logos, and no watermark.",
    coverImageAspectRatio: "16:10",
    coverImageWidth: 1600,
    coverImageHeight: 1000,
    coverImageGenerator: "OpenAI image generation via Codex",
    coverImageGeneratedAt: "2026-09-03",
    coverImageSourceHash: `sha256:${"a".repeat(64)}`,
    coverImageSourceHashVersion: 2,
  };
  const preserved = preserveArtworkOverlay(generated, current);
  assert.equal(preserved.publicationStatus, "published");
  assert.equal(preserved.coverImage, current.coverImage);
  assert.equal(preserved.coverImageSourceHashVersion, 2);
});

test("E05 adds the exact PRD variable without changing the prompt body", () => {
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  const record = manifest.records.find((entry) => entry.id === "prompt:prd-generator")!;
  const meta = metadata(record.canonicalSlug);
  assert.deepEqual(meta.variables, [
    {
      name: "prd_instructions",
      label: "PRD Instructions",
      type: "textarea",
      required: true,
      default: null,
      placeholder: "Enter the project-specific instructions for the PRD.",
      help: "Describe the product, users, goals, constraints, and requirements the PRD must address.",
      rows: 8,
    },
  ]);
  assert.equal(digest(readFileSync(promptPath(record.canonicalSlug), "utf8")), record.promptSha256);
  assert.ok(meta.provenance.appliedRepairs.includes("add-prd-instructions-variable"));
});

test("E06 and the approved display repair produce clean academic prompt text", () => {
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  const repairs = manifest.proposedRepairs.promptBodyEdits.filter(
    (repair) => repair.artifactId === "prompt:academic-critique-content",
  );
  const imported = readFileSync(promptPath("academic-critique-content"), "utf8");
  assert.equal(digest(imported), repairs.at(-1)?.resultingPromptSha256);
  assert.equal(
    imported.split("Include a formal grading rubric: {{include_grading}}.").length - 1,
    1,
  );
  assert.doesNotMatch(imported, /\\(?:n|r|t|u[0-9a-fA-F]{4}|"|&)/);
  assert.doesNotMatch(imported, /\\\n/);
  assert.doesNotMatch(imported, /(^|\n)[nrt](?=<[A-Z])/);
  assert.deepEqual(
    repairs.map((repair) => repair.id),
    [
      "use-academic-include-grading-variable",
      "decode-academic-legacy-serialized-text",
    ],
  );
  assert.ok(
    metadata("academic-critique-content").provenance.appliedRepairs.includes(
      "decode-academic-legacy-serialized-text",
    ),
  );
});

test("legacy serialized prompt decoding joins wrapper lines and decodes known escapes", () => {
  const malformed =
    'One\\\n\\ line\\nTwo \\u2019quoted\\u2019 and \\"plain\\" plus A\\&B.\\n\\\n\\n<Standards>\n';
  assert.equal(
    decodeLegacySerializedPromptText(malformed),
    'One line\nTwo ’quoted’ and "plain" plus A&B.\n\n<Standards>\n',
  );
});

test("E07 emits both repaired two-step workflows with no dangling relationships", () => {
  const simple = metadata("simple-blog-generator");
  const universal = metadata("universal-content-creator-demo");
  const academic = metadata("academic-critique-content");
  assert.deepEqual(simple.series, [
    {
      id: "simple-blog-review",
      title: "Simple Blog Review",
      step: 1,
      totalSteps: 2,
      previousAssetId: null,
      nextAssetId: "prompt:academic-critique-content",
    },
  ]);
  assert.deepEqual(universal.series, [
    {
      id: "universal-content-review",
      title: "Universal Content Review",
      step: 1,
      totalSteps: 2,
      previousAssetId: null,
      nextAssetId: "prompt:academic-critique-content",
    },
  ]);
  assert.equal(academic.series.length, 2);
  assert.deepEqual(
    new Set(academic.relatedAssetIds),
    new Set(["prompt:simple-blog-generator", "prompt:universal-content-creator-demo"]),
  );
});

test("approved metadata, model, alias, and inclusion decisions are materialized", () => {
  const manifest = loadApprovedManifest(MANIFEST_PATH);
  const expectedTitles = new Map([
    ["business-skills-prompts", "Business Skills Prompts"],
    ["create-a-unforgettable-opening-to-a-ttrpg", "Create an Unforgettable Opening to a TTRPG"],
    ["expert-novelist", "Communications Expert Novelist"],
    ["find-your-super-power", "Find Your Superpower"],
    ["risk-assessment-clean-up", "Risk Assessment Cleanup"],
    ["technology-architecture-as-markdown", "Technology Architecture Generator"],
  ]);
  for (const [slug, title] of expectedTitles) assert.equal(metadata(slug).name, title);
  assert.equal(metadata("technology-architecture-as-markdown").status, "beta");

  const prd3 = metadata("product-requirements-document-prd-template-3");
  assert.match(prd3.description, /\(PRD\) Template 3/);
  assert.match(prd3.seoDescription, /\(PRD\) Template 3/);

  const aliases = new Map([
    ["artistic-analysis", "/prompts/artistic-Analysis/"],
    [
      "create-a-unforgettable-opening-to-a-ttrpg",
      "/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/",
    ],
    ["midjourney-v6-1-prompt-template", "/prompts/midjourney-v6.1-prompt-template/"],
  ]);
  for (const [slug, path] of aliases) {
    assert.deepEqual(metadata(slug).provenance.legacyPaths, [path]);
  }

  const hidden = manifest.records.filter((record) => !record.visibleInAlphaIndex);
  assert.equal(hidden.length, 13);
  assert.ok(
    hidden.every((record) =>
      metadata(record.canonicalSlug).provenance.appliedRepairs.includes(
        "include-hidden-alpha-prompt",
      ),
    ),
  );

  for (const record of manifest.records) {
    const meta = metadata(record.canonicalSlug);
    assert.deepEqual(meta.models, record.normalizedModels);
    assert.deepEqual(meta.compatibility, record.compatibility);
    assert.deepEqual(meta.worksWith, record.compatibility);
    assert.ok(!meta.models.includes("github"));
    assert.ok(!meta.models.includes("04-mini"));
    assert.ok(!meta.models.includes("04-mini-high"));
    if (record.unknownModelIdentifiers.includes("3")) {
      assert.deepEqual(meta.provenance.unresolvedModelIdentifiers, [3]);
      assert.ok(meta.provenance.sourceModels.includes(3));
    }
  }

  assert.equal(
    readFileSync(promptPath("product-requirements-document-prd-template-2"), "utf8"),
    readFileSync(promptPath("product-requirements-document-prd-template-3"), "utf8"),
  );
});
