import assert from "node:assert/strict";
import { readFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import AdmZip from "adm-zip";
import {
  GENERIC_FILE_ASSET_KINDS,
  genericFileAssetSchema,
  normalizeGenericFileAssetInput,
  type GenericFileAssetKind,
} from "../src/lib/library-asset-schema.ts";
import {
  genericFileToLibraryAsset,
  toLibraryAssetSummary,
} from "../src/lib/library-assets.ts";
import {
  buildArtifactPayloadIndex,
  buildPromptContent,
  genericArtifactDownloadPath,
  loadSubmission,
  validateGenericPayloadFiles,
  writeBundle,
  writeGenericArtifactDownloads,
} from "./import-submissions.ts";
import matter from "gray-matter";

function metadata(
  kind: GenericFileAssetKind,
  payloadPaths = ["AGENTS.md"],
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    kind,
    slug: "generic-example",
    name: "Generic Example",
    description: "A generic file artifact used to verify the unified library pipeline.",
    status: "active",
    publicationStatus: "blocked-pending-artwork",
    topics: ["Agent Configuration"],
    tags: ["Agent Configuration"],
    keywords: [],
    models: [],
    compatibility: ["codex"],
    worksWith: ["codex"],
    author: "Example Author",
    entrypoint: payloadPaths[0],
    payloadPaths,
    downloadPath: genericArtifactDownloadPath("generic-example", payloadPaths),
    createdAt: "2026-09-03",
    variables: [],
    series: [],
    relatedAssetIds: [],
    featured: false,
    ...overrides,
  };
}

test("all four generic file kinds normalize through one LibraryAsset adapter", () => {
  for (const kind of GENERIC_FILE_ASSET_KINDS) {
    const data = genericFileAssetSchema.parse(metadata(kind));
    const asset = genericFileToLibraryAsset({ id: data.slug, data, body: "# Instructions\n" });
    assert.equal(asset.kind, kind);
    assert.equal(asset.canonicalPath, "/library/generic-example/");
    assert.equal(asset.publicationStatus, "blocked-pending-artwork");
    assert.deepEqual(asset.payloadPaths, ["AGENTS.md"]);
    assert.deepEqual(asset.payloads, [
      { path: "AGENTS.md", downloadPath: "bundles/generic-example/AGENTS.md" },
    ]);
    assert.equal(asset.bundleDownloadPath, null);
    assert.equal(asset.content.body, "# Instructions\n");
    assert.deepEqual(asset.content.files, [
      { path: "AGENTS.md", body: "# Instructions\n" },
    ]);
    assert.equal(asset.content.promptBody, null);
  }
});

test("minimal contributor metadata is normalized with importer-owned defaults", () => {
  const raw = {
    kind: "agent-instruction",
    name: "Generic Example",
    description: "A generic file artifact used to verify the unified library pipeline.",
    tags: ["Agent Configuration"],
    author: "Example Author",
    entrypoint: ".github/copilot-instructions.md",
    payloadPaths: [".github/copilot-instructions.md"],
  };
  const parsed = genericFileAssetSchema.parse(
    normalizeGenericFileAssetInput(raw, "generic-example"),
  );
  assert.equal(parsed.slug, "generic-example");
  assert.deepEqual(parsed.topics, raw.tags);
  assert.equal(parsed.status, "active");
  assert.equal(parsed.publicationStatus, "blocked-pending-artwork");
  assert.equal(
    parsed.downloadPath,
    "bundles/generic-example/.github/copilot-instructions.md",
  );
  assert.equal(parsed.createdAt, undefined);
  assert.deepEqual(parsed.keywords, []);
  assert.deepEqual(parsed.compatibility, []);
  assert.deepEqual(parsed.worksWith, []);
  assert.equal(parsed.featured, false);
});

test("generic schema preserves safe nested paths and derives single versus multi downloads", () => {
  const single = genericFileAssetSchema.parse(
    metadata("agent-instruction", [".github/copilot-instructions.md"]),
  );
  assert.equal(
    single.downloadPath,
    "bundles/generic-example/.github/copilot-instructions.md",
  );

  const files = ["spec/requirements.md", "spec/design.md", "spec/tasks.md"];
  const multi = genericFileAssetSchema.parse(metadata("work-specification", files));
  assert.equal(multi.downloadPath, "bundles/generic-example.zip");
  assert.deepEqual(multi.payloadPaths, files);
});

test("generic schema rejects unsafe, ambiguous, unknown, and prematurely published metadata", () => {
  assert.throws(
    () =>
      genericFileAssetSchema.parse(
        metadata("agent-instruction", ["../AGENTS.md"], {
          downloadPath: "bundles/generic-example/../AGENTS.md",
        }),
      ),
    /safe relative POSIX path/,
  );
  assert.throws(
    () =>
      genericFileAssetSchema.parse(
        metadata("work-specification", ["requirements.md", "requirements.md"]),
      ),
    /duplicate paths/,
  );
  assert.throws(
    () => genericFileAssetSchema.parse(metadata("agent-definition", ["agent.agent.md"], { entrypoint: "other.md" })),
    /included in payloadPaths/,
  );
  assert.throws(
    () => genericFileAssetSchema.parse({ ...metadata("agent-instruction"), undocumented: true }),
    /Unrecognized key/,
  );
  assert.throws(
    () => genericFileAssetSchema.parse(metadata("agent-instruction", ["AGENTS.md"], { publicationStatus: "published" })),
    /cannot be published/,
  );
});

test("payload validation fails closed on missing, extra, empty, or invalid UTF-8 files", () => {
  const meta = metadata("work-specification", ["requirements.md", "design.md"]);
  assert.deepEqual(
    validateGenericPayloadFiles(meta, [
      { path: "requirements.md", data: Buffer.from("# Requirements\n") },
      { path: "design.md", data: Buffer.from("# Design\n") },
    ]).problems,
    [],
  );
  const problems = validateGenericPayloadFiles(meta, [
    { path: "requirements.md", data: Buffer.from("   ") },
    { path: "extra.md", data: Buffer.from([0xc3, 0x28]) },
  ]).problems.join("\n");
  assert.match(problems, /declared payload path is missing: design\.md/);
  assert.match(problems, /undeclared payload file is not allowed: extra\.md/);
  assert.match(problems, /payload file must not be empty: requirements\.md/);
  assert.match(problems, /extra\.md is not valid UTF-8/);
});

test("work specifications expose every exact body and download without leaking bodies to summaries", () => {
  const paths = ["spec/requirements.md", "spec/design.md", "spec/tasks.md"];
  const data = genericFileAssetSchema.parse(metadata("work-specification", paths));
  const files = paths.map((path) => ({ path, body: `# ${path}\nunique-${path}\n` }));
  const asset = genericFileToLibraryAsset(
    { id: data.slug, data, body: files[0].body },
    null,
    files,
  );
  assert.deepEqual(asset.content.files, files);
  assert.deepEqual(
    asset.payloads,
    paths.map((path) => ({
      path,
      downloadPath: `bundles/generic-example/${path}`,
    })),
  );
  assert.equal(asset.bundleDownloadPath, "bundles/generic-example.zip");
  assert.equal(asset.downloadPath, "bundles/generic-example.zip");
  const serializedSummary = JSON.stringify(toLibraryAssetSummary(asset));
  assert.doesNotMatch(serializedSummary, /unique-spec\/requirements\.md/);
  assert.equal("content" in toLibraryAssetSummary(asset), false);
});

test("loader classifies exact generic payload paths and reserves non-payload README as guide", (t) => {
  const root = mkdtempSync(join(tmpdir(), "generic-submission-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const submission = join(root, "generic-example");
  mkdirSync(join(submission, ".github"), { recursive: true });
  const data = metadata("agent-instruction", [".github/copilot-instructions.md"]);
  writeFileSync(join(submission, "metadata.json"), `${JSON.stringify(data)}\n`);
  writeFileSync(join(submission, "README.md"), "# Installation Guide\n");
  writeFileSync(
    join(submission, ".github", "copilot-instructions.md"),
    "# Repository Instructions\n",
  );

  const loaded = loadSubmission(submission);
  assert.equal(loaded.kind, "agent-instruction");
  assert.equal(loaded.readmeMd, "# Installation Guide\n");
  assert.deepEqual(loaded.artifactFiles?.map((file) => file.path), [
    ".github/copilot-instructions.md",
  ]);
});

test("multi-file bundles are byte deterministic and preserve exact relative paths", (t) => {
  const root = mkdtempSync(join(tmpdir(), "generic-bundle-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = [
    { path: "spec/tasks.md", data: Buffer.from("# Tasks\n") },
    { path: "spec/design.md", data: Buffer.from("# Design\n") },
    { path: "spec/requirements.md", data: Buffer.from("# Requirements\n") },
  ];
  const first = join(root, "first.zip");
  const second = join(root, "second.zip");
  writeBundle(files, first);
  writeBundle([...files].reverse(), second);
  assert.ok(readFileSync(first).equals(readFileSync(second)));
  assert.deepEqual(
    new AdmZip(first).getEntries().map((entry) => entry.entryName),
    ["spec/design.md", "spec/requirements.md", "spec/tasks.md"],
  );
});

test("generic publishing writes every individual source and a deterministic multi-file bundle", (t) => {
  const root = mkdtempSync(join(tmpdir(), "generic-publish-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const files = [
    { path: "spec/tasks.md", data: Buffer.from("# Tasks\n") },
    { path: "spec/requirements.md", data: Buffer.from("# Requirements\n") },
  ];
  const paths = ["spec/requirements.md", "spec/tasks.md"];
  const output = writeGenericArtifactDownloads(root, "generic-example", paths, files);
  assert.deepEqual(output.payloadDownloadPaths, [
    "bundles/generic-example/spec/requirements.md",
    "bundles/generic-example/spec/tasks.md",
  ]);
  assert.equal(output.bundleDownloadPath, "bundles/generic-example.zip");
  assert.equal(
    readFileSync(join(root, "public/bundles/generic-example/spec/requirements.md"), "utf8"),
    "# Requirements\n",
  );
  assert.equal(
    readFileSync(join(root, "public/bundles/generic-example/spec/tasks.md"), "utf8"),
    "# Tasks\n",
  );
  assert.deepEqual(
    new AdmZip(join(root, "public/bundles/generic-example.zip"))
      .getEntries()
      .map((entry) => entry.entryName),
    ["spec/requirements.md", "spec/tasks.md"],
  );
});

test("artifact payload indexes round-trip exact ordered bodies and content hashes", () => {
  const files = [
    { path: "design.md", data: Buffer.from("# Design\n\nExact body.\n") },
    { path: "requirements.md", data: Buffer.from("# Requirements\n") },
  ];
  const index = buildArtifactPayloadIndex(
    "generic-example",
    ["requirements.md", "design.md"],
    files,
  );
  const roundTrip = matter(
    buildPromptContent(index as unknown as Record<string, unknown>, ""),
  ).data;
  assert.deepEqual(roundTrip.files.map((file: { path: string }) => file.path), [
    "requirements.md",
    "design.md",
  ]);
  assert.equal(roundTrip.files[0].body, "# Requirements\n");
  assert.match(roundTrip.files[0].sha256, /^sha256:[a-f0-9]{64}$/);
  assert.equal(roundTrip.files[1].body, "# Design\n\nExact body.\n");
});
