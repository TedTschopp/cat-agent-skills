/**
 * Read-side helper for skill ratings.
 *
 * `src/data/ratings.json` is the compatibility view of the two-source
 * engagement snapshot produced by `scripts/fetch-engagement.ts`. Each value is
 * the combined Microsoft + AI.Tedt.org positive-reaction total for one slug.
 */
import ratings from "../data/ratings.json";

const counts = ratings as Record<string, number>;

/** 👍 count for a skill slug (0 when unknown). */
export function getRating(slug: string): number {
  const n = counts[slug];
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0;
}
