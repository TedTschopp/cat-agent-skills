import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { genericFileAssetSchema } from "../src/lib/library-asset-schema.ts";
import type { ValidationResult } from "./validate-skill.ts";

export function validateLibraryArtifactData(data: unknown, label: string): ValidationResult {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return { label, ok: false, problems: ["no metadata found for generic file asset"] };
  }
  const result = genericFileAssetSchema.safeParse(data);
  if (result.success) return { label, ok: true, problems: [] };
  return {
    label,
    ok: false,
    problems: result.error.issues.map((issue) => {
      const field = issue.path.length ? issue.path.join(".") : "(root)";
      return `${field}: ${issue.message}`;
    }),
  };
}

export function validateLibraryArtifactSource(
  source: string,
  label: string,
): ValidationResult {
  try {
    return validateLibraryArtifactData(matter(source).data, label);
  } catch (error) {
    return {
      label,
      ok: false,
      problems: [`could not parse frontmatter: ${(error as Error).message}`],
    };
  }
}

function main(): void {
  let files = process.argv.slice(2);
  if (files.length === 0) {
    const directory = join(import.meta.dirname, "..", "src", "content", "artifacts");
    files = existsSync(directory)
      ? readdirSync(directory)
          .filter((name) => name.endsWith(".md"))
          .sort()
          .map((name) => join(directory, name))
      : [];
  }
  if (files.length === 0) {
    console.log("No generated generic file assets to validate.");
    return;
  }
  let failures = 0;
  for (const file of files) {
    const result = validateLibraryArtifactSource(readFileSync(file, "utf8"), file);
    if (result.ok) console.log(`✓ ${basename(file)} — generic file metadata OK`);
    else {
      failures += 1;
      console.error(`✗ ${file} — invalid generic file metadata:`);
      for (const problem of result.problems) console.error(`    • ${problem}`);
    }
  }
  if (failures > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
