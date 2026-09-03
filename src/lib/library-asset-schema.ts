import { z } from "astro/zod";

/** Stable identifiers used by the unified AI.Tedt.org library. */
export const LIBRARY_ASSET_KINDS = [
  "skill",
  "plugin",
  "automation",
  "agent-instruction",
  "scoped-agent-instruction",
  "agent-definition",
  "prompt-template",
  "work-specification",
] as const;

export type LibraryAssetKind = (typeof LIBRARY_ASSET_KINDS)[number];

export const LIBRARY_ASSET_KIND_LABELS: Record<LibraryAssetKind, string> = {
  skill: "Agent Skill",
  plugin: "Plugin",
  automation: "Automation",
  "agent-instruction": "Agent Instruction File",
  "scoped-agent-instruction": "Scoped Agent Instruction File",
  "agent-definition": "Agent Definition File",
  "prompt-template": "Prompt Template File",
  "work-specification": "Work Specification File",
};

export const LIBRARY_ASSET_STATUSES = ["active", "beta"] as const;
export type LibraryAssetStatus = (typeof LIBRARY_ASSET_STATUSES)[number];

export const GENERIC_FILE_ASSET_KINDS = [
  "agent-instruction",
  "scoped-agent-instruction",
  "agent-definition",
  "work-specification",
] as const;
export type GenericFileAssetKind = (typeof GENERIC_FILE_ASSET_KINDS)[number];

const safeSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const assetId = z.string().regex(/^[a-z-]+:[a-z0-9]+(?:-[a-z0-9]+)*$/);
const sha256 = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const portableMarkdownPath = z.string().min(1).superRefine((value, ctx) => {
  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    value.includes("\0") ||
    value.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    ctx.addIssue({ code: "custom", message: "must be a safe relative POSIX path" });
  }
  if (!/\.(?:md|mdc)$/i.test(value)) {
    ctx.addIssue({ code: "custom", message: "must end in .md or .mdc" });
  }
});

export const promptVariableSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9_]*$/),
    label: z.string().trim().min(1),
    type: z.enum(["text", "textarea", "number", "select", "radio", "checkbox"]),
    required: z.boolean().default(false),
    placeholder: z.string().optional(),
    help: z.string().optional(),
    default: z.union([z.string(), z.number(), z.array(z.string()), z.null()]).optional(),
    options: z.array(z.string()).optional(),
    rows: z.number().int().positive().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().positive().optional(),
  })
  .superRefine((variable, ctx) => {
    if (["select", "radio", "checkbox"].includes(variable.type)) {
      if (!variable.options?.length) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: `is required for ${variable.type} variables`,
        });
      }
    }
  });

export const assetSeriesMembershipSchema = z.object({
  id: safeSlug,
  title: z.string().trim().min(1),
  step: z.number().int().positive(),
  totalSteps: z.number().int().positive(),
  previousAssetId: assetId.nullable().default(null),
  nextAssetId: assetId.nullable().default(null),
});

export const promptProvenanceSchema = z.object({
  sourceRepository: z.string().url(),
  sourceCommit: z.string().regex(/^[a-f0-9]{40}$/),
  sourcePath: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceFileSha256: sha256,
  sourcePromptSha256: sha256,
  importedPromptSha256: sha256,
  sourceGuideSha256: sha256,
  importedGuideSha256: sha256,
  rawFrontmatterSha256: sha256,
  sourceTitle: z.string(),
  sourceDescription: z.string(),
  sourceSeoDescription: z.string().nullable(),
  sourceModels: z.array(z.union([z.string(), z.number()])),
  unresolvedModelIdentifiers: z.array(z.union([z.string(), z.number()])),
  legacyPaths: z.array(z.string()).nonempty(),
  legacyCategories: z.array(z.string()),
  visibleInAlphaIndex: z.boolean(),
  legacyImage: z.record(z.string(), z.unknown()),
  legacyMetadata: z.record(z.string(), z.unknown()),
  appliedRepairs: z.array(z.string()),
});

export const genericFileProvenanceSchema = z.object({
  sourceRepository: z.string().url().nullable().optional(),
  sourceCommit: z.string().regex(/^[a-f0-9]{40}$/).nullable().optional(),
  sourcePath: z.string().min(1).nullable().optional(),
  sourceUrl: z.string().url().nullable().optional(),
  sourceFileSha256: sha256.nullable().optional(),
  sourceFiles: z
    .array(z.object({ path: portableMarkdownPath, sha256 }).strict())
    .default([]),
  importedFiles: z
    .array(z.object({ path: portableMarkdownPath, sha256 }).strict())
    .default([]),
  legacyPaths: z.array(z.string()).default([]),
  legacyImage: z.record(z.string(), z.unknown()).nullable().optional(),
  legacyMetadata: z.record(z.string(), z.unknown()).nullable().optional(),
  appliedRepairs: z.array(z.string()).default([]),
}).strict();

export const artifactPayloadSchema = z.object({
  slug: safeSlug,
  files: z
    .array(
      z
        .object({
          path: portableMarkdownPath,
          body: z.string(),
          sha256,
        })
        .strict(),
    )
    .nonempty(),
})
  .strict()
  .superRefine((data, ctx) => {
    const seen = new Set<string>();
    for (const [index, file] of data.files.entries()) {
      if (seen.has(file.path)) {
        ctx.addIssue({
          code: "custom",
          path: ["files", index, "path"],
          message: "must not duplicate another payload path",
        });
      }
      seen.add(file.path);
    }
  });

/** Add importer-owned fields while retaining exact contributor path spelling. */
export function normalizeGenericFileAssetInput(
  value: unknown,
  slug: string,
): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const source = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...source, slug };
  if (normalized.topics === undefined && Array.isArray(source.tags)) {
    normalized.topics = [...source.tags];
  }
  if (normalized.compatibility === undefined && Array.isArray(source.worksWith)) {
    normalized.compatibility = [...source.worksWith];
  }
  if (normalized.worksWith === undefined && Array.isArray(source.compatibility)) {
    normalized.worksWith = [...source.compatibility];
  }
  if (Array.isArray(source.payloadPaths) && source.payloadPaths.every((path) => typeof path === "string")) {
    normalized.downloadPath =
      source.payloadPaths.length === 1
        ? `bundles/${slug}/${source.payloadPaths[0]}`
        : `bundles/${slug}.zip`;
  }
  return normalized;
}

/**
 * Frontmatter emitted for `src/content/prompts/*.md`.
 *
 * The Markdown body is the exact normalized prompt payload. Human-facing
 * explanatory prose remains in the sibling `guides` collection.
 */
export const promptSchema = z
  .object({
    kind: z.literal("prompt-template"),
    slug: safeSlug,
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    status: z.enum(LIBRARY_ASSET_STATUSES).default("active"),
    publicationStatus: z
      .enum(["published", "blocked-pending-artwork"])
      .default("blocked-pending-artwork"),
    topics: z.array(z.string().trim().min(1)),
    tags: z.array(z.string().trim().min(1)),
    keywords: z.array(z.string().trim().min(1)).default([]),
    models: z.array(z.string().trim().min(1)).default([]),
    compatibility: z.array(z.string().trim().min(1)).default([]),
    worksWith: z.array(z.string().trim().min(1)).default([]),
    author: z.string().trim().min(1),
    authorUrl: z.string().url().nullable().optional(),
    authorAvatar: z.string().url().nullable().optional(),
    entrypoint: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.prompt\.md$/),
    payloadPaths: z.array(z.string().min(1)).nonempty(),
    downloadPath: z.string().regex(/^bundles\/[a-z0-9]+(?:-[a-z0-9]+)*\.prompt\.md$/),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    summaryBullets: z.array(z.string()).default([]),
    seoDescription: z.string().nullable().optional(),
    variables: z.array(promptVariableSchema).default([]),
    series: z.array(assetSeriesMembershipSchema).default([]),
    relatedAssetIds: z.array(assetId).default([]),
    version: z.string().optional(),
    featured: z.boolean().default(false),
    provenance: promptProvenanceSchema.optional(),
    coverColor: z.string().optional(),
    coverImage: z
      .string()
      .regex(/^skill-art\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/)
      .optional(),
    coverImageAlt: z.string().trim().min(12).max(240).optional(),
    coverImagePrompt: z.string().trim().min(120).max(6000).optional(),
    coverImageAspectRatio: z.literal("16:10").optional(),
    coverImageWidth: z.literal(1600).optional(),
    coverImageHeight: z.literal(1000).optional(),
    coverImageGenerator: z.string().trim().min(3).max(120).optional(),
    coverImageGeneratedAt: z.coerce.date().optional(),
    coverImageSourceHash: sha256.optional(),
    coverImageSourceHashVersion: z.literal(2).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.entrypoint !== `${data.slug}.prompt.md`) {
      ctx.addIssue({
        code: "custom",
        path: ["entrypoint"],
        message: "must match <slug>.prompt.md",
      });
    }
    if (data.payloadPaths.length !== 1 || data.payloadPaths[0] !== data.entrypoint) {
      ctx.addIssue({
        code: "custom",
        path: ["payloadPaths"],
        message: "must contain only the prompt entrypoint",
      });
    }
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
      "coverImageSourceHashVersion",
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
    if (data.publicationStatus === "published" && present.length !== artworkFields.length) {
      ctx.addIssue({
        code: "custom",
        path: ["publicationStatus"],
        message: "cannot be published until every generated-cover field is present",
      });
    }
  });

/** Frontmatter for non-prompt Markdown artifacts in `src/content/artifacts`. */
export const genericFileAssetSchema = z
  .object({
    kind: z.enum(GENERIC_FILE_ASSET_KINDS),
    slug: safeSlug,
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    status: z.enum(LIBRARY_ASSET_STATUSES).default("active"),
    publicationStatus: z
      .enum(["published", "blocked-pending-artwork"])
      .default("blocked-pending-artwork"),
    topics: z.array(z.string().trim().min(1)).nonempty(),
    tags: z.array(z.string().trim().min(1)).nonempty(),
    keywords: z.array(z.string().trim().min(1)).default([]),
    models: z.array(z.string().trim().min(1)).default([]),
    compatibility: z.array(z.string().trim().min(1)).default([]),
    worksWith: z.array(z.string().trim().min(1)).default([]),
    author: z.string().trim().min(1),
    authorUrl: z.string().url().nullable().optional(),
    authorGithub: z
      .string()
      .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i)
      .nullable()
      .optional(),
    authorAvatar: z.string().url().nullable().optional(),
    entrypoint: portableMarkdownPath,
    payloadPaths: z.array(portableMarkdownPath).nonempty(),
    downloadPath: z.string().min(1),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().nullable().optional(),
    subtitle: z.string().nullable().optional(),
    summaryBullets: z.array(z.string()).default([]),
    seoDescription: z.string().nullable().optional(),
    variables: z.array(promptVariableSchema).default([]),
    series: z.array(assetSeriesMembershipSchema).default([]),
    relatedAssetIds: z.array(assetId).default([]),
    version: z.string().optional(),
    featured: z.boolean().default(false),
    provenance: genericFileProvenanceSchema.optional(),
    coverColor: z.string().optional(),
    coverImage: z
      .string()
      .regex(/^skill-art\/[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/)
      .optional(),
    coverImageAlt: z.string().trim().min(12).max(240).optional(),
    coverImagePrompt: z.string().trim().min(120).max(6000).optional(),
    coverImageAspectRatio: z.literal("16:10").optional(),
    coverImageWidth: z.literal(1600).optional(),
    coverImageHeight: z.literal(1000).optional(),
    coverImageGenerator: z.string().trim().min(3).max(120).optional(),
    coverImageGeneratedAt: z.coerce.date().optional(),
    coverImageSourceHash: sha256.optional(),
    coverImageSourceHashVersion: z.literal(2).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const uniquePaths = new Set(data.payloadPaths);
    if (uniquePaths.size !== data.payloadPaths.length) {
      ctx.addIssue({
        code: "custom",
        path: ["payloadPaths"],
        message: "must not contain duplicate paths",
      });
    }
    if (!uniquePaths.has(data.entrypoint)) {
      ctx.addIssue({
        code: "custom",
        path: ["entrypoint"],
        message: "must be included in payloadPaths",
      });
    }
    const expectedDownload =
      data.payloadPaths.length === 1
        ? `bundles/${data.slug}/${data.entrypoint}`
        : `bundles/${data.slug}.zip`;
    if (data.downloadPath !== expectedDownload) {
      ctx.addIssue({
        code: "custom",
        path: ["downloadPath"],
        message: `must be ${expectedDownload}`,
      });
    }
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
      "coverImageSourceHashVersion",
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
    if (data.publicationStatus === "published" && present.length !== artworkFields.length) {
      ctx.addIssue({
        code: "custom",
        path: ["publicationStatus"],
        message: "cannot be published until every generated-cover field is present",
      });
    }
  });

export type PromptFrontmatter = z.infer<typeof promptSchema>;
export type GenericFileAssetFrontmatter = z.infer<typeof genericFileAssetSchema>;
export type GenericFileAssetProvenance = z.infer<typeof genericFileProvenanceSchema>;
export type ArtifactPayload = z.infer<typeof artifactPayloadSchema>;
export type PromptVariable = z.infer<typeof promptVariableSchema>;
export type AssetSeriesMembership = z.infer<typeof assetSeriesMembershipSchema>;
