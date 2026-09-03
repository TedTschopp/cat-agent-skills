import type { APIRoute } from "astro";
import { getLibraryAssets } from "../lib/library-assets";
import { SITE_METADATA, toIsoDate } from "../lib/site-metadata";
import { withBase } from "../lib/url";
import { groupAssetsByTopic } from "../components/topic-routing";

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
  const assets = await getLibraryAssets();
  const contentDates: string[] = [];

  for (const asset of assets) {
    const date = toIsoDate(asset.dates.updated ?? asset.dates.created ?? undefined);
    if (date) contentDates.push(date);
  }

  const latest = contentDates.sort().at(-1);
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: latest },
    { path: "/authors/", lastModified: latest },
    ...assets
      .filter((asset) => !asset.tags.includes("sample"))
      .map((asset) => ({
        path: asset.canonicalPath,
        lastModified: toIsoDate(asset.dates.updated ?? asset.dates.created ?? undefined),
      })),
    ...groupAssetsByTopic(assets)
      .map((topic) => ({
        path: `/tags/${topic.routeTopic}/`,
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
