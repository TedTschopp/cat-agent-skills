import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { verifyRenderedMarkdown } from "./verify-rendered-markdown.mjs";

function write(repo: string, path: string, content: string): void {
  const destination = join(repo, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function repositoryWithSkill(slug: string, markdown: string): string {
  const repo = mkdtempSync(join(tmpdir(), "cat-rendered-markdown-"));
  write(repo, `src/content/skills/${slug}.md`, markdown);
  return repo;
}

test("allows inert HTML and unsafe-URL examples in inline and fenced code", (t) => {
  const repo = repositoryWithSkill(
    "safe-examples",
    `---
name: Safe Examples
---
# Safe examples

Use \`<script src="javascript:alert(1)"></script>\` only as an example.

\`\`\`html
<iframe srcdoc="<script>alert(1)</script>"></iframe>
<img src="data:text/html,unsafe">
\`\`\`

<details><summary>Allowed disclosure</summary>Plain content.</details>

[An ordinary link](https://example.com)
`,
  );
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  write(
    repo,
    "src/content/guides/safe-examples.md",
    "A guide with `![bad](javascript:alert(1))` shown as code.\n",
  );

  assert.deepEqual(verifyRenderedMarkdown({ repoRoot: repo, generatedSlugs: ["safe-examples"] }), {
    files: [
      "src/content/guides/safe-examples.md",
      "src/content/skills/safe-examples.md",
    ],
  });
});

test("rejects every blocked active HTML element", (t) => {
  const tags = [
    "applet",
    "base",
    "embed",
    "frame",
    "frameset",
    "iframe",
    "link",
    "math",
    "meta",
    "object",
    "script",
    "style",
    "svg",
  ];
  const repo = repositoryWithSkill(
    "active-elements",
    tags.map((tag) => `<${tag}>unsafe</${tag}>`).join("\n\n"),
  );
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  assert.throws(
    () => verifyRenderedMarkdown({ repoRoot: repo, generatedSlugs: ["active-elements"] }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      for (const tag of tags) assert.match(error.message, new RegExp(`<${tag}>`));
      return true;
    },
  );
});

test("rejects event handlers, srcdoc, and dangerous raw or Markdown URLs", (t) => {
  const repo = repositoryWithSkill(
    "active-attributes",
    `# Unsafe attributes

<div onclick="alert(1)">handler</div>
<div srcdoc="unsafe">document</div>
<a href="&#x6a;avascript:alert(1)">raw link</a>
<div style="background: url('data:text/html,unsafe')">style URL</div>

[Markdown JavaScript](javascript:alert(1))
[Markdown VBScript](vbscript:msgbox(1))
![Markdown data image](data:text/html;base64,PHNjcmlwdD4=)
`,
  );
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  assert.throws(
    () => verifyRenderedMarkdown({ repoRoot: repo, generatedSlugs: ["active-attributes"] }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /event-handler attribute/);
      assert.match(error.message, /"srcdoc" attribute/);
      assert.match(error.message, /javascript: URL/);
      assert.match(error.message, /vbscript: URL/);
      assert.match(error.message, /data: URL/);
      return true;
    },
  );
});

test("rejects active content inside declarative shadow DOM templates", (t) => {
  const repo = repositoryWithSkill(
    "shadow-template",
    `<div>
  <template shadowrootmode="open">
    <img src="missing" onerror="alert(document.domain)">
  </template>
</div>
`,
  );
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  assert.throws(
    () => verifyRenderedMarkdown({ repoRoot: repo, generatedSlugs: ["shadow-template"] }),
    /blocked event-handler attribute "onError"/,
  );
});

test("fails closed when the expected generated skill page is missing", (t) => {
  const repo = mkdtempSync(join(tmpdir(), "cat-rendered-markdown-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  assert.throws(
    () => verifyRenderedMarkdown({ repoRoot: repo, generatedSlugs: ["missing-skill"] }),
    /missing generated Markdown required for verification/,
  );
});

test("validates prompt, generic artifact, and guide Markdown by exact generated path", (t) => {
  const repo = mkdtempSync(join(tmpdir(), "cat-rendered-markdown-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  write(repo, "src/content/prompts/example-prompt.md", "# Safe prompt\n");
  write(repo, "src/content/artifacts/example-instructions.md", "# Safe instructions\n");
  write(repo, "src/content/guides/example-prompt.md", "# Safe guide\n");

  assert.deepEqual(
    verifyRenderedMarkdown({
      repoRoot: repo,
      generatedFiles: [
        "src/content/prompts/example-prompt.md",
        "src/content/artifacts/example-instructions.md",
        "src/content/guides/example-prompt.md",
      ],
    }),
    {
      files: [
        "src/content/artifacts/example-instructions.md",
        "src/content/guides/example-prompt.md",
        "src/content/prompts/example-prompt.md",
      ],
    },
  );
});

test("rejects active content in generated prompt and generic artifact pages", (t) => {
  const repo = mkdtempSync(join(tmpdir(), "cat-rendered-markdown-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  write(repo, "src/content/prompts/unsafe-prompt.md", '<img src="x" onerror="alert(1)">\n');
  write(repo, "src/content/artifacts/unsafe-instructions.md", '<a href="javascript:alert(1)">run</a>\n');

  assert.throws(
    () =>
      verifyRenderedMarkdown({
        repoRoot: repo,
        generatedFiles: [
          "src/content/prompts/unsafe-prompt.md",
          "src/content/artifacts/unsafe-instructions.md",
        ],
      }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /src\/content\/prompts\/unsafe-prompt\.md: blocked event-handler/);
      assert.match(error.message, /src\/content\/artifacts\/unsafe-instructions\.md: blocked javascript: URL/);
      return true;
    },
  );
});

test("rejects generated Markdown paths outside public content collections", (t) => {
  const repo = mkdtempSync(join(tmpdir(), "cat-rendered-markdown-"));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  write(repo, "README.md", "# Not generated content\n");

  assert.throws(
    () =>
      verifyRenderedMarkdown({
        repoRoot: repo,
        generatedFiles: ["README.md"],
      }),
    /unsafe or unsupported generated Markdown path/,
  );
});
