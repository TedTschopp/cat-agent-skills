import type { LibraryAssetKind } from "./library-asset-schema";

/**
 * The small, public topic vocabulary used by cards, filters, topic pages, and
 * assets.json. Contributor tags stay free-form and searchable; they are mapped
 * here instead of being exposed as hundreds of competing catalog topics.
 */
export const LIBRARY_TOPICS = [
  {
    id: "ai-agents",
    label: "AI and Agents",
    aliases: [
      "advisor",
      "agent",
      "agent-365",
      "agent-design",
      "agentic-workflow",
      "agents",
      "ai",
      "ai-detection",
      "artificial intelligence",
      "capabilities",
      "copilot",
      "copilot-studio",
      "cowork",
      "data-ai",
      "foundry",
      "foundry-agent-service",
      "grounding",
      "mcp",
      "memory",
      "microsoft-365-copilot",
      "orchestration",
      "rag",
      "skill-generation",
      "skills",
      "topics",
      "windows-ai-foundry",
    ],
  },
  {
    id: "architecture-engineering",
    label: "Architecture and Engineering",
    aliases: [
      "adaptive-card",
      "architecture",
      "azure",
      "azure-ai-search",
      "azure-data-factory",
      "debugging",
      "deep-links",
      "diagnostics",
      "engineering",
      "html",
      "json",
      "logging",
      "m365",
      "microsoft-365",
      "monitoring",
      "observability",
      "office",
      "pcf",
      "playwright",
      "power-apps",
      "power-pages",
      "power-platform",
      "python",
      "qr-codes",
      "routing",
      "runtime",
      "scripts",
      "sharepoint",
      "snapshots",
      "web",
    ],
  },
  {
    id: "business-strategy",
    label: "Business and Strategy",
    aliases: [
      "batna",
      "brainstorming",
      "business",
      "business strategy",
      "business-applications",
      "commerce",
      "comparison",
      "consulting",
      "crm",
      "deals",
      "decision-making",
      "decision-support",
      "enterprise",
      "leadership",
      "marketing",
      "negotiation",
      "offers",
      "personas",
      "positioning",
      "problem-solving",
      "procurement",
      "salary",
      "sales",
      "sales-enablement",
      "vendor-management",
      "zopa",
    ],
  },
  {
    id: "communication-collaboration",
    label: "Communication and Collaboration",
    aliases: [
      "briefing",
      "collaboration",
      "communication",
      "communications",
      "conference",
      "demo",
      "demonstrations",
      "email",
      "events",
      "handoff",
      "localization",
      "meeting analysis",
      "meetings",
      "multilingual",
      "speaking",
      "teams",
    ],
  },
  {
    id: "content-documentation",
    label: "Content and Documentation",
    aliases: [
      "abstract",
      "acroform",
      "authoring",
      "blog",
      "case-study",
      "content",
      "content creation",
      "conversion",
      "digest",
      "documentation",
      "documents",
      "editing",
      "forms",
      "humanize",
      "linkedin",
      "markdown",
      "news",
      "pdf",
      "report",
      "reporting",
      "seo",
      "social-media",
      "storytelling",
      "structure",
      "style",
      "summarization",
      "templates",
      "wikipedia",
      "word",
      "writing",
    ],
  },
  {
    id: "data-analytics",
    label: "Data and Analytics",
    aliases: [
      "analysis",
      "analytics",
      "azure-maps",
      "bing-maps",
      "charts",
      "column-mapping",
      "csv",
      "dashboard",
      "data",
      "data-ingestion",
      "data-lookup",
      "dataverse",
      "dax",
      "deduplication",
      "excel",
      "extraction",
      "fabric",
      "geojson",
      "insights",
      "kml",
      "leaflet",
      "lists",
      "maps",
      "matplotlib",
      "monte-carlo",
      "openstreetmap",
      "power-bi",
      "schema-drift",
      "scoring",
      "semantic-model",
      "simulation",
      "spreadsheets",
      "tables",
      "visualization",
      "xlsx",
    ],
  },
  {
    id: "design-media",
    label: "Design and Media",
    aliases: [
      "animation",
      "audio",
      "branding",
      "clipchamp",
      "design",
      "design-review",
      "diagrams",
      "ffmpeg",
      "image generation",
      "infographic",
      "narration",
      "podcast",
      "powerpoint",
      "presentations",
      "speaker-notes",
      "ssml",
      "text-to-speech",
      "transcription",
      "tts",
      "video",
      "voice",
      "whiteboard",
    ],
  },
  {
    id: "governance-risk-compliance",
    label: "Governance, Risk, and Compliance",
    aliases: [
      "a11y",
      "accessibility",
      "assessment",
      "audit",
      "compliance",
      "contracts",
      "environmental claims",
      "esg",
      "eu-regulation",
      "eval",
      "evaluation",
      "governance",
      "greenwashing",
      "hipaa",
      "human-in-the-loop",
      "iso standards",
      "legal",
      "licensing",
      "marketing-review",
      "phi",
      "privacy",
      "prompt-injection",
      "qa",
      "quality",
      "quality-assurance",
      "redaction",
      "regression",
      "regulation",
      "responsible-ai",
      "review",
      "risk",
      "risk management",
      "risk-assessment",
      "security",
      "sustainability",
      "testing",
      "transparency",
      "uat",
      "wcag",
    ],
  },
  {
    id: "industries-domains",
    label: "Industries and Domains",
    aliases: [
      "adventure",
      "brasil",
      "canada",
      "clinical-data",
      "clt",
      "departamento-pessoal",
      "european union",
      "expenses",
      "finance",
      "folha",
      "game",
      "game master",
      "healthcare",
      "hls",
      "inss",
      "irrf",
      "lab-results",
      "location",
      "logistics",
      "loinc",
      "offboarding",
      "rescisao",
      "rh",
      "stoicism",
      "trabalhista",
      "travel",
      "ttrpg",
      "united kingdom",
      "verbas-rescisorias",
    ],
  },
  {
    id: "knowledge-learning",
    label: "Knowledge, Learning, and Research",
    aliases: [
      "courseware",
      "education",
      "hands-on-labs",
      "instructional-design",
      "instructional-intelligence",
      "knowledge",
      "learning",
      "learning-analytics",
      "learning-experience",
      "mct",
      "microsoft-learn",
      "microsoft-learning",
      "research",
      "surveys",
      "teaching & education",
      "training",
      "workshops",
    ],
  },
  {
    id: "planning-delivery",
    label: "Planning and Delivery",
    aliases: [
      "backlog",
      "blueprint",
      "change-management",
      "discovery",
      "gantt",
      "go-live",
      "intake",
      "iteration",
      "launch-readiness",
      "planning",
      "post-launch",
      "product management",
      "project-management",
      "project-planning",
      "readiness",
      "refinement",
      "requirements",
      "requirements engineering",
      "srs generation",
      "systems analysis",
      "timeline",
      "use-case",
    ],
  },
  {
    id: "productivity-automation",
    label: "Productivity and Automation",
    aliases: [
      "action-items",
      "automation",
      "browser-automation",
      "calendar",
      "catch-up",
      "desktop-flows",
      "download",
      "export",
      "files",
      "follow-up",
      "inbox",
      "modern-work",
      "operations",
      "optimization",
      "out-of-office",
      "outlook",
      "power-automate",
      "process-improvement",
      "productivity",
      "reminder",
      "reminders",
      "sop",
      "tasks",
      "uploads",
      "weekly",
      "work-iq",
      "work-patterns",
      "workflow",
      "zip",
    ],
  },
] as const;

export type LibraryTopic = (typeof LIBRARY_TOPICS)[number];
export type LibraryTopicId = LibraryTopic["id"];
export type LibraryTopicLabel = LibraryTopic["label"];

export const MAX_LIBRARY_TOPICS_PER_ASSET = 3;

const normalize = (value: string): string =>
  value.trim().toLocaleLowerCase("en-US");

const topicById = new Map<string, LibraryTopic>(
  LIBRARY_TOPICS.map((topic) => [topic.id, topic]),
);
const topicByLabel = new Map<string, LibraryTopic>(
  LIBRARY_TOPICS.map((topic) => [normalize(topic.label), topic]),
);
const topicByAlias = new Map<string, LibraryTopic>(
  LIBRARY_TOPICS.flatMap((topic) =>
    topic.aliases.map((alias) => [normalize(alias), topic] as const),
  ),
);

// These terms describe the central purpose of a topic rather than a supporting
// technology, format, or product. Give them more weight when an asset spans
// several disciplines so the three visible Topics remain meaningful.
const coreAliases = new Set([
  "agent",
  "agents",
  "ai",
  "artificial intelligence",
  "agentic-workflow",
  "capabilities",
  "copilot",
  "copilot-studio",
  "architecture",
  "debugging",
  "diagnostics",
  "runtime",
  "business",
  "business strategy",
  "comparison",
  "marketing",
  "sales",
  "sales-enablement",
  "collaboration",
  "communication",
  "communications",
  "conference",
  "speaking",
  "content",
  "content creation",
  "documentation",
  "documents",
  "report",
  "reporting",
  "writing",
  "analysis",
  "analytics",
  "data",
  "column-mapping",
  "data-ingestion",
  "data-lookup",
  "extraction",
  "insights",
  "lists",
  "visualization",
  "audio",
  "design",
  "image generation",
  "presentations",
  "video",
  "adventure",
  "clt",
  "game",
  "game master",
  "healthcare",
  "hls",
  "rh",
  "travel",
  "ttrpg",
  "accessibility",
  "audit",
  "compliance",
  "environmental claims",
  "esg",
  "governance",
  "evaluation",
  "greenwashing",
  "privacy",
  "regulation",
  "responsible-ai",
  "risk",
  "risk management",
  "risk-assessment",
  "security",
  "sustainability",
  "quality-assurance",
  "eval",
  "qa",
  "regression",
  "testing",
  "wcag",
  "education",
  "courseware",
  "instructional-design",
  "knowledge",
  "learning",
  "learning-experience",
  "mct",
  "research",
  "teaching & education",
  "training",
  "planning",
  "intake",
  "product management",
  "project-management",
  "project-planning",
  "requirements",
  "requirements engineering",
  "use-case",
  "automation",
  "operations",
  "process-improvement",
  "productivity",
  "workflow",
]);

export function libraryTopic(value: string): LibraryTopic | undefined {
  const normalized = normalize(value);
  return topicById.get(normalized) ?? topicByLabel.get(normalized);
}

export function libraryTopicId(value: string): LibraryTopicId | undefined {
  return libraryTopic(value)?.id;
}

export function isLibraryTopicLabel(value: string): value is LibraryTopicLabel {
  return topicByLabel.has(normalize(value));
}

export type LibraryTopicInput = {
  kind: LibraryAssetKind;
  name?: string;
  authoredTopics?: readonly string[];
  tags?: readonly string[];
};

type TopicEvidence = {
  authored: number;
  core: number;
  supporting: number;
  score: number;
};

/**
 * Convert authored/free-form terms to one to three high-signal public topics.
 * A term is counted once even when legacy metadata copied it into both
 * `topics` and `tags`. More supporting terms make a topic rank higher.
 */
export function deriveLibraryTopics(input: LibraryTopicInput): LibraryTopicLabel[] {
  const evidence = new Map<LibraryTopicId, TopicEvidence>();
  const seenTerms = new Set<string>();
  const addTerms = (values: readonly string[], authored: boolean): void => {
    for (const value of values) {
      const term = normalize(value);
      if (!term || seenTerms.has(term)) continue;
      seenTerms.add(term);
      const canonical = libraryTopic(term);
      const mapped = canonical ?? topicByAlias.get(term);
      if (!mapped) continue;
      const current = evidence.get(mapped.id) ?? {
        authored: 0,
        core: 0,
        supporting: 0,
        score: 0,
      };
      if (authored || canonical) {
        current.authored += 1;
        current.score += 100;
      } else if (coreAliases.has(term)) {
        current.core += 1;
        current.score += 3;
      } else {
        current.supporting += 1;
        current.score += 1;
      }
      evidence.set(mapped.id, current);
    }
  };

  // Authored Topics are intentional taxonomy choices. Tags add evidence, but
  // search-only keywords never get to change an asset's visible classification.
  addTerms(input.authoredTopics ?? [], true);
  addTerms(input.tags ?? [], false);
  const unambiguousNameSignals = new Set(["ai", "agent", "agents", "copilot"]);
  addTerms(
    normalize(input.name ?? "")
      .split(/[^a-z0-9]+/)
      .filter((term) => unambiguousNameSignals.has(term)),
    false,
  );

  const eligible = LIBRARY_TOPICS
    .map((topic, order) => ({
      topic,
      order,
      evidence: evidence.get(topic.id),
    }))
    .filter(({ evidence }) =>
      Boolean(
        evidence &&
          (evidence.authored > 0 || evidence.core > 0),
      ),
    );

  if (eligible.length === 0) {
    throw new Error(
      `No controlled Topic matches ${input.name ?? input.kind}. Add a canonical Topic or a mapped tag.`,
    );
  }

  return eligible
    .sort(
      (left, right) =>
        right.evidence!.score - left.evidence!.score || left.order - right.order,
    )
    .slice(0, MAX_LIBRARY_TOPICS_PER_ASSET)
    .map(({ topic }) => topic.label);
}

/** Resolve a canonical Topic from either its public name or a legacy raw tag. */
export function libraryTopicForTerm(value: string): LibraryTopic | undefined {
  const normalized = normalize(value);
  return libraryTopic(normalized) ?? topicByAlias.get(normalized);
}

export function libraryTopicIdForTerm(value: string): LibraryTopicId | undefined {
  return libraryTopicForTerm(value)?.id;
}

/** Raw contributor terms remain useful for search and compatibility routes. */
export function uniqueSearchTerms(...groups: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of groups.flat()) {
    const key = normalize(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }
  return result;
}

/** Retain authored topic terms only when another searchable field lacks them. */
export function uniqueSearchTermsExcluding(
  excluded: readonly string[],
  ...groups: readonly (readonly string[])[]
): string[] {
  const excludedKeys = new Set(excluded.map(normalize));
  return uniqueSearchTerms(...groups).filter(
    (value) => !excludedKeys.has(normalize(value)),
  );
}
