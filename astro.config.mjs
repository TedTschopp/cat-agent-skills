// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages deployment: served from the AI.Tedt.org custom domain root.
export default defineConfig({
  site: "https://ai.tedt.org",
  trailingSlash: "ignore",
  vite: {
    plugins: [tailwindcss()],
  },
});
