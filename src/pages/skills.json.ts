import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { coverGradient, initials, type SkillSummary } from "../lib/skills";
import { getRating } from "../lib/ratings";
import { getDownloads } from "../lib/downloads";
import { getSkillEngagement, type SkillEngagement } from "../lib/engagement";

export const GET: APIRoute = async () => {
  const skills = await getCollection("skills");

  const data: Array<SkillSummary & { engagement: SkillEngagement }> = skills
    .map((skill) => {
      const d = skill.data;
      return {
        slug: skill.id,
        name: d.name,
        description: d.description,
        platforms: d.platforms,
        type: d.type,
        tags: d.tags,
        author: d.author,
        authorGithub: d.authorGithub ?? null,
        createdAt: d.createdAt ? d.createdAt.toISOString() : null,
        version: d.version,
        hasBundle: Boolean(d.bundle),
        featured: d.featured,
        rating: getRating(skill.id),
        engagement: getSkillEngagement(skill.id),
        downloads: getDownloads(skill.id),
        gradient: coverGradient(skill.id, d.coverColor),
        initials: initials(d.name),
        coverImage: d.coverImage ?? null,
        coverImageAlt: d.coverImageAlt ?? null,
        coverImageWidth: d.coverImageWidth ?? null,
        coverImageHeight: d.coverImageHeight ?? null,
      };
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};
