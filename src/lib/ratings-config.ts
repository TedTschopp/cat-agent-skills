/**
 * Configuration for the GitHub-native skill rating feature.
 *
 * Ratings are positive reactions on source-separated GitHub Discussions. We
 * preserve Microsoft's upstream threads and add an independent AI.Tedt.org
 * thread for each skill. Aggregate counts are read at build time via the
 * GitHub GraphQL API (see `scripts/fetch-engagement.ts`).
 *
 * The repo and category IDs below are public giscus client values and are safe
 * to commit. A new source becomes interactive only after its repository has
 * Discussions enabled and the giscus GitHub App installed.
 *
 *   1. Enable Discussions on the repository.
 *   2. Create a Discussion category (e.g. "Skill Ratings").
 *   3. Install the giscus app and paste the generated ids here (or set the
 *      matching PUBLIC_GISCUS_* env vars at build time).
 *
 * The local embed has an additional explicit feature gate so a valid category
 * ID cannot accidentally expose a broken widget before the app is installed.
 */

/** Microsoft upstream discussion source. */
export const MICROSOFT_GISCUS_REPO =
  import.meta.env.PUBLIC_MICROSOFT_GISCUS_REPO ?? "microsoft/cat-agent-skills";
export const MICROSOFT_GISCUS_REPO_ID =
  import.meta.env.PUBLIC_MICROSOFT_GISCUS_REPO_ID ?? "R_kgDOSwZGlA";
export const MICROSOFT_GISCUS_CATEGORY =
  import.meta.env.PUBLIC_MICROSOFT_GISCUS_CATEGORY ?? "Announcements";
export const MICROSOFT_GISCUS_CATEGORY_ID =
  import.meta.env.PUBLIC_MICROSOFT_GISCUS_CATEGORY_ID ?? "DIC_kwDOSwZGlM4DAxet";

/** AI.Tedt.org discussion source in this repository. */
export const LOCAL_GISCUS_REPO =
  import.meta.env.PUBLIC_LOCAL_GISCUS_REPO ?? "TedTschopp/cat-agent-skills";
export const LOCAL_GISCUS_REPO_ID =
  import.meta.env.PUBLIC_LOCAL_GISCUS_REPO_ID ?? "R_kgDOUII1_Q";
export const LOCAL_GISCUS_CATEGORY =
  import.meta.env.PUBLIC_LOCAL_GISCUS_CATEGORY ?? "Announcements";
export const LOCAL_GISCUS_CATEGORY_ID =
  import.meta.env.PUBLIC_LOCAL_GISCUS_CATEGORY_ID ?? "DIC_kwDOUII1_c4DEej4";

/**
 * The rating widget renders only when giscus has been fully configured. This
 * keeps local dev and un-provisioned deploys from showing a broken embed.
 */
export const MICROSOFT_RATINGS_ENABLED = Boolean(
  MICROSOFT_GISCUS_REPO_ID && MICROSOFT_GISCUS_CATEGORY_ID,
);

/**
 * The local category exists, but the giscus GitHub App still needs to be
 * installed for this repository. Keep the embed off until that external setup
 * is complete; setting this public flag to `true` is the deliberate go-live.
 */
export const LOCAL_RATINGS_ENABLED =
  import.meta.env.PUBLIC_LOCAL_GISCUS_ENABLED === "true" &&
  Boolean(LOCAL_GISCUS_REPO_ID && LOCAL_GISCUS_CATEGORY_ID);

// Backward-compatible aliases for consumers that still expect one discussion
// source. They continue to mean Microsoft upstream.
export const GISCUS_REPO = MICROSOFT_GISCUS_REPO;
export const GISCUS_REPO_ID = MICROSOFT_GISCUS_REPO_ID;
export const GISCUS_CATEGORY = MICROSOFT_GISCUS_CATEGORY;
export const GISCUS_CATEGORY_ID = MICROSOFT_GISCUS_CATEGORY_ID;
export const RATINGS_ENABLED = MICROSOFT_RATINGS_ENABLED;
