/**
 * Snapshot engagement from both the Microsoft catalog and this mirror.
 *
 * GitHub Discussions remain the source of truth. We never copy comments or
 * reactions between repositories because doing so would lose authorship,
 * timestamps, edits, and moderation state. This script stores only stable
 * aggregate counts and links for the static gallery.
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ENGAGEMENT_OUT = resolve(ROOT, "src/data/engagement.json");
const RATINGS_OUT = resolve(ROOT, "src/data/ratings.json");
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? "";
const CATEGORY = process.env.GISCUS_CATEGORY ?? "Announcements";
const API_URL = "https://api.github.com/graphql";
const GISCUS_API_URL = "https://giscus.app/api/discussions";
const GITHUB_REST_URL = "https://api.github.com";
const REQUEST_ATTEMPTS = 3;
const GISCUS_CONCURRENCY = 4;
const MAX_GISCUS_COMMENT_PAGES = 20;

const SOURCES = {
  microsoft: process.env.MICROSOFT_GISCUS_REPO ?? "microsoft/cat-agent-skills",
  local: process.env.LOCAL_GISCUS_REPO ?? "TedTschopp/cat-agent-skills",
} as const;

/** Skill slugs: 1-64 chars, lowercase alnum with single hyphens. */
const SLUG_RE = /^(?!-)(?!.*--)[a-z0-9-]{1,64}(?<!-)$/;

export type EngagementSourceKey = keyof typeof SOURCES;
export type ReactionGroup = { content: string; reactors?: { totalCount?: number } | null };
export type DiscussionLink = { number: number; url: string };
export type SkillSourceEngagement = {
  rating: number;
  comments: number;
  discussions: DiscussionLink[];
};
export type RepositoryEngagement = { repository: string; stars: number };
export type SourceFetch = RepositoryEngagement & {
  skills: Record<string, SkillSourceEngagement>;
};
export type EngagementSnapshot = {
  schemaVersion: 1;
  repositories: Record<EngagementSourceKey, RepositoryEngagement>;
  skills: Record<
    string,
    Record<EngagementSourceKey, SkillSourceEngagement> & {
      total: { rating: number; comments: number };
    }
  >;
};

export type RetainedDiscussion = DiscussionLink & { slug: string };
export type GiscusDiscussionRecord = RetainedDiscussion & {
  rating: number;
  comments: number;
};

type GiscusReaction = { count?: number };
type GiscusDiscussionPayload = {
  url?: string;
  repository?: { nameWithOwner?: string };
  totalCommentCount?: number;
  totalReplyCount?: number;
  reactions?: Record<string, GiscusReaction | undefined>;
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
};
type GiscusApiPayload = {
  discussion?: GiscusDiscussionPayload | null;
  error?: string;
};
type GiscusPage = {
  number: number;
  url: string;
  rating: number;
  topLevelComments: number;
  replyComments: number;
  hasNextPage: boolean;
  endCursor: string | null;
};

type CommentPage = {
  totalCount: number;
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Array<{ replies?: { totalCount?: number } | null }>;
};

type DiscussionNode = {
  id: string;
  title: string;
  number: number;
  url: string;
  category?: { name?: string } | null;
  reactionGroups?: ReactionGroup[] | null;
  comments: CommentPage;
};

type RepositoryPage = {
  repository: {
    stargazerCount: number;
    discussions: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
      nodes: DiscussionNode[];
    };
  } | null;
};

type CommentPageResponse = {
  node: ({ comments: CommentPage } & { __typename?: "Discussion" }) | null;
};

const POSITIVE_REACTIONS = new Set([
  "THUMBS_UP",
  "HEART",
  "HOORAY",
  "ROCKET",
  "LAUGH",
]);

const REPOSITORY_QUERY = `
  query ($owner: String!, $name: String!, $after: String) {
    repository(owner: $owner, name: $name) {
      stargazerCount
      discussions(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          title
          number
          url
          category { name }
          reactionGroups {
            content
            reactors { totalCount }
          }
          comments(first: 100) {
            totalCount
            pageInfo { hasNextPage endCursor }
            nodes { replies { totalCount } }
          }
        }
      }
    }
  }
`;

const COMMENTS_QUERY = `
  query ($id: ID!, $after: String) {
    node(id: $id) {
      ... on Discussion {
        comments(first: 100, after: $after) {
          totalCount
          pageInfo { hasNextPage endCursor }
          nodes { replies { totalCount } }
        }
      }
    }
  }
`;

function warn(message: string): void {
  console.warn(`[fetch-engagement] ${message}`);
}

function appendOutput(name: string, value: string | number | boolean): void {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${String(value)}\n`);
  }
}

function appendSummary(markdown: string): void {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
}

/** Sum the same positive reaction set used by the historical ratings snapshot. */
export function positiveScore(groups: ReactionGroup[] | null | undefined): number {
  let total = 0;
  for (const group of groups ?? []) {
    if (POSITIVE_REACTIONS.has(group.content)) {
      total += group.reactors?.totalCount ?? 0;
    }
  }
  return total;
}

function nonnegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a nonnegative safe integer`);
  }
  return value as number;
}

function positiveInteger(value: unknown, label: string): number {
  const parsed = nonnegativeInteger(value, label);
  if (parsed === 0) throw new Error(`${label} must be greater than zero`);
  return parsed;
}

function parseRepository(repository: string): { owner: string; name: string } {
  const match = /^([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100})$/.exec(
    repository,
  );
  if (!match) throw new Error(`invalid repository name: ${repository}`);
  return { owner: match[1], name: match[2] };
}

function canonicalDiscussionUrl(repository: string, number: number): string {
  return `https://github.com/${repository}/discussions/${number}`;
}

function discussionNumberFromUrl(repository: string, value: unknown): number {
  if (typeof value !== "string") throw new Error("giscus discussion URL is missing");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`invalid giscus discussion URL: ${String(value)}`);
  }
  if (
    url.protocol !== "https:" ||
    url.hostname.toLowerCase() !== "github.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(`untrusted giscus discussion URL: ${value}`);
  }
  const { owner, name } = parseRepository(repository);
  const pathMatch = /^\/([^/]+)\/([^/]+)\/discussions\/([1-9][0-9]*)$/.exec(url.pathname);
  if (
    !pathMatch ||
    pathMatch[1].toLowerCase() !== owner.toLowerCase() ||
    pathMatch[2].toLowerCase() !== name.toLowerCase()
  ) {
    throw new Error(`giscus discussion URL is outside ${repository}: ${value}`);
  }
  return positiveInteger(Number(pathMatch[3]), "giscus discussion number");
}

/** Sum the positive reactions returned by the public giscus API. */
export function positiveGiscusScore(
  reactions: Record<string, GiscusReaction | undefined> | null | undefined,
): number {
  if (reactions == null) return 0;
  if (typeof reactions !== "object" || Array.isArray(reactions)) {
    throw new Error("giscus reactions must be an object");
  }
  let total = 0;
  for (const [content, reaction] of Object.entries(reactions)) {
    if (!POSITIVE_REACTIONS.has(content)) continue;
    total += nonnegativeInteger(reaction?.count ?? 0, `giscus ${content} reaction count`);
  }
  return total;
}

/** Validate and normalize one paginated public giscus API response. */
export function parseGiscusDiscussionPage(
  payload: GiscusApiPayload,
  options: { repository: string; expectedNumber?: number },
): GiscusPage {
  const discussion = payload?.discussion;
  if (!discussion || typeof discussion !== "object") {
    throw new Error(payload?.error || "giscus returned no discussion");
  }
  const returnedRepository = discussion.repository?.nameWithOwner;
  if (
    typeof returnedRepository !== "string" ||
    returnedRepository.toLowerCase() !== options.repository.toLowerCase()
  ) {
    throw new Error(
      `giscus returned an unexpected repository: ${returnedRepository ?? "missing"}`,
    );
  }
  const number = discussionNumberFromUrl(options.repository, discussion.url);
  if (options.expectedNumber !== undefined) {
    const expected = positiveInteger(options.expectedNumber, "expected discussion number");
    if (number !== expected) {
      throw new Error(`giscus returned discussion ${number}; expected ${expected}`);
    }
  }
  const hasNextPage = discussion.pageInfo?.hasNextPage === true;
  const endCursor = discussion.pageInfo?.endCursor ?? null;
  if (hasNextPage && (typeof endCursor !== "string" || endCursor.length === 0)) {
    throw new Error(`giscus discussion ${number} has no next-page cursor`);
  }
  if (endCursor !== null && typeof endCursor !== "string") {
    throw new Error(`giscus discussion ${number} returned an invalid cursor`);
  }
  return {
    number,
    url: canonicalDiscussionUrl(options.repository, number),
    rating: positiveGiscusScore(discussion.reactions),
    topLevelComments: nonnegativeInteger(
      discussion.totalCommentCount,
      `giscus discussion ${number} top-level comment count`,
    ),
    replyComments: nonnegativeInteger(
      discussion.totalReplyCount ?? 0,
      `giscus discussion ${number} reply count`,
    ),
    hasNextPage,
    endCursor,
  };
}

function pageCommentCount(page: CommentPage): number {
  if (!Array.isArray(page.nodes)) return Math.max(0, page.totalCount ?? 0);
  return page.nodes.reduce(
    (total, comment) => total + 1 + Math.max(0, comment.replies?.totalCount ?? 0),
    0,
  );
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  if (!TOKEN) throw new Error("no GITHUB_TOKEN available for GitHub GraphQL");
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        signal: AbortSignal.timeout(20_000),
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "ai-tedt-org-engagement-sync",
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) {
        throw new Error(`GitHub GraphQL HTTP ${response.status}: ${await response.text()}`);
      }
      const payload = (await response.json()) as {
        data?: T;
        errors?: Array<{ message: string }>;
      };
      if (payload.errors?.length) {
        throw new Error(payload.errors.map((error) => error.message).join("; "));
      }
      if (!payload.data) throw new Error("GitHub GraphQL returned no data");
      return payload.data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < REQUEST_ATTEMPTS) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 1_000));
      }
    }
  }
  throw lastError ?? new Error("GitHub GraphQL request failed");
}

class PermanentRequestError extends Error {}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function fetchJsonWithRetries<T>(
  url: URL,
  options: { headers?: Record<string, string>; discussionNotFoundIsEmpty?: boolean } = {},
): Promise<T | undefined> {
  let lastError: Error | undefined;
  for (let attempt = 1; attempt <= REQUEST_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: options.headers,
        signal: AbortSignal.timeout(20_000),
      });
      const body = await response.text();
      if (!response.ok) {
        if (response.status === 404 && options.discussionNotFoundIsEmpty) {
          try {
            const payload = JSON.parse(body) as { error?: unknown };
            if (payload?.error === "Discussion not found") return undefined;
          } catch {
            // An unexpected 404 body is an endpoint failure, not an absent discussion.
          }
        }
        const detail = body.replace(/\s+/g, " ").trim().slice(0, 500);
        const error = new Error(
          `HTTP ${response.status} from ${url.origin}: ${detail || response.statusText}`,
        );
        const retryable =
          response.status === 408 ||
          response.status === 425 ||
          response.status === 429 ||
          response.status >= 500;
        if (!retryable) throw new PermanentRequestError(error.message);
        throw error;
      }
      try {
        return JSON.parse(body) as T;
      } catch {
        throw new Error(`invalid JSON from ${url.origin}`);
      }
    } catch (error) {
      if (error instanceof PermanentRequestError) throw error;
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < REQUEST_ATTEMPTS) {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, attempt * 500));
      }
    }
  }
  throw lastError ?? new Error(`request failed: ${url.origin}`);
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new Error("concurrency must be a positive integer");
  }
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function fetchGiscusDiscussion(options: {
  repository: string;
  slug: string;
  number?: number;
}): Promise<GiscusDiscussionRecord | undefined> {
  if (!SLUG_RE.test(options.slug)) throw new Error(`unsafe skill slug: ${options.slug}`);
  if (options.number !== undefined) {
    positiveInteger(options.number, "retained discussion number");
  }

  let firstPage: GiscusPage | undefined;
  let replyComments = 0;
  let after: string | null = null;
  const seenCursors = new Set<string>();
  for (let pageIndex = 0; pageIndex < MAX_GISCUS_COMMENT_PAGES; pageIndex += 1) {
    const url = new URL(GISCUS_API_URL);
    url.searchParams.set("repo", options.repository);
    url.searchParams.set("first", "100");
    if (options.number !== undefined) {
      url.searchParams.set("number", String(options.number));
    } else {
      url.searchParams.set("term", options.slug);
      url.searchParams.set("category", CATEGORY);
      url.searchParams.set("strict", "true");
    }
    if (after) url.searchParams.set("after", after);

    const payload = await fetchJsonWithRetries<GiscusApiPayload>(url, {
      discussionNotFoundIsEmpty: pageIndex === 0,
    });
    if (!payload) return undefined;
    const page = parseGiscusDiscussionPage(payload, {
      repository: options.repository,
      expectedNumber: options.number,
    });
    if (!firstPage) {
      firstPage = page;
    } else if (
      page.number !== firstPage.number ||
      page.url !== firstPage.url ||
      page.rating !== firstPage.rating ||
      page.topLevelComments !== firstPage.topLevelComments
    ) {
      throw new Error(`giscus discussion ${firstPage.number} changed while paginating`);
    }
    replyComments = nonnegativeInteger(
      replyComments + page.replyComments,
      `giscus discussion ${page.number} accumulated reply count`,
    );
    if (!page.hasNextPage) {
      return {
        slug: options.slug,
        number: page.number,
        url: page.url,
        rating: page.rating,
        comments: nonnegativeInteger(
          page.topLevelComments + replyComments,
          `giscus discussion ${page.number} total comment count`,
        ),
      };
    }
    if (pageIndex === MAX_GISCUS_COMMENT_PAGES - 1) {
      throw new Error(
        `giscus discussion ${page.number} exceeds ${MAX_GISCUS_COMMENT_PAGES} comment pages`,
      );
    }
    if (!page.endCursor || seenCursors.has(page.endCursor)) {
      throw new Error(`giscus discussion ${page.number} returned a repeated cursor`);
    }
    seenCursors.add(page.endCursor);
    after = page.endCursor;
  }
  throw new Error("unreachable giscus pagination state");
}

/** Validate and retain every known Microsoft discussion number from the last snapshot. */
export function retainedMicrosoftDiscussions(
  snapshot: EngagementSnapshot | undefined,
  repository = SOURCES.microsoft,
): RetainedDiscussion[] {
  if (!snapshot) return [];
  const snapshotRepository = snapshot.repositories?.microsoft?.repository;
  if (
    typeof snapshotRepository !== "string" ||
    snapshotRepository.toLowerCase() !== repository.toLowerCase()
  ) {
    throw new Error(
      `retained Microsoft repository does not match ${repository}: ${snapshotRepository ?? "missing"}`,
    );
  }
  const retained = new Map<number, RetainedDiscussion>();
  for (const [slug, engagement] of Object.entries(snapshot.skills ?? {})) {
    const discussions = engagement?.microsoft?.discussions ?? [];
    if (discussions.length > 0 && !SLUG_RE.test(slug)) {
      throw new Error(`unsafe retained Microsoft skill slug: ${slug}`);
    }
    for (const discussion of discussions) {
      const number = positiveInteger(discussion.number, "retained discussion number");
      const urlNumber = discussionNumberFromUrl(repository, discussion.url);
      if (urlNumber !== number) {
        throw new Error(
          `retained discussion URL number ${urlNumber} does not match ${number}`,
        );
      }
      const existing = retained.get(number);
      if (existing && existing.slug !== slug) {
        throw new Error(
          `retained discussion ${number} is assigned to both ${existing.slug} and ${slug}`,
        );
      }
      retained.set(number, {
        slug,
        number,
        url: canonicalDiscussionUrl(repository, number),
      });
    }
  }
  return [...retained.values()].sort((a, b) => a.number - b.number);
}

/** Deduplicate term and retained-number lookups without collapsing legacy discussions. */
export function dedupeGiscusRecords(
  records: readonly GiscusDiscussionRecord[],
  repository = SOURCES.microsoft,
): GiscusDiscussionRecord[] {
  const deduplicated = new Map<number, GiscusDiscussionRecord>();
  for (const record of records) {
    if (!SLUG_RE.test(record.slug)) throw new Error(`unsafe giscus skill slug: ${record.slug}`);
    const number = positiveInteger(record.number, "giscus discussion number");
    const urlNumber = discussionNumberFromUrl(repository, record.url);
    if (urlNumber !== number) {
      throw new Error(`giscus discussion URL number ${urlNumber} does not match ${number}`);
    }
    const existing = deduplicated.get(number);
    if (existing && existing.slug !== record.slug) {
      throw new Error(
        `giscus discussion ${number} matched both ${existing.slug} and ${record.slug}`,
      );
    }
    deduplicated.set(number, {
      slug: record.slug,
      number,
      url: canonicalDiscussionUrl(repository, number),
      rating: nonnegativeInteger(record.rating, `giscus discussion ${number} rating`),
      comments: nonnegativeInteger(record.comments, `giscus discussion ${number} comments`),
    });
  }
  return [...deduplicated.values()].sort(
    (a, b) => a.number - b.number || a.slug.localeCompare(b.slug),
  );
}

/** Convert distinct public giscus discussions into the existing source model. */
export function giscusRecordsToSkills(
  records: readonly GiscusDiscussionRecord[],
  repository = SOURCES.microsoft,
): Record<string, SkillSourceEngagement> {
  const skills: Record<string, SkillSourceEngagement> = {};
  for (const record of dedupeGiscusRecords(records, repository)) {
    const current = skills[record.slug] ?? { rating: 0, comments: 0, discussions: [] };
    current.rating = nonnegativeInteger(
      current.rating + record.rating,
      `giscus ${record.slug} accumulated rating`,
    );
    current.comments = nonnegativeInteger(
      current.comments + record.comments,
      `giscus ${record.slug} accumulated comments`,
    );
    current.discussions.push({ number: record.number, url: record.url });
    skills[record.slug] = current;
  }
  const sorted: Record<string, SkillSourceEngagement> = {};
  for (const slug of Object.keys(skills).sort()) sorted[slug] = skills[slug];
  return sorted;
}

function listSubmissionSlugs(): string[] {
  const submissions = resolve(ROOT, "submissions");
  return readdirSync(submissions, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && SLUG_RE.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function fetchPublicRepositoryStars(repository: string): Promise<number> {
  const { owner, name } = parseRepository(repository);
  const url = new URL(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    GITHUB_REST_URL,
  );
  const payload = await fetchJsonWithRetries<{
    full_name?: unknown;
    stargazers_count?: unknown;
  }>(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ai-tedt-org-engagement-sync",
    },
  });
  if (!payload || typeof payload.full_name !== "string") {
    throw new Error(`GitHub REST returned no repository for ${repository}`);
  }
  if (payload.full_name.toLowerCase() !== repository.toLowerCase()) {
    throw new Error(`GitHub REST returned ${payload.full_name}; expected ${repository}`);
  }
  return nonnegativeInteger(payload.stargazers_count, `${repository} stargazer count`);
}

export async function fetchMicrosoftViaGiscus(
  previous: EngagementSnapshot | undefined = readSnapshot(),
): Promise<SourceFetch> {
  const repository = SOURCES.microsoft;
  parseRepository(repository);
  const slugs = listSubmissionSlugs();
  const retained = retainedMicrosoftDiscussions(previous, repository);
  const tasks: Array<
    | { kind: "term"; slug: string }
    | { kind: "retained"; slug: string; number: number }
  > = [
    ...slugs.map((slug) => ({ kind: "term" as const, slug })),
    ...retained.map(({ slug, number }) => ({ kind: "retained" as const, slug, number })),
  ];
  const [queried, stars] = await Promise.all([
    mapWithConcurrency(tasks, GISCUS_CONCURRENCY, (task) =>
      fetchGiscusDiscussion({
        repository,
        slug: task.slug,
        number: task.kind === "retained" ? task.number : undefined,
      }),
    ),
    fetchPublicRepositoryStars(repository),
  ]);
  return {
    repository,
    stars,
    skills: giscusRecordsToSkills(
      queried.filter((record): record is GiscusDiscussionRecord => record !== undefined),
      repository,
    ),
  };
}

async function fullCommentCount(discussion: DiscussionNode): Promise<number> {
  let total = pageCommentCount(discussion.comments);
  let after = discussion.comments.pageInfo.hasNextPage
    ? discussion.comments.pageInfo.endCursor
    : null;

  while (after) {
    const data: CommentPageResponse = await graphql<CommentPageResponse>(COMMENTS_QUERY, {
      id: discussion.id,
      after,
    });
    if (!data.node?.comments) {
      throw new Error(`discussion ${discussion.number} returned no comment connection`);
    }
    total += pageCommentCount(data.node.comments);
    after = data.node.comments.pageInfo.hasNextPage
      ? data.node.comments.pageInfo.endCursor
      : null;
  }
  return total;
}

type AggregationInput = {
  title: string;
  number: number;
  url: string;
  category?: { name?: string } | null;
  reactionGroups?: ReactionGroup[] | null;
  commentCount: number;
};

/** Aggregate duplicate slug-titled discussions without losing any source links. */
export function aggregateDiscussions(
  discussions: AggregationInput[],
  category = CATEGORY,
): Record<string, SkillSourceEngagement> {
  const skills: Record<string, SkillSourceEngagement> = {};
  for (const discussion of discussions) {
    if (discussion.category?.name !== category) continue;
    const slug = discussion.title.trim();
    if (!SLUG_RE.test(slug)) continue;
    const current = skills[slug] ?? { rating: 0, comments: 0, discussions: [] };
    current.rating += positiveScore(discussion.reactionGroups);
    current.comments += Math.max(0, discussion.commentCount);
    current.discussions.push({ number: discussion.number, url: discussion.url });
    skills[slug] = current;
  }

  const sorted: Record<string, SkillSourceEngagement> = {};
  for (const slug of Object.keys(skills).sort()) {
    const value = skills[slug];
    value.discussions.sort((a, b) => a.number - b.number || a.url.localeCompare(b.url));
    sorted[slug] = value;
  }
  return sorted;
}

async function fetchSourceGraphql(repository: string): Promise<SourceFetch> {
  const { owner, name } = parseRepository(repository);

  const discussions: AggregationInput[] = [];
  let stars: number | undefined;
  let after: string | null = null;
  do {
    const data: RepositoryPage = await graphql<RepositoryPage>(REPOSITORY_QUERY, {
      owner,
      name,
      after,
    });
    if (!data.repository) throw new Error(`repository is unavailable: ${repository}`);
    stars = data.repository.stargazerCount;
    for (const discussion of data.repository.discussions.nodes) {
      discussions.push({
        title: discussion.title,
        number: discussion.number,
        url: discussion.url,
        category: discussion.category,
        reactionGroups: discussion.reactionGroups,
        commentCount: await fullCommentCount(discussion),
      });
    }
    after = data.repository.discussions.pageInfo.hasNextPage
      ? data.repository.discussions.pageInfo.endCursor
      : null;
  } while (after);

  return {
    repository,
    stars: Math.max(0, stars ?? 0),
    skills: aggregateDiscussions(discussions),
  };
}

async function fetchMicrosoft(previous: EngagementSnapshot | undefined): Promise<SourceFetch> {
  try {
    return await fetchSourceGraphql(SOURCES.microsoft);
  } catch (graphqlError) {
    warn(
      `Microsoft GraphQL refresh failed; trying the public giscus API: ${errorMessage(graphqlError)}`,
    );
    try {
      return await fetchMicrosoftViaGiscus(previous);
    } catch (giscusError) {
      throw new Error(
        `Microsoft GraphQL failed (${errorMessage(graphqlError)}); public giscus fallback failed (${errorMessage(giscusError)})`,
      );
    }
  }
}

const EMPTY_SKILL_SOURCE = (): SkillSourceEngagement => ({
  rating: 0,
  comments: 0,
  discussions: [],
});

/** Build the deterministic two-source read model used by the static site. */
export function buildSnapshot(sources: Record<EngagementSourceKey, SourceFetch>): EngagementSnapshot {
  const slugs = new Set([
    ...Object.keys(sources.microsoft.skills),
    ...Object.keys(sources.local.skills),
  ]);
  const skills: EngagementSnapshot["skills"] = {};
  for (const slug of [...slugs].sort()) {
    const microsoft = sources.microsoft.skills[slug] ?? EMPTY_SKILL_SOURCE();
    const local = sources.local.skills[slug] ?? EMPTY_SKILL_SOURCE();
    skills[slug] = {
      microsoft,
      local,
      total: {
        rating: microsoft.rating + local.rating,
        comments: microsoft.comments + local.comments,
      },
    };
  }
  return {
    schemaVersion: 1,
    repositories: {
      microsoft: {
        repository: sources.microsoft.repository,
        stars: sources.microsoft.stars,
      },
      local: {
        repository: sources.local.repository,
        stars: sources.local.stars,
      },
    },
    skills,
  };
}

/** Preserve the existing flat ratings contract as a derived combined total. */
export function deriveRatings(snapshot: EngagementSnapshot): Record<string, number> {
  const ratings: Record<string, number> = {};
  for (const slug of Object.keys(snapshot.skills).sort()) {
    const rating = snapshot.skills[slug].total.rating;
    if (Number.isFinite(rating) && rating >= 0) ratings[slug] = rating;
  }
  return ratings;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

function readSnapshot(): EngagementSnapshot | undefined {
  if (!existsSync(ENGAGEMENT_OUT)) return undefined;
  try {
    const parsed = JSON.parse(readFileSync(ENGAGEMENT_OUT, "utf8")) as EngagementSnapshot;
    return parsed?.schemaVersion === 1 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function sourceFromSnapshot(
  snapshot: EngagementSnapshot | undefined,
  key: EngagementSourceKey,
): SourceFetch | undefined {
  const repository = snapshot?.repositories?.[key];
  if (!repository) return undefined;
  const skills: Record<string, SkillSourceEngagement> = {};
  for (const [slug, value] of Object.entries(snapshot.skills ?? {})) {
    if (value[key]) skills[slug] = value[key];
  }
  return { ...repository, skills };
}

function writeAtomically(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  try {
    writeFileSync(temporary, content);
    renameSync(temporary, path);
  } finally {
    rmSync(temporary, { force: true });
  }
}

async function main(): Promise<void> {
  if (!TOKEN) {
    warn("no GITHUB_TOKEN set; leaving engagement snapshots unchanged");
    appendOutput("changed", false);
    appendOutput("partial", false);
    return;
  }

  const previous = readSnapshot();
  const settled = await Promise.allSettled([
    fetchMicrosoft(previous),
    fetchSourceGraphql(SOURCES.local),
  ]);
  const keys: EngagementSourceKey[] = ["microsoft", "local"];
  const fetched = {} as Record<EngagementSourceKey, SourceFetch>;
  const failures: EngagementSourceKey[] = [];

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    const result = settled[index];
    if (result.status === "fulfilled") {
      fetched[key] = result.value;
      continue;
    }
    const fallback = sourceFromSnapshot(previous, key);
    if (!fallback) throw result.reason;
    failures.push(key);
    fetched[key] = fallback;
    warn(`${key} refresh failed; retaining its last-known-good snapshot: ${result.reason}`);
  }

  const snapshot = buildSnapshot(fetched);
  const ratings = deriveRatings(snapshot);
  const engagementJson = stableJson(snapshot);
  const ratingsJson = stableJson(ratings);
  const previousEngagement = existsSync(ENGAGEMENT_OUT)
    ? readFileSync(ENGAGEMENT_OUT, "utf8")
    : "";
  const previousRatings = existsSync(RATINGS_OUT) ? readFileSync(RATINGS_OUT, "utf8") : "";
  const changed = engagementJson !== previousEngagement || ratingsJson !== previousRatings;

  if (engagementJson !== previousEngagement) writeAtomically(ENGAGEMENT_OUT, engagementJson);
  if (ratingsJson !== previousRatings) writeAtomically(RATINGS_OUT, ratingsJson);

  appendOutput("changed", changed);
  appendOutput("partial", failures.length > 0);
  appendOutput("failed_sources", failures.join(","));

  const totals = (key: EngagementSourceKey) => {
    const skills = Object.values(fetched[key].skills);
    return {
      discussions: skills.reduce((sum, skill) => sum + skill.discussions.length, 0),
      ratings: skills.reduce((sum, skill) => sum + skill.rating, 0),
      comments: skills.reduce((sum, skill) => sum + skill.comments, 0),
    };
  };
  const microsoftTotals = totals("microsoft");
  const localTotals = totals("local");
  appendSummary(
    `\n### Community engagement sync\n\n` +
      `| Source | Repository stars | Skill discussions | Positive reactions | Comments |\n` +
      `| --- | ---: | ---: | ---: | ---: |\n` +
      `| Microsoft upstream | ${fetched.microsoft.stars} | ${microsoftTotals.discussions} | ${microsoftTotals.ratings} | ${microsoftTotals.comments} |\n` +
      `| AI.Tedt.org | ${fetched.local.stars} | ${localTotals.discussions} | ${localTotals.ratings} | ${localTotals.comments} |\n` +
      (failures.length > 0
        ? `\n> Warning: retained last-known-good data for: ${failures.join(", ")}.\n`
        : ""),
  );
  console.log(
    `[fetch-engagement] ${changed ? "updated" : "no change to"} two-source snapshots` +
      (failures.length > 0 ? ` (stale: ${failures.join(", ")})` : ""),
  );
  if (failures.length > 0) {
    throw new Error(`engagement refresh retained stale data for: ${failures.join(", ")}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n\u2717 engagement sync failed: ${message}`);
    process.exit(1);
  }
}
