import assert from "node:assert/strict";
import test from "node:test";
import {
  ARTWORK,
  artworkDate,
  framedSourceDigest,
  parseMetadataText,
  serializeMetadataText,
  slugsFromAddedSkillPaths,
  stableJson,
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

test("the artwork contract is exact 16:10 at 1600x1000", () => {
  assert.deepEqual(webpDimensions(vp8x(1600, 1000)), { width: 1600, height: 1000 });
  assert.equal(ARTWORK.aspectRatio, "16:10");
});

test("generated dates use the gallery's Pacific calendar day", () => {
  assert.equal(artworkDate(new Date("2026-08-30T00:30:00Z")), "2026-08-29");
});

test("future Microsoft imports and local skills share the artwork queue", () => {
  assert.deepEqual(
    slugsFromAddedSkillPaths([
      "submissions/microsoft-import/metadata.json",
      "src/content/skills/microsoft-import.md",
      "submissions/local-skill/metadata.yaml",
      "src/content/skills/local-skill.md",
      "submissions/local-skill/SKILL.md",
      "src/content/skills/Unsafe Name.md",
      "docs/authoring-skills.md",
    ]),
    ["local-skill", "microsoft-import"],
  );
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
