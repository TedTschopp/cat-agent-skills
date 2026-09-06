import type { LibraryAssetKind } from "./library-asset-schema";

/**
 * Personal topic taxonomy for skills imported from your Prompt Library.
 * This taxonomy is separate from the Microsoft canonical taxonomy to avoid conflicts.
 * Use this for your own personal submissions, while Microsoft's LIBRARY_TOPICS
 * remain unmodified for their official skills.
 */
export const PERSONAL_LIBRARY_TOPICS = [
  {
    id: "wellness-lifestyle",
    label: "Wellness and Lifestyle",
    aliases: [
      "wellness",
      "breathing",
      "breathing-room",
      "meditation",
      "mindfulness",
      "relaxation",
      "stress-relief",
      "health",
      "mental-health",
      "self-care",
      "lifestyle",
    ],
  },
  {
    id: "personal-development",
    label: "Personal Development",
    aliases: [
      "personal-growth",
      "self-improvement",
      "goals",
      "motivation",
      "habits",
      "personal-productivity",
      "time-management",
      "friends",
      "family",
      "relationships",
    ],
  },
  {
    id: "creative-expression",
    label: "Creative Expression",
    aliases: [
      "creativity",
      "creative",
      "writing",
      "storytelling",
      "fiction",
      "roleplay",
    ],
  },
] as const;

export type PersonalLibraryTopic = (typeof PERSONAL_LIBRARY_TOPICS)[number];
export type PersonalLibraryTopicId = PersonalLibraryTopic["id"];
export type PersonalLibraryTopicLabel = PersonalLibraryTopic["label"];

const normalize = (value: string): string =>
  value.trim().toLocaleLowerCase("en-US");

const topicByAlias = new Map<string, PersonalLibraryTopic>(
  PERSONAL_LIBRARY_TOPICS.flatMap((topic) =>
    topic.aliases.map((alias) => [normalize(alias), topic] as const),
  ),
);

export function personalLibraryTopic(value: string): PersonalLibraryTopic | undefined {
  const normalized = normalize(value);
  return topicByAlias.get(normalized);
}

export function derivePersonalLibraryTopics(
  name?: string,
  tags?: readonly string[],
): PersonalLibraryTopicLabel[] {
  const evidence = new Map<PersonalLibraryTopicId, number>();
  const seenTerms = new Set<string>();

  const addTerms = (values: readonly string[]): void => {
    for (const value of values) {
      const term = normalize(value);
      if (!term || seenTerms.has(term)) continue;
      seenTerms.add(term);
      const found = personalLibraryTopic(term);
      if (found) {
        evidence.set(found.id, (evidence.get(found.id) ?? 0) + 1);
      }
    }
  };

  addTerms(tags ?? []);
  if (name) {
    addTerms(
      normalize(name)
        .split(/[^a-z0-9]+/)
        .filter(Boolean),
    );
  }

  if (evidence.size === 0) {
    // Fallback to a default personal topic
    return ["Wellness and Lifestyle"];
  }

  return Array.from(evidence.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => PERSONAL_LIBRARY_TOPICS.find((t) => t.id === id)!.label);
}
