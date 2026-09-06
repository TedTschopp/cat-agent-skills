/**
 * Prompt Library provenance marker:
 * imported from Ted's tedt.org prompt source, not authored directly in this repo
 * and not copied from Microsoft upstream.
 */
const PROMPT_LIBRARY_REPOSITORY = "https://github.com/tedtschopp/tedt.org";
const PROMPT_LIBRARY_PATH_PREFIX = "_posts/prompts/";

type PromptLibraryProvenance = {
  sourceRepository?: string | null;
  sourcePath?: string | null;
  sourceUrl?: string | null;
  sourceFiles?: Array<{ path?: string | null }> | null;
};

/**
 * Personal taxonomy aliases for Ted's Prompt Library only.
 * Values map to the existing public controlled topic labels.
 */
const PERSONAL_TOPIC_OVERRIDES = [
  {
    canonicalTopic: "Industries and Domains",
    aliases: ["prompts - philosophy", "philosophy"],
  },
] as const;

const normalize = (value: string): string =>
  value.trim().toLocaleLowerCase("en-US");

const promptLibraryTopicByAlias = new Map<string, string>(
  PERSONAL_TOPIC_OVERRIDES.flatMap((entry) =>
    entry.aliases.map((alias) => [normalize(alias), entry.canonicalTopic] as const),
  ),
);

function hasPromptLibraryPath(path: string | null | undefined): boolean {
  return typeof path === "string" && normalize(path).startsWith(PROMPT_LIBRARY_PATH_PREFIX);
}

/**
 * True only for verified imports from the Tedt.org Prompt Library source.
 * Unknown/missing provenance is intentionally NOT treated as personal.
 */
export function isPromptLibraryImport(
  provenance: PromptLibraryProvenance | null | undefined,
): boolean {
  if (!provenance) return false;
  if (normalize(provenance.sourceRepository ?? "") !== PROMPT_LIBRARY_REPOSITORY) {
    return false;
  }
  if (hasPromptLibraryPath(provenance.sourcePath)) return true;
  if (
    Array.isArray(provenance.sourceFiles) &&
    provenance.sourceFiles.some((file) => hasPromptLibraryPath(file.path))
  ) {
    return true;
  }
  if (typeof provenance.sourceUrl === "string") {
    try {
      const parsed = new URL(provenance.sourceUrl);
      return parsed.hostname.toLocaleLowerCase("en-US") === "tedt.org" &&
        parsed.pathname.startsWith("/prompts/");
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Map personal Prompt Library terms to canonical controlled topic labels.
 * This is additive and never invents fallback topics.
 */
export function mapPromptLibraryTopicsToCanonical(terms: readonly string[]): string[] {
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const term of terms) {
    const mapped = promptLibraryTopicByAlias.get(normalize(term));
    if (!mapped || seen.has(mapped)) continue;
    seen.add(mapped);
    topics.push(mapped);
  }
  return topics;
}
