import type { APIRoute } from "astro";
import { SITE_METADATA } from "../lib/site-metadata";
import { withBase } from "../lib/url";

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_METADATA.url);
  const sitemap = new URL(withBase("/sitemap.xml"), origin).href;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
