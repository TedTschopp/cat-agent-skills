import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import matter from "gray-matter";
import { promptSchema } from "../src/lib/library-asset-schema.ts";
import type { ValidationResult } from "./validate-skill.ts";

export function validatePromptData(data: unknown, label: string): ValidationResult {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return {
      label,
      ok: false,
      problems: ["no metadata found for prompt-template asset"],
    };
  }
  const result = promptSchema.safeParse(data);
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

export function validatePromptSource(source: string, label: string): ValidationResult {
  let data: Record<string, unknown>;
  try {
    data = matter(source).data;
  } catch (error) {
    return {
      label,
      ok: false,
      problems: [`could not parse frontmatter: ${(error as Error).message}`],
    };
  }
  return validatePromptData(data, label);
}

function main(): void {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error("usage: tsx scripts/validate-prompt.ts <file.md> [more.md ...]");
    process.exit(2);
  }
  let failures = 0;
  for (const file of files) {
    const result = validatePromptSource(readFileSync(file, "utf8"), file);
    if (result.ok) console.log(`\u2713 ${basename(file)} \u2014 prompt metadata OK`);
    else {
      failures += 1;
      console.error(`\u2717 ${file} \u2014 invalid prompt metadata:`);
      for (const problem of result.problems) console.error(`    \u2022 ${problem}`);
    }
  }
  if (failures > 0) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
