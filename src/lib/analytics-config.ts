/**
 * Configuration for Microsoft Clarity analytics.
 *
 * Clarity gives us session replay, heatmaps, and custom event tracking. We use
 * it to understand how visitors browse the gallery and, in particular, to
 * capture two important interactions:
 *
 *   - `skill_download` — a visitor downloads a skill/plugin package or `.md`.
 *   - `skill_view`     — a visitor lands on a skill detail page.
 *
 * A project id is NOT a secret — Clarity emits it into the public client bundle
 * (like the giscus ids in `ratings-config.ts`). This mirror leaves analytics
 * disabled by default. Set `PUBLIC_CLARITY_PROJECT_ID` at build time to opt in
 * with a project owned by the deployment operator.
 */

/** Clarity project id (public client id, safe to commit). */
export const CLARITY_PROJECT_ID =
  import.meta.env.PUBLIC_CLARITY_PROJECT_ID ?? "";

/**
 * Clarity only loads when a project id is configured. This keeps builds without
 * an id (or with it explicitly cleared) from injecting a broken loader.
 */
export const ANALYTICS_ENABLED = Boolean(CLARITY_PROJECT_ID);
