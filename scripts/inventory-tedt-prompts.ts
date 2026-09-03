/**
 * Build the approval-gated inventory for the published Tedt.org prompt library.
 *
 * Usage:
 *   npm run inventory:tedt-prompts -- \
 *     --source /path/to/tedt.org \
 *     --source-ref 0123456789abcdef0123456789abcdef01234567
 *
 * The source repository must be clean. The generated JSON contains no prompt
 * bodies; it records exact decoded-body hashes and source-file hashes so the
 * later importer can prove that approved prompt text was preserved.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { load as loadYaml } from "js-yaml";

export const EXPECTED_PROMPT_COUNT = 56;
export const DEFAULT_OUTPUT_DIRECTORY = "docs/migrations";
export const MANIFEST_NAME = "tedt-prompts-inventory.json";
export const REPORT_NAME = "tedt-prompts-curation-report.md";

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type Frontmatter = Record<string, unknown>;

export type InventoryIssue = {
  code: string;
  severity: "information" | "repair" | "review";
  evidence: string;
  proposedTreatment: string;
};

export type SeriesStep = {
  step: number | null;
  title: string | null;
  description: string | null;
  sourcePromptFile: string | null;
  targetExists: boolean;
  proposedTargetFile: string | null;
  proposedTargetSlug: string | null;
  current: boolean;
};

export type PromptInventoryRecord = {
  id: `prompt:${string}`;
  artifactKind: "prompt-template";
  artifactTypeLabel: "Prompt Template File";
  sourceFile: string;
  sourceFileSha256: string;
  rawFrontmatterSha256: string;
  sourceUrl: string;
  legacyPath: string;
  legacySlug: string;
  canonicalSlug: string;
  proposedEntrypoint: string;
  title: string;
  proposedTitle: string;
  subtitle: string | null;
  description: string;
  summaryBullets: string[];
  seoDescription: string | null;
  author: { name: string; url: string | null; avatar: string | null };
  publishedAt: string;
  updatedAt: string | null;
  visibleInAlphaIndex: boolean;
  categories: string[];
  topics: string[];
  keywords: string[];
  sourceModels: string[];
  rawModelIdentifiers: JsonValue[];
  normalizedModels: string[];
  compatibility: string[];
  unknownModelIdentifiers: string[];
  promptSha256: string;
  promptCharacters: number;
  promptBytes: number;
  promptSizeClass: "S" | "M" | "L" | "XL";
  guideSha256: string;
  guideCharacters: number;
  guideBytes: number;
  variables: JsonValue[];
  variableAnalysis: {
    declared: string[];
    referenced: string[];
    undeclared: string[];
    unused: string[];
  };
  series: SeriesStep[];
  legacyImage: {
    sourcePath: string | null;
    sourceUrl: string | null;
    exists: boolean;
    sha256: string | null;
    metadata: { [key: string]: JsonValue };
  };
  artwork: {
    required: true;
    disposition: "regenerate";
    legacyImageUse: "provenance-only";
    generationReferencePolicy: "legacy-artwork-forbidden";
    publicationGate: "new-validated-cover-required";
    plannedPath: string;
    status: "pending-approval";
  };
  proposedDecision: {
    migration: "include";
    publication: "blocked-pending-artwork";
    status: "active" | "beta";
    duplicateHandling: "not-applicable" | "retain-distinct-version";
    metadataRepairs: string[];
    approval: "pending";
  };
  issues: InventoryIssue[];
  legacyMetadata: { [key: string]: JsonValue };
};

export type PromptInventoryManifest = {
  schemaVersion: 1;
  source: {
    repository: string;
    requestedRef: string;
    commit: string;
    commitDate: string;
    contentRoot: string;
    excludedContentRoots: Array<{
      path: string;
      trackedMarkdownFiles: number;
      reason: string;
    }>;
  };
  policy: {
    expectedPromptCount: 56;
    defaultArtifactKind: "prompt-template";
    preservePromptBodies: true;
    preserveGuides: true;
    preserveAllSources: true;
    preserveLegacyMetadata: true;
    mergeRequiresExplicitApproval: true;
    regenerateEveryCover: true;
    reuseLegacyArtwork: false;
    migrateLegacyEngagement: false;
  };
  summary: {
    records: number;
    visibleInAlphaIndex: number;
    hiddenFromAlphaIndex: number;
    variableEnabled: number;
    variableDefinitions: number;
    proposedVariableEnabled: number;
    proposedVariableDefinitions: number;
    seriesEnabled: number;
    withGuide: number;
    withDescription: number;
    withSubtitle: number;
    withSummaryBullets: number;
    summaryBulletItems: number;
    withSeoDescription: number;
    withUpdatedAt: number;
    withLegacyImage: number;
    withoutLegacyImage: number;
    uniqueLegacyImages: number;
    promptCharacters: number;
    promptBytes: number;
    guideCharacters: number;
    guideBytes: number;
    issueCounts: Record<string, number>;
    recommendedForMigration: number;
    recommendedCurationHold: 0;
    publicationBlockedPendingArtwork: number;
    artworkRequired: number;
  };
  proposedWorkflows: Array<{
    id: string;
    title: string;
    derivedFromLegacySeries: true;
    approval: "pending";
    ifDeclined: "omit-repaired-relationship";
    steps: Array<{
      step: number;
      artifactId: `prompt:${string}`;
      title: string;
      description: string;
    }>;
  }>;
  proposedRepairs: {
    catalogMetadata: Array<{
      id: string;
      artifactId: `prompt:${string}`;
      operation: "replace-catalog-fields";
      promptBodyChanges: false;
      approval: "pending";
      ifDeclined: "preserve-source-value";
      changes: Record<string, { from: string; to: string }>;
    }>;
    variableDefinitions: Array<{
      id: string;
      artifactId: `prompt:${string}`;
      operation: "add-variable-definition";
      promptBodyChanges: false;
      approval: "pending";
      ifDeclined: "hold-asset";
      definition: {
        name: string;
        label: string;
        type: "textarea";
        required: true;
        default: null;
        placeholder: string;
        help: string;
        rows: number;
      };
    }>;
    promptBodyEdits: Array<{
      id: string;
      artifactId: `prompt:${string}`;
      operation: "replace-exactly-once";
      approval: "pending";
      ifDeclined: "hold-asset";
      sourcePromptSha256: string;
      match: string;
      replacement: string;
      resultingPromptSha256: string;
    }>;
  };
  records: PromptInventoryRecord[];
};

type ParsedPrompt = {
  fileName: string;
  sourceFile: string;
  sourceSlug: string;
  sourceText: string;
  sourceFileSha256: string;
  rawFrontmatter: string;
  frontmatter: Frontmatter;
  guide: string;
};

const MALFORMED_MODEL_IDENTIFIERS = new Set(["04-mini", "04-mini-high"]);
const AMBIGUOUS_MODEL_IDENTIFIERS = new Set(["3"]);
const MODEL_ALIASES = new Map([
  ["04-mini", "o4-mini"],
  ["04-mini-high", "o4-mini-high"],
  ["github", "github-copilot"],
]);
const KNOWN_SERIES_REPAIR = new Map([
  ["2025-08-01-Critique-Content.md", "2025-08-01-Academic-Critique-Content.md"],
]);

const ISSUE_ORDER = [
  "duplicate-prompt-body",
  "work-in-progress-title",
  "title-needs-editorial-repair",
  "description-version-mismatch",
  "undeclared-variable",
  "unused-variable",
  "missing-series-target",
  "legacy-route-needs-alias",
  "hidden-from-alpha-index",
  "model-alias-needs-normalization",
  "ambiguous-model-identifier",
  "unknown-model-identifier",
  "source-filename-misspelling",
  "legacy-image-dimension-invalid",
  "legacy-image-missing",
  "legacy-image-reused",
  "legacy-image-fallback",
] as const;

const ISSUE_LABELS: Record<string, string> = {
  "duplicate-prompt-body": "Exact duplicate prompt body",
  "work-in-progress-title": "Work-in-progress title",
  "title-needs-editorial-repair": "Title needs editorial repair",
  "description-version-mismatch": "Description names the wrong version",
  "undeclared-variable": "Prompt token has no variable definition",
  "unused-variable": "Declared variable is unused",
  "missing-series-target": "Broken series target",
  "legacy-route-needs-alias": "Legacy route requires an explicit alias",
  "hidden-from-alpha-index": "Published prompt missing from the alpha index",
  "model-alias-needs-normalization": "Malformed model identifier",
  "ambiguous-model-identifier": "Ambiguous model identifier",
  "source-filename-misspelling": "Source filename misspells Midjourney",
  "legacy-image-dimension-invalid": "Legacy image dimension has an invalid type",
  "legacy-image-reused": "Legacy image reused by multiple prompts",
  "legacy-image-fallback": "No dedicated legacy image",
  "legacy-image-missing": "Legacy image file is missing",
  "unknown-model-identifier": "Unknown model identifier",
};

const ISSUE_TREATMENTS: Record<string, string> = {
  "duplicate-prompt-body":
    "Retain each prompt as a distinct version. Do not merge either record without a separate explicit approval.",
  "work-in-progress-title":
    "Remove the work-in-progress prefix from the catalog title and migrate the asset with BETA status.",
  "title-needs-editorial-repair":
    "Use each record's proposed catalog title and preserve its original title in migration provenance.",
  "description-version-mismatch":
    "Correct Template 3 catalog and SEO descriptions to identify Template 3; preserve the prompt body.",
  "undeclared-variable":
    "Add a required textarea variable named prd_instructions without changing the prompt body. Treat capitalized and prose-filled double braces as literal authoring placeholders, not app variables.",
  "unused-variable":
    "Approve the proposed one-line prompt-body repair that references include_grading, then record and verify the resulting new body hash.",
  "missing-series-target":
    "Replace the missing filename with prompt:academic-critique-content and represent the two source branches as the proposed simple-blog-review and universal-content-review workflows.",
  "legacy-route-needs-alias":
    "Use each safe lowercase canonical slug and retain its exact unusual Tedt.org route as an explicit redirect alias.",
  "hidden-from-alpha-index":
    "Include the prompt in the unified catalog and preserve the malformed legacy category only in migration provenance.",
  "model-alias-needs-normalization":
    "Normalize 04-mini to o4-mini and 04-mini-high to o4-mini-high while preserving every original value in provenance.",
  "ambiguous-model-identifier":
    "Preserve numeric model value 3 as unresolved; do not infer a model, provider, or launch action.",
  "unknown-model-identifier":
    "Preserve the value as unresolved and omit unverified provider actions.",
  "source-filename-misspelling":
    "Preserve each exact source filename in provenance and use the correctly spelled canonical slug.",
  "legacy-image-dimension-invalid":
    "Preserve the raw dimension value in provenance; do not use it for generated-cover dimensions.",
  "legacy-image-reused":
    "Keep the shared-image hashes as provenance and generate a unique, unrelated AI.Tedt.org cover for every prompt.",
  "legacy-image-fallback":
    "Generate a new, prompt-specific AI.Tedt.org cover before publication.",
  "legacy-image-missing":
    "Preserve the unresolved path in provenance and generate a new prompt-specific cover.",
};

const ISSUE_RESULTS: Record<string, string> = {
  "work-in-progress-title": "APPROVE FOR MIGRATION AS BETA",
  "undeclared-variable": "APPROVE AFTER VARIABLE REPAIR",
  "unused-variable": "APPROVE AFTER EXACT BODY REPAIR",
};

function issueRank(code: string): number {
  const index = ISSUE_ORDER.indexOf(code as (typeof ISSUE_ORDER)[number]);
  return index === -1 ? ISSUE_ORDER.length : index;
}

const PROPOSED_WORKFLOWS: PromptInventoryManifest["proposedWorkflows"] = [
  {
    id: "simple-blog-review",
    title: "Simple Blog Review",
    derivedFromLegacySeries: true,
    approval: "pending",
    ifDeclined: "omit-repaired-relationship",
    steps: [
      {
        step: 1,
        artifactId: "prompt:simple-blog-generator",
        title: "Content Generation",
        description: "Create initial blog post content based on your topic and audience",
      },
      {
        step: 2,
        artifactId: "prompt:academic-critique-content",
        title: "Content Critique",
        description: "Analyze and improve the generated content for quality and effectiveness",
      },
    ],
  },
  {
    id: "universal-content-review",
    title: "Universal Content Review",
    derivedFromLegacySeries: true,
    approval: "pending",
    ifDeclined: "omit-repaired-relationship",
    steps: [
      {
        step: 1,
        artifactId: "prompt:universal-content-creator-demo",
        title: "Content Planning",
        description: "Comprehensive content creation with all customization options",
      },
      {
        step: 2,
        artifactId: "prompt:academic-critique-content",
        title: "Content Critique",
        description: "Analyze and improve the generated content for quality and effectiveness",
      },
    ],
  },
];

function sha256(data: string | Buffer): string {
  return `sha256:${createHash("sha256").update(data).digest("hex")}`;
}

function toJsonValue(value: unknown): JsonValue {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (Array.isArray(value)) return value.map(toJsonValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, toJsonValue(entry)]),
    );
  }
  if (["string", "number", "boolean"].includes(typeof value)) return value as JsonPrimitive;
  return String(value);
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function strings(value: unknown): string[] {
  if (value === null || value === undefined || value === "") return [];
  return (Array.isArray(value) ? value : [value])
    .map(text)
    .filter(Boolean);
}

function plainObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function safeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

export function splitFrontmatter(source: string): {
  frontmatter: Frontmatter;
  rawFrontmatter: string;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match) throw new Error("missing or malformed YAML frontmatter");
  const loaded = loadYaml(match[1]);
  if (!loaded || typeof loaded !== "object" || Array.isArray(loaded)) {
    throw new Error("frontmatter must be a YAML mapping");
  }
  const frontmatter = loaded as Frontmatter;
  // js-yaml coerces unquoted large integers through IEEE-754 and can silently
  // corrupt identifiers. Preserve any unsafe top-level integer as source text.
  for (const line of match[1].split(/\r?\n/)) {
    const scalar = /^([A-Za-z0-9_-]+):\s*([+-]?\d+)\s*(?:#.*)?$/.exec(line);
    if (scalar && !Number.isSafeInteger(Number(scalar[2]))) {
      frontmatter[scalar[1]] = scalar[2];
    }
  }
  return {
    frontmatter,
    rawFrontmatter: match[1],
    body: source.slice(match[0].length),
  };
}

function findPublishedPromptsDirectory(sourceRoot: string): string {
  const postsDirectory = join(sourceRoot, "_posts");
  const matches = readdirSync(postsDirectory, { withFileTypes: true }).filter(
    (entry) => entry.isDirectory() && entry.name.toLowerCase() === "prompts",
  );
  if (matches.length !== 1) {
    throw new Error(`expected one _posts/prompts directory; found ${matches.length}`);
  }
  return join(postsDirectory, matches[0].name);
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function promptSizeClass(bytes: number): "S" | "M" | "L" | "XL" {
  if (bytes < 8_192) return "S";
  if (bytes < 32_768) return "M";
  if (bytes < 100_000) return "L";
  return "XL";
}

function assertInside(root: string, candidate: string, label: string): void {
  const rootPrefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (candidate !== root && !candidate.startsWith(rootPrefix)) {
    throw new Error(`${label} escapes the source repository`);
  }
}

function legacyPath(frontmatter: Frontmatter, sourceSlug: string): string {
  const permalink = text(frontmatter.permalink) || "/prompts/:slug/";
  const resolved = permalink.replaceAll(":slug", safeSlug(sourceSlug));
  const leading = resolved.startsWith("/") ? resolved : `/${resolved}`;
  return leading.endsWith("/") ? leading : `${leading}/`;
}

function compatibilityForModels(models: string[]): {
  compatibility: string[];
  unknown: string[];
} {
  const targets = new Set<string>();
  const unknown: string[] = [];
  for (const raw of models) {
    const model = raw.toLowerCase();
    if (model.startsWith("gpt-") || model.startsWith("o4-") || model.startsWith("04-")) {
      targets.add("chatgpt");
    } else if (model.startsWith("claude")) {
      targets.add("claude");
    } else if (model === "microsoft-copilot") {
      targets.add("microsoft-copilot");
    } else if (model === "github" || model === "github-copilot") {
      targets.add("github-copilot");
    } else if (model.startsWith("gemini")) {
      targets.add("gemini");
    } else {
      unknown.push(raw);
    }
  }
  return { compatibility: [...targets].sort(), unknown: [...new Set(unknown)].sort() };
}

function normalizeModels(models: string[]): string[] {
  return [
    ...new Set(
      models
        .filter((model) => !AMBIGUOUS_MODEL_IDENTIFIERS.has(model))
        .map((model) => MODEL_ALIASES.get(model) ?? model),
    ),
  ].sort();
}

function proposedTitle(title: string): string {
  return title.replace(/^Work In Progress:\s*/i, "").trim();
}

const TITLE_REPAIRS = new Map<string, string>([
  ["business-skills-prompts", "Business Skills Prompts"],
  ["create-a-unforgettable-opening-to-a-ttrpg", "Create an Unforgettable Opening to a TTRPG"],
  ["expert-novelist", "Communications Expert Novelist"],
  ["find-your-super-power", "Find Your Superpower"],
  ["risk-assessment-clean-up", "Risk Assessment Cleanup"],
]);

function variableNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => text(plainObject(entry).name)).filter(Boolean);
}

function referencedVariables(prompt: string): string[] {
  // Alpha variable names are lowercase snake_case. Capitalized or prose-filled
  // double braces are literal authoring placeholders, not customization fields.
  const matches = prompt.matchAll(/\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g);
  return [...new Set([...matches].map((match) => match[1]))].sort();
}

function readLegacyImage(sourceRoot: string, frontmatter: Frontmatter) {
  const imageMetadata = Object.fromEntries(
    Object.entries(frontmatter)
      .filter(([key, value]) => key.toLowerCase().startsWith("image") && value !== null && value !== "")
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, toJsonValue(value)]),
  );
  const sourcePath = text(frontmatter.image) || null;
  if (!sourcePath) {
    return {
      sourcePath: null,
      sourceUrl: null,
      exists: false,
      sha256: null,
      metadata: imageMetadata,
    };
  }
  const candidate = resolve(sourceRoot, sourcePath.replace(/^\/+/, ""));
  assertInside(sourceRoot, candidate, "legacy image");
  const exists = existsSync(candidate);
  if (exists && lstatSync(candidate).isSymbolicLink()) {
    throw new Error(`unsupported legacy image symlink: ${relative(sourceRoot, candidate)}`);
  }
  const isFile = exists && statSync(candidate).isFile();
  return {
    sourcePath,
    sourceUrl: new URL(sourcePath, "https://tedt.org/").href,
    exists: isFile,
    sha256: isFile ? sha256(readFileSync(candidate)) : null,
    metadata: imageMetadata,
  };
}

function parsePrompt(path: string, sourceRoot: string): ParsedPrompt {
  const info = lstatSync(path);
  if (info.isSymbolicLink()) throw new Error(`unsupported symlink: ${relative(sourceRoot, path)}`);
  if (!info.isFile()) throw new Error(`not a regular file: ${relative(sourceRoot, path)}`);
  const fileName = basename(path);
  const match = /^\d{4}-\d{2}-\d{2}-(.+)\.md$/.exec(fileName);
  if (!match) throw new Error(`unexpected prompt filename: ${fileName}`);
  const sourceBytes = readFileSync(path);
  const sourceText = sourceBytes.toString("utf8");
  const { frontmatter, rawFrontmatter, body } = splitFrontmatter(sourceText);
  if (typeof frontmatter.prompt_content !== "string") {
    throw new Error(`${fileName}: prompt_content must be a string`);
  }
  return {
    fileName,
    // Git's canonical path is lowercase. The local macOS checkout can retain an
    // older `_posts/Prompts` directory spelling for the same commit.
    sourceFile: `_posts/prompts/${fileName}`,
    sourceSlug: match[1],
    sourceText,
    sourceFileSha256: sha256(sourceBytes),
    rawFrontmatter,
    frontmatter,
    guide: body,
  };
}

function makeIssue(
  code: string,
  severity: InventoryIssue["severity"],
  evidence: string,
  proposedTreatment: string,
): InventoryIssue {
  return { code, severity, evidence, proposedTreatment };
}

function groupBy<T>(values: T[], keyFor: (value: T) => string | null): Map<string | null, T[]> {
  const grouped = new Map<string | null, T[]>();
  for (const value of values) {
    const key = keyFor(value);
    grouped.set(key, [...(grouped.get(key) ?? []), value]);
  }
  return grouped;
}

function parseSeries(
  frontmatter: Frontmatter,
  availableFiles: Set<string>,
  canonicalSlugByFile: Map<string, string>,
): SeriesStep[] {
  const value = Array.isArray(frontmatter.series) ? frontmatter.series : [];
  return value.map((raw) => {
    const step = plainObject(raw);
    const sourcePromptFile = text(step.prompt_file) || null;
    const suggested = sourcePromptFile ? KNOWN_SERIES_REPAIR.get(sourcePromptFile) ?? null : null;
    const proposedTargetFile =
      sourcePromptFile && availableFiles.has(sourcePromptFile) ? sourcePromptFile : suggested;
    return {
      step: Number.isFinite(Number(step.step)) ? Number(step.step) : null,
      title: text(step.title) || null,
      description: text(step.description) || null,
      sourcePromptFile,
      targetExists: Boolean(sourcePromptFile && availableFiles.has(sourcePromptFile)),
      proposedTargetFile,
      proposedTargetSlug: proposedTargetFile
        ? canonicalSlugByFile.get(proposedTargetFile) ?? null
        : null,
      current: step.current === true,
    };
  });
}

export function buildPromptRecords(sourceRootInput: string): PromptInventoryRecord[] {
  const sourceRoot = realpathSync(resolve(sourceRootInput));
  const promptsDirectory = findPublishedPromptsDirectory(sourceRoot);
  if (!existsSync(promptsDirectory) || !statSync(promptsDirectory).isDirectory()) {
    throw new Error(`published prompt directory not found: ${promptsDirectory}`);
  }
  const paths = readdirSync(promptsDirectory)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => join(promptsDirectory, name));
  if (paths.length !== EXPECTED_PROMPT_COUNT) {
    throw new Error(
      `expected ${EXPECTED_PROMPT_COUNT} published prompts; found ${paths.length}`,
    );
  }

  const parsed = paths.map((path) => parsePrompt(path, sourceRoot));
  const availableFiles = new Set(parsed.map((prompt) => prompt.fileName));
  const canonicalSlugByFile = new Map(
    parsed.map((prompt) => {
      const path = legacyPath(prompt.frontmatter, prompt.sourceSlug);
      return [prompt.fileName, safeSlug(path.split("/").filter(Boolean).at(-1) ?? prompt.sourceSlug)];
    }),
  );

  const records = parsed.map((prompt): PromptInventoryRecord => {
    const frontmatter = prompt.frontmatter;
    const promptContent = normalizeLineEndings(frontmatter.prompt_content as string);
    const guideContent = normalizeLineEndings(prompt.guide);
    const path = legacyPath(frontmatter, prompt.sourceSlug);
    const legacySlug = path.split("/").filter(Boolean).at(-1) ?? prompt.sourceSlug;
    const canonicalSlug = safeSlug(legacySlug);
    const title = text(frontmatter.title);
    const normalizedTitle = TITLE_REPAIRS.get(canonicalSlug) ?? proposedTitle(title);
    const categories = strings(frontmatter.categories);
    const sourceModels = strings(frontmatter["models-supported"]);
    const rawModelIdentifiers = Array.isArray(frontmatter["models-supported"])
      ? (toJsonValue(frontmatter["models-supported"]) as JsonValue[])
      : frontmatter["models-supported"] === undefined
        ? []
        : [toJsonValue(frontmatter["models-supported"])];
    const normalizedModels = normalizeModels(sourceModels);
    const { compatibility, unknown } = compatibilityForModels(sourceModels);
    const author = plainObject(frontmatter.author);
    const series = parseSeries(frontmatter, availableFiles, canonicalSlugByFile);
    const declaredVariables = variableNames(frontmatter.variables);
    const referenced = referencedVariables(promptContent);
    const undeclared = referenced.filter((name) => !declaredVariables.includes(name));
    const unused = declaredVariables.filter((name) => !referenced.includes(name));
    const issues: InventoryIssue[] = [];

    if (!categories.includes("Prompts")) {
      issues.push(
        makeIssue(
          "hidden-from-alpha-index",
          "repair",
          `categories=${JSON.stringify(toJsonValue(frontmatter.categories))}`,
          "Publish in the unified catalog and normalize the legacy category only in mapped metadata.",
        ),
      );
    }
    if (/^Work In Progress:/i.test(title)) {
      issues.push(
        makeIssue(
          "work-in-progress-title",
          "review",
          title,
          `Publish as BETA with the proposed title “${normalizedTitle}”.`,
        ),
      );
    }
    if (TITLE_REPAIRS.has(canonicalSlug)) {
      issues.push(
        makeIssue(
          "title-needs-editorial-repair",
          "review",
          title,
          `Publish with the proposed catalog title “${normalizedTitle}”; preserve the source title in provenance.`,
        ),
      );
    }
    if (
      /Template 3/i.test(title) &&
      /template 2/i.test(`${text(frontmatter.description)} ${text(frontmatter["seo-description"])}`)
    ) {
      issues.push(
        makeIssue(
          "description-version-mismatch",
          "repair",
          "Template 3 metadata describes template 2.",
          "Correct catalog and SEO descriptions to identify Template 3; preserve the prompt body.",
        ),
      );
    }
    for (const step of series.filter((entry) => entry.sourcePromptFile && !entry.targetExists)) {
      issues.push(
        makeIssue(
          "missing-series-target",
          "repair",
          `${step.sourcePromptFile} does not exist.`,
          step.proposedTargetFile
            ? `Map the relationship to ${step.proposedTargetFile} by canonical slug.`
            : "Hold the relationship until a target is explicitly approved.",
        ),
      );
    }
    for (const name of undeclared) {
      const suggestedType = name === "prd_instructions" ? "textarea" : "text";
      issues.push(
        makeIssue(
          "undeclared-variable",
          "review",
          `{{${name}}} appears in the prompt but has no variable definition.`,
          `Add a required ${suggestedType} variable named ${name}; preserve the prompt body.`,
        ),
      );
    }
    for (const name of unused) {
      issues.push(
        makeIssue(
          "unused-variable",
          "review",
          `${name} is declared but never referenced by the prompt.`,
          name === "include_grading"
            ? "Add the approved line “Include a formal grading rubric: {{include_grading}}.” and record the new body hash."
            : "Hold the variable behavior for an explicit content decision.",
        ),
      );
    }
    if (legacySlug !== canonicalSlug) {
      issues.push(
        makeIssue(
          "legacy-route-needs-alias",
          "repair",
          path,
          `Use ${canonicalSlug} as the canonical slug and preserve ${path} as an exact redirect alias.`,
        ),
      );
    }
    const malformed = sourceModels.filter((model) => MALFORMED_MODEL_IDENTIFIERS.has(model));
    if (malformed.length > 0) {
      issues.push(
        makeIssue(
          "model-alias-needs-normalization",
          "repair",
          malformed.join(", "),
          "Preserve the original identifiers in provenance and map them to ChatGPT compatibility.",
        ),
      );
    }
    const ambiguous = sourceModels.filter((model) => AMBIGUOUS_MODEL_IDENTIFIERS.has(model));
    if (ambiguous.length > 0) {
      issues.push(
        makeIssue(
          "ambiguous-model-identifier",
          "review",
          ambiguous.join(", "),
          "Preserve the numeric value in provenance; do not infer a model or provider from it.",
        ),
      );
    }
    const trulyUnknown = unknown.filter((model) => !AMBIGUOUS_MODEL_IDENTIFIERS.has(model));
    if (trulyUnknown.length > 0) {
      issues.push(
        makeIssue(
          "unknown-model-identifier",
          "review",
          trulyUnknown.join(", "),
          "Preserve the identifiers in provenance and omit unverified provider actions.",
        ),
      );
    }
    if (/Midjounrey/i.test(prompt.fileName)) {
      issues.push(
        makeIssue(
          "source-filename-misspelling",
          "information",
          prompt.fileName,
          "Preserve the source filename in provenance; use the correctly spelled canonical slug.",
        ),
      );
    }

    const legacyImage = readLegacyImage(sourceRoot, frontmatter);
    const legacyWidth = frontmatter.image_width;
    if (legacyWidth !== undefined && legacyWidth !== null && typeof legacyWidth !== "number") {
      issues.push(
        makeIssue(
          "legacy-image-dimension-invalid",
          "information",
          `image_width=${JSON.stringify(toJsonValue(legacyWidth))}`,
          "Preserve the raw value in provenance; do not use it for generated-cover dimensions.",
        ),
      );
    }
    if (!legacyImage.sourcePath) {
      issues.push(
        makeIssue(
          "legacy-image-fallback",
          "information",
          "The alpha page uses the site-wide fallback image.",
          "Generate a new, prompt-specific AI.Tedt.org cover before publication.",
        ),
      );
    } else if (!legacyImage.exists) {
      issues.push(
        makeIssue(
          "legacy-image-missing",
          "review",
          legacyImage.sourcePath,
          "Keep the unresolved path as provenance; do not use it for the new cover.",
        ),
      );
    }

    const legacyMetadata = Object.fromEntries(
      Object.entries(frontmatter)
        .filter(([key]) => key !== "prompt_content")
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => [key, toJsonValue(value)]),
    );
    const repairCodes = issues
      .filter((issue) => issue.severity === "repair")
      .map((issue) => issue.code)
      .sort();
    return {
      id: `prompt:${canonicalSlug}`,
      artifactKind: "prompt-template",
      artifactTypeLabel: "Prompt Template File",
      sourceFile: prompt.sourceFile,
      sourceFileSha256: prompt.sourceFileSha256,
      rawFrontmatterSha256: sha256(prompt.rawFrontmatter),
      sourceUrl: new URL(path, "https://tedt.org/").href,
      legacyPath: path,
      legacySlug,
      canonicalSlug,
      proposedEntrypoint: `${canonicalSlug}.prompt.md`,
      title,
      proposedTitle: normalizedTitle,
      subtitle: text(frontmatter.subtitle) || null,
      description: text(frontmatter.description),
      summaryBullets: strings(frontmatter.bullets),
      seoDescription: text(frontmatter["seo-description"]) || null,
      author: {
        name: text(author.name),
        url: text(author.url) || null,
        avatar: text(author.avatar) || null,
      },
      publishedAt: text(frontmatter.date),
      updatedAt: text(frontmatter.update) || null,
      visibleInAlphaIndex: categories.includes("Prompts"),
      categories,
      topics: strings(frontmatter.tags),
      keywords: strings(frontmatter.keywords),
      sourceModels,
      rawModelIdentifiers,
      normalizedModels,
      compatibility,
      unknownModelIdentifiers: unknown,
      promptSha256: sha256(promptContent),
      promptCharacters: [...promptContent].length,
      promptBytes: Buffer.byteLength(promptContent),
      promptSizeClass: promptSizeClass(Buffer.byteLength(promptContent)),
      guideSha256: sha256(guideContent),
      guideCharacters: [...guideContent].length,
      guideBytes: Buffer.byteLength(guideContent),
      variables: Array.isArray(frontmatter.variables)
        ? (toJsonValue(frontmatter.variables) as JsonValue[])
        : [],
      variableAnalysis: {
        declared: declaredVariables,
        referenced,
        undeclared,
        unused,
      },
      series,
      legacyImage,
      artwork: {
        required: true,
        disposition: "regenerate",
        legacyImageUse: "provenance-only",
        generationReferencePolicy: "legacy-artwork-forbidden",
        publicationGate: "new-validated-cover-required",
        plannedPath: `skill-art/${canonicalSlug}.webp`,
        status: "pending-approval",
      },
      proposedDecision: {
        migration: "include",
        publication: "blocked-pending-artwork",
        status: /^Work In Progress:/i.test(title) ? "beta" : "active",
        duplicateHandling: "not-applicable",
        metadataRepairs: repairCodes,
        approval: "pending",
      },
      issues,
      legacyMetadata,
    };
  });

  const bySlug = new Map<string, string>();
  const bySourceUrl = new Map<string, string>();
  for (const record of records) {
    const earlier = bySlug.get(record.canonicalSlug);
    if (earlier) {
      throw new Error(
        `canonical slug collision: ${record.canonicalSlug} (${earlier}, ${record.sourceFile})`,
      );
    }
    bySlug.set(record.canonicalSlug, record.sourceFile);
    const earlierUrl = bySourceUrl.get(record.sourceUrl);
    if (earlierUrl) {
      throw new Error(`legacy URL collision: ${record.sourceUrl} (${earlierUrl}, ${record.sourceFile})`);
    }
    bySourceUrl.set(record.sourceUrl, record.sourceFile);
  }

  const byPromptHash = groupBy(records, (record) => record.promptSha256);
  for (const group of byPromptHash.values()) {
    if (group.length < 2) continue;
    const peers = group.map((record) => record.canonicalSlug).sort();
    for (const record of group) {
      record.issues.push(
        makeIssue(
          "duplicate-prompt-body",
          "review",
          `Exact body match: ${peers.join(", ")}.`,
          "Retain each as a distinct version by default; merge only with explicit approval.",
        ),
      );
      record.proposedDecision.duplicateHandling = "retain-distinct-version";
    }
  }

  const withLegacyImages = records.filter((record) => record.legacyImage.sourcePath);
  const byLegacyImage = groupBy(withLegacyImages, (record) => record.legacyImage.sha256);
  for (const [imageHash, group] of byLegacyImage) {
    if (!imageHash || group.length < 2) continue;
    const peers = group.map((record) => record.canonicalSlug).sort();
    for (const record of group) {
      record.issues.push(
        makeIssue(
          "legacy-image-reused",
          "information",
          `${group.length} prompts share the legacy binary: ${peers.join(", ")}.`,
          "Retain the shared-image evidence as provenance and generate a unique new cover.",
        ),
      );
    }
  }

  for (const record of records) {
    record.issues.sort(
      (left, right) => issueRank(left.code) - issueRank(right.code) || left.code.localeCompare(right.code),
    );
  }
  return records.sort((left, right) => left.canonicalSlug.localeCompare(right.canonicalSlug));
}

function gitOutput(sourceRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", sourceRoot, ...args], { encoding: "utf8" }).trim();
}

function gitBytes(sourceRoot: string, args: string[]): Buffer {
  return execFileSync("git", ["-C", sourceRoot, ...args], {
    encoding: null,
    maxBuffer: 32 * 1024 * 1024,
  });
}

function verifyRecordsAgainstGitSnapshot(
  sourceRoot: string,
  sourceRef: string,
  records: PromptInventoryRecord[],
): void {
  for (const record of records) {
    const sourceBlob = gitBytes(sourceRoot, ["show", `${sourceRef}:${record.sourceFile}`]);
    if (sha256(sourceBlob) !== record.sourceFileSha256) {
      throw new Error(`${record.sourceFile}: worktree bytes differ from approved Git snapshot`);
    }
    if (record.legacyImage.sourcePath && record.legacyImage.sha256) {
      const imagePath = record.legacyImage.sourcePath.replace(/^\/+/, "");
      const imageBlob = gitBytes(sourceRoot, ["show", `${sourceRef}:${imagePath}`]);
      if (sha256(imageBlob) !== record.legacyImage.sha256) {
        throw new Error(`${imagePath}: worktree image differs from approved Git snapshot`);
      }
    }
  }
}

function normalizeRepositoryUrl(value: string): string {
  const ssh = /^git@github\.com:(.+)$/.exec(value);
  return (ssh ? `https://github.com/${ssh[1]}` : value).replace(/\.git$/, "");
}

function buildProposedRepairs(
  sourceRoot: string,
  records: PromptInventoryRecord[],
): PromptInventoryManifest["proposedRepairs"] {
  const academic = records.find((record) => record.id === "prompt:academic-critique-content");
  if (!academic) throw new Error("academic critique prompt is missing from the inventory");
  const academicPath = join(findPublishedPromptsDirectory(sourceRoot), basename(academic.sourceFile));
  const parsed = parsePrompt(academicPath, sourceRoot);
  const promptContent = normalizeLineEndings(parsed.frontmatter.prompt_content as string);
  if (sha256(promptContent) !== academic.promptSha256) {
    throw new Error("academic critique prompt changed while proposed repairs were calculated");
  }

  const match = "{{author_names}}\\n\\n## Introduction";
  const replacement =
    "{{author_names}}\\nInclude a formal grading rubric: {{include_grading}}.\\n\\n## Introduction";
  const occurrences = promptContent.split(match).length - 1;
  if (occurrences !== 1) {
    throw new Error(`expected the academic grading edit anchor exactly once; found ${occurrences}`);
  }
  const revisedPrompt = promptContent.replace(match, replacement);
  const prdTemplate3 = records.find(
    (record) => record.id === "prompt:product-requirements-document-prd-template-3",
  );
  if (!prdTemplate3) throw new Error("PRD Template 3 is missing from the inventory");
  const prdDescription =
    "Professional architecture product requirements document (prd) template 2 prompt designed for high-quality content generation and structured analysis.";
  const prdSeoDescription =
    "Master architecture product requirements document (prd) template 2 with this comprehensive AI prompt featuring structured templates and best practices.";
  if (
    prdTemplate3.description !== prdDescription ||
    prdTemplate3.seoDescription !== prdSeoDescription
  ) {
    throw new Error("PRD Template 3 source descriptions changed; review the proposed repair");
  }

  return {
    catalogMetadata: [
      ...records
        .filter((record) => record.title !== record.proposedTitle)
        .map((record) => ({
          id: `repair-title-${record.canonicalSlug}`,
          artifactId: record.id,
          operation: "replace-catalog-fields" as const,
          promptBodyChanges: false as const,
          approval: "pending" as const,
          ifDeclined: "preserve-source-value" as const,
          changes: { title: { from: record.title, to: record.proposedTitle } },
        })),
      {
        id: "repair-prd-template-3-description",
        artifactId: "prompt:product-requirements-document-prd-template-3",
        operation: "replace-catalog-fields",
        promptBodyChanges: false,
        approval: "pending",
        ifDeclined: "preserve-source-value",
        changes: {
          description: {
            from: prdDescription,
            to: "Professional architecture product requirements document (PRD) Template 3 prompt designed for high-quality content generation and structured analysis.",
          },
          seoDescription: {
            from: prdSeoDescription,
            to: "Master architecture product requirements document (PRD) Template 3 with this comprehensive AI prompt featuring structured templates and best practices.",
          },
        },
      },
    ],
    variableDefinitions: [
      {
        id: "add-prd-instructions-variable",
        artifactId: "prompt:prd-generator",
        operation: "add-variable-definition",
        promptBodyChanges: false,
        approval: "pending",
        ifDeclined: "hold-asset",
        definition: {
          name: "prd_instructions",
          label: "PRD Instructions",
          type: "textarea",
          required: true,
          default: null,
          placeholder: "Enter the project-specific instructions for the PRD.",
          help: "Describe the product, users, goals, constraints, and requirements the PRD must address.",
          rows: 8,
        },
      },
    ],
    promptBodyEdits: [
      {
        id: "use-academic-include-grading-variable",
        artifactId: "prompt:academic-critique-content",
        operation: "replace-exactly-once",
        approval: "pending",
        ifDeclined: "hold-asset",
        sourcePromptSha256: academic.promptSha256,
        match,
        replacement,
        resultingPromptSha256: sha256(revisedPrompt),
      },
    ],
  };
}

export function buildManifest(
  sourceRootInput: string,
  sourceRefInput: string,
): PromptInventoryManifest {
  const sourceRoot = realpathSync(resolve(sourceRootInput));
  const sourceRef = sourceRefInput.toLowerCase();
  if (!/^[a-f0-9]{40}$/.test(sourceRef)) {
    throw new Error("--source-ref must be a full 40-character commit SHA");
  }
  const resolvedRef = gitOutput(sourceRoot, ["rev-parse", "--verify", `${sourceRef}^{commit}`]);
  if (resolvedRef !== sourceRef) {
    throw new Error(`source ref resolved unexpectedly: ${resolvedRef}`);
  }
  const head = gitOutput(sourceRoot, ["rev-parse", "HEAD"]);
  if (head !== sourceRef) {
    throw new Error(`source worktree HEAD is ${head}; expected approved source ref ${sourceRef}`);
  }
  const originMain = gitOutput(sourceRoot, ["rev-parse", "refs/remotes/origin/main"]);
  if (originMain !== sourceRef) {
    throw new Error(`origin/main is ${originMain}; expected source ref ${sourceRef}`);
  }
  const dirty = gitOutput(sourceRoot, ["status", "--porcelain"]);
  if (dirty) throw new Error("source repository must be clean before inventory generation");
  const records = buildPromptRecords(sourceRoot);
  verifyRecordsAgainstGitSnapshot(sourceRoot, sourceRef, records);
  const proposedRepairs = buildProposedRepairs(sourceRoot, records);
  const contentRoot = gitOutput(sourceRoot, [
    "ls-tree",
    "-d",
    "--name-only",
    sourceRef,
    "--",
    "_posts/prompts",
  ]);
  if (contentRoot !== "_posts/prompts") {
    throw new Error(`expected canonical Git content root _posts/prompts; found ${contentRoot || "none"}`);
  }
  const excludedRootFiles = gitOutput(sourceRoot, [
    "ls-tree",
    "-r",
    "--name-only",
    sourceRef,
    "--",
    "prompts",
  ])
    .split("\n")
    .filter((path) => path.toLowerCase().endsWith(".md"));
  const issueCounts: Record<string, number> = {};
  for (const record of records) {
    for (const issue of record.issues) {
      issueCounts[issue.code] = (issueCounts[issue.code] ?? 0) + 1;
    }
  }
  const legacyHashes = new Set(
    records.map((record) => record.legacyImage.sha256).filter((value): value is string => Boolean(value)),
  );
  const variableEnabled = records.filter((record) => record.variables.length > 0).length;
  const variableDefinitions = records.reduce((sum, record) => sum + record.variables.length, 0);
  const newlyVariableEnabled = new Set(
    proposedRepairs.variableDefinitions
      .map((repair) => records.find((record) => record.id === repair.artifactId))
      .filter((record): record is PromptInventoryRecord => Boolean(record))
      .filter((record) => record.variables.length === 0)
      .map((record) => record.id),
  ).size;
  const finalOriginMain = gitOutput(sourceRoot, ["rev-parse", "refs/remotes/origin/main"]);
  if (finalOriginMain !== sourceRef) {
    throw new Error(`origin/main moved during inventory generation: ${finalOriginMain}`);
  }
  return {
    schemaVersion: 1,
    source: {
      repository: normalizeRepositoryUrl(gitOutput(sourceRoot, ["remote", "get-url", "origin"])),
      requestedRef: sourceRef,
      commit: sourceRef,
      commitDate: gitOutput(sourceRoot, ["show", "-s", "--format=%cI", "HEAD"]),
      contentRoot,
      excludedContentRoots: [
        {
          path: "prompts",
          trackedMarkdownFiles: excludedRootFiles.length,
          reason:
            "Tracked source library outside the published Jekyll prompt-post collection; excluded from this 56-page alpha migration gate.",
        },
      ],
    },
    policy: {
      expectedPromptCount: EXPECTED_PROMPT_COUNT,
      defaultArtifactKind: "prompt-template",
      preservePromptBodies: true,
      preserveGuides: true,
      preserveAllSources: true,
      preserveLegacyMetadata: true,
      mergeRequiresExplicitApproval: true,
      regenerateEveryCover: true,
      reuseLegacyArtwork: false,
      migrateLegacyEngagement: false,
    },
    summary: {
      records: records.length,
      visibleInAlphaIndex: records.filter((record) => record.visibleInAlphaIndex).length,
      hiddenFromAlphaIndex: records.filter((record) => !record.visibleInAlphaIndex).length,
      variableEnabled,
      variableDefinitions,
      proposedVariableEnabled: variableEnabled + newlyVariableEnabled,
      proposedVariableDefinitions:
        variableDefinitions + proposedRepairs.variableDefinitions.length,
      seriesEnabled: records.filter((record) => record.series.length > 0).length,
      withGuide: records.filter((record) => record.guideCharacters > 0).length,
      withDescription: records.filter((record) => record.description).length,
      withSubtitle: records.filter((record) => record.subtitle).length,
      withSummaryBullets: records.filter((record) => record.summaryBullets.length > 0).length,
      summaryBulletItems: records.reduce((sum, record) => sum + record.summaryBullets.length, 0),
      withSeoDescription: records.filter((record) => record.seoDescription).length,
      withUpdatedAt: records.filter((record) => record.updatedAt).length,
      withLegacyImage: records.filter((record) => record.legacyImage.sourcePath).length,
      withoutLegacyImage: records.filter((record) => !record.legacyImage.sourcePath).length,
      uniqueLegacyImages: legacyHashes.size,
      promptCharacters: records.reduce((sum, record) => sum + record.promptCharacters, 0),
      promptBytes: records.reduce((sum, record) => sum + record.promptBytes, 0),
      guideCharacters: records.reduce((sum, record) => sum + record.guideCharacters, 0),
      guideBytes: records.reduce((sum, record) => sum + record.guideBytes, 0),
      issueCounts: Object.fromEntries(Object.entries(issueCounts).sort()),
      recommendedForMigration: records.length,
      recommendedCurationHold: 0,
      publicationBlockedPendingArtwork: records.length,
      artworkRequired: records.length,
    },
    proposedWorkflows: PROPOSED_WORKFLOWS,
    proposedRepairs,
    records,
  };
}

function escapeCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function escapeLinkLabel(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("[", "\\[").replaceAll("]", "\\]");
}

function recordLink(record: PromptInventoryRecord): string {
  return `[${escapeLinkLabel(record.title)}](${record.sourceUrl})`;
}

function recordLinks(records: PromptInventoryRecord[], limit = 6): string {
  const shown = records.slice(0, limit).map(recordLink).join("; ");
  const remaining = records.length - limit;
  return remaining > 0 ? `${shown}; and ${remaining} more (see the manifest)` : shown;
}

export function renderReport(manifest: PromptInventoryManifest, manifestDigest: string): string {
  const exceptionGroups = new Map<string, PromptInventoryRecord[]>();
  for (const record of manifest.records) {
    for (const issue of record.issues) {
      const group = exceptionGroups.get(issue.code) ?? [];
      if (!group.some((entry) => entry.id === record.id)) group.push(record);
      exceptionGroups.set(issue.code, group);
    }
  }
  const orderedIssueCodes = [
    ...ISSUE_ORDER.filter((code) => exceptionGroups.has(code)),
    ...[...exceptionGroups.keys()]
      .filter((code) => !ISSUE_ORDER.includes(code as (typeof ISSUE_ORDER)[number]))
      .sort(),
  ];

  const issueSeverity = (code: string): InventoryIssue["severity"] => {
    const record = (exceptionGroups.get(code) ?? [])[0];
    return record?.issues.find((issue) => issue.code === code)?.severity ?? "review";
  };
  const decisionCodes = orderedIssueCodes.filter((code) => issueSeverity(code) !== "information");
  const informationCodes = orderedIssueCodes.filter(
    (code) => issueSeverity(code) === "information",
  );
  const decisionIdByCode = new Map(
    decisionCodes.map((code, index) => [code, `E${String(index + 1).padStart(2, "0")}`]),
  );
  const findingIdByCode = new Map(
    informationCodes.map((code, index) => [code, `F${String(index + 1).padStart(2, "0")}`]),
  );
  const requiredDecisionId = (code: string): string => {
    const id = decisionIdByCode.get(code);
    if (!id) throw new Error(`required report decision is missing: ${code}`);
    return id;
  };
  const variableDecisionId = requiredDecisionId("undeclared-variable");
  const bodyDecisionId = requiredDecisionId("unused-variable");
  const workflowDecisionId = requiredDecisionId("missing-series-target");
  const individuallyApprovedCodes = new Set([
    "undeclared-variable",
    "unused-variable",
    "missing-series-target",
  ]);
  const bulkDecisionIds = decisionCodes
    .filter((code) => !individuallyApprovedCodes.has(code))
    .map((code) => requiredDecisionId(code))
    .join(", ");
  const metadataDecisionIds = [
    requiredDecisionId("work-in-progress-title"),
    requiredDecisionId("title-needs-editorial-repair"),
    requiredDecisionId("description-version-mismatch"),
  ].join(", ");

  const exceptionRows = decisionCodes.map((code) => {
    const records = exceptionGroups.get(code) ?? [];
    const treatment = ISSUE_TREATMENTS[code] ?? "Review each manifest record's evidence and proposed treatment.";
    const result = ISSUE_RESULTS[code] ?? "APPROVE FOR MIGRATION";
    return `| ${decisionIdByCode.get(code)} | ${escapeCell(ISSUE_LABELS[code] ?? code)} | ${records.length} | ${escapeCell(recordLinks(records))} | ${escapeCell(treatment)} | ${result} |`;
  });

  const findingRows = informationCodes.map((code) => {
    const records = exceptionGroups.get(code) ?? [];
    const treatment = ISSUE_TREATMENTS[code] ?? "Retain the evidence in migration provenance.";
    return `| ${findingIdByCode.get(code)} | ${escapeCell(ISSUE_LABELS[code] ?? code)} | ${records.length} | ${escapeCell(recordLinks(records))} | ${escapeCell(treatment)} |`;
  });

  const exceptionAssetRows = decisionCodes.flatMap((code) => {
    const decisionId = decisionIdByCode.get(code);
    return (exceptionGroups.get(code) ?? []).map((record) => {
      const issue = record.issues.find((candidate) => candidate.code === code);
      const disposition = ISSUE_RESULTS[code] ?? "APPROVE FOR MIGRATION";
      return `| \`${decisionId}/${record.canonicalSlug}\` | ${recordLink(record)} | ${escapeCell(issue?.evidence ?? "See manifest")} | ${escapeCell(issue?.proposedTreatment ?? ISSUE_TREATMENTS[code] ?? "Review")} | ${disposition} |`;
    });
  });

  const coverageRows = manifest.records.map((record) => {
    const issues = record.issues.map((issue) => issue.code).join(", ") || "none";
    return `| ${recordLink(record)} | \`${record.canonicalSlug}\` | ${record.visibleInAlphaIndex ? "Yes" : "No"} | ${record.promptSizeClass} | ${record.promptCharacters.toLocaleString("en-US")} | ${record.variables.length} | ${record.legacyImage.sourcePath ? "Legacy image" : "Fallback"} | ${escapeCell(issues)} | ${record.proposedDecision.status.toUpperCase()} |`;
  });

  const workflowRows = manifest.proposedWorkflows.map((workflow) => {
    const steps = workflow.steps
      .map((step) => `${step.step}. \`${step.artifactId}\``)
      .join(" → ");
    return `| \`${workflow.id}\` | ${escapeCell(workflow.title)} | ${steps} | Derived from the alpha series metadata; pending this approval |`;
  });

  const catalogRepairRows = manifest.proposedRepairs.catalogMetadata.flatMap((repair) =>
    Object.entries(repair.changes).map(
      ([field, change]) =>
        `| \`${repair.id}\` | \`${repair.artifactId}\` | \`${field}\` | ${escapeCell(change.from)} | ${escapeCell(change.to)} |`,
    ),
  );
  const variableRepairRows = manifest.proposedRepairs.variableDefinitions.map((repair) => {
    const definition = repair.definition;
    return `| \`${repair.id}\` | \`${repair.artifactId}\` | \`${definition.name}\` | ${escapeCell(definition.label)} | ${definition.type} | ${definition.required ? "Yes" : "No"} | ${definition.default === null ? "None" : escapeCell(String(definition.default))} | ${escapeCell(definition.placeholder)} | ${escapeCell(definition.help)} | ${definition.rows} |`;
  });
  const bodyRepairRows = manifest.proposedRepairs.promptBodyEdits.map(
    (repair) =>
      `| \`${repair.id}\` | \`${repair.artifactId}\` | \`${repair.sourcePromptSha256}\` | \`${repair.match}\` | \`${repair.replacement}\` | \`${repair.resultingPromptSha256}\` |`,
  );

  const excludedRoot = manifest.source.excludedContentRoots[0];

  return `# Prompt Migration Curation Report

Source snapshot: [${manifest.source.repository}](${manifest.source.repository}/tree/${manifest.source.commit}/${manifest.source.contentRoot}) at \`${manifest.source.commit}\`  
Source commit date: ${manifest.source.commitDate}  
Manifest: [${MANIFEST_NAME}](./${MANIFEST_NAME})  
Manifest digest: \`${manifestDigest}\`

Inventory scope: \`${manifest.source.contentRoot}\` contains the 56 published prompt posts. The separate tracked \`${excludedRoot.path}/\` tree (${excludedRoot.trackedMarkdownFiles} Markdown files) is not the published alpha collection and is explicitly excluded from this gate.

## Approval Requested

Approve the global defaults and recommended treatments below. This report accounts for all ${manifest.summary.records} published prompt sources. The default is to recommend every prompt for migration; no source is deleted or merged without an explicit override.

Expected curation result if every recommendation is approved: **${manifest.summary.recommendedForMigration} approved for migration · ${manifest.summary.recommendedCurationHold} held for curation · ${manifest.summary.publicationBlockedPendingArtwork} still blocked from publication pending new artwork**.

Approval authorizes curation decisions only. It does not authorize prompt import, image generation, deployment, deletion, or redirect activation.

## Decision Summary

| Total | Visible in Alpha Index | Missing From Alpha Index | Series Records | Recommended for Migration | Curation Hold | Publication-Blocked Pending Artwork |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ${manifest.summary.records} | ${manifest.summary.visibleInAlphaIndex} | ${manifest.summary.hiddenFromAlphaIndex} | ${manifest.summary.seriesEnabled} | ${manifest.summary.recommendedForMigration} | ${manifest.summary.recommendedCurationHold} | ${manifest.summary.publicationBlockedPendingArtwork} |

### Alpha Content Captured

| Content | Sources With Content | Captured Amount | Migration Treatment |
| --- | ---: | ---: | --- |
| Prompt bodies | ${manifest.summary.records} | ${manifest.summary.promptCharacters.toLocaleString("en-US")} characters | Hash now; write approved content to \`.prompt.md\` during import |
| Detail-page guides | ${manifest.summary.withGuide} | ${manifest.summary.guideCharacters.toLocaleString("en-US")} characters | Hash now; map unchanged to the unified asset guide during import |
| Descriptions | ${manifest.summary.withDescription} | — | Map to catalog descriptions |
| Subtitles | ${manifest.summary.withSubtitle} | — | Preserve where present |
| Summary bullet arrays | ${manifest.summary.withSummaryBullets} | ${manifest.summary.summaryBulletItems} bullets | Preserve source order |
| SEO descriptions | ${manifest.summary.withSeoDescription} | — | Preserve where present |
| Updated dates | ${manifest.summary.withUpdatedAt} | — | Preserve where present |
| Customization variables | ${manifest.summary.variableEnabled} source prompts | ${manifest.summary.variableDefinitions} source definitions | ${manifest.summary.proposedVariableEnabled} prompts and ${manifest.summary.proposedVariableDefinitions} definitions after approving ${variableDecisionId} |
| Legacy image provenance | ${manifest.summary.withLegacyImage} | ${manifest.summary.uniqueLegacyImages} unique binary hashes; ${manifest.summary.withoutLegacyImage} fallback pages | Retain only in the migration manifest |
| Replacement artwork | ${manifest.summary.artworkRequired} | 0 generated; ${manifest.summary.artworkRequired} pending approval | Generate through the AI.Tedt.org artwork pipeline after this gate |

## Global Defaults

| ID | Default Rule |
| --- | --- |
| D01 | Approve all 56 sources for migration unless an explicit override places one on curation hold. Publication remains blocked until every later release gate passes. |
| D02 | Store the unified kind identifier as \`prompt-template\` and display its proper type label as **Prompt Template File**. |
| D03 | Preserve decoded prompt content and all 56 explanatory guide bodies exactly except CRLF or CR line endings normalize to LF. Record the exact source-file hash plus separate normalized prompt and guide hashes. |
| D04 | Use a safe lowercase canonical slug and preserve the exact Tedt.org path as a redirect alias. |
| D05 | Apply AP headline-style capitalization only to proposed catalog titles. Preserve source titles in provenance and map subtitles, descriptions, ordered summary bullets, SEO descriptions, authors, and published/updated dates without inventing missing values. |
| D06 | Present source tags as Topics and retain keywords as search aliases. |
| D07 | Map model strings to provider/product compatibility while retaining every original identifier in provenance. |
| D08 | Preserve variables, defaults, help, validation rules, and series evidence. Apply only the explicitly approved variable and two-workflow repairs listed below. |
| D09 | Before publication, generate a new, unique AI.Tedt.org editorial cover for every migrated prompt with the existing built-in artwork workflow. Never copy, crop, trace, recolor, or use legacy artwork as an image-generation reference. A missing, blocked, partial, or stale cover blocks that prompt. |
| D10 | Preserve legacy image paths, metadata, credits, dimensions, and binary hashes only as migration provenance. Do not map them into active \`coverImage*\` fields or credit replacement art with legacy metadata. |
| D11 | Start AI.Tedt.org ratings and discussions fresh. Do not migrate alpha Webmentions, Mastodon threads, or browser-local likes. |
| D12 | Preserve every source separately by default. A merge requires explicit approval. |

## Decisions Requiring Approval

| ID | Exception | Affected | Prompts | Recommended Treatment | Recommended Disposition |
| --- | --- | ---: | --- | --- | --- |
${exceptionRows.join("\n")}

Grouped decisions may be overridden for one asset with \`E##/canonical-slug\`, or for the entire group with \`E##\`. The complete map below names every affected asset and its record-specific evidence.

<details>
<summary>Complete Decision-to-Asset Map</summary>

| Override Key | Prompt | Evidence | Record-Specific Treatment | Recommended Disposition |
| --- | --- | --- | --- | --- |
${exceptionAssetRows.join("\n")}

</details>

## Exact Catalog Metadata Repairs

These are the complete source-to-proposed values for ${metadataDecisionIds}. They do not change prompt bodies.

| Repair ID | Asset | Field | Source Value | Proposed Value |
| --- | --- | --- | --- | --- |
${catalogRepairRows.join("\n")}

## Exact Variable Repair

${variableDecisionId} adds this complete customization definition. Capitalized and prose-filled double braces remain literal authoring placeholders.

| Repair ID | Asset | Name | Label | Type | Required | Default | Placeholder | Help | Rows |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: |
${variableRepairRows.join("\n")}

## Proposed Workflow Repair

The alpha has no series identifier and points three times to a filename that does not exist. Approval of D08 and ${workflowDecisionId} approves these two derived workflows:

| Workflow ID | Label | Ordered Assets | Status |
| --- | --- | --- | --- |
${workflowRows.join("\n")}

## Exact Prompt-Body Repair

${bodyDecisionId} is the only proposed prompt-body change. The exact-once replacement and resulting normalized hash are:

| Repair ID | Asset | Source Prompt Hash | Match Exactly Once | Replacement | Resulting Prompt Hash |
| --- | --- | --- | --- | --- | --- |
${bodyRepairRows.join("\n")}

If ${bodyDecisionId} is not explicitly approved, \`prompt:academic-critique-content\` will be held. All other proposed repairs leave decoded prompt content unchanged apart from line-ending normalization.

## Informational Findings Covered by Defaults

These findings require no separate decision. D04, D09, and D10 already define their handling.

| ID | Finding | Affected | Examples | Handling |
| --- | --- | ---: | --- | --- |
${findingRows.join("\n")}

## Ted’s Overrides

Use \`E##\` to override a whole decision group or \`E##/canonical-slug\` to override one asset. Approval accepts the remaining recommended treatments.

- Decision or compound override key:
- Replacement decision:
- Notes:

If an override or declined repair holds an asset, list each distinct held asset ID and recalculate the curation outcome. Relationship-only changes under ${workflowDecisionId} do not change asset counts.

- Distinct held asset IDs:
- Revised recommended-for-migration count: ${manifest.summary.recommendedForMigration} minus distinct held assets =
- Revised curation-hold count: ${manifest.summary.recommendedCurationHold} plus distinct held assets =

## Final Approval

- [ ] Approve global defaults D01–D12
- [ ] Approve ${bulkDecisionIds} except listed overrides
- [ ] Approve ${variableDecisionId} exactly as specified in **Exact Variable Repair**; otherwise hold \`prompt:prd-generator\`
- [ ] Approve ${bodyDecisionId} exactly as specified in **Exact Prompt-Body Repair**; otherwise hold \`prompt:academic-critique-content\`
- [ ] Approve ${workflowDecisionId} exactly as specified in **Proposed Workflow Repair**; otherwise hold the three series relationships, not their prompt assets
- [ ] Approve the baseline ${manifest.summary.recommendedForMigration} migration / ${manifest.summary.recommendedCurationHold} curation-hold recommendation when there are no held-asset overrides; otherwise approve the completed revised counts above. Every migration-approved asset remains publication-blocked pending validated new artwork.

Name:  
Date:

<details>
<summary>Complete 56-Prompt Coverage Table</summary>

| Prompt | Canonical Slug | In Alpha Index | Size | Characters | Variables | Old Cover | Issues | Recommended Catalog Status |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
${coverageRows.join("\n")}

</details>
`;
}

export function parseCliArgs(args: string[]): {
  source: string;
  sourceRef: string;
  output: string;
  check: boolean;
} {
  let source = "";
  let sourceRef = "";
  let output = DEFAULT_OUTPUT_DIRECTORY;
  let check = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check") {
      check = true;
      continue;
    }
    const [key, inline] = argument.split("=", 2);
    if (key !== "--source" && key !== "--source-ref" && key !== "--output") {
      throw new Error(`unknown argument: ${argument}`);
    }
    const value = inline ?? args[++index];
    if (!value || value.startsWith("--")) throw new Error(`${key} requires a value`);
    if (key === "--source") source = value;
    else if (key === "--source-ref") sourceRef = value;
    else output = value;
  }
  if (!source) throw new Error("--source is required");
  if (!sourceRef) throw new Error("--source-ref is required");
  if (!/^[a-fA-F0-9]{40}$/.test(sourceRef)) {
    throw new Error("--source-ref must be a full 40-character commit SHA");
  }
  return { source, sourceRef: sourceRef.toLowerCase(), output, check };
}

function assertCurrent(path: string, expected: string): void {
  if (!existsSync(path)) throw new Error(`--check failed: missing ${path}`);
  const actual = readFileSync(path, "utf8");
  if (actual !== expected) throw new Error(`--check failed: generated content differs for ${path}`);
}

function writeAtomic(path: string, content: string): void {
  const temporary = `${path}.tmp-${process.pid}`;
  writeFileSync(temporary, content, "utf8");
  renameSync(temporary, path);
}

function main(): void {
  const options = parseCliArgs(process.argv.slice(2));
  const manifest = buildManifest(options.source, options.sourceRef);
  const outputDirectory = resolve(options.output);
  const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
  const manifestDigest = sha256(manifestText);
  const report = renderReport(manifest, manifestDigest);
  const manifestPath = join(outputDirectory, MANIFEST_NAME);
  const reportPath = join(outputDirectory, REPORT_NAME);
  if (options.check) {
    assertCurrent(manifestPath, manifestText);
    assertCurrent(reportPath, report);
  } else {
    mkdirSync(outputDirectory, { recursive: true });
    writeAtomic(manifestPath, manifestText);
    writeAtomic(reportPath, report);
  }
  console.log(
    JSON.stringify(
      {
        sourceCommit: manifest.source.commit,
        records: manifest.summary.records,
        check: options.check,
        manifest: manifestPath,
        report: reportPath,
        manifestDigest,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(`inventory-tedt-prompts: ${(error as Error).message}`);
    process.exit(1);
  }
}
