/**
 * Shared helpers for the skills gallery: deterministic cover styling and
 * small utilities reused across pages, endpoints, and the client island.
 */

/** The agent platforms a skill can target. */
export const PLATFORMS = ["Cowork", "Copilot Studio", "Scout"] as const;
export type Platform = (typeof PLATFORMS)[number];

/**
 * A submission is a single cross-platform Agent Skill, a Cowork plugin (an M365
 * app package bundling one or more skills + optional connectors), or a Scout
 * automation (a scheduled `.json` of ordered prompt steps, Scout-only).
 */
export type SkillType = "skill" | "plugin" | "automation";

/** AI.Tedt.org platform tones, drawn from the tedt.org brand palette. */
export const PLATFORM_COLORS: Record<Platform, string> = {
  Cowork: "#00446f",
  "Copilot Studio": "#00a9e0",
  Scout: "#e86027",
};

const COVER_GLOWS = [
  { color: "#e86027", rgb: "232, 96, 39" },
  { color: "#00a9e0", rgb: "0, 169, 224" },
];

/** Stable hash for a string (FNV-1a style, good enough for theming). */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The stable cyan-or-orange edge used by a skill cover. */
export function coverAccent(slug: string): string {
  return COVER_GLOWS[hash(slug) % COVER_GLOWS.length].color;
}

/** Near-black skill-cover field, backlit like the tedt.org TT mark. */
export function coverField(slug: string, override?: string): string {
  if (override) return override;
  const glow = COVER_GLOWS[hash(slug) % COVER_GLOWS.length];
  const drift = hash(`${slug}:drift`) % 40;
  return `radial-gradient(120% 140% at ${30 + drift}% 8%, rgba(${glow.rgb}, 0.42) 0%, rgba(${glow.rgb}, 0.1) 34%, transparent 62%), linear-gradient(180deg, #17202b 0%, #101820 55%, #07090f 100%)`;
}

/**
 * Compatibility treatment for small contributor initials. Skill covers use
 * `coverField`; avatars use one flat brand signal instead of the old spectrum.
 */
export function coverGradient(slug: string, override?: string): string {
  const tone = override ?? coverAccent(slug);
  return `linear-gradient(135deg, ${tone} 0%, ${tone} 100%)`;
}

/** Up to two-letter initials used as a watermark on covers. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "AI";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function formatDate(date?: Date): string | undefined {
  if (!date) return undefined;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export type SkillSummary = {
  slug: string;
  name: string;
  description: string;
  platforms: Platform[];
  type: SkillType;
  tags: string[];
  author?: string;
  authorGithub?: string | null;
  createdAt?: string | null;
  version?: string;
  hasBundle: boolean;
  featured: boolean;
  rating: number;
  downloads: number;
  gradient: string;
  initials: string;
};
