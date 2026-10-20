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

function removeFinalBlankLines(source) {
  const parts = source.split(/(\r\n|\n|\r)/);
  let lastLine = parts.length - 1;
  while (lastLine >= 0 && /^[\t ]*$/.test(parts[lastLine])) lastLine -= 2;
  // Keep the original first line ending after the last content line. Splitting
  // prevents a CRLF pair from being mistaken for two separate blank lines.
  return parts.slice(0, lastLine + 2).join("");
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
    if (protectedLines.has(index / 2 + 1)) continue;
    // Two spaces can mark a hard break only on a line containing text. A blank
    // separator inside a list can safely lose its incidental indentation.
    if (/\S/.test(parts[index]) && / {2,}$/.test(parts[index])) continue;
    parts[index] = parts[index].replace(/[\t ]+$/, "");
  }
  const normalized = removeFinalBlankLines(parts.join(""));
  if (normalized === source) return source;
  // A removed space can, for example, turn a final backslash into a hard break.
  // Preserve the source whenever cleanup would change the parsed document.
  return semanticTree(tree) === semanticTree(markdownToMdast(normalized))
    ? normalized
    : source;
}

/** JSON whitespace outside strings is insignificant; retain the original tokens. */
export function normalizeJsonWhitespace(source) {
  try {
    JSON.parse(source);
  } catch {
    return source;
  }
  return removeFinalBlankLines(source.replace(/[\t ]+(?=\r\n|\n|\r|$)/g, ""));
}

/** Clean only a new submission's Markdown/JSON before staging and generation. */
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
    const format = /\.(?:md|markdown)$/i.test(file.relativePath)
      ? "Markdown"
      : /\.json$/i.test(file.relativePath) ? "JSON" : undefined;
    if (!format) return file;
    const source = file.data.toString("utf8");
    if (source.includes("\0") || !Buffer.from(source, "utf8").equals(file.data)) return file;
    const normalized = format === "Markdown"
      ? normalizeMarkdownWhitespace(source)
      : normalizeJsonWhitespace(source);
    if (normalized === source) return file;
    logger(`Normalized accidental ${format} whitespace: ${file.relativePath}`);
    return { ...file, data: Buffer.from(normalized, "utf8") };
  });
}
