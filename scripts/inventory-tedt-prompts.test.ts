import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildPromptRecords,
  EXPECTED_PROMPT_COUNT,
  parseCliArgs,
  safeSlug,
  splitFrontmatter,
} from "./inventory-tedt-prompts.ts";

function fixturePrompt(
  index: number,
  options: { overrides?: string; promptContent?: string; models?: string } = {},
): string {
  const promptContent = options.promptContent ?? `Exact prompt ${index}.`;
  const indentedPrompt = promptContent
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `---
layout: prompt-details
permalink: /prompts/:slug/
title: Prompt ${index}
description: Description ${index}
author:
  name: Ted Tschopp
  url: https://tedt.org/
date: 2025-01-01
categories: [Prompts]
tags: [Documentation]
keywords: [prompt engineering]
models-supported: ${options.models ?? "[gpt-4, microsoft-copilot, github]"}
${options.overrides ?? ""}prompt_content: |-
${indentedPrompt}
---
Guide ${index}.
`;
}

test("safe slugs preserve words while normalizing case and punctuation", () => {
  assert.equal(safeSlug("Midjourney-V6.1-Prompt-Template"), "midjourney-v6-1-prompt-template");
  assert.equal(safeSlug("Create-a-Unforgettable-Opening-to-a-TTRPG"), "create-a-unforgettable-opening-to-a-ttrpg");
});

test("frontmatter parsing preserves the decoded prompt text and guide", () => {
  const parsed = splitFrontmatter(
    fixturePrompt(1, { overrides: "mastodon-post-id: 115003055074249913\n" }),
  );
  assert.equal(parsed.frontmatter.prompt_content, "Exact prompt 1.");
  assert.equal(parsed.frontmatter["mastodon-post-id"], "115003055074249913");
  assert.equal(parsed.body, "Guide 1.\n");

  const withLeadingBlank = fixturePrompt(2).replace("\n---\nGuide 2.", "\n---\n\nGuide 2.");
  assert.equal(splitFrontmatter(withLeadingBlank).body, "\nGuide 2.\n");
});

test("inventory CLI requires a source and accepts an output override", () => {
  const sourceRef = "a".repeat(40);
  assert.deepEqual(
    parseCliArgs([
      "--source",
      "/source",
      `--source-ref=${sourceRef}`,
      "--output=review",
      "--check",
    ]),
    {
    source: "/source",
    sourceRef,
    output: "review",
    check: true,
    },
  );
  assert.throws(() => parseCliArgs([]), /--source is required/);
  assert.throws(() => parseCliArgs(["--source"]), /requires a value/);
  assert.throws(
    () => parseCliArgs(["--source", "/source", "--source-ref", "main"]),
    /full 40-character commit SHA/,
  );
});

test("inventory requires exactly 56 posts and retains legacy image provenance", (t) => {
  const root = mkdtempSync(join(tmpdir(), "tedt-prompt-inventory-"));
  const prompts = join(root, "_posts", "Prompts");
  mkdirSync(join(root, "img", "prompts"), { recursive: true });
  mkdirSync(prompts, { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));

  writeFileSync(join(root, "img", "prompts", "shared.png"), "legacy image");
  for (let index = 1; index <= EXPECTED_PROMPT_COUNT; index += 1) {
    const serial = String(index).padStart(2, "0");
    let overrides = "";
    let promptContent: string | undefined;
    if (index <= 2) {
      overrides = "image: /img/prompts/shared.png\nimage-alt: Legacy image description\n";
      if (index === 1) overrides += "mastodon-post-id: 115003055074249913\n";
    } else if (index === 3) {
      overrides = 'variables:\n  - name: "include_grading"\n    type: checkbox\n';
    } else if (index === 4) {
      promptContent = "Use {{prd_instructions}}. Preserve {{Title}} as a literal placeholder.";
    }
    writeFileSync(
      join(prompts, `2025-01-${serial}-prompt-${serial}.md`),
      fixturePrompt(index, { overrides, promptContent }),
    );
  }

  const records = buildPromptRecords(root);
  assert.equal(records.length, EXPECTED_PROMPT_COUNT);
  assert.ok(records.every((record) => record.sourceFile.startsWith("_posts/prompts/")));
  assert.equal(records.filter((record) => record.legacyImage.sourcePath).length, 2);
  assert.ok(
    records
      .filter((record) => record.legacyImage.sourcePath)
      .every((record) => record.issues.some((issue) => issue.code === "legacy-image-reused")),
  );
  assert.ok(records.every((record) => record.artwork.disposition === "regenerate"));
  assert.ok(records.every((record) => record.artwork.status === "pending-approval"));
  assert.ok(
    records.every((record) => record.artwork.generationReferencePolicy === "legacy-artwork-forbidden"),
  );
  assert.ok(
    records.every((record) => record.artwork.publicationGate === "new-validated-cover-required"),
  );
  assert.ok(records.every((record) => record.artifactKind === "prompt-template"));
  assert.ok(records.every((record) => record.artifactTypeLabel === "Prompt Template File"));
  assert.ok(records.every((record) => record.guideSha256.startsWith("sha256:")));

  const unused = records.find((record) => record.canonicalSlug === "prompt-03");
  assert.deepEqual(unused?.variableAnalysis.unused, ["include_grading"]);
  assert.ok(unused?.issues.some((issue) => issue.code === "unused-variable"));

  const undeclared = records.find((record) => record.canonicalSlug === "prompt-04");
  assert.deepEqual(undeclared?.variableAnalysis.undeclared, ["prd_instructions"]);
  assert.deepEqual(undeclared?.variableAnalysis.referenced, ["prd_instructions"]);
  assert.ok(undeclared?.issues.some((issue) => issue.code === "undeclared-variable"));

  const preciseId = records.find((record) => record.canonicalSlug === "prompt-01");
  assert.equal(preciseId?.legacyMetadata["mastodon-post-id"], "115003055074249913");
});
