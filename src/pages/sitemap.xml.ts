import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE_METADATA, toIsoDate } from "../lib/site-metadata";
import { withBase } from "../lib/url";

type SitemapEntry = {
  path: string;
  lastModified?: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const GET: APIRoute = async ({ site }) => {
  const skills = await getCollection("skills");
  const tags = new Set<string>();
  const contentDates: string[] = [];

  for (const skill of skills) {
    for (const tag of skill.data.tags) tags.add(tag);
    const date = toIsoDate(skill.data.updatedAt ?? skill.data.createdAt);
    if (date) contentDates.push(date);
  }

  const latest = contentDates.sort().at(-1);
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: latest },
    { path: "/authors/", lastModified: latest },
    ...skills
      .filter((skill) => !skill.data.tags.includes("sample"))
      .map((skill) => ({
      path: `/skills/${skill.id}/`,
      lastModified: toIsoDate(skill.data.updatedAt ?? skill.data.createdAt),
      })),
    ...[...tags]
      .sort((a, b) => a.localeCompare(b))
      .map((tag) => ({
        path: `/tags/${encodeURIComponent(tag)}/`,
        lastModified: latest,
      })),
  ];

  const origin = site ?? new URL(SITE_METADATA.url);
  const urls = entries
    .map((entry) => {
      const location = new URL(withBase(entry.path), origin).href;
      const lastModified = entry.lastModified
        ? `\n    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`
        : "";
      return `  <url>\n    <loc>${escapeXml(location)}</loc>${lastModified}\n  </url>`;
    })
    .join("\n");
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
