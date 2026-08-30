import type { APIRoute } from "astro";
import { renderSocialCardJpeg } from "../../lib/social-card";

export const GET: APIRoute = async () => {
  const image = await renderSocialCardJpeg({
    label: "Community ledger",
    title: "Contributors",
    description:
      "Everyone who has shipped a skill to the AI.Tedt.org gallery, with contribution badges computed from the public catalog.",
    badges: ["Skills", "Plugins", "Automations"],
    kind: "Prompts and Agent Skills",
    byline: "The people behind the gallery",
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
