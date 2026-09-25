import { markdownToMdast } from "satteri";
import { load as loadYaml } from "js-yaml";

const METADATA_NAMES = new Set(["metadata.json", "metadata.yaml", "metadata.yml"]);
const PROTECTED_NODES = new Set(["code", "inlineCode", "html", "yaml", "toml"]);
const SOURCE_CLAIMS = new Set(["provenance", "coverImageSourceHash", "importedFiles"]);

function hasSourceClaims(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return false;
  seen.add(value);
  return Object.entries(value).some(
    ([key, child]) => SOURCE_CLAIMS.has(key) || hasSourceClaims(child, seen),
  );
}

function semanticTree(tree) {
  return JSON.stringify(tree, (key, value) => key === "position" ? undefined : value);
}

/** Remove accidental prose whitespace without reserializing authored Markdown. */
export function normalizeMarkdownWhitespace(source) {
  const tree = markdownToMdast(source);
  const protectedLines = new Set();
  function visit(node) {
    if (PROTECTED_NODES.has(node.type) && node.position) {
      // Parser offsets count Unicode code points, not JavaScript UTF-16 units.
      // Protect complete lines, including prose sharing a line with inline code.
      for (let line = node.position.start.line; line <= node.position.end.line; line++) {
        protectedLines.add(line);
      }
    }
    if (node.type === "break" && node.position) {
      protectedLines.add(node.position.start.line);
    }
    for (const child of node.children ?? []) visit(child);
  }
  visit(tree);

  const parts = source.split(/(\r\n|\n|\r)/);
  for (let index = 0; index < parts.length; index += 2) {
    if (protectedLines.has(index / 2 + 1) || / {2,}$/.test(parts[index])) continue;
    parts[index] = parts[index].replace(/[\t ]+$/, "");
  }
  const normalized = parts.join("");
  if (normalized === source) return source;
  // A removed space can, for example, turn a final backslash into a hard break.
  // Preserve the source whenever cleanup would change the parsed document.
  return semanticTree(tree) === semanticTree(markdownToMdast(normalized))
    ? normalized
    : source;
}

/** Run only on the new submission's in-memory files, before staging/generation. */
export function normalizeNewSubmissionMarkdown(files, logger = () => {}) {
  const metadataFiles = files.filter((file) => METADATA_NAMES.has(file.relativePath.toLowerCase()));
  if (metadataFiles.length !== 1) return files;
  let metadata;
  try {
    const file = metadataFiles[0];
    const text = file.data.toString("utf8");
    metadata = file.relativePath.toLowerCase().endsWith(".json") ? JSON.parse(text) : loadYaml(text);
    if (hasSourceClaims(metadata)) return files;
  } catch {
    // The importer owns metadata validation. Never repair malformed metadata or
    // invalidate existing hashes while preparing a submission for that check.
    return files;
  }

  return files.map((file) => {
    if (!/\.(?:md|markdown)$/i.test(file.relativePath)) return file;
    const source = file.data.toString("utf8");
    if (source.includes("\0") || !Buffer.from(source, "utf8").equals(file.data)) return file;
    const normalized = normalizeMarkdownWhitespace(source);
    if (normalized === source) return file;
    logger(`Normalized accidental Markdown whitespace: ${file.relativePath}`);
    return { ...file, data: Buffer.from(normalized, "utf8") };
  });
}
