/**
 * Materialize the approved Tedt.org prompt migration as reviewable submissions.
 *
 * Source content is always read from Git objects at the pinned commit. The
 * source worktree may be dirty or checked out elsewhere; neither affects the
 * generated result. The committed inventory itself is approval-gated by its
 * byte-for-byte SHA-256 before any files are written.
 *
 * Usage:
 *   npm run migrate:tedt-prompts -- --source /path/to/tedt.org
 *   npm run migrate:tedt-prompts -- --source /path/to/tedt.org --check
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promptSchema, type AssetSeriesMembership } from "../src/lib/library-asset-schema.ts";
import {
  EXPECTED_PROMPT_COUNT,
  splitFrontmatter,
  type JsonValue,
  type PromptInventoryManifest,
  type PromptInventoryRecord,
} from "./inventory-tedt-prompts.ts";

export const APPROVED_SOURCE_COMMIT = "61d55789c8754fec010824ccccb893e25f19ccb3";
export const APPROVED_MANIFEST_SHA256 =
  "sha256:0a061c4a4e098cd647d1219582ecd7e5de18248a49337229342d8fd1e70441f0";
export const DEFAULT_MANIFEST_PATH = "docs/migrations/tedt-prompts-inventory.json";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MODEL_ALIASES = new Map([
  ["github", "github-copilot"],
  ["04-mini", "o4-mini"],
  ["04-mini-high", "o4-mini-high"],
]);
const ARTWORK_OVERLAY_FIELDS = [
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

type JsonObject = Record<string, unknown>;

export type PromptMigrationCliOptions = {
  source: string;
  manifest: string;
  outputRoot: string;
  checkOnly: boolean;
};

export type MigratedPrompt = {
  slug: string;
  metadata: JsonObject;
  prompt: string;
  guide: string;
};

export function sha256(data: string | Buffer): string {
  return `sha256:${createHash("sha256").update(data).digest("hex")}`;
}

export function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function optionValue(args: string[], index: number, name: string): [string, number] {
  const arg = args[index];
  if (arg === name) {
    const value = args[index + 1];
    if (!value) throw new Error(`\`${name}\` requires a value`);
    return [value, index + 1];
  }
  return [arg.slice(name.length + 1), index];
}

export function parseMigrationCliArgs(
  args: string[],
  root = join(import.meta.dirname, ".."),
): PromptMigrationCliOptions {
  let source: string | undefined;
  let manifest = join(root, DEFAULT_MANIFEST_PATH);
  let outputRoot = root;
  let checkOnly = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check") {
      checkOnly = true;
    } else if (arg === "--source" || arg.startsWith("--source=")) {
      [source, index] = optionValue(args, index, "--source");
    } else if (arg === "--manifest" || arg.startsWith("--manifest=")) {
      [manifest, index] = optionValue(args, index, "--manifest");
    } else if (arg === "--output-root" || arg.startsWith("--output-root=")) {
      [outputRoot, index] = optionValue(args, index, "--output-root");
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!source) throw new Error("`--source` is required");
  return {
    source: resolve(source),
    manifest: resolve(manifest),
    outputRoot: resolve(outputRoot),
    checkOnly,
  };
}

/** Load and authenticate the exact inventory that received migration approval. */
export function loadApprovedManifest(path: string): PromptInventoryManifest {
  const bytes = readFileSync(path);
  const digest = sha256(bytes);
  if (digest !== APPROVED_MANIFEST_SHA256) {
    throw new Error(
      `inventory SHA-256 mismatch: expected ${APPROVED_MANIFEST_SHA256}, got ${digest}`,
    );
  }
  const manifest = JSON.parse(bytes.toString("utf8")) as PromptInventoryManifest;
  if (manifest.schemaVersion !== 1) throw new Error("approved inventory schemaVersion must be 1");
  if (manifest.source.commit !== APPROVED_SOURCE_COMMIT) {
    throw new Error(
      `inventory source commit mismatch: expected ${APPROVED_SOURCE_COMMIT}, got ${manifest.source.commit}`,
    );
  }
  if (manifest.records.length !== EXPECTED_PROMPT_COUNT) {
    throw new Error(
      `approved inventory must contain ${EXPECTED_PROMPT_COUNT} records; found ${manifest.records.length}`,
    );
  }
  return manifest;
}

export function readGitBlob(sourceRepository: string, commit: string, path: string): Buffer {
  try {
    return execFileSync("git", ["-C", sourceRepository, "show", `${commit}:${path}`], {
      encoding: "buffer",
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`could not read ${commit}:${path} from ${sourceRepository}: ${detail}`);
  }
}

function occurrences(value: string, match: string): number {
  if (!match) return 0;
  let count = 0;
  for (let offset = 0; ; offset += match.length) {
    const index = value.indexOf(match, offset);
    if (index === -1) return count;
    count += 1;
    offset = index;
  }
}

/**
 * Reverse the accidental JSON/Python-style escaping embedded in one legacy
 * YAML block scalar. This is deliberately narrow: physical lines are joined
 * only where the source carries an explicit trailing continuation slash, then
 * only known serialized escapes are decoded.
 */
export function decodeLegacySerializedPromptText(prompt: string): string {
  const unwrapped = prompt
    // The serializer used `\\` plus a physical newline to wrap long lines.
    // A second slash is wrapper padding only when it precedes whitespace. If
    // it begins a real escape such as `\\n`, preserve it for decoding below.
    .replace(/\\\n\\(?=[ \t])/g, "")
    .replace(/\\\n/g, "");
  return unwrapped
    .replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, "/")
    .replace(/\\&/g, "&");
}

/** Apply approved prompt-body edits, enforcing source and result hashes. */
export function applyApprovedPromptBodyEdits(
  prompt: string,
  artifactId: string,
  manifest: PromptInventoryManifest,
): { prompt: string; repairIds: string[] } {
  let next = prompt;
  const repairIds: string[] = [];
  for (const repair of manifest.proposedRepairs.promptBodyEdits) {
    if (repair.artifactId !== artifactId) continue;
    if (sha256(next) !== repair.sourcePromptSha256) {
      throw new Error(`${artifactId}: source prompt hash does not match repair ${repair.id}`);
    }
    if (repair.operation === "decode-legacy-serialized-text") {
      next = decodeLegacySerializedPromptText(next);
      const result = sha256(next);
      if (result !== repair.resultingPromptSha256) {
        throw new Error(
          `${artifactId}: repair ${repair.id} result hash mismatch; expected ${repair.resultingPromptSha256}, got ${result}`,
        );
      }
      repairIds.push(repair.id);
      continue;
    }
    const count = occurrences(next, repair.match);
    if (count !== 1) {
      throw new Error(`${artifactId}: repair ${repair.id} match count must be 1; found ${count}`);
    }
    next = next.replace(repair.match, repair.replacement);
    const result = sha256(next);
    if (result !== repair.resultingPromptSha256) {
      throw new Error(
        `${artifactId}: repair ${repair.id} result hash mismatch; expected ${repair.resultingPromptSha256}, got ${result}`,
      );
    }
    repairIds.push(repair.id);
  }
  return { prompt: next, repairIds };
}

function workflowMemberships(
  manifest: PromptInventoryManifest,
): Map<string, { series: AssetSeriesMembership[]; relatedAssetIds: string[]; repairIds: string[] }> {
  const result = new Map<
    string,
    { series: AssetSeriesMembership[]; relatedAssetIds: string[]; repairIds: string[] }
  >();
  for (const workflow of manifest.proposedWorkflows) {
    const ordered = [...workflow.steps].sort((left, right) => left.step - right.step);
    if (ordered.length === 0 || ordered.some((step, index) => step.step !== index + 1)) {
      throw new Error(`workflow ${workflow.id} must have contiguous one-based steps`);
    }
    for (let index = 0; index < ordered.length; index += 1) {
      const step = ordered[index];
      const entry = result.get(step.artifactId) ?? {
        series: [],
        relatedAssetIds: [],
        repairIds: [],
      };
      const previousAssetId = ordered[index - 1]?.artifactId ?? null;
      const nextAssetId = ordered[index + 1]?.artifactId ?? null;
      entry.series.push({
        id: workflow.id,
        title: workflow.title,
        step: step.step,
        totalSteps: ordered.length,
        previousAssetId,
        nextAssetId,
      });
      for (const related of [previousAssetId, nextAssetId]) {
        if (related && !entry.relatedAssetIds.includes(related)) entry.relatedAssetIds.push(related);
      }
      entry.repairIds.push(`repair-workflow-${workflow.id}`);
      result.set(step.artifactId, entry);
    }
  }
  return result;
}

function unresolvedRawModels(record: PromptInventoryRecord): JsonValue[] {
  const unresolved = new Set(record.unknownModelIdentifiers);
  return record.rawModelIdentifiers.filter((value) => unresolved.has(String(value)));
}

function copyVariables(record: PromptInventoryRecord): JsonValue[] {
  return structuredClone(record.variables);
}

function valueForCatalogField(record: PromptInventoryRecord, field: string): string | null {
  if (field === "title") return record.title;
  if (field === "description") return record.description;
  if (field === "seoDescription") return record.seoDescription;
  throw new Error(`${record.id}: unsupported approved catalog field ${field}`);
}

function applyCatalogRepairs(
  record: PromptInventoryRecord,
  manifest: PromptInventoryManifest,
): { name: string; description: string; seoDescription: string | null; repairIds: string[] } {
  const values: Record<string, string | null> = {
    title: record.title,
    description: record.description,
    seoDescription: record.seoDescription,
  };
  const repairIds: string[] = [];
  for (const repair of manifest.proposedRepairs.catalogMetadata) {
    if (repair.artifactId !== record.id) continue;
    for (const [field, change] of Object.entries(repair.changes)) {
      const source = valueForCatalogField(record, field);
      if (values[field] !== source || source !== change.from) {
        throw new Error(
          `${record.id}: repair ${repair.id} expected ${field}=${JSON.stringify(change.from)}, got ${JSON.stringify(source)}`,
        );
      }
      values[field] = change.to;
    }
    repairIds.push(repair.id);
  }
  if (values.title !== record.proposedTitle) {
    throw new Error(
      `${record.id}: approved title ${JSON.stringify(values.title)} does not match inventory proposedTitle ${JSON.stringify(record.proposedTitle)}`,
    );
  }
  return {
    name: values.title!,
    description: values.description!,
    seoDescription: values.seoDescription,
    repairIds,
  };
}

function modelRepairIds(record: PromptInventoryRecord): string[] {
  const raw = new Set(record.rawModelIdentifiers.map(String));
  return [...MODEL_ALIASES]
    .filter(([source]) => raw.has(source))
    .map(([source, target]) => `normalize-model-${source}-to-${target}`);
}

/** Build one normalized prompt and its complete provenance from verified source text. */
export function migratePromptRecord(
  record: PromptInventoryRecord,
  sourceBytes: Buffer,
  manifest: PromptInventoryManifest,
): MigratedPrompt {
  if (sha256(sourceBytes) !== record.sourceFileSha256) {
    throw new Error(`${record.id}: source file SHA-256 differs from approved inventory`);
  }
  const source = sourceBytes.toString("utf8");
  const parsed = splitFrontmatter(source);
  if (sha256(parsed.rawFrontmatter) !== record.rawFrontmatterSha256) {
    throw new Error(`${record.id}: raw frontmatter SHA-256 differs from approved inventory`);
  }
  if (typeof parsed.frontmatter.prompt_content !== "string") {
    throw new Error(`${record.id}: source prompt_content must be a string`);
  }
  const sourcePrompt = normalizeLineEndings(parsed.frontmatter.prompt_content);
  const guide = normalizeLineEndings(parsed.body);
  if (sha256(sourcePrompt) !== record.promptSha256) {
    throw new Error(`${record.id}: decoded prompt SHA-256 differs from approved inventory`);
  }
  if (sha256(guide) !== record.guideSha256) {
    throw new Error(`${record.id}: guide SHA-256 differs from approved inventory`);
  }

  const catalog = applyCatalogRepairs(record, manifest);
  const variables = copyVariables(record);
  const variableRepairIds: string[] = [];
  for (const repair of manifest.proposedRepairs.variableDefinitions) {
    if (repair.artifactId !== record.id) continue;
    if (variables.some((value) => (value as JsonObject).name === repair.definition.name)) {
      throw new Error(`${record.id}: repair ${repair.id} would duplicate variable ${repair.definition.name}`);
    }
    variables.push(structuredClone(repair.definition) as JsonValue);
    variableRepairIds.push(repair.id);
  }
  const bodyRepair = applyApprovedPromptBodyEdits(sourcePrompt, record.id, manifest);
  const workflows = workflowMemberships(manifest).get(record.id) ?? {
    series: [],
    relatedAssetIds: [],
    repairIds: [],
  };

  const transformationRepairIds: string[] = [];
  if (record.legacySlug !== record.canonicalSlug) {
    transformationRepairIds.push(
      `normalize-slug-${record.legacySlug}-to-${record.canonicalSlug}`,
    );
  }
  if (!record.visibleInAlphaIndex) transformationRepairIds.push("include-hidden-alpha-prompt");

  const importedPromptSha256 = sha256(bodyRepair.prompt);
  const importedGuideSha256 = sha256(guide);
  const metadata: JsonObject = {
    kind: "prompt-template",
    slug: record.canonicalSlug,
    name: catalog.name,
    description: catalog.description,
    status: record.proposedDecision.status,
    publicationStatus: "blocked-pending-artwork",
    topics: record.topics,
    tags: record.topics,
    keywords: record.keywords,
    models: record.normalizedModels,
    compatibility: record.compatibility,
    worksWith: record.compatibility,
    author: record.author.name,
    authorUrl: record.author.url,
    authorAvatar: record.author.avatar,
    entrypoint: record.proposedEntrypoint,
    payloadPaths: [record.proposedEntrypoint],
    downloadPath: `bundles/${record.proposedEntrypoint}`,
    createdAt: record.publishedAt,
    updatedAt: record.updatedAt,
    subtitle: record.subtitle,
    summaryBullets: record.summaryBullets,
    seoDescription: catalog.seoDescription,
    variables,
    series: workflows.series,
    relatedAssetIds: workflows.relatedAssetIds,
    featured: false,
    provenance: {
      sourceRepository: manifest.source.repository,
      sourceCommit: manifest.source.commit,
      sourcePath: record.sourceFile,
      sourceUrl: record.sourceUrl,
      sourceFileSha256: record.sourceFileSha256,
      sourcePromptSha256: record.promptSha256,
      importedPromptSha256,
      sourceGuideSha256: record.guideSha256,
      importedGuideSha256,
      rawFrontmatterSha256: record.rawFrontmatterSha256,
      sourceTitle: record.title,
      sourceDescription: record.description,
      sourceSeoDescription: record.seoDescription,
      sourceModels: record.rawModelIdentifiers,
      unresolvedModelIdentifiers: unresolvedRawModels(record),
      legacyPaths: [record.legacyPath],
      legacyCategories: record.categories,
      visibleInAlphaIndex: record.visibleInAlphaIndex,
      legacyImage: record.legacyImage,
      legacyMetadata: record.legacyMetadata,
      appliedRepairs: [
        ...catalog.repairIds,
        ...variableRepairIds,
        ...bodyRepair.repairIds,
        ...workflows.repairIds,
        ...modelRepairIds(record),
        ...transformationRepairIds,
      ].sort(),
    },
  };
  promptSchema.parse(metadata);
  return { slug: record.canonicalSlug, metadata, prompt: bodyRepair.prompt, guide };
}

function serializeMetadata(metadata: JsonObject): string {
  return `${JSON.stringify(metadata, null, 2)}\n`;
}

/** Preserve only the artwork workflow's complete derived overlay on a rerun. */
export function preserveArtworkOverlay(
  generated: JsonObject,
  current: JsonObject | null,
): JsonObject {
  if (!current) return generated;
  const present = ARTWORK_OVERLAY_FIELDS.filter((field) => current[field] !== undefined);
  if (present.length === 0) return generated;
  if (present.length !== ARTWORK_OVERLAY_FIELDS.length || current.publicationStatus !== "published") {
    throw new Error("existing prompt metadata has an incomplete artwork publication overlay");
  }
  const merged: JsonObject = { ...generated, publicationStatus: "published" };
  for (const field of ARTWORK_OVERLAY_FIELDS) merged[field] = current[field];
  promptSchema.parse(merged);
  return merged;
}

function expectedFiles(prompt: MigratedPrompt, root: string): Map<string, string> {
  const directory = join(root, "submissions", prompt.slug);
  const metadataPath = join(directory, "metadata.json");
  let currentMetadata: JsonObject | null = null;
  if (existsSync(metadataPath)) {
    try {
      currentMetadata = JSON.parse(readFileSync(metadataPath, "utf8")) as JsonObject;
    } catch (error) {
      throw new Error(`${metadataPath}: could not parse existing artwork overlay: ${(error as Error).message}`);
    }
  }
  const metadata = preserveArtworkOverlay(prompt.metadata, currentMetadata);
  return new Map([
    [metadataPath, serializeMetadata(metadata)],
    [join(directory, `${prompt.slug}.prompt.md`), prompt.prompt],
    [join(directory, "README.md"), prompt.guide],
  ]);
}

function atomicWrite(path: string, content: string): boolean {
  if (existsSync(path) && readFileSync(path, "utf8") === content) return false;
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(temporary, content, "utf8");
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
  return true;
}

function findStaleMigratedPromptSlugs(root: string, expected: Set<string>): string[] {
  const submissions = join(root, "submissions");
  if (!existsSync(submissions)) return [];
  const stale: string[] = [];
  for (const name of readdirSync(submissions)) {
    if (expected.has(name) || !SAFE_SLUG.test(name)) continue;
    const metadataPath = join(submissions, name, "metadata.json");
    if (!existsSync(metadataPath)) continue;
    try {
      const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as JsonObject;
      const provenance = metadata.provenance as JsonObject | undefined;
      if (
        metadata.kind === "prompt-template" &&
        provenance?.sourceRepository === "https://github.com/TedTschopp/tedt.org" &&
        provenance?.sourceCommit === APPROVED_SOURCE_COMMIT
      ) {
        stale.push(name);
      }
    } catch {
      // The normal importer owns malformed unrelated sidecars.
    }
  }
  return stale.sort();
}

export function materializeApprovedPrompts(options: PromptMigrationCliOptions): {
  prompts: number;
  files: number;
  changed: number;
} {
  const manifest = loadApprovedManifest(options.manifest);
  const slugs = manifest.records.map((record) => record.canonicalSlug);
  if (new Set(slugs).size !== slugs.length) throw new Error("approved inventory has duplicate slugs");
  const recordIds = new Set(manifest.records.map((record) => record.id));
  for (const workflow of manifest.proposedWorkflows) {
    for (const step of workflow.steps) {
      if (!recordIds.has(step.artifactId)) {
        throw new Error(`workflow ${workflow.id} references missing ${step.artifactId}`);
      }
    }
  }

  const stale = findStaleMigratedPromptSlugs(options.outputRoot, new Set(slugs));
  if (stale.length) {
    throw new Error(`stale migrated prompt submissions require review: ${stale.join(", ")}`);
  }

  let fileCount = 0;
  let changed = 0;
  for (const record of [...manifest.records].sort((a, b) =>
    a.canonicalSlug.localeCompare(b.canonicalSlug),
  )) {
    const bytes = readGitBlob(options.source, manifest.source.commit, record.sourceFile);
    const prompt = migratePromptRecord(record, bytes, manifest);
    for (const [path, content] of expectedFiles(prompt, options.outputRoot)) {
      fileCount += 1;
      const current = existsSync(path) ? readFileSync(path, "utf8") : null;
      if (current === content) continue;
      if (options.checkOnly) {
        throw new Error(`generated prompt migration differs: ${path}`);
      }
      if (atomicWrite(path, content)) changed += 1;
    }
  }
  return { prompts: manifest.records.length, files: fileCount, changed };
}

function main(): void {
  try {
    const result = materializeApprovedPrompts(parseMigrationCliArgs(process.argv.slice(2)));
    console.log(
      `${result.prompts} prompts / ${result.files} files (${result.changed ? `${result.changed} updated` : "current"})`,
    );
  } catch (error) {
    console.error(`migrate-tedt-prompts: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
