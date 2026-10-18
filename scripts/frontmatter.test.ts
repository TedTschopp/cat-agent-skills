import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { parseFrontmatter } from "./frontmatter.ts";
import { validateSkillSource } from "./validate-skill.ts";
import { validatePromptSource } from "./validate-prompt.ts";
import { validateLibraryArtifactSource } from "./validate-library-artifact.ts";
import { validatePluginFiles } from "./validate-plugin.ts";

test("YAML metadata preserves dates, nested values, and exact body bytes", () => {
  const body = "\r\n  Indented body  \r\n---\r\nTrailing line\r\n";
  for (const language of ["", "yaml", "YML"]) {
    const result = parseFrontmatter(
      `\uFEFF---${language}\r\nname: Example\r\ncreatedAt: 2026-10-18\r\ntags: [research]\r\nvariables:\r\n  - name: question\r\n    required: true\r\n---\r\n${body}`,
    );
    assert.deepEqual(result.data, {
      name: "Example",
      createdAt: new Date("2026-10-18"),
      tags: ["research"],
      variables: [{ name: "question", required: true }],
    });
    assert.equal(result.content, body);
  }
});

test("JSON frontmatter is data and empty or absent frontmatter remains supported", () => {
  assert.deepEqual(parseFrontmatter('---json\n{"name":"Example"}\n---\nBody'), {
    data: { name: "Example" }, content: "Body",
  });
  for (const source of ["", "Plain Markdown", "----\nBody"]) {
    assert.deepEqual(parseFrontmatter(source), { data: {}, content: source });
  }
  for (const metadata of ["", "# Only a comment", "null"]) {
    assert.deepEqual(parseFrontmatter(`---\n${metadata}\n---\nBody`), {
      data: {}, content: "Body",
    });
  }
});

test("executable frontmatter labels and aliases cannot run during validation", () => {
  const probe = globalThis as typeof globalThis & { __frontmatterExecuted?: boolean };
  delete probe.__frontmatterExecuted;
  for (const language of ["js", "javascript", "JS", "JavaScript", " js ", "coffee"]) {
    const source = `---${language}\n(globalThis.__frontmatterExecuted = true, { name: "probe" })\n---\nBody`;
    assert.throws(() => parseFrontmatter(source), /unsupported frontmatter language/);
    for (const validate of [validateSkillSource, validatePromptSource, validateLibraryArtifactSource]) {
      const result = validate(source, "malicious.md");
      assert.equal(result.ok, false);
      assert.match(result.problems.join("\n"), /unsupported frontmatter language/);
    }
    const plugin = validatePluginFiles([
      { path: "manifest.json", data: Buffer.from(JSON.stringify({ agentSkills: [{ folder: "probe" }] })) },
      { path: "probe/SKILL.md", data: Buffer.from(source) },
    ], "malicious plugin");
    assert.equal(plugin.ok, false);
    assert.match(plugin.problems.join("\n"), /unsupported frontmatter language/);
    assert.equal(probe.__frontmatterExecuted, undefined);
  }
});

test("malformed frontmatter, non-mappings, and executable YAML tags fail closed", () => {
  for (const source of [
    "---\nname: Example",
    "---toml\nname = 'Example'\n---\nBody",
    "---\n- array\n---\nBody",
    "---\n42\n---\nBody",
    "---json\n[]\n---\nBody",
    "---\nname: !!js/function 'function () { return 5; }'\n---\nBody",
  ]) assert.throws(() => parseFrontmatter(source));
});

test("existing skill and prompt metadata still pass their public validators", () => {
  const root = new URL("../", import.meta.url);
  assert.equal(validateSkillSource(
    readFileSync(new URL("src/content/skills/asd-ste100.md", root), "utf8"), "existing skill",
  ).ok, true);
  assert.equal(validatePromptSource(
    readFileSync(new URL("src/content/prompts/professional-headshot-from-a-photo.md", root), "utf8"), "existing prompt",
  ).ok, true);
});
