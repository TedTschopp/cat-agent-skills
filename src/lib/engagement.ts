/**
 * Read-side helpers for the daily GitHub engagement snapshot.
 *
 * Microsoft and AI.Tedt.org remain separate sources of record. The gallery may
 * add their reaction and comment counts for discovery, but it never represents
 * those totals as unique people and never copies discussion authorship.
 */
import engagementJson from "../data/engagement.json";
import legacyRatingsJson from "../data/ratings.json";

export type EngagementSourceKey = "microsoft" | "local";

export type DiscussionLink = {
  number: number;
  url: string;
};

export type SourceSkillEngagement = {
  rating: number;
  comments: number;
  discussions: DiscussionLink[];
};

export type SkillEngagement = {
  microsoft: SourceSkillEngagement;
  local: SourceSkillEngagement;
  total: {
    rating: number;
    comments: number;
  };
};

export type RepositoryEngagement = {
  repository: string;
  stars: number;
  url: string;
  discussionsUrl: string;
};

type EngagementSnapshot = {
  schemaVersion: 1;
  repositories: Record<
    EngagementSourceKey,
    { repository: string; stars: number }
  >;
  skills: Record<string, SkillEngagement>;
};

const DEFAULT_REPOSITORIES: Record<EngagementSourceKey, string> = {
  microsoft: "microsoft/cat-agent-skills",
  local: "TedTschopp/cat-agent-skills",
};

const snapshot = engagementJson as unknown as Partial<EngagementSnapshot>;
const legacyRatings = legacyRatingsJson as Record<string, unknown>;
const supportedSnapshot = snapshot.schemaVersion === 1;

function count(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function repositoryName(source: EngagementSourceKey): string {
  const candidate = supportedSnapshot
    ? snapshot.repositories?.[source]?.repository
    : undefined;
  return typeof candidate === "string" &&
    /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(candidate)
    ? candidate
    : DEFAULT_REPOSITORIES[source];
}

function normalizeDiscussions(
  value: unknown,
  repository: string,
): DiscussionLink[] {
  if (!Array.isArray(value)) return [];
  const prefix = `https://github.com/${repository}/discussions/`;
  const seen = new Set<number>();
  const discussions: DiscussionLink[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const number = count((entry as { number?: unknown }).number);
    const url = (entry as { url?: unknown }).url;
    if (
      !number ||
      typeof url !== "string" ||
      url !== `${prefix}${number}` ||
      seen.has(number)
    ) {
      continue;
    }
    seen.add(number);
    discussions.push({ number, url });
  }

  return discussions.sort((a, b) => b.number - a.number);
}

function emptySource(): SourceSkillEngagement {
  return { rating: 0, comments: 0, discussions: [] };
}

function normalizeSource(
  value: unknown,
  repository: string,
): SourceSkillEngagement {
  if (!value || typeof value !== "object") return emptySource();
  const source = value as Partial<SourceSkillEngagement>;
  return {
    rating: count(source.rating),
    comments: count(source.comments),
    discussions: normalizeDiscussions(source.discussions, repository),
  };
}

/** Source-separated engagement for one skill, with a legacy-safe fallback. */
export function getSkillEngagement(slug: string): SkillEngagement {
  const entry = supportedSnapshot ? snapshot.skills?.[slug] : undefined;
  if (!entry || typeof entry !== "object") {
    const legacyRating = count(legacyRatings[slug]);
    return {
      microsoft: { ...emptySource(), rating: legacyRating },
      local: emptySource(),
      total: { rating: legacyRating, comments: 0 },
    };
  }

  const microsoft = normalizeSource(
    entry.microsoft,
    repositoryName("microsoft"),
  );
  const local = normalizeSource(entry.local, repositoryName("local"));

  // Derive totals from the source records instead of trusting redundant input.
  // This keeps the displayed breakdown and combined count consistent.
  return {
    microsoft,
    local,
    total: {
      rating: microsoft.rating + local.rating,
      comments: microsoft.comments + local.comments,
    },
  };
}

/** Repository-wide stars and canonical links for one engagement source. */
export function getRepositoryEngagement(
  source: EngagementSourceKey,
): RepositoryEngagement {
  const repository = repositoryName(source);
  const stars = count(
    supportedSnapshot ? snapshot.repositories?.[source]?.stars : undefined,
  );
  const url = `https://github.com/${repository}`;
  return { repository, stars, url, discussionsUrl: `${url}/discussions` };
}
