import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import {
  artifactPayloadSchema,
  genericFileAssetSchema,
  promptSchema,
} from "../src/lib/library-asset-schema.ts";
import {
  assertUniqueLibraryAssetSlugs,
  genericFileToLibraryAsset,
  promptToLibraryAsset,
  skillToLibraryAsset,
  sortLibraryAssets,
  toLibraryAssetSummary,
  type LibraryAsset,
  type LibraryAssetSummary,
} from "../src/lib/library-assets.ts";
import { skillSchema } from "../src/lib/skill-schema.ts";

function markdownFiles(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(".md"))
    .sort();
}

function guides(root: string): Map<string, string> {
  const directory = join(root, "src", "content", "guides");
  return new Map(
    markdownFiles(directory).map((name) => [
      name.slice(0, -3),
      readFileSync(join(directory, name), "utf8"),
    ]),
  );
}

function artifactPayloads(root: string): Map<string, Array<{ path: string; body: string }>> {
  const directory = join(root, "src", "content", "artifact-payloads");
  return new Map(
    markdownFiles(directory).map((name) => {
      const id = name.slice(0, -3);
      const parsed = matter(readFileSync(join(directory, name), "utf8"));
      const data = artifactPayloadSchema.parse(parsed.data);
      if (data.slug !== id) {
        throw new Error(`artifact payload slug mismatch: entry ${id} declares ${data.slug}`);
      }
      return [
        id,
        data.files.map(({ path, body }) => ({ path, body })),
      ];
    }),
  );
}

/** Build the public JSON snapshot from the same generated Markdown Astro reads. */
export function buildLibraryAssetSnapshot(rootInput: string): LibraryAssetSummary[] {
  const root = resolve(rootInput);
  const guideBySlug = guides(root);
  const artifactPayloadsBySlug = artifactPayloads(root);
  const assets: LibraryAsset[] = [];

  const skillsDirectory = join(root, "src", "content", "skills");
  for (const name of markdownFiles(skillsDirectory)) {
    const slug = name.slice(0, -3);
    const parsed = matter(readFileSync(join(skillsDirectory, name), "utf8"));
    const data = skillSchema.parse(parsed.data);
    assets.push(
      skillToLibraryAsset(
        { id: slug, data, body: parsed.content },
        guideBySlug.get(slug) ?? null,
      ),
    );
  }

  const promptsDirectory = join(root, "src", "content", "prompts");
  for (const name of markdownFiles(promptsDirectory)) {
    const slug = name.slice(0, -3);
    const parsed = matter(readFileSync(join(promptsDirectory, name), "utf8"));
    const data = promptSchema.parse(parsed.data);
    assets.push(
      promptToLibraryAsset(
        { id: slug, data, body: parsed.content },
        guideBySlug.get(slug) ?? null,
      ),
    );
  }

  const artifactsDirectory = join(root, "src", "content", "artifacts");
  for (const name of markdownFiles(artifactsDirectory)) {
    const slug = name.slice(0, -3);
    const parsed = matter(readFileSync(join(artifactsDirectory, name), "utf8"));
    const data = genericFileAssetSchema.parse(parsed.data);
    assets.push(
      genericFileToLibraryAsset(
        { id: slug, data, body: parsed.content },
        guideBySlug.get(slug) ?? null,
        artifactPayloadsBySlug.get(slug) ?? null,
      ),
    );
  }

  assertUniqueLibraryAssetSlugs(assets);
  return sortLibraryAssets(assets)
    .filter((asset) => asset.publicationStatus === "published")
    .map(toLibraryAssetSummary);
}

export function serializeLibraryAssetSnapshot(assets: readonly LibraryAssetSummary[]): string {
  return `${JSON.stringify(assets, null, 2)}\n`;
}

export function writeLibraryAssetsJson(options: {
  root: string;
  checkOnly?: boolean;
}): { path: string; assets: number; changed: boolean } {
  const root = resolve(options.root);
  const path = join(root, "public", "assets.json");
  const content = serializeLibraryAssetSnapshot(buildLibraryAssetSnapshot(root));
  const current = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (options.checkOnly) {
    if (current !== content) throw new Error(`generated library catalog differs: ${path}`);
    return { path, assets: JSON.parse(content).length, changed: false };
  }
  if (current === content) {
    return { path, assets: JSON.parse(content).length, changed: false };
  }
  mkdirSync(join(root, "public"), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(temporary, content, "utf8");
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
  return { path, assets: JSON.parse(content).length, changed: true };
}

function main(): void {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const unknown = args.filter((arg) => arg !== "--check");
  if (unknown.length) throw new Error(`unknown argument: ${unknown[0]}`);
  const result = writeLibraryAssetsJson({
    root: join(import.meta.dirname, ".."),
    checkOnly,
  });
  console.log(`${result.assets} library assets (${result.changed ? "updated" : "current"})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error(`library-assets-json: ${(error as Error).message}`);
    process.exit(1);
  }
}
