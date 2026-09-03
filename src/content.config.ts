import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { skillSchema } from "./lib/skill-schema";
import {
  artifactPayloadSchema,
  genericFileAssetSchema,
  promptSchema,
} from "./lib/library-asset-schema";

const skills = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/skills" }),
  schema: skillSchema,
});

// Optional human-facing "overview" for an entry, generated from a
// submission's README.md. Keyed by the same slug as its skill so the detail page
// can look it up. Plain markdown — any frontmatter is ignored.
const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/guides" }),
  schema: z.object({}).passthrough(),
});

const prompts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/prompts" }),
  schema: promptSchema,
});

const artifacts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/artifacts" }),
  schema: genericFileAssetSchema,
});

// Importer-owned, build-only copies of every exact generic payload body. The
// public assets.json deliberately drops `content`, while detail pages join this
// collection to the catalog metadata by slug.
const artifactPayloads = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/artifact-payloads" }),
  schema: artifactPayloadSchema,
});

export const collections = { skills, guides, prompts, artifacts, artifactPayloads };
