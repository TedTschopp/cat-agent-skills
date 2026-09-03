import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  ARTWORK,
  ARTWORK_FIELDS,
  ARTWORK_SOURCE_HASH_VERSION,
  assetSourceHash,
  artworkDate,
  artworkSourceHashVersion,
  discoverCandidates,
  excludesPawImagery,
  framedSourceDigest,
  parseMetadataText,
  prepareArtwork,
  serializeMetadataText,
  skillSourceHash,
  slugsFromAddedAssetPaths,
  slugsFromAddedSkillPaths,
  stableJson,
  validateArtwork,
  webpDimensions,
} from "./skill-artwork.ts";
import { validateSkillData } from "./validate-skill.ts";

function vp8x(width: number, height: number): Buffer {
  const chunk = Buffer.alloc(10);
  const write24 = (offset: number, value: number) => {
    chunk[offset] = value & 0xff;
    chunk[offset + 1] = (value >> 8) & 0xff;
    chunk[offset + 2] = (value >> 16) & 0xff;
  };
  write24(4, width - 1);
  write24(7, height - 1);
  const buffer = Buffer.alloc(12 + 8 + chunk.length);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WEBP", 8, "ascii");
  buffer.write("VP8X", 12, "ascii");
  buffer.writeUInt32LE(chunk.length, 16);
  chunk.copy(buffer, 20);
  return buffer;
}

const base = {
  name: "Example",
  description: "Catalog description",
  platforms: ["Cowork"],
  tags: ["example"],
  author: "Example Author",
};

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function promptMetadata(slug: string): Record<string, unknown> {
  return {
    kind: "prompt-template",
    slug,
    name: "Example Prompt",
    description: "A prompt used to verify the artwork source contract.",
    status: "active",
    publicationStatus: "blocked-pending-artwork",
    topics: ["Testing"],
    tags: ["testing"],
    keywords: [],
    models: ["gpt-4"],
    compatibility: ["chatgpt"],
    worksWith: ["chatgpt"],
    author: "Example Author",
    entrypoint: `${slug}.prompt.md`,
    payloadPaths: [`${slug}.prompt.md`],
    downloadPath: `bundles/${slug}.prompt.md`,
    createdAt: "2026-09-01",
  };
}

function createPromptSubmission(root: string, slug: string): Record<string, unknown> {
  const submission = join(root, "submissions", slug);
  mkdirSync(submission, { recursive: true });
  const metadata = promptMetadata(slug);
  writeJson(join(submission, "metadata.json"), metadata);
  writeFileSync(join(submission, `${slug}.prompt.md`), "Draft a concise test plan.\n", "utf8");
  writeFileSync(join(submission, "README.md"), "# Example Prompt\n\nTesting guide.\n", "utf8");
  return metadata;
}

function git(root: string, args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

test("paw exclusion accepts an explicit comma-separated no clause", () => {
  assert.equal(
    excludesPawImagery(
      "Constraints: no text, letters, numbers, logos, product UI, paw imagery, paw logo, cats, or watermark.",
    ),
    true,
  );
  assert.equal(excludesPawImagery("Constraints: paw imagery is acceptable."), false);
});

test("the artwork contract is exact 16:10 at 1600x1000", () => {
  assert.deepEqual(webpDimensions(vp8x(1600, 1000)), { width: 1600, height: 1000 });
  assert.equal(ARTWORK.aspectRatio, "16:10");
});

test("generated dates use the gallery's Pacific calendar day", () => {
  assert.equal(artworkDate(new Date("2026-08-30T00:30:00Z")), "2026-08-29");
});

test("future skills and prompt templates share the artwork queue", () => {
  const paths = [
    "submissions/microsoft-import/metadata.json",
    "src/content/skills/microsoft-import.md",
    "submissions/local-skill/metadata.yaml",
    "src/content/skills/local-skill.md",
    "submissions/local-skill/SKILL.md",
    "submissions/example-prompt/example-prompt.prompt.md",
    "src/content/prompts/example-prompt.md",
    "src/content/prompts/catalog-prompt.prompt.md",
    "src/content/artifacts/repo-guidance.md",
    "submissions/wrong-prompt/different.prompt.md",
    "src/content/skills/Unsafe Name.md",
    "docs/authoring-skills.md",
  ];
  assert.deepEqual(slugsFromAddedAssetPaths(paths), [
    "catalog-prompt",
    "example-prompt",
    "local-skill",
    "microsoft-import",
    "repo-guidance",
  ]);
  assert.deepEqual(slugsFromAddedSkillPaths(paths), slugsFromAddedAssetPaths(paths));
});

test("gallery artwork metadata round-trips through supported YAML sidecars", () => {
  const metadata = {
    ...base,
    createdAt: "2026-08-29",
    coverImage: "skill-art/example.webp",
    coverImagePrompt: "A complete exact 16:10 prompt with no paw imagery.",
  };
  const serialized = serializeMetadataText("metadata.yaml", metadata);
  const parsed = parseMetadataText("metadata.yaml", serialized);
  assert.deepEqual(parsed, metadata);
  assert.equal(parsed.createdAt, "2026-08-29");
});

test("stable source hashing distinguishes Date values", () => {
  assert.notEqual(
    stableJson({ createdAt: new Date("2026-08-29T00:00:00.000Z") }),
    stableJson({ createdAt: new Date("2026-08-30T00:00:00.000Z") }),
  );
});

test("source hashing frames path and content boundaries", () => {
  const left = framedSourceDigest([
    { kind: "metadata", data: "{}" },
    { kind: "path", data: "a" },
    { kind: "content", data: "bc" },
  ]);
  const right = framedSourceDigest([
    { kind: "metadata", data: "{}" },
    { kind: "path", data: "ab" },
    { kind: "content", data: "c" },
  ]);
  assert.notEqual(left, right);
});

test("the v1 skill source hash remains byte-for-byte compatible", (t) => {
  const root = mkdtempSync(join(tmpdir(), "artwork-v1-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const submission = join(root, "submissions", "example");
  mkdirSync(submission, { recursive: true });
  writeFileSync(join(submission, "SKILL.md"), "# Example\n\nDo the work.\n", "utf8");
  writeFileSync(join(submission, "README.md"), "# Guide\n", "utf8");
  const metadata = {
    ...base,
    createdAt: "2026-08-29",
    coverImage: "skill-art/example.webp",
    coverImageAlt: "An abstract editorial cover for the example skill.",
    coverImagePrompt:
      "Use case: stylized-concept. Composition/framing: exact 16:10 landscape with a crop-safe subject. Constraints: no paw imagery, no cats, no text, no logos, no trademarks, and no watermark.",
    coverImageAspectRatio: "16:10",
    coverImageWidth: 1600,
    coverImageHeight: 1000,
    coverImageGenerator: "OpenAI image generation via Codex",
    coverImageGeneratedAt: "2026-08-29",
    coverImageSourceHash: `sha256:${"a".repeat(64)}`,
  };
  writeJson(join(submission, "metadata.json"), metadata);

  assert.equal(
    skillSourceHash(root, "example", metadata),
    "sha256:f76b003b53cc9f62f271591eef7ceb5377660741d28efcacee097a056a85a253",
  );
  assert.equal(artworkSourceHashVersion(metadata), 1);
});

test("all 96 enrolled covers retain their stored v1 source hashes", () => {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const enrollment = JSON.parse(
    readFileSync(
      join(root, ".agents", "skills", "generate-skill-artwork", "references", "enrollment.json"),
      "utf8",
    ),
  ) as { initialSlugs: string[] };
  assert.equal(enrollment.initialSlugs.length, 96);
  for (const slug of enrollment.initialSlugs) {
    const metadataPath = ["metadata.json", "metadata.yaml", "metadata.yml"]
      .map((name) => join(root, "submissions", slug, name))
      .find((path) => existsSync(path));
    assert.ok(metadataPath, `${slug} metadata is missing`);
    const metadata = parseMetadataText(metadataPath, readFileSync(metadataPath, "utf8"));
    assert.equal(metadata.coverImageSourceHashVersion, undefined, `${slug} must remain v1`);
    assert.equal(
      skillSourceHash(root, slug, metadata),
      metadata.coverImageSourceHash,
      `${slug} v1 source hash changed`,
    );
  }
});

test("v2 source hashes bind prompt metadata, payload, guide, and asset kind", (t) => {
  const root = mkdtempSync(join(tmpdir(), "artwork-v2-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const metadata = createPromptSubmission(root, "example-prompt");
  const baseline = assetSourceHash(root, "example-prompt", metadata);
  assert.match(baseline, /^sha256:[a-f0-9]{64}$/);
  assert.equal(artworkSourceHashVersion(metadata), ARTWORK_SOURCE_HASH_VERSION);

  const generated = Object.fromEntries(ARTWORK_FIELDS.map((field) => [field, `generated-${field}`]));
  assert.equal(
    assetSourceHash(root, "example-prompt", {
      ...metadata,
      ...generated,
      coverImageSourceHashVersion: ARTWORK_SOURCE_HASH_VERSION,
      publicationStatus: "published",
    }),
    baseline,
    "derived artwork and publication fields must not hash themselves",
  );

  assert.notEqual(
    assetSourceHash(root, "example-prompt", { ...metadata, description: "Changed description" }),
    baseline,
  );
  assert.notEqual(
    assetSourceHash(root, "example-prompt", { ...metadata, kind: "skill" }),
    baseline,
  );
  writeFileSync(
    join(root, "submissions", "example-prompt", "README.md"),
    "# Example Prompt\n\nChanged guide.\n",
    "utf8",
  );
  assert.notEqual(assetSourceHash(root, "example-prompt", metadata), baseline);
});

test("uncommitted prompt templates enroll and publish atomically through v2 prepare", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "artwork-prompt-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.email", "artwork-test@example.invalid"]);
  git(root, ["config", "user.name", "Artwork Test"]);
  writeFileSync(join(root, ".baseline"), "baseline\n", "utf8");
  git(root, ["add", ".baseline"]);
  git(root, ["commit", "--quiet", "-m", "baseline"]);
  const baselineCommit = git(root, ["rev-parse", "HEAD"]);

  writeJson(
    join(root, ".agents", "skills", "generate-skill-artwork", "references", "enrollment.json"),
    { schemaVersion: 1, baselineCommit, initialSlugs: [] },
  );
  createPromptSubmission(root, "example-prompt");

  assert.deepEqual(discoverCandidates(root), [
    {
      slug: "example-prompt",
      name: "Example Prompt",
      kind: "prompt-template",
      metadataPath: "submissions/example-prompt/metadata.json",
      status: "pending",
      sourceHash: assetSourceHash(root, "example-prompt"),
      sourceHashVersion: ARTWORK_SOURCE_HASH_VERSION,
    },
  ]);

  const generationPrompt = join(root, "generation-prompt.txt");
  writeFileSync(
    generationPrompt,
    "Use case: stylized-concept. Asset type: AI.Tedt.org prompt gallery cover. Composition/framing: exact 16:10 landscape with a crop-safe subject. Constraints: no paw imagery, no cats, no text, no logos, no trademarks, and no watermark.",
    "utf8",
  );
  const invalidSource = join(root, "invalid-source.txt");
  writeFileSync(invalidSource, "not an image", "utf8");
  await assert.rejects(
    prepareArtwork(root, [
      "--slug",
      "example-prompt",
      "--source",
      invalidSource,
      "--prompt-file",
      generationPrompt,
      "--alt",
      "An abstract editorial illustration for an example prompt.",
    ]),
  );
  const metadataPath = join(root, "submissions", "example-prompt", "metadata.json");
  assert.equal(JSON.parse(readFileSync(metadataPath, "utf8")).publicationStatus, "blocked-pending-artwork");
  assert.equal(existsSync(join(root, "public", "skill-art", "example-prompt.webp")), false);

  const source = join(root, "source.png");
  await sharp({
    create: {
      width: 320,
      height: 200,
      channels: 3,
      background: { r: 0, g: 68, b: 111 },
    },
  })
    .png()
    .toFile(source);
  await prepareArtwork(root, [
    "--slug",
    "example-prompt",
    "--source",
    source,
    "--prompt-file",
    generationPrompt,
    "--alt",
    "An abstract editorial illustration for an example prompt.",
  ]);

  const updated = JSON.parse(readFileSync(metadataPath, "utf8")) as Record<string, unknown>;
  assert.equal(updated.publicationStatus, "published");
  assert.equal(updated.coverImageSourceHashVersion, ARTWORK_SOURCE_HASH_VERSION);
  assert.equal(updated.coverImageSourceHash, assetSourceHash(root, "example-prompt", updated));
  assert.deepEqual(validateArtwork(root, "example-prompt", updated), []);
  assert.equal(discoverCandidates(root)[0]?.status, "complete");

  writeFileSync(
    join(root, "submissions", "example-prompt", "example-prompt.prompt.md"),
    "Draft a concise test plan without serialized escape artifacts.\n",
    "utf8",
  );
  assert.equal(discoverCandidates(root)[0]?.status, "stale");
  await assert.rejects(
    prepareArtwork(root, [
      "--slug",
      "example-prompt",
      "--source",
      source,
      "--prompt-file",
      generationPrompt,
      "--alt",
      "An abstract editorial illustration for an example prompt.",
    ]),
    /stale; refusing to overwrite or repair artwork/,
  );
  await prepareArtwork(root, [
    "--slug",
    "example-prompt",
    "--source",
    source,
    "--prompt-file",
    generationPrompt,
    "--alt",
    "An abstract editorial illustration for an example prompt.",
    "--refresh-stale",
    "true",
  ]);
  const refreshed = JSON.parse(readFileSync(metadataPath, "utf8")) as Record<string, unknown>;
  assert.equal(refreshed.coverImageSourceHash, assetSourceHash(root, "example-prompt", refreshed));
  assert.equal(discoverCandidates(root)[0]?.status, "complete");
});

test("minimal generic file metadata enters the same blocked-to-published artwork gate", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "artwork-generic-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  git(root, ["init", "--quiet"]);
  git(root, ["config", "user.email", "artwork-test@example.invalid"]);
  git(root, ["config", "user.name", "Artwork Test"]);
  writeFileSync(join(root, ".baseline"), "baseline\n", "utf8");
  git(root, ["add", ".baseline"]);
  git(root, ["commit", "--quiet", "-m", "baseline"]);
  const baselineCommit = git(root, ["rev-parse", "HEAD"]);
  writeJson(
    join(root, ".agents", "skills", "generate-skill-artwork", "references", "enrollment.json"),
    { schemaVersion: 1, baselineCommit, initialSlugs: [] },
  );

  const slug = "example-work-spec";
  const submission = join(root, "submissions", slug);
  mkdirSync(join(submission, "spec"), { recursive: true });
  writeJson(join(submission, "metadata.json"), {
    kind: "work-specification",
    name: "Example Work Specification",
    description: "A multi-file specification used to verify generic artwork publication.",
    tags: ["Specification"],
    author: "Example Author",
    entrypoint: "spec/requirements.md",
    payloadPaths: ["spec/requirements.md", "spec/design.md", "spec/tasks.md"],
  });
  writeFileSync(join(submission, "spec", "requirements.md"), "# Requirements\n", "utf8");
  writeFileSync(join(submission, "spec", "design.md"), "# Design\n", "utf8");
  writeFileSync(join(submission, "spec", "tasks.md"), "# Tasks\n", "utf8");

  const pending = discoverCandidates(root);
  assert.equal(pending[0]?.slug, slug);
  assert.equal(pending[0]?.kind, "work-specification");
  assert.equal(pending[0]?.status, "pending");
  assert.equal(pending[0]?.sourceHashVersion, ARTWORK_SOURCE_HASH_VERSION);

  const promptFile = join(root, "generation-prompt.txt");
  writeFileSync(
    promptFile,
    "Use case: stylized-concept. Asset type: AI.Tedt.org work specification cover. Composition/framing: exact 16:10 landscape with a crop-safe subject. Constraints: no paw imagery, no cats, no text, no logos, no trademarks, and no watermark.",
    "utf8",
  );
  const source = join(root, "source.png");
  await sharp({
    create: {
      width: 320,
      height: 200,
      channels: 3,
      background: { r: 231, g: 121, b: 37 },
    },
  })
    .png()
    .toFile(source);
  await prepareArtwork(root, [
    "--slug",
    slug,
    "--source",
    source,
    "--prompt-file",
    promptFile,
    "--alt",
    "An abstract editorial illustration for a multi-file work specification.",
  ]);

  const metadataPath = join(submission, "metadata.json");
  const updated = JSON.parse(readFileSync(metadataPath, "utf8")) as Record<string, unknown>;
  assert.equal(updated.slug, undefined, "derived catalog fields stay out of the contributor sidecar");
  assert.equal(updated.publicationStatus, "published");
  assert.equal(updated.coverImageSourceHashVersion, ARTWORK_SOURCE_HASH_VERSION);
  assert.equal(updated.coverImageSourceHash, assetSourceHash(root, slug, updated));
  assert.deepEqual(validateArtwork(root, slug, updated), []);
  assert.equal(discoverCandidates(root)[0]?.status, "complete");
});

test("skill metadata accepts a complete generated-artwork record", () => {
  const result = validateSkillData(
    {
      ...base,
      coverImage: "skill-art/example.webp",
      coverImageAlt: "An abstract editorial cover for the example skill.",
      coverImagePrompt:
        "Use case: stylized-concept. Composition/framing: exact 16:10 landscape with a crop-safe subject. Constraints: no paw imagery, no cats, no text, no logos, no trademarks, and no watermark.",
      coverImageAspectRatio: "16:10",
      coverImageWidth: 1600,
      coverImageHeight: 1000,
      coverImageGenerator: "OpenAI image generation via Codex",
      coverImageGeneratedAt: "2026-08-29",
      coverImageSourceHash: `sha256:${"a".repeat(64)}`,
    },
    "complete",
  );
  assert.equal(result.ok, true, result.problems.join("; "));
});

test("skill metadata rejects a partial generated-artwork record", () => {
  const result = validateSkillData(
    { ...base, coverImage: "skill-art/example.webp" },
    "partial",
  );
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((problem) => problem.startsWith("coverImagePrompt:")));
});
