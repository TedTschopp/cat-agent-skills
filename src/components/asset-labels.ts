const WORKS_WITH_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  "github-copilot": "GitHub Copilot",
  "microsoft-copilot": "Microsoft Copilot",
};

/** Present machine-friendly compatibility identifiers as stable product names. */
export function worksWithLabel(value: string): string {
  const trimmed = value.trim();
  return WORKS_WITH_LABELS[trimmed.toLocaleLowerCase()] ?? trimmed;
}
