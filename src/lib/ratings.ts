/**
 * Read-side helper for skill ratings.
 *
 * Use the same source-aware totals as detail pages and the public catalog.
 * Microsoft reactions are included only for assets in the upstream catalog.
 */
import { getSkillEngagement } from "./engagement";

/** 👍 count for a skill slug (0 when unknown). */
export function getRating(slug: string): number {
  return getSkillEngagement(slug).total.rating;
}
