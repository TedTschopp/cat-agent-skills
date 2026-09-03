import type { APIRoute } from "astro";
import { renderSocialCardJpeg } from "../../lib/social-card";

export const GET: APIRoute = async () => {
  const image = await renderSocialCardJpeg({
    label: "Community Ledger",
    title: "Contributors",
    description:
      "Everyone who has shipped an asset to the AI.Tedt.org library, with skill-family contribution badges computed from the public catalog.",
    badges: ["Prompt Templates", "Agent Files", "Specifications"],
    kind: "AI Library",
    byline: "The people behind the library",
    artPath: "logo-site.webp",
    artFit: "contain",
    accent: "#e86027",
  });

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
