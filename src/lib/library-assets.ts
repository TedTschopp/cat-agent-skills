import type { SkillFrontmatter } from "./skill-schema";
import {
  LIBRARY_ASSET_KIND_LABELS,
  type AssetSeriesMembership,
  type GenericFileAssetFrontmatter,
  type LibraryAssetKind,
  type LibraryAssetStatus,
  type PromptFrontmatter,
  type PromptVariable,
} from "./library-asset-schema";
import { coverGradient, initials, type SkillType } from "./skills";
import { getDownloads } from "./downloads";
import { getSkillEngagement, type SkillEngagement } from "./engagement";
import { getRating } from "./ratings";
import {
  deriveLibraryTopics,
  uniqueSearchTerms,
} from "./topic-taxonomy";

// Vite expands these at build time. They let the loader avoid Astro's noisy
// "collection does not exist or is empty" warning before the first generic
// contributor asset is added, without committing a fake placeholder asset.
const genericArtifactModules =
  typeof import.meta.glob === "function"
    ? import.meta.glob("../content/artifacts/**/*.md")
    : {};
const artifactPayloadModules =
  typeof import.meta.glob === "function"
    ? import.meta.glob("../content/artifact-payloads/**/*.md")
    : {};

export {
  LIBRARY_ASSET_KINDS,
  LIBRARY_ASSET_KIND_LABELS,
  type LibraryAssetKind,
  type LibraryAssetStatus,
  type PromptVariable,
  type AssetSeriesMembership,
} from "./library-asset-schema";

export type LibraryAssetAuthor = {
  name: string;
  url: string | null;
  github: string | null;
  avatar: string | null;
};

export type LibraryAssetArtwork = {
  ready: boolean;
  image: string | null;
  alt: string | null;
  prompt: string | null;
  aspectRatio: "16:10" | null;
  width: number | null;
  height: number | null;
  generator: string | null;
  generatedAt: string | null;
  sourceHash: string | null;
  sourceHashVersion: 1 | 2 | null;
  fallbackGradient: string;
  fallbackInitials: string;
};

export type LibraryAssetProvenance = {
  sourceRepository: string | null;
  sourceCommit: string | null;
  sourcePath: string | null;
  sourceUrl: string | null;
  sourceFileSha256: string | null;
  sourcePromptSha256: string | null;
  importedPromptSha256: string | null;
  sourceGuideSha256: string | null;
  importedGuideSha256: string | null;
  sourceFiles: Array<{ path: string; sha256: string }>;
  importedFiles: Array<{ path: string; sha256: string }>;
  legacyPaths: string[];
  legacyImage: Record<string, unknown> | null;
  legacyMetadata: Record<string, unknown> | null;
  appliedRepairs: string[];
};

export type LibraryAssetPayload = {
  /** Exact install-relative filename/path from the submission. */
  path: string;
  /** Published source download, relative to the site root. */
  downloadPath: string;
};

export type LibraryAssetContentFile = {
  /** Exact install-relative filename/path from the submission. */
  path: string;
  /** Exact UTF-8 source body. This field is never serialized to assets.json. */
  body: string;
};

export type LibraryAssetContent = {
  body: string;
  guide: string | null;
  promptBody: string | null;
  files: LibraryAssetContentFile[];
};

export type LibraryAsset = {
  kind: LibraryAssetKind;
  kindLabel: string;
  slug: string;
  name: string;
  /** Alias retained for consumers that call catalog names titles. */
  title: string;
  description: string;
  status: LibraryAssetStatus;
  publicationStatus: "published" | "blocked-pending-artwork";
  topics: string[];
  tags: string[];
  keywords: string[];
  /** Internal search-only terms omitted from the public catalog snapshot. */
  searchTerms: string[];
  models: string[];
  compatibility: string[];
  worksWith: string[];
  author: LibraryAssetAuthor;
  dates: {
    created: string | null;
    updated: string | null;
  };
  entrypoint: string;
  /** Published payload paths, relative to the site root. */
  payloadPaths: string[];
  /** Individually downloadable source payloads. */
  payloads: LibraryAssetPayload[];
  /** Deterministic multi-file archive, or null for single-file assets. */
  bundleDownloadPath: string | null;
  downloadPath: string | null;
  canonicalPath: string;
  legacyPaths: string[];
  featured: boolean;
  version: string | null;
  rating: number;
  downloads: number;
  engagement: SkillEngagement;
  variables: PromptVariable[];
  series: AssetSeriesMembership[];
  relatedAssetIds: string[];
  artwork: LibraryAssetArtwork;
  provenance: LibraryAssetProvenance;
  content: LibraryAssetContent;
};

export type LibraryAssetSummary = Omit<LibraryAsset, "content" | "searchTerms">;

type SkillRecord = {
  id: string;
  data: SkillFrontmatter;
  body?: string;
};

type PromptRecord = {
  id: string;
  data: PromptFrontmatter;
  body?: string;
};

type GenericFileRecord = {
  id: string;
  data: GenericFileAssetFrontmatter;
  body?: string;
};

function isoDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function skillKind(type: SkillType): LibraryAssetKind {
  return type;
}

/** Canonical route policy shared by pages, metadata, sitemap, and JSON output. */
export function canonicalPathFor(kind: LibraryAssetKind, slug: string): string {
  if (kind === "skill" || kind === "plugin" || kind === "automation") {
    return `/skills/${slug}/`;
  }
  if (kind === "prompt-template") return `/prompts/${slug}/`;
  return `/library/${slug}/`;
}

function emptyProvenance(slug: string): LibraryAssetProvenance {
  return {
    sourceRepository: "https://github.com/TedTschopp/cat-agent-skills",
    sourceCommit: null,
    sourcePath: `submissions/${slug}`,
    sourceUrl: null,
    sourceFileSha256: null,
    sourcePromptSha256: null,
    importedPromptSha256: null,
    sourceGuideSha256: null,
    importedGuideSha256: null,
    sourceFiles: [],
    importedFiles: [],
    legacyPaths: [],
    legacyImage: null,
    legacyMetadata: null,
    appliedRepairs: [],
  };
}

function artwork(
  slug: string,
  name: string,
  data: Pick<
    SkillFrontmatter | PromptFrontmatter | GenericFileAssetFrontmatter,
    | "coverColor"
    | "coverImage"
    | "coverImageAlt"
    | "coverImagePrompt"
    | "coverImageAspectRatio"
    | "coverImageWidth"
    | "coverImageHeight"
    | "coverImageGenerator"
    | "coverImageGeneratedAt"
    | "coverImageSourceHash"
  > & { coverImageSourceHashVersion?: 2 },
): LibraryAssetArtwork {
  const ready = Boolean(
    data.coverImage &&
      data.coverImageAlt &&
      data.coverImagePrompt &&
      data.coverImageAspectRatio &&
      data.coverImageWidth &&
      data.coverImageHeight &&
      data.coverImageGenerator &&
      data.coverImageGeneratedAt &&
      data.coverImageSourceHash,
  );
  return {
    ready,
    image: data.coverImage ?? null,
    alt: data.coverImageAlt ?? null,
    prompt: data.coverImagePrompt ?? null,
    aspectRatio: data.coverImageAspectRatio ?? null,
    width: data.coverImageWidth ?? null,
    height: data.coverImageHeight ?? null,
    generator: data.coverImageGenerator ?? null,
    generatedAt: isoDate(data.coverImageGeneratedAt),
    sourceHash: data.coverImageSourceHash ?? null,
    // Existing enrolled skill covers predate versioned hashes and remain v1.
    sourceHashVersion: data.coverImageSourceHash ? (data.coverImageSourceHashVersion ?? 1) : null,
    fallbackGradient: coverGradient(slug, data.coverColor),
    fallbackInitials: initials(name),
  };
}

function skillEntrypoint(type: SkillType, bundle: string | undefined): string {
  if (type === "plugin") return "manifest.json";
  if (type === "automation") {
    return bundle?.split("/").at(-1) ?? "automation.json";
  }
  return "SKILL.md";
}

/** Pure adapter for the existing skill collection. */
export function skillToLibraryAsset(record: SkillRecord, guide: string | null = null): LibraryAsset {
  const { id: slug, data } = record;
  const kind = skillKind(data.type);
  const downloadPath = data.bundle ?? `skills/${slug}.md`;
  const engagement = getSkillEngagement(slug);
  return {
    kind,
    kindLabel: LIBRARY_ASSET_KIND_LABELS[kind],
    slug,
    name: data.name,
    title: data.name,
    description: data.description,
    status: "active",
    publicationStatus: "published",
    topics: deriveLibraryTopics({ kind, name: data.name, tags: data.tags }),
    tags: [...data.tags],
    keywords: [],
    searchTerms: [],
    models: [],
    compatibility: [],
    worksWith: [...data.platforms],
    author: {
      name: data.author,
      url: data.authorUrl ?? null,
      github: data.authorGithub ?? null,
      avatar: null,
    },
    dates: {
      created: isoDate(data.createdAt),
      updated: isoDate(data.updatedAt),
    },
    entrypoint: skillEntrypoint(data.type, data.bundle),
    payloadPaths: [downloadPath],
    payloads: [{ path: skillEntrypoint(data.type, data.bundle), downloadPath }],
    bundleDownloadPath: downloadPath.endsWith(".zip") ? downloadPath : null,
    downloadPath,
    canonicalPath: canonicalPathFor(kind, slug),
    legacyPaths: [],
    featured: data.featured,
    version: data.version ?? null,
    rating: getRating(slug),
    downloads: getDownloads(slug),
    engagement,
    variables: [],
    series: [],
    relatedAssetIds: [],
    artwork: artwork(slug, data.name, data),
    provenance: emptyProvenance(slug),
    content: {
      body: record.body ?? "",
      guide,
      promptBody: null,
      files: [{ path: skillEntrypoint(data.type, data.bundle), body: record.body ?? "" }],
    },
  };
}

/** Pure adapter for migrated prompt collection entries. */
export function promptToLibraryAsset(
  record: PromptRecord,
  guide: string | null = null,
): LibraryAsset {
  const { id: slug, data } = record;
  if (data.slug !== slug) {
    throw new Error(`prompt slug mismatch: entry ${slug} declares ${data.slug}`);
  }
  const kind = data.kind;
  const engagement = getSkillEngagement(slug);
  const promptArtwork = artwork(slug, data.name, data);
  const source = data.provenance;
  return {
    kind,
    kindLabel: LIBRARY_ASSET_KIND_LABELS[kind],
    slug,
    name: data.name,
    title: data.name,
    description: data.description,
    status: data.status,
    // Fail closed even if malformed content bypasses collection validation.
    publicationStatus:
      data.publicationStatus === "published" && promptArtwork.ready
        ? "published"
        : "blocked-pending-artwork",
    topics: deriveLibraryTopics({
      kind,
      name: data.name,
      authoredTopics: data.topics,
      tags: data.tags,
    }),
    tags: [...data.tags],
    keywords: [...data.keywords],
    searchTerms: uniqueSearchTerms(data.topics),
    models: [...data.models],
    compatibility: [...data.compatibility],
    worksWith: [...data.worksWith],
    author: {
      name: data.author,
      url: data.authorUrl ?? null,
      github: null,
      avatar: data.authorAvatar ?? null,
    },
    dates: {
      created: isoDate(data.createdAt),
      updated: isoDate(data.updatedAt),
    },
    entrypoint: data.entrypoint,
    payloadPaths: [...data.payloadPaths],
    payloads: [{ path: data.entrypoint, downloadPath: data.downloadPath }],
    bundleDownloadPath: null,
    downloadPath: data.downloadPath,
    canonicalPath: canonicalPathFor(kind, slug),
    legacyPaths: [...(source?.legacyPaths ?? [])],
    featured: data.featured,
    version: data.version ?? null,
    rating: getRating(slug),
    downloads: getDownloads(slug),
    engagement,
    variables: [...data.variables],
    series: [...data.series],
    relatedAssetIds: [...data.relatedAssetIds],
    artwork: promptArtwork,
    provenance: {
      sourceRepository: source?.sourceRepository ?? null,
      sourceCommit: source?.sourceCommit ?? null,
      sourcePath: source?.sourcePath ?? null,
      sourceUrl: source?.sourceUrl ?? null,
      sourceFileSha256: source?.sourceFileSha256 ?? null,
      sourcePromptSha256: source?.sourcePromptSha256 ?? null,
      importedPromptSha256: source?.importedPromptSha256 ?? null,
      sourceGuideSha256: source?.sourceGuideSha256 ?? null,
      importedGuideSha256: source?.importedGuideSha256 ?? null,
      sourceFiles: [],
      importedFiles: [],
      legacyPaths: [...(source?.legacyPaths ?? [])],
      legacyImage: source?.legacyImage ?? null,
      legacyMetadata: source?.legacyMetadata ?? null,
      appliedRepairs: [...(source?.appliedRepairs ?? [])],
    },
    content: {
      body: record.body ?? "",
      guide,
      promptBody: record.body ?? "",
      files: [{ path: data.entrypoint, body: record.body ?? "" }],
    },
  };
}

/** Pure adapter for instruction, definition, and work-specification files. */
export function genericFileToLibraryAsset(
  record: GenericFileRecord,
  guide: string | null = null,
  files: readonly LibraryAssetContentFile[] | null = null,
): LibraryAsset {
  const { id: slug, data } = record;
  if (data.slug !== slug) {
    throw new Error(`generic file slug mismatch: entry ${slug} declares ${data.slug}`);
  }
  const genericArtwork = artwork(slug, data.name, data);
  const source = data.provenance;
  const providedFiles =
    files ??
    (data.payloadPaths.length === 1
      ? [{ path: data.entrypoint, body: record.body ?? "" }]
      : null);
  if (!providedFiles) {
    throw new Error(`generic file ${slug} is missing its multi-file payload content`);
  }
  const contentByPath = new Map<string, string>();
  for (const file of providedFiles) {
    if (contentByPath.has(file.path)) {
      throw new Error(`generic file ${slug} has duplicate payload content for ${file.path}`);
    }
    contentByPath.set(file.path, file.body);
  }
  const unexpectedPaths = [...contentByPath.keys()].filter(
    (path) => !data.payloadPaths.includes(path),
  );
  const missingPaths = data.payloadPaths.filter((path) => !contentByPath.has(path));
  if (unexpectedPaths.length || missingPaths.length) {
    throw new Error(
      `generic file ${slug} payload content mismatch` +
        (missingPaths.length ? `; missing: ${missingPaths.join(", ")}` : "") +
        (unexpectedPaths.length ? `; unexpected: ${unexpectedPaths.join(", ")}` : ""),
    );
  }
  const contentFiles = data.payloadPaths.map((path) => ({
    path,
    body: contentByPath.get(path)!,
  }));
  const entrypointBody = contentByPath.get(data.entrypoint)!;
  if (record.body !== undefined && record.body !== entrypointBody) {
    throw new Error(`generic file ${slug} entrypoint body differs from its payload content`);
  }
  return {
    kind: data.kind,
    kindLabel: LIBRARY_ASSET_KIND_LABELS[data.kind],
    slug,
    name: data.name,
    title: data.name,
    description: data.description,
    status: data.status,
    publicationStatus:
      data.publicationStatus === "published" && genericArtwork.ready
        ? "published"
        : "blocked-pending-artwork",
    topics: deriveLibraryTopics({
      kind: data.kind,
      name: data.name,
      authoredTopics: data.topics,
      tags: data.tags,
    }),
    tags: [...data.tags],
    keywords: [...data.keywords],
    searchTerms: uniqueSearchTerms(data.topics),
    models: [...data.models],
    compatibility: [...data.compatibility],
    worksWith: [...data.worksWith],
    author: {
      name: data.author,
      url: data.authorUrl ?? null,
      github: data.authorGithub ?? null,
      avatar: data.authorAvatar ?? null,
    },
    dates: {
      created: isoDate(data.createdAt),
      updated: isoDate(data.updatedAt),
    },
    entrypoint: data.entrypoint,
    payloadPaths: [...data.payloadPaths],
    payloads: data.payloadPaths.map((path) => ({
      path,
      downloadPath: `bundles/${slug}/${path}`,
    })),
    bundleDownloadPath:
      data.payloadPaths.length > 1 ? `bundles/${slug}.zip` : null,
    downloadPath: data.downloadPath,
    canonicalPath: canonicalPathFor(data.kind, slug),
    legacyPaths: [...(source?.legacyPaths ?? [])],
    featured: data.featured,
    version: data.version ?? null,
    rating: getRating(slug),
    downloads: getDownloads(slug),
    engagement: getSkillEngagement(slug),
    variables: [...data.variables],
    series: [...data.series],
    relatedAssetIds: [...data.relatedAssetIds],
    artwork: genericArtwork,
    provenance: {
      sourceRepository: source?.sourceRepository ?? null,
      sourceCommit: source?.sourceCommit ?? null,
      sourcePath: source?.sourcePath ?? null,
      sourceUrl: source?.sourceUrl ?? null,
      sourceFileSha256: source?.sourceFileSha256 ?? null,
      sourcePromptSha256: null,
      importedPromptSha256: null,
      sourceGuideSha256: null,
      importedGuideSha256: null,
      sourceFiles: [...(source?.sourceFiles ?? [])],
      importedFiles: [...(source?.importedFiles ?? [])],
      legacyPaths: [...(source?.legacyPaths ?? [])],
      legacyImage: source?.legacyImage ?? null,
      legacyMetadata: source?.legacyMetadata ?? null,
      appliedRepairs: [...(source?.appliedRepairs ?? [])],
    },
    content: {
      body: entrypointBody,
      guide,
      promptBody: null,
      files: contentFiles,
    },
  };
}

export function assertUniqueLibraryAssetSlugs(assets: readonly LibraryAsset[]): void {
  const seen = new Map<string, LibraryAssetKind>();
  for (const asset of assets) {
    const earlier = seen.get(asset.slug);
    if (earlier) {
      throw new Error(
        `duplicate library asset slug ${asset.slug}: ${earlier} and ${asset.kind}`,
      );
    }
    seen.set(asset.slug, asset.kind);
  }
}

export function sortLibraryAssets(assets: readonly LibraryAsset[]): LibraryAsset[] {
  return [...assets].sort((left, right) => {
    if (left.featured !== right.featured) return left.featured ? -1 : 1;
    return left.name.localeCompare(right.name) || left.slug.localeCompare(right.slug);
  });
}

export function toLibraryAssetSummary(asset: LibraryAsset): LibraryAssetSummary {
  const { content: _content, searchTerms: _searchTerms, ...summary } = asset;
  return summary;
}

/** Load every authored collection through one normalized data surface. */
export async function getAllLibraryAssets(): Promise<LibraryAsset[]> {
  const { getCollection } = await import("astro:content");
  const [skills, prompts, guides] = await Promise.all([
    getCollection("skills"),
    getCollection("prompts"),
    getCollection("guides"),
  ]);
  const [artifacts, artifactPayloads] = await Promise.all([
    Object.keys(genericArtifactModules).length > 0
      ? getCollection("artifacts")
      : Promise.resolve([]),
    Object.keys(artifactPayloadModules).length > 0
      ? getCollection("artifactPayloads")
      : Promise.resolve([]),
  ]);
  const guideBySlug = new Map(guides.map((guide) => [guide.id, guide.body ?? ""]));
  const payloadsBySlug = new Map(
    artifactPayloads.map((payload) => {
      if (payload.id !== payload.data.slug) {
        throw new Error(
          `artifact payload slug mismatch: entry ${payload.id} declares ${payload.data.slug}`,
        );
      }
      return [
        payload.id,
        payload.data.files.map(({ path, body }) => ({ path, body })),
      ] as const;
    }),
  );
  const assets = [
    ...skills.map((skill) => skillToLibraryAsset(skill, guideBySlug.get(skill.id) ?? null)),
    ...prompts.map((prompt) => promptToLibraryAsset(prompt, guideBySlug.get(prompt.id) ?? null)),
    ...artifacts.map((artifact) =>
      genericFileToLibraryAsset(
        artifact,
        guideBySlug.get(artifact.id) ?? null,
        payloadsBySlug.get(artifact.id) ?? null,
      ),
    ),
  ];
  assertUniqueLibraryAssetSlugs(assets);
  return sortLibraryAssets(assets);
}

/** Public library loader. Publication-blocked assets never reach routes or catalogs. */
export async function getLibraryAssets(): Promise<LibraryAsset[]> {
  return (await getAllLibraryAssets()).filter((asset) => asset.publicationStatus === "published");
}

export async function getLibraryAssetBySlug(slug: string): Promise<LibraryAsset | undefined> {
  return (await getLibraryAssets()).find((asset) => asset.slug === slug);
}
