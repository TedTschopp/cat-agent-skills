// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import consolidationRegistry from "./src/data/asset-consolidations.json" with { type: "json" };
import { consolidationRedirects, parseAssetConsolidations } from "./src/lib/asset-consolidations.mjs";

// GitHub Pages deployment: served from the AI.Tedt.org custom domain root.
export default defineConfig({
  site: "https://ai.tedt.org",
  trailingSlash: "ignore",
  redirects: Object.fromEntries(consolidationRedirects(parseAssetConsolidations(consolidationRegistry))),
  vite: {
    plugins: [tailwindcss()],
  },
});
