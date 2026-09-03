/**
 * Unit tests for the shared catalog-merge policy used by every submission
 * processor (`buildMeta` + `CATALOG_PASSTHROUGH`). These lock in the invariant
 * that derived/canonical frontmatter always wins over the metadata sidecar and
 * that undocumented catalog keys are dropped — the bug class that a per-field
 * spot fix would leave open.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import AdmZip from "adm-zip";
import matter from "gray-matter";
import {
  assertSubmissionDirectory,
  buildContent,
  buildPromptContent,
  buildMeta,
  CATALOG_PASSTHROUGH,
  parseImportCliArgs,
  listFiles,
  readPackedSubmissionFiles,
  shouldImportSlug,
} from "./import-submissions.ts";

test("generated Markdown ends with exactly one newline", () => {
  const content = buildContent(
    { name: "Whitespace Test" },
    "\n\nInstructions stay intact.\n\n\n",
  );

  assert.match(content, /Instructions stay intact\.\n$/);
  assert.doesNotMatch(content, /\n\n$/);
});

test("prompt content serializes nested metadata deterministically without trimming payload bytes", () => {
  const body = "\n  Preserve leading and trailing whitespace.  \n\n";
  const meta = {
    variables: [{ name: "topic", type: "text", required: true }],
    name: "Prompt",
  };
  const first = buildPromptContent(meta, body);
  const second = buildPromptContent({ ...meta }, body);
  assert.equal(first, second);
  assert.ok(first.endsWith(body));
  assert.match(first, /variables:\n  - name: "topic"/);
});

test("prompt artwork aspect ratios remain strings after a frontmatter round trip", () => {
  const output = buildPromptContent(
    { name: "Prompt", coverImageAspectRatio: "16:10" },
    "Prompt body\n",
  );

  assert.equal(matter(output).data.coverImageAspectRatio, "16:10");
});

test("submission enumeration rejects symlinks before reading their targets", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-import-symlink-"));
  const payload = join(root, "payload");
  mkdirSync(payload);
  writeFileSync(join(root, "outside.txt"), "must not be bundled\n");
  symlinkSync("../outside.txt", join(payload, "leak.txt"));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.throws(() => listFiles(payload), /unsupported symlink: leak\.txt/);
});

test("submission enumeration rejects a symlinked submission root", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-import-root-symlink-"));
  const outside = join(root, "outside-submission");
  const submission = join(root, "evil-submission");
  mkdirSync(outside);
  writeFileSync(join(outside, "SKILL.md"), "must not be bundled\n");
  symlinkSync("outside-submission", submission, "dir");
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => listFiles(submission),
    /unsupported symlink: evil-submission/,
  );
  assert.deepEqual(
    listFiles(outside).map((file) => file.path),
    ["SKILL.md"],
  );
});

test("the importer rejects a symlinked submissions parent", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-import-parent-symlink-"));
  const outside = join(root, "outside");
  const submissions = join(root, "submissions");
  mkdirSync(join(outside, "poc"), { recursive: true });
  writeFileSync(join(outside, "poc", "SKILL.md"), "must not be bundled\n");
  symlinkSync("outside", submissions, "dir");
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => assertSubmissionDirectory(submissions, "submissions"),
    /unsupported symlink: submissions/,
  );
});

test("grandfathered ZIP import rejects backslash entry names before reading them", (t) => {
  const root = mkdtempSync(join(tmpdir(), "cat-import-zip-path-"));
  const zipPath = join(root, "payload.zip");
  const zip = new AdmZip();
  const entry = zip.addFile("placeholder", Buffer.from("must not be bundled\n"));
  entry.entryName = "assets\\payload.txt";
  zip.writeZip(zipPath);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  assert.throws(
    () => readPackedSubmissionFiles(zipPath, "test ZIP"),
    /backslashes are not portable path separators/,
  );
});

test("the importer accepts repeatable, deduplicated slug filters", () => {
  assert.deepEqual(
    parseImportCliArgs([
      "--check",
      "--slug",
      "meeting-analyzer",
      "--slug=work-brief",
      "--slug",
      "meeting-analyzer",
    ]),
    {
      checkOnly: true,
      slugs: ["meeting-analyzer", "work-brief"],
    },
  );
});

test("the importer rejects missing, unsafe, and unknown CLI arguments", () => {
  assert.throws(() => parseImportCliArgs(["--slug"]), /requires a value/);
  assert.throws(() => parseImportCliArgs(["--slug", "../escape"]), /invalid submission slug/);
  assert.throws(() => parseImportCliArgs(["--slgu", "work-brief"]), /unknown argument/);
});

test("the slug filter imports all entries by default and only selected entries when set", () => {
  assert.equal(shouldImportSlug("one", new Set()), true);
  assert.equal(shouldImportSlug("one", new Set(["one", "two"])), true);
  assert.equal(shouldImportSlug("three", new Set(["one", "two"])), false);
});

test("derived fields always win over same-named catalog keys", () => {
  const meta = buildMeta(
    {
      name: "Display Name",
      description: "catalog summary",
      agentDescription: "agent-facing trigger",
      platforms: ["Cowork"],
      type: "plugin",
      bundle: "bundles/x.zip",
    },
    {
      name: "SIDECAR NAME",
      description: "SIDECAR DESC",
      agentDescription: "SIDECAR AGENT DESC",
      platforms: ["Scout"],
      type: "automation",
      bundle: "bundles/EVIL.zip",
    },
  );
  assert.equal(meta.name, "Display Name");
  assert.equal(meta.description, "catalog summary");
  assert.equal(meta.agentDescription, "agent-facing trigger");
  assert.deepEqual(meta.platforms, ["Cowork"]);
  assert.equal(meta.type, "plugin");
  assert.equal(meta.bundle, "bundles/x.zip");
});

test("a metadata sidecar cannot override the SKILL.md agentDescription (the #140 regression)", () => {
  const meta = buildMeta(
    { name: "N", description: "D", agentDescription: "FROM SKILL.md" },
    {
      agentDescription: "FROM metadata.json",
      platforms: ["Cowork"],
      tags: ["t"],
      author: "A",
    },
  );
  assert.equal(meta.agentDescription, "FROM SKILL.md");
});

test("only allowlisted catalog fields pass through; everything else is dropped", () => {
  const catalog: Record<string, unknown> = {
    // canonical fields the importer owns — must not pass through:
    name: "n",
    description: "d",
    type: "automation",
    // allowlisted, human-authored:
    platforms: ["Cowork"],
    tags: ["a", "b"],
    author: "Ada",
    authorUrl: "https://github.com/ada",
    authorGithub: "ada",
    version: "1.2.3",
    createdAt: "2024-01-01",
    updatedAt: "2024-02-01",
    coverColor: "#fff",
    coverImage: "skill-art/n.webp",
    coverImageAlt: "Abstract skill artwork for N.",
    coverImagePrompt: "Use case: stylized-concept. Composition/framing: exact 16:10 landscape. Constraints: no paw imagery, no text, no logos, and no watermark. A calm editorial metaphor for the skill.",
    coverImageAspectRatio: "16:10",
    coverImageWidth: 1600,
    coverImageHeight: 1000,
    coverImageGenerator: "OpenAI image generation via Codex",
    coverImageGeneratedAt: "2026-08-29",
    coverImageSourceHash: `sha256:${"a".repeat(64)}`,
    coverImageSourceHashVersion: 2,
    featured: true,
    // undocumented noise that must be dropped:
    slug: "n",
    license: "MIT",
    runtime: "python>=3.10",
    entrypoint: "scripts/x.py",
    dependencies: ["a"],
    capabilities: ["b"],
    evil: "leak",
  };
  const meta = buildMeta({ name: "N", description: "D" }, catalog);

  for (const key of CATALOG_PASSTHROUGH) {
    assert.ok(key in meta, `expected allowlisted "${key}" to pass through`);
  }
  for (const key of [
    "slug",
    "license",
    "runtime",
    "entrypoint",
    "dependencies",
    "capabilities",
    "evil",
    // `type` is derived, not passthrough: a catalog-only `type` is dropped so a
    // skill can't self-declare its type (the schema defaults it instead).
    "type",
  ]) {
    assert.ok(!(key in meta), `expected non-allowlisted "${key}" to be dropped`);
  }
});

test("undefined derived values are skipped so no empty keys are emitted", () => {
  const meta = buildMeta(
    { name: "N", description: "D", agentDescription: undefined, bundle: undefined },
    { platforms: ["Cowork"], tags: ["t"], author: "A" },
  );
  assert.ok(!("agentDescription" in meta));
  assert.ok(!("bundle" in meta));
});

test("undefined catalog values are skipped", () => {
  const meta = buildMeta(
    { name: "N", description: "D" },
    { platforms: ["Cowork"], tags: undefined },
  );
  assert.ok(!("tags" in meta));
});

test("CATALOG_PASSTHROUGH never lists a canonical/derived field", () => {
  for (const forbidden of ["name", "description", "agentDescription", "type", "bundle"]) {
    assert.ok(
      !(CATALOG_PASSTHROUGH as readonly string[]).includes(forbidden),
      `"${forbidden}" must never be in the passthrough allowlist`,
    );
  }
});
