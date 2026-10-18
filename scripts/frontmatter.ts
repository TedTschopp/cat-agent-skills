import { load as loadYaml } from "js-yaml";

/** Parse contributed metadata as data, never as an executable language. */
export function parseFrontmatter(source: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const text = source.replace(/^\uFEFF/, "");
  if (!text.startsWith("---") || text.startsWith("----")) {
    return { data: {}, content: text };
  }

  const opening = /^---([^\r\n]*)(?:\r?\n|$)/.exec(text);
  if (!opening) throw new Error("malformed frontmatter opening delimiter");
  const language = opening[1].trim().toLowerCase();
  if (!["", "yaml", "yml", "json"].includes(language)) {
    throw new Error(`unsupported frontmatter language: ${language}`);
  }

  const remaining = text.slice(opening[0].length);
  const closing = /^---[\t ]*(?:\r?\n|$)/m.exec(remaining);
  if (!closing) throw new Error("missing frontmatter closing delimiter");
  const metadata = remaining.slice(0, closing.index);
  const data: unknown = metadata.trim() === ""
    ? {}
    : language === "json" ? JSON.parse(metadata) : loadYaml(metadata);
  if (data != null && (typeof data !== "object" || Array.isArray(data))) {
    throw new Error("frontmatter must be a mapping");
  }

  return {
    data: (data ?? {}) as Record<string, unknown>,
    content: remaining.slice(closing.index + closing[0].length),
  };
}
