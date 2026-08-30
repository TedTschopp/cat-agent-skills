/**
 * Single source of truth for the skill frontmatter schema.
 *
 * Imported by both the Astro content collection (`src/content.config.ts`) and
 * the standalone CI validator (`scripts/validate-skill.mjs`) so that the rules
 * enforced at build time and at submission time can never drift apart.
 */
import { z } from "astro/zod";
import { PLATFORMS } from "./skills";

/** Zod schema for a skill's frontmatter metadata. */
export const skillSchema = z.object({
  name: z.string(),
  // Catalog/gallery summary shown to humans on the card, search, and the top of
  // the detail page. Comes from metadata.json.
  description: z.string(),
  // The agent-facing description the model reads to decide when to invoke the
  // skill. Comes from the `description` in SKILL.md's own frontmatter (the
  // canonical Agent Skills format). Optional so older catalog-only skills still
  // validate.
  agentDescription: z.string().optional(),
  // Agent platform(s) the skill targets: Cowork, Copilot Studio, and/or Scout.
  platforms: z.array(z.enum(PLATFORMS)).nonempty(),
  // Distinguishes a single cross-platform Agent Skill from a Cowork plugin (an
  // M365 app package bundling one or more skills + optional connectors) or a
  // Scout automation (a scheduled `.json` of ordered prompt steps). Derived by
  // the importer, not authored; defaults keep existing skills unchanged.
  type: z.enum(["skill", "plugin", "automation"]).default("skill"),
  tags: z.array(z.string()).nonempty(),
  // Human-readable author (person or team) shown on the gallery card and detail
  // page. Required: every submission must declare who authored it. Comes from
  // metadata.json.
  author: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "author is required — add it to the submission's metadata.json"
          : "author must be a string",
    })
    .trim()
    .min(1, "author must not be empty"),
  // Optional URL to the author's website / profile, shown as a link on the
  // skill page when an `author` is also present.
  authorUrl: z.string().url().optional(),
  // The skill author's GitHub login, stored WITHOUT a leading `@`. Resolved by
  // the importer purely from the submission — an explicit `authorGithub`, else
  // derived from a `github.com/<login>` `authorUrl`, else unset — never from the
  // PR/merger login. Used by the "skillbot" to @-mention the author on the first
  // comment of the skill's discussion. A bare GitHub username: 1-39 chars,
  // alphanumerics or single hyphens, no leading/trailing hyphen.
  authorGithub: z
    .string()
    .regex(
      /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i,
      "must be a bare GitHub username (no leading @)",
    )
    .optional(),
  version: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  // Path (relative to /public) of a bundled .zip of the skill's files, when the
  // skill ships more than its SKILL.md (scripts, references, assets).
  bundle: z.string().optional(),
  // Optional override for the auto-generated cover color (any CSS color).
  coverColor: z.string().optional(),
  // Gallery-only generated artwork. These fields originate in the
  // submission's non-bundled metadata sidecar; the image itself lives under
  // /public/skill-art, never inside the downloadable skill package.
  coverImage: z
    .string()
    .regex(
      /^skill-art\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/,
      "must be skill-art/<skill-slug>.webp",
    )
    .optional(),
  coverImageAlt: z.string().trim().min(12).max(240).optional(),
  coverImagePrompt: z.string().trim().min(120).max(6000).optional(),
  coverImageAspectRatio: z.literal("16:10").optional(),
  coverImageWidth: z.literal(1600).optional(),
  coverImageHeight: z.literal(1000).optional(),
  coverImageGenerator: z.string().trim().min(3).max(120).optional(),
  coverImageGeneratedAt: z.coerce.date().optional(),
  coverImageSourceHash: z
    .string()
    .regex(/^sha256:[a-f0-9]{64}$/, "must be a sha256:<64 lowercase hex> digest")
    .optional(),
  featured: z.boolean().default(false),
}).superRefine((data, ctx) => {
  const artworkFields = [
    "coverImage",
    "coverImageAlt",
    "coverImagePrompt",
    "coverImageAspectRatio",
    "coverImageWidth",
    "coverImageHeight",
    "coverImageGenerator",
    "coverImageGeneratedAt",
    "coverImageSourceHash",
  ] as const;
  const present = artworkFields.filter((field) => data[field] !== undefined);
  if (present.length > 0 && present.length !== artworkFields.length) {
    for (const field of artworkFields) {
      if (data[field] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "is required when generated cover artwork is present",
        });
      }
    }
  }
});

export type SkillFrontmatter = z.infer<typeof skillSchema>;
