export const SITE_METADATA = Object.freeze({
  name: "AI.Tedt.org",
  title: "AI Library",
  description:
    "Reusable agent instruction files, scoped agent instruction files, agent definition files, prompt template files, work specification files, skills, plugins, and automations for leading AI tools.",
  url: "https://ai.tedt.org/",
  language: "en-US",
  locale: "en_US",
  owner: "Ted Tschopp",
  ownerUrl: "https://tedt.org/profile/",
  twitterSite: "@TedTschopp",
  fediverseCreator: "@TedT@twit.social",
  fediverseProfile: "https://twit.social/@TedT",
  themeLight: "#f8f6f0",
  themeDark: "#101820",
  socialImagePath: "/social/ai-tedt-org.jpg",
  socialImageAlt:
    "AI.Tedt.org AI Library beside the illuminated orange-and-cyan TT mark.",
  socialImageWidth: 1200,
  socialImageHeight: 630,
  socialImageType: "image/jpeg",
  sameAs: [
    "https://github.com/TedTschopp",
    "https://www.linkedin.com/in/tedtschopp",
    "https://twitter.com/TedTschopp",
    "https://bsky.app/profile/tedt.org",
    "https://twit.social/@TedT",
  ],
});

export type OpenGraphType = "website" | "article" | "profile";
export type PageSchemaType =
  | "WebPage"
  | "CollectionPage"
  | "ItemPage"
  | "ProfilePage";

export interface SocialImageMetadata {
  path: string;
  alt: string;
  width?: number;
  height?: number;
  type?: string;
}

/** Normalize prose and shorten it at a word boundary for social/search snippets. */
export function compactDescription(value: string, limit = 200): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;

  const candidate = normalized.slice(0, Math.max(1, limit - 1));
  const boundary = candidate.lastIndexOf(" ");
  const end = boundary >= Math.floor(limit * 0.72) ? boundary : candidate.length;
  return `${candidate.slice(0, end).replace(/[,:;\-–—]+$/u, "")}…`;
}

/** Return an ISO timestamp when a content date is present and valid. */
export function toIsoDate(value?: Date | string): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString();
}
