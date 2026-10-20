import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeMarkdownWhitespace,
  normalizeJsonWhitespace,
  normalizeNewSubmissionMarkdown,
} from "./normalize-upstream-markdown.mjs";

test("cleans prose while preserving Markdown meaning, code, and CRLF bytes", () => {
  const lines = [
    "---", "title: Preserve frontmatter ", "---", "",
    "# Heading ", "", "🙂 Prose with a stray space ", "continues here\t", "",
    "A hard break  ", "continues here", "",
    "```text", "code with meaningful trailing space ", "```", "",
    "    indented code ", "",
    "> ```text", "> nested code ", "> ```", "",
    "Inline `code ` and prose ", "",
    "Multiline `code ", "continues` ", "",
    "<pre>", "HTML text ", "</pre>", "",
  ];
  const source = lines.join("\r\n");
  const expected = [...lines];
  expected[4] = "# Heading";
  expected[6] = "🙂 Prose with a stray space";
  expected[7] = "continues here";
  const result = normalizeMarkdownWhitespace(source);
  assert.equal(result, expected.join("\r\n"));
  assert.equal(normalizeMarkdownWhitespace(result), result);
});

test("does not turn an escaped trailing space into a Markdown line break", () => {
  const source = "Keep this backslash\\ \nfollowed by text\n";
  assert.equal(normalizeMarkdownWhitespace(source), source);
});

test("cleans blank prose lines and final blank lines while retaining hard breaks", () => {
  const source = [
    "1. Resolve the folder.",
    "   - Pass these arguments:",
    "     1. `create`",
    "     2. `-b`",
    "     ",
    "     Discover the parent folder before continuing.",
    "",
    "Keep this intentional break  ",
    "and the next line.",
    " \t ",
    "",
  ].join("\r\n");
  const expected = source.replace("     \r\n", "\r\n").replace(/ \t \r\n$/, "");
  const result = normalizeMarkdownWhitespace(source);
  assert.equal(result, expected);
  assert.equal(normalizeMarkdownWhitespace(result), result);
});

test("normalizes valid JSON formatting without reserializing values or line endings", () => {
  const source = '{\r\n  "folder": "Keep  ", \r\n  "number": 1e3\t\r\n}\r\n \t\r\n\r\n';
  const result = normalizeJsonWhitespace(source);
  assert.equal(result, '{\r\n  "folder": "Keep  ",\r\n  "number": 1e3\r\n}\r\n');
  assert.deepEqual(JSON.parse(result), JSON.parse(source));
  assert.equal(normalizeJsonWhitespace(result), result);
  assert.equal(normalizeJsonWhitespace('{"invalid": "literal\nspace "}\n\n'), '{"invalid": "literal\nspace "}\n\n');
});

test("cleans new JSON examples but preserves hash-bound JSON, scripts, and binary files", () => {
  const files = [
    { relativePath: "metadata.json", data: Buffer.from("{}\n") },
    { relativePath: "assets/config.example.json", data: Buffer.from('{"folder":"Keep  "}\n\n') },
    { relativePath: "scripts/run.sh", data: Buffer.from("echo 'keep' \n\n") },
    { relativePath: "assets/binary.json", data: Buffer.from([0xff, 0x20, 0x0a]) },
  ];
  const result = normalizeNewSubmissionMarkdown(files);
  assert.equal(result[1].data.toString(), '{"folder":"Keep  "}\n');
  for (const index of [0, 2, 3]) assert.deepEqual(result[index], files[index]);
  const bound = [
    { relativePath: "metadata.json", data: Buffer.from('{"provenance":{"sourceCommit":"recorded"}}') },
    ...files.slice(1),
  ];
  assert.deepEqual(normalizeNewSubmissionMarkdown(bound), bound);
});

test("preserves hash-bound submissions and malformed metadata without rewriting claims", () => {
  for (const [name, metadata] of [
    ["metadata.json", '{"provenance":{"importedPromptSha256":"sha256:recorded"}}'],
    ["metadata.yaml", "provenance:\n  importedGuideSha256: sha256:recorded\n"],
    ["metadata.yml", "coverImageSourceHash: sha256:recorded\n"],
    ["metadata.json", '{"source":{"importedFiles":[{"sha256":"recorded"}]}}'],
    ["metadata.json", "invalid metadata"],
  ]) {
    const files = [
      { relativePath: name, mode: "100644", data: Buffer.from(metadata) },
      { relativePath: "README.md", mode: "100644", data: Buffer.from("Keep authored bytes \n") },
    ];
    assert.deepEqual(normalizeNewSubmissionMarkdown(files), files);
  }
});

test("leaves non-Markdown, invalid UTF-8, binary data, and BOM/line endings intact", () => {
  const files = [
    { relativePath: "metadata.json", data: Buffer.from("{}") },
    { relativePath: "README.md", data: Buffer.from("\uFEFFProse \r\n") },
    { relativePath: "script.py", data: Buffer.from("print('keep') \n") },
    { relativePath: "invalid.md", data: Buffer.from([0xff, 0x20, 0x0a]) },
    { relativePath: "binary.md", data: Buffer.from("binary\0 \n") },
  ];
  const result = normalizeNewSubmissionMarkdown(files);
  assert.equal(result[1].data.toString(), "\uFEFFProse\r\n");
  for (const index of [0, 2, 3, 4]) assert.deepEqual(result[index], files[index]);
});

test("handles cyclic and shared YAML aliases without repeatedly traversing their objects", () => {
  const aliases = ["level0: &level0 {self: *level0}"];
  for (let index = 1; index <= 35; index++) {
    aliases.push(`level${index}: &level${index} [*level${index - 1}, *level${index - 1}]`);
  }
  aliases.push("provenance: {importedGuideSha256: 'sha256:recorded'}");
  const files = [
    { relativePath: "metadata.yaml", data: Buffer.from(aliases.join("\n")) },
    { relativePath: "README.md", data: Buffer.from("Preserve hash-bound prose \n") },
  ];
  assert.deepEqual(normalizeNewSubmissionMarkdown(files), files);
});
