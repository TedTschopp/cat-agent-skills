import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { relatedAssetsFor } from "../src/components/asset-detail-data.ts";
import { groupAssetsByTopic, topicKey } from "../src/components/topic-routing.ts";
import type { LibraryAsset } from "../src/lib/library-assets.ts";
import {
  LIBRARY_TOPICS,
  MAX_LIBRARY_TOPICS_PER_ASSET,
  deriveLibraryTopics,
  isLibraryTopicLabel,
  libraryTopicId,
  libraryTopicIdForTerm,
} from "../src/lib/topic-taxonomy.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(root, "public", "assets.json"), "utf8"),
) as Array<Pick<LibraryAsset, "slug" | "kind" | "topics" | "tags">>;
const normalize = (value: string): string =>
  value.trim().toLocaleLowerCase("en-US");

test("the public taxonomy has twelve unique stable topics and unambiguous aliases", () => {
  assert.equal(LIBRARY_TOPICS.length, 12);
  assert.equal(new Set(LIBRARY_TOPICS.map(({ id }) => id)).size, 12);
  assert.equal(new Set(LIBRARY_TOPICS.map(({ label }) => normalize(label))).size, 12);
  const aliases = LIBRARY_TOPICS.flatMap(({ aliases }) => aliases.map(normalize));
  assert.equal(new Set(aliases).size, aliases.length);
});

test("every published raw tag is covered while public assets use only one to three controlled topics", () => {
  const knownTerms = new Set(
    LIBRARY_TOPICS.flatMap(({ id, label, aliases }) => [
      normalize(id),
      normalize(label),
      ...aliases.map(normalize),
    ]),
  );
  const uncovered = [
    ...new Set(catalog.flatMap(({ tags }) => tags.map(normalize))),
  ].filter((tag) => !knownTerms.has(tag));
  assert.deepEqual(uncovered, []);

  for (const asset of catalog) {
    assert.ok(asset.topics.length >= 1, `${asset.slug} has no public topic`);
    assert.ok(
      asset.topics.length <= MAX_LIBRARY_TOPICS_PER_ASSET,
      `${asset.slug} has too many public topics`,
    );
    assert.equal(new Set(asset.topics).size, asset.topics.length);
    assert.ok(
      asset.topics.every(isLibraryTopicLabel),
      `${asset.slug} exposes a free-form topic`,
    );
  }
});

test("topic derivation honors authored intent and rejects an unmapped-only asset", () => {
  assert.deepEqual(
    deriveLibraryTopics({
      kind: "skill",
      authoredTopics: ["knowledge"],
      tags: ["knowledge", "sharepoint", "governance", "documents", "uploads"],
    }),
    [
      "Knowledge, Learning, and Research",
      "Content and Documentation",
      "Governance, Risk, and Compliance",
    ],
  );
  assert.throws(
    () => deriveLibraryTopics({ kind: "automation", tags: ["unmapped-new-term"] }),
    /No controlled Topic matches automation/,
  );
});

test("keywords cannot displace authored topics and single implementation tags stay secondary", () => {
  const topicsFor = (slug: string): string[] =>
    catalog.find((asset) => asset.slug === slug)?.topics ?? [];
  assert.deepEqual(topicsFor("ai-teaching-assistant-prompt-creator"), [
    "AI and Agents",
    "Knowledge, Learning, and Research",
    "Planning and Delivery",
  ]);
  assert.deepEqual(topicsFor("lean-six-sigma-analysis"), [
    "Business and Strategy",
    "Governance, Risk, and Compliance",
    "Planning and Delivery",
  ]);
  assert.deepEqual(topicsFor("find-your-super-power"), [
    "Business and Strategy",
    "Knowledge, Learning, and Research",
    "Planning and Delivery",
  ]);
  for (const slug of [
    "action-items-todo",
    "classic-text-adventure",
    "powerpoint-deck-designer",
    "travel-cost-estimator",
  ]) {
    assert.equal(
      topicsFor(slug).includes("Architecture and Engineering"),
      false,
      `${slug} treats one implementation tag as a public topic`,
    );
  }
  assert.deepEqual(topicsFor("agent-harness-explorer"), [
    "Architecture and Engineering",
    "AI and Agents",
  ]);
  assert.deepEqual(topicsFor("agent-evaluation-designer"), [
    "Governance, Risk, and Compliance",
    "AI and Agents",
  ]);
  assert.equal(topicsFor("mct-excellence-iq")[0], "Knowledge, Learning, and Research");
  assert.ok(topicsFor("lab-column-mapper").includes("Data and Analytics"));
  assert.ok(
    topicsFor("pdf-table-data-conversion").includes("Data and Analytics"),
  );
  assert.ok(
    topicsFor("copilot-studio-test-planner").includes(
      "Governance, Risk, and Compliance",
    ),
  );
  assert.ok(
    topicsFor("competitive-battlecard-builder").includes("Business and Strategy"),
  );
  assert.ok(
    topicsFor("call-for-speakers-digest").includes(
      "Communication and Collaboration",
    ),
  );
  assert.ok(topicsFor("ai-usecase-assessment").includes("Planning and Delivery"));
  assert.equal(topicsFor("artistic-analysis").includes("Data and Analytics"), false);
  assert.equal(
    topicsFor("eu-greenwashing-analysis").includes("Data and Analytics"),
    false,
  );
});

test("canonical topic labels use stable route ids while legacy tag keys remain available", () => {
  assert.equal(libraryTopicId("AI and Agents"), "ai-agents");
  assert.equal(libraryTopicIdForTerm("Writing"), "content-documentation");
  assert.equal(libraryTopicIdForTerm("engineering"), "architecture-engineering");
  assert.equal(topicKey("AI and Agents"), "ai-agents");
  assert.equal(topicKey("Writing"), "writing");
  assert.deepEqual(
    groupAssetsByTopic([
      { topics: ["AI and Agents"] },
      { topics: ["AI and Agents", "Data and Analytics"] },
    ]).map(({ routeTopic, label, assets }) => ({
      routeTopic,
      label,
      count: assets.length,
    })),
    [
      { routeTopic: "ai-agents", label: "AI and Agents", count: 2 },
      { routeTopic: "data-analytics", label: "Data and Analytics", count: 1 },
    ],
  );
});

test("granular shared tags outrank broad-topic-only matches", () => {
  const asset = (overrides: Partial<LibraryAsset>): LibraryAsset =>
    ({
      kind: "skill",
      slug: "target",
      name: "Target",
      topics: ["Content and Documentation"],
      tags: ["precise-tag"],
      worksWith: [],
      relatedAssetIds: [],
      featured: false,
      ...overrides,
    }) as LibraryAsset;
  const target = asset({});
  const precise = asset({
    slug: "precise",
    name: "Precise",
    topics: ["Data and Analytics"],
    tags: ["precise-tag"],
  });
  const broad = asset({
    slug: "broad",
    name: "Broad",
    tags: ["different-tag"],
  });
  assert.deepEqual(
    relatedAssetsFor(target, [target, broad, precise], 2).map(({ slug }) => slug),
    ["precise", "broad"],
  );
});
