import type { APIRoute } from "astro";
import { SITE_METADATA } from "../../lib/site-metadata";
import { renderSocialCardJpeg } from "../../lib/social-card";

export const GET: APIRoute = async () => {
  const image = await renderSocialCardJpeg({
    label: "AI Library",
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    badges: ["Prompt Templates", "Agent Files", "Specifications"],
    kind: "Practitioner-Built Library",
    byline: "Reusable files for AI work",
    artPath: "logo-site.webp",
    artFit: "contain",
    accent: "#00a9e0",
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
