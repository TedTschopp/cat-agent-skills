import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { promptSchema } from "../src/lib/library-asset-schema.ts";
import {
  LIBRARY_ASSET_KINDS,
  assertUniqueLibraryAssetSlugs,
  canonicalPathFor,
  promptToLibraryAsset,
  skillToLibraryAsset,
  type LibraryAsset,
} from "../src/lib/library-assets.ts";
import { skillSchema } from "../src/lib/skill-schema.ts";
import { buildLibraryAssetSnapshot } from "./library-assets-json.ts";

function promptData(overrides: Record<string, unknown> = {}) {
  return {
    kind: "prompt-template",
    slug: "example-prompt",
    name: "Example Prompt",
    description: "A complete example prompt for schema tests.",
    status: "active",
    publicationStatus: "blocked-pending-artwork",
    topics: ["Testing"],
    tags: ["Testing"],
    keywords: [],
    models: [],
    compatibility: ["chatgpt"],
    worksWith: ["chatgpt"],
    author: "Test Author",
    entrypoint: "example-prompt.prompt.md",
    payloadPaths: ["example-prompt.prompt.md"],
    downloadPath: "bundles/example-prompt.prompt.md",
    createdAt: "2026-09-03",
    variables: [],
    series: [],
    relatedAssetIds: [],
    featured: false,
    ...overrides,
  };
}

test("canonical routes preserve legacy skill routes and use kind-specific unified routes", () => {
  assert.equal(canonicalPathFor("skill", "demo"), "/skills/demo/");
  assert.equal(canonicalPathFor("plugin", "demo"), "/skills/demo/");
  assert.equal(canonicalPathFor("automation", "demo"), "/skills/demo/");
  assert.equal(canonicalPathFor("prompt-template", "demo"), "/prompts/demo/");
  for (const kind of LIBRARY_ASSET_KINDS.filter(
    (value) => !["skill", "plugin", "automation", "prompt-template"].includes(value),
  )) {
    assert.equal(canonicalPathFor(kind, "demo"), "/library/demo/");
  }
});

test("prompt schema accepts blocked generic prompts without migration provenance", () => {
  const parsed = promptSchema.parse(
    promptData({ keywords: ["Testing", "test keyword"] }),
  );
  const asset = promptToLibraryAsset({ id: parsed.slug, data: parsed, body: "Exact body" });
  assert.equal(asset.kind, "prompt-template");
  assert.equal(asset.kindLabel, "Prompt Template File");
  assert.equal(asset.canonicalPath, "/prompts/example-prompt/");
  assert.equal(asset.publicationStatus, "blocked-pending-artwork");
  assert.deepEqual(asset.topics, ["Governance, Risk, and Compliance"]);
  assert.deepEqual(asset.tags, ["Testing"]);
  assert.deepEqual(asset.keywords, ["Testing", "test keyword"]);
  assert.deepEqual(asset.searchTerms, ["Testing"]);
  assert.equal(asset.content.promptBody, "Exact body");
  assert.equal(asset.provenance.sourceRepository, null);
});

test("published prompts require the complete v2 artwork contract", () => {
  assert.throws(
    () => promptSchema.parse(promptData({ publicationStatus: "published" })),
    /cannot be published until every generated-cover field is present/,
  );
  const complete = promptSchema.parse(
    promptData({
      publicationStatus: "published",
      coverImage: "skill-art/example-prompt.webp",
      coverImageAlt: "Abstract editorial cover artwork for the example prompt.",
      coverImagePrompt:
        "Use case: stylized-concept. Composition and framing: exact 16:10 landscape. Create an editorial abstract scene for a reusable prompt template. Constraints: no text, no logos, no watermark, and no paw imagery.",
      coverImageAspectRatio: "16:10",
      coverImageWidth: 1600,
      coverImageHeight: 1000,
      coverImageGenerator: "OpenAI image generation via Codex",
      coverImageGeneratedAt: "2026-09-03",
      coverImageSourceHash: `sha256:${"a".repeat(64)}`,
      coverImageSourceHashVersion: 2,
    }),
  );
  const asset = promptToLibraryAsset({ id: complete.slug, data: complete, body: "Body" });
  assert.equal(asset.publicationStatus, "published");
  assert.equal(asset.artwork.ready, true);
  assert.equal(asset.artwork.sourceHashVersion, 2);
});

test("duplicate slugs fail closed across every asset kind", () => {
  const base = {
    slug: "same-slug",
    name: "Same",
    featured: false,
  } as LibraryAsset;
  assert.throws(
    () =>
      assertUniqueLibraryAssetSlugs([
        { ...base, kind: "skill" },
        { ...base, kind: "prompt-template" },
      ]),
    /duplicate library asset slug same-slug: skill and prompt-template/,
  );
});

test("Microsoft skill tags stay unchanged and supporting aliases still classify topics", () => {
  const data = skillSchema.parse({
    name: "Breathing Room",
    description: "Catalog summary",
    agentDescription: "Agent summary",
    platforms: ["Scout"],
    type: "skill",
    tags: [
      "calendar",
      "workload",
      "focus",
      "work-life-balance",
      "meetings",
      "deep-work",
      "self-service",
    ],
    author: "Allan De Castro",
    authorUrl: "https://github.com/allandecastro",
    authorGithub: "allandecastro",
    version: "1.1.1",
    createdAt: "2026-07-28",
    updatedAt: "2026-08-20",
    featured: false,
  });
  const asset = skillToLibraryAsset({ id: "breathing-room", data, body: "Body" });
  assert.deepEqual(asset.tags, data.tags);
  assert.deepEqual(asset.topics, [
    "Communication and Collaboration",
    "Productivity and Automation",
  ]);
});

test("catalog snapshot generation keeps Microsoft tags and controlled topics", (t) => {
  const root = mkdtempSync(join(tmpdir(), "catalog-breathing-room-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const skillsDir = join(root, "src", "content", "skills");
  mkdirSync(skillsDir, { recursive: true });
  writeFileSync(
    join(skillsDir, "breathing-room.md"),
    `---
name: Breathing Room
description: Shows where your own week has room to breathe.
agentDescription: Reads calendar load for one person.
platforms: [Scout]
type: skill
tags: [calendar, workload, focus, work-life-balance, meetings, deep-work, self-service]
author: Allan De Castro
authorUrl: https://github.com/allandecastro
authorGithub: allandecastro
version: 1.1.1
createdAt: 2026-07-28
updatedAt: 2026-08-20
featured: false
---
Run the workflow.
`,
    "utf8",
  );

  const assets = buildLibraryAssetSnapshot(root);
  const breathingRoom = assets.find((asset) => asset.slug === "breathing-room");
  assert.ok(breathingRoom);
  assert.deepEqual(breathingRoom.tags, [
    "calendar",
    "workload",
    "focus",
    "work-life-balance",
    "meetings",
    "deep-work",
    "self-service",
  ]);
  assert.deepEqual(breathingRoom.topics, [
    "Communication and Collaboration",
    "Productivity and Automation",
  ]);
});
