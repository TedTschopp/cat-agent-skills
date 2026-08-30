/**
 * Deterministic support for the Codex-generated skill artwork pass.
 *
 * The image model remains a Codex tool call. This script owns the mechanical
 * parts: enrollment, safe 16:10 normalization, gallery-sidecar updates, and
 * validation. It never edits SKILL.md or a downloadable bundle.
 *
 * Usage:
 *   tsx scripts/skill-artwork.ts pending [--limit 15]
 *   tsx scripts/skill-artwork.ts prepare --slug <slug> --source <image> \
 *     --prompt-file <file> --alt <text>
 *   tsx scripts/skill-artwork.ts validate
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { JSON_SCHEMA, dump as dumpYaml, load as loadYaml } from "js-yaml";
import sharp from "sharp";

export const ARTWORK = Object.freeze({
  aspectRatio: "16:10",
  width: 1600,
  height: 1000,
  directory: "skill-art",
  format: "webp",
  maxBytes: 2 * 1024 * 1024,
});

export const ARTWORK_FIELDS = [
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

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const METADATA_NAMES = ["metadata.json", "metadata.yaml", "metadata.yml"];
const DEFAULT_GENERATOR = "OpenAI image generation via Codex";
const ARTWORK_TIME_ZONE = "America/Los_Angeles";

type Metadata = Record<string, unknown>;
type Enrollment = {
  schemaVersion: number;
  baselineCommit: string;
  initialSlugs: string[];
};
type Dimensions = { width: number; height: number };
type Candidate = {
  slug: string;
  name: string;
  metadataPath: string;
  status: "pending" | "complete" | "blocked" | "stale";
  reason?: string;
  sourceHash: string;
};

function assertRepoRoot(root: string): void {
  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) throw new Error(`package.json not found under ${root}`);
  const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string };
  if (pkg.name !== "cat-agent-skills") {
    throw new Error(`refusing to run outside cat-agent-skills (found ${pkg.name ?? "unknown"})`);
  }
}

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

type HashRecord = { kind: string; data: string | Buffer };

/** Hash typed, length-prefixed records so boundaries cannot be reinterpreted. */
export function framedSourceDigest(records: HashRecord[]): string {
  const hash = createHash("sha256");
  for (const record of records) {
    const kind = Buffer.from(record.kind, "utf8");
    const data = Buffer.isBuffer(record.data)
      ? record.data
      : Buffer.from(record.data, "utf8");
    const lengths = Buffer.allocUnsafe(8);
    lengths.writeUInt32BE(kind.length, 0);
    lengths.writeUInt32BE(data.length, 4);
    hash.update(lengths);
    hash.update(kind);
    hash.update(data);
  }
  return `sha256:${hash.digest("hex")}`;
}

/** Record the gallery's calendar day, independent of the runner's system zone. */
export function artworkDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ARTWORK_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function enrollmentPath(root: string): string {
  return join(
    root,
    ".agents",
    "skills",
    "generate-skill-artwork",
    "references",
    "enrollment.json",
  );
}

function readEnrollment(root: string): Enrollment {
  const value = JSON.parse(readFileSync(enrollmentPath(root), "utf8")) as Enrollment;
  if (
    value.schemaVersion !== 1 ||
    !/^[a-f0-9]{40}$/.test(value.baselineCommit) ||
    !Array.isArray(value.initialSlugs) ||
    value.initialSlugs.some((slug) => !SAFE_SLUG.test(slug))
  ) {
    throw new Error("invalid artwork enrollment configuration");
  }
  return value;
}

function findMetadata(root: string, slug: string): string {
  const submission = join(root, "submissions", slug);
  const matches = METADATA_NAMES.filter((name) => existsSync(join(submission, name)));
  if (matches.length !== 1) {
    throw new Error(
      `submissions/${slug} must have exactly one metadata sidecar; found ${matches.length}`,
    );
  }
  return join(submission, matches[0]);
}

export function parseMetadataText(path: string, text: string): Metadata {
  const value = path.endsWith(".json")
    ? JSON.parse(text)
    : loadYaml(text, { schema: JSON_SCHEMA });
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${basename(path)} must contain a metadata object`);
  }
  return value as Metadata;
}

export function serializeMetadataText(path: string, metadata: Metadata): string {
  if (path.endsWith(".json")) return `${JSON.stringify(metadata, null, 2)}\n`;
  return dumpYaml(metadata, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
}

function readMetadata(path: string): Metadata {
  return parseMetadataText(path, readFileSync(path, "utf8"));
}

function walkFiles(directory: string): string[] {
  const files: string[] = [];
  const visit = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`symlink not allowed in artwork source: ${path}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  visit(directory);
  return files.sort((a, b) => a.localeCompare(b));
}

/** Hash the current descriptive submission state, excluding generated artwork metadata. */
export function skillSourceHash(root: string, slug: string, metadata?: Metadata): string {
  if (!SAFE_SLUG.test(slug)) throw new Error(`invalid skill slug: ${slug}`);
  const submission = join(root, "submissions", slug);
  if (!existsSync(submission) || !lstatSync(submission).isDirectory()) {
    throw new Error(`submission directory not found: ${slug}`);
  }
  const meta = { ...(metadata ?? readMetadata(findMetadata(root, slug))) };
  for (const field of ARTWORK_FIELDS) delete meta[field];

  const records: HashRecord[] = [
    { kind: "domain", data: "cat-agent-skills:skill-source:v1" },
    { kind: "metadata", data: stableJson(meta) },
  ];
  for (const file of walkFiles(submission)) {
    if (METADATA_NAMES.includes(basename(file))) continue;
    records.push({
      kind: "path",
      data: relative(submission, file).split(sep).join("/"),
    });
    records.push({ kind: "content", data: readFileSync(file) });
  }
  return framedSourceDigest(records);
}

function littleEndian24(data: Buffer, offset: number): number {
  return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16);
}

/** Read dimensions from VP8, VP8L, or VP8X WebP containers without native dependencies. */
export function webpDimensions(data: Buffer): Dimensions {
  if (
    data.length < 30 ||
    data.toString("ascii", 0, 4) !== "RIFF" ||
    data.toString("ascii", 8, 12) !== "WEBP"
  ) {
    throw new Error("not a WebP RIFF container");
  }

  let offset = 12;
  while (offset + 8 <= data.length) {
    const type = data.toString("ascii", offset, offset + 4);
    const size = data.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > data.length) throw new Error("truncated WebP chunk");

    if (type === "VP8X" && size >= 10) {
      return {
        width: littleEndian24(data, start + 4) + 1,
        height: littleEndian24(data, start + 7) + 1,
      };
    }
    if (type === "VP8L" && size >= 5 && data[start] === 0x2f) {
      const b1 = data[start + 1];
      const b2 = data[start + 2];
      const b3 = data[start + 3];
      const b4 = data[start + 4];
      return {
        width: 1 + (b1 | ((b2 & 0x3f) << 8)),
        height: 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)),
      };
    }
    if (
      type === "VP8 " &&
      size >= 10 &&
      data[start + 3] === 0x9d &&
      data[start + 4] === 0x01 &&
      data[start + 5] === 0x2a
    ) {
      return {
        width: data.readUInt16LE(start + 6) & 0x3fff,
        height: data.readUInt16LE(start + 8) & 0x3fff,
      };
    }
    offset = start + size + (size % 2);
  }
  throw new Error("WebP dimensions not found");
}

function presentArtworkFields(metadata: Metadata): string[] {
  return ARTWORK_FIELDS.filter((field) => metadata[field] !== undefined);
}

/** Validate one complete gallery-art record and its external image. */
export function validateArtwork(
  root: string,
  slug: string,
  metadata: Metadata,
): string[] {
  const problems: string[] = [];
  const present = presentArtworkFields(metadata);
  if (present.length === 0) return problems;
  for (const field of ARTWORK_FIELDS) {
    if (metadata[field] === undefined) problems.push(`${field} is missing`);
  }
  if (present.length !== ARTWORK_FIELDS.length) return problems;

  const expectedPath = `${ARTWORK.directory}/${slug}.${ARTWORK.format}`;
  if (metadata.coverImage !== expectedPath) {
    problems.push(`coverImage must be ${expectedPath}`);
  }
  if (metadata.coverImageAspectRatio !== ARTWORK.aspectRatio) {
    problems.push(`coverImageAspectRatio must be ${ARTWORK.aspectRatio}`);
  }
  if (metadata.coverImageWidth !== ARTWORK.width) {
    problems.push(`coverImageWidth must be ${ARTWORK.width}`);
  }
  if (metadata.coverImageHeight !== ARTWORK.height) {
    problems.push(`coverImageHeight must be ${ARTWORK.height}`);
  }
  if (typeof metadata.coverImagePrompt !== "string" || metadata.coverImagePrompt.length < 120) {
    problems.push("coverImagePrompt must be at least 120 characters");
  } else {
    if (!metadata.coverImagePrompt.includes(ARTWORK.aspectRatio)) {
      problems.push(`coverImagePrompt must name the ${ARTWORK.aspectRatio} aspect ratio`);
    }
    if (!/no paw|without paw/i.test(metadata.coverImagePrompt)) {
      problems.push("coverImagePrompt must explicitly exclude paw imagery");
    }
  }
  if (typeof metadata.coverImageAlt !== "string" || metadata.coverImageAlt.trim().length < 12) {
    problems.push("coverImageAlt must be meaningful alt text");
  }
  if (metadata.coverImageSourceHash !== skillSourceHash(root, slug, metadata)) {
    problems.push("coverImageSourceHash does not match the current submission source");
  }

  const publicPath = join(root, "public", expectedPath);
  if (!existsSync(publicPath)) {
    problems.push(`${expectedPath} does not exist under public/`);
  } else {
    const size = statSync(publicPath).size;
    if (size > ARTWORK.maxBytes) {
      problems.push(`${expectedPath} exceeds ${ARTWORK.maxBytes} bytes`);
    }
    try {
      const dimensions = webpDimensions(readFileSync(publicPath));
      if (dimensions.width !== ARTWORK.width || dimensions.height !== ARTWORK.height) {
        problems.push(
          `${expectedPath} is ${dimensions.width}x${dimensions.height}; expected ` +
            `${ARTWORK.width}x${ARTWORK.height}`,
        );
      }
    } catch (error) {
      problems.push(`${expectedPath}: ${(error as Error).message}`);
    }
  }
  return problems;
}

/** Extract newly added skill slugs from committed submission or catalog paths. */
export function slugsFromAddedSkillPaths(paths: string[]): string[] {
  const slugs = new Set<string>();
  for (const path of paths) {
    let match = /^submissions\/([^/]+)\/(?:metadata\.json|metadata\.ya?ml)$/.exec(path);
    if (!match) match = /^src\/content\/skills\/([^/]+)\.md$/.exec(path);
    const slug = match?.[1];
    if (slug && SAFE_SLUG.test(slug)) slugs.add(slug);
  }
  return [...slugs].sort();
}

function addedSkillSlugs(root: string, baseline: string): string[] {
  execFileSync("git", ["merge-base", "--is-ancestor", baseline, "HEAD"], { cwd: root });
  const output = execFileSync(
    "git",
    [
      "diff",
      "--name-only",
      "--diff-filter=A",
      `${baseline}..HEAD`,
      "--",
      "submissions",
      "src/content/skills",
    ],
    { cwd: root, encoding: "utf8" },
  );
  return slugsFromAddedSkillPaths(output.split("\n").filter(Boolean));
}

/** Discover enrolled current/future skills and classify their artwork state. */
export function discoverCandidates(root: string): Candidate[] {
  const enrollment = readEnrollment(root);
  const slugs = new Set([
    ...enrollment.initialSlugs,
    ...addedSkillSlugs(root, enrollment.baselineCommit),
  ]);
  const candidates: Candidate[] = [];
  for (const slug of [...slugs].sort()) {
    try {
      const metadataPath = findMetadata(root, slug);
      const metadata = readMetadata(metadataPath);
      const sourceHash = skillSourceHash(root, slug, metadata);
      const present = presentArtworkFields(metadata);
      if (present.length === 0) {
        candidates.push({
          slug,
          name: String(metadata.name ?? slug),
          metadataPath: relative(root, metadataPath),
          status: "pending",
          sourceHash,
        });
        continue;
      }
      const problems = validateArtwork(root, slug, metadata);
      if (problems.length === 0) {
        candidates.push({
          slug,
          name: String(metadata.name ?? slug),
          metadataPath: relative(root, metadataPath),
          status: "complete",
          sourceHash,
        });
      } else if (problems.length === 1 && problems[0].includes("SourceHash")) {
        candidates.push({
          slug,
          name: String(metadata.name ?? slug),
          metadataPath: relative(root, metadataPath),
          status: "stale",
          reason: problems[0],
          sourceHash,
        });
      } else {
        candidates.push({
          slug,
          name: String(metadata.name ?? slug),
          metadataPath: relative(root, metadataPath),
          status: "blocked",
          reason: problems.join("; "),
          sourceHash,
        });
      }
    } catch (error) {
      candidates.push({
        slug,
        name: slug,
        metadataPath: `submissions/${slug}`,
        status: "blocked",
        reason: (error as Error).message,
        sourceHash: "",
      });
    }
  }
  return candidates;
}

function parseArgs(args: string[]): Map<string, string> {
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(`invalid option near ${key ?? "end of arguments"}`);
    }
    options.set(key.slice(2), value);
  }
  return options;
}

function requiredOption(options: Map<string, string>, name: string): string {
  const value = options.get(name);
  if (!value) throw new Error(`--${name} is required`);
  return value;
}

async function prepare(root: string, args: string[]): Promise<void> {
  const options = parseArgs(args);
  const slug = requiredOption(options, "slug");
  const source = resolve(requiredOption(options, "source"));
  const promptFile = resolve(requiredOption(options, "prompt-file"));
  const alt = requiredOption(options, "alt").trim();
  const generator = options.get("generator")?.trim() || DEFAULT_GENERATOR;
  if (!SAFE_SLUG.test(slug)) throw new Error(`invalid skill slug: ${slug}`);
  if (!existsSync(source) || !statSync(source).isFile()) {
    throw new Error(`source image not found: ${source}`);
  }
  if (!existsSync(promptFile) || !statSync(promptFile).isFile()) {
    throw new Error(`prompt file not found: ${promptFile}`);
  }
  const prompt = readFileSync(promptFile, "utf8").trim();
  if (prompt.length < 120 || !prompt.includes(ARTWORK.aspectRatio)) {
    throw new Error(`prompt must be at least 120 characters and name ${ARTWORK.aspectRatio}`);
  }
  if (!/no paw|without paw/i.test(prompt)) {
    throw new Error("prompt must explicitly exclude paw imagery");
  }
  if (alt.length < 12 || alt.length > 240) {
    throw new Error("alt text must be 12-240 characters");
  }

  const enrolled = discoverCandidates(root).find((candidate) => candidate.slug === slug);
  if (!enrolled) throw new Error(`${slug} is not enrolled for generated artwork`);
  if (enrolled.status !== "pending") {
    throw new Error(`${slug} is ${enrolled.status}; refusing to overwrite or repair artwork`);
  }

  const metadataPath = findMetadata(root, slug);
  const metadata = readMetadata(metadataPath);
  const imageRelative = `${ARTWORK.directory}/${slug}.${ARTWORK.format}`;
  const imagePath = join(root, "public", imageRelative);
  if (existsSync(imagePath)) throw new Error(`refusing to overwrite ${imageRelative}`);
  mkdirSync(join(root, "public", ARTWORK.directory), { recursive: true });

  const imageTemp = join(root, "public", ARTWORK.directory, `.${slug}-${process.pid}.webp`);
  const metadataTemp = `${metadataPath}.${process.pid}.tmp`;
  try {
    await sharp(source)
      .rotate()
      .resize(ARTWORK.width, ARTWORK.height, { fit: "cover", position: "centre" })
      .webp({ quality: 82, effort: 6 })
      .toFile(imageTemp);
    const dimensions = webpDimensions(readFileSync(imageTemp));
    if (dimensions.width !== ARTWORK.width || dimensions.height !== ARTWORK.height) {
      throw new Error(`normalized image is ${dimensions.width}x${dimensions.height}`);
    }
    if (statSync(imageTemp).size > ARTWORK.maxBytes) {
      throw new Error(`normalized image exceeds ${ARTWORK.maxBytes} bytes`);
    }

    const updated: Metadata = {
      ...metadata,
      coverImage: imageRelative,
      coverImageAlt: alt,
      coverImagePrompt: prompt,
      coverImageAspectRatio: ARTWORK.aspectRatio,
      coverImageWidth: ARTWORK.width,
      coverImageHeight: ARTWORK.height,
      coverImageGenerator: generator,
      coverImageGeneratedAt: artworkDate(new Date()),
      coverImageSourceHash: skillSourceHash(root, slug, metadata),
    };
    writeFileSync(metadataTemp, serializeMetadataText(metadataPath, updated), "utf8");
    renameSync(imageTemp, imagePath);
    renameSync(metadataTemp, metadataPath);
  } catch (error) {
    rmSync(imageTemp, { force: true });
    rmSync(metadataTemp, { force: true });
    if (existsSync(imagePath) && presentArtworkFields(readMetadata(metadataPath)).length === 0) {
      rmSync(imagePath, { force: true });
    }
    throw error;
  }

  console.log(
    JSON.stringify({ slug, image: imageRelative, width: ARTWORK.width, height: ARTWORK.height }),
  );
}

function pending(root: string, args: string[]): void {
  const options = parseArgs(args);
  const rawLimit = options.get("limit") ?? "15";
  const limit = Number.parseInt(rawLimit, 10);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("--limit must be an integer from 1 to 50");
  }
  const all = discoverCandidates(root);
  const pendingCandidates = all.filter((candidate) => candidate.status === "pending");
  console.log(
    JSON.stringify(
      {
        contract: ARTWORK,
        totals: {
          enrolled: all.length,
          pending: pendingCandidates.length,
          complete: all.filter((candidate) => candidate.status === "complete").length,
          blocked: all.filter((candidate) => candidate.status === "blocked").length,
          stale: all.filter((candidate) => candidate.status === "stale").length,
        },
        batch: pendingCandidates.slice(0, limit),
        blocked: all.filter((candidate) => candidate.status === "blocked"),
        stale: all.filter((candidate) => candidate.status === "stale"),
      },
      null,
      2,
    ),
  );
}

function validateAll(root: string): void {
  const failures: string[] = [];
  const submissions = join(root, "submissions");
  let artworkCount = 0;
  for (const entry of readdirSync(submissions, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_") || !SAFE_SLUG.test(entry.name)) continue;
    const metadataPath = findMetadata(root, entry.name);
    const metadata = readMetadata(metadataPath);
    if (presentArtworkFields(metadata).length === 0) continue;
    artworkCount += 1;
    for (const problem of validateArtwork(root, entry.name, metadata)) {
      failures.push(`${entry.name}: ${problem}`);
    }
  }
  if (failures.length > 0) {
    for (const failure of failures) console.error(`\u2717 ${failure}`);
    throw new Error(`${failures.length} generated-artwork validation problem(s)`);
  }
  console.log(`\u2713 ${artworkCount} generated skill artwork record(s) validated`);
}

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  assertRepoRoot(root);
  const [command, ...args] = process.argv.slice(2);
  if (command === "pending") pending(root, args);
  else if (command === "prepare") await prepare(root, args);
  else if (command === "validate") validateAll(root);
  else throw new Error("usage: skill-artwork.ts <pending|prepare|validate> [options]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    console.error(`skill-artwork: ${(error as Error).message}`);
    process.exit(1);
  }
}
