import { execFileSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  planUpstreamSync,
  syncUpstreamSubmissions,
  verifySyncWorktree,
} from "./sync-upstream-submissions.mjs";

function git(repo: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
}

function write(repo: string, path: string, content: string): void {
  const destination = join(repo, path);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

function initializeRepository(): string {
  const repo = mkdtempSync(join(tmpdir(), "cat-upstream-sync-"));
  git(repo, "init", "-b", "main");
  git(repo, "config", "user.name", "Test Bot");
  git(repo, "config", "user.email", "test@example.com");

  write(repo, "submissions/existing/metadata.json", '{"name":"Existing"}\n');
  write(repo, "submissions/existing/SKILL.md", "local existing instructions\n");
  write(repo, "submissions/_template/SKILL.md", "ignored template\n");
  write(repo, "src/content/skills/existing.md", "generated existing page\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "local baseline");
  return repo;
}

test("copies only absent upstream submissions and preserves existing local content", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  git(repo, "switch", "-c", "microsoft-main");
  write(repo, "submissions/existing/SKILL.md", "upstream replacement that must not win\n");
  write(repo, "submissions/new-skill/metadata.json", '{"name":"New Skill"}\n');
  write(repo, "submissions/new-skill/SKILL.md", "new instructions\n");
  write(repo, "submissions/new-skill/scripts/run.sh", "#!/bin/sh\nexit 0\n");
  chmodSync(join(repo, "submissions/new-skill/scripts/run.sh"), 0o755);
  write(repo, "submissions/_template-next/SKILL.md", "ignored template\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "upstream additions");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  const plan = planUpstreamSync({ repoRoot: repo, upstreamRef });
  assert.deepEqual(plan.newSlugs, ["new-skill"]);
  assert.deepEqual(plan.pendingGeneratedSlugs, ["new-skill"]);

  syncUpstreamSubmissions({
    repoRoot: repo,
    upstreamRef,
    checkOnly: true,
    logger: () => {},
  });
  assert.equal(existsSync(join(repo, "submissions/new-skill")), false);
  assert.equal(existsSync(join(repo, "src/data/microsoft-catalog.json")), false);

  syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} });
  assert.equal(
    readFileSync(join(repo, "submissions/existing/SKILL.md"), "utf8"),
    "local existing instructions\n",
  );
  assert.equal(
    readFileSync(join(repo, "submissions/new-skill/SKILL.md"), "utf8"),
    "new instructions\n",
  );
  assert.notEqual(statSync(join(repo, "submissions/new-skill/scripts/run.sh")).mode & 0o111, 0);
  assert.deepEqual(
    JSON.parse(readFileSync(join(repo, "src/data/microsoft-catalog.json"), "utf8")),
    ["existing", "new-skill"],
  );

  const scope = verifySyncWorktree({
    repoRoot: repo,
    newSlugs: ["new-skill"],
    generatedSlugs: [],
    upstreamRef,
  });
  assert.equal(scope.changed, true);
  assert.ok(scope.entries.every((entry) =>
    entry.path.startsWith("submissions/new-skill/") || entry.path === "src/data/microsoft-catalog.json",
  ));

  write(repo, "src/styles/unexpected.css", "unsafe\n");
  assert.throws(
    () =>
      verifySyncWorktree({
        repoRoot: repo,
        newSlugs: ["new-skill"],
        generatedSlugs: [],
        upstreamRef,
      }),
    /outside the addition-only allowlist/,
  );
});

test("upstream sync never resurrects a consolidated submission or regenerates its catalog record", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  git(repo, "switch", "-c", "microsoft-main");
  for (const slug of ["retired-skill", "new-skill"]) {
    write(repo, `submissions/${slug}/SKILL.md`, "upstream instructions\n");
    write(repo, `submissions/${slug}/metadata.json`, '{"name":"Upstream Skill"}\n');
  }
  git(repo, "add", "."); git(repo, "commit", "-m", "upstream additions");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");
  write(repo, "src/data/asset-consolidations.json", JSON.stringify({ schemaVersion: 1, entries: [{
    slug: "retired-skill", kind: "skill", name: "Retired Skill", replacementSlug: "existing", replacementKind: "skill",
    legacyPaths: [], legacyDownloads: [{ path: "bundles/retired-skill.zip", sha256: `sha256:${"a".repeat(64)}` }],
    reason: "Consolidated into the existing skill.", source: { commit: upstreamRef, path: "submissions/retired-skill", author: "Original Author" },
  }] }));
  write(repo, "public/bundles/retired-skill.zip", "preserved legacy package\n");
  const plan = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} });
  assert.deepEqual(plan.newSlugs, ["new-skill"]);
  assert.deepEqual(plan.pendingGeneratedSlugs, ["new-skill"]);
  assert.equal(existsSync(join(repo, "submissions/retired-skill")), false);
  assert.ok(plan.upstreamSlugs.includes("retired-skill"));
  assert.equal(readFileSync(join(repo, "public/bundles/retired-skill.zip"), "utf8"), "preserved legacy package\n");
});

test("fails closed on upstream symlinks without leaving a partial submission", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  git(repo, "switch", "-c", "microsoft-main");
  write(repo, "submissions/symlink-skill/metadata.json", '{"name":"Symlink Skill"}\n');
  write(repo, "submissions/symlink-skill/SKILL.md", "instructions\n");
  mkdirSync(join(repo, "submissions/symlink-skill/assets"), { recursive: true });
  symlinkSync("../SKILL.md", join(repo, "submissions/symlink-skill/assets/link"));
  git(repo, "add", ".");
  git(repo, "commit", "-m", "unsafe upstream symlink");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  assert.throws(
    () => syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} }),
    /symlinks are not copied/,
  );
  assert.equal(existsSync(join(repo, "submissions/symlink-skill")), false);
});

test("new Microsoft Markdown passes the staged whitespace gate without touching existing sources", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const existing = "existing local content must remain byte-identical \n";
  write(repo, "submissions/existing/SKILL.md", existing);
  git(repo, "add", ".");
  git(repo, "commit", "-m", "existing authored whitespace");
  git(repo, "switch", "-c", "microsoft-main");

  // These are the accidental single-space endings from the September 25 run.
  const skill = [
    "MAC report exports through the *Copilot Adoption Analysis* framework ",
    "public framework approach such as Microsoft Adoption toolkit or M365 Copilot ",
    "Adoption Guide. Entire framework is within explained within references) ",
    "",
  ].join("\n");
  const slug = "create-copilot-adoption-dashboard";
  write(repo, `submissions/${slug}/metadata.json`, '{"name":"Copilot Adoption Dashboard"}\n');
  write(repo, `submissions/${slug}/SKILL.md`, skill);
  write(repo, `submissions/${slug}/README.md`, "exports to compare, so they aren't reported. \n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "upstream whitespace regression");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  const plan = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} });
  assert.deepEqual(plan.newSlugs, [slug]);
  assert.equal(readFileSync(join(repo, "submissions/existing/SKILL.md"), "utf8"), existing);
  const cleanedSkill = readFileSync(join(repo, `submissions/${slug}/SKILL.md`), "utf8");
  assert.equal(cleanedSkill, skill.replace(/ +$/gm, ""));
  assert.equal(git(repo, "show", `${upstreamRef}:submissions/${slug}/SKILL.md`), skill.trim());
  git(repo, "add", `submissions/${slug}`);
  assert.equal(git(repo, "diff", "--cached", "--check"), "");
  assert.equal(verifySyncWorktree({ repoRoot: repo, newSlugs: [slug], generatedSlugs: [], upstreamRef }).changed, true);

  const second = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} });
  assert.deepEqual(second.newSlugs, []);
  assert.equal(readFileSync(join(repo, `submissions/${slug}/SKILL.md`), "utf8"), cleanedSkill);
});

test("new submission blank Markdown lines and JSON EOF pass the staged whitespace gate", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  git(repo, "switch", "-c", "microsoft-main");
  const prefix = "submissions/inbox-triage";
  const source = "1. Resolve the folder.\n   - Pass the arguments:\n     1. `create`\n     \n     Discover the parent folder.\n";
  const config = '{"folder":"Keep  "}\n\n';
  write(repo, `${prefix}/metadata.json`, '{"name":"Inbox Triage"}\n');
  write(repo, `${prefix}/SKILL.md`, source);
  write(repo, `${prefix}/assets/config.example.json`, config);
  git(repo, "add", ".");
  git(repo, "commit", "-m", "upstream blank-line whitespace");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  const plan = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} });
  assert.deepEqual(plan.newSlugs, ["inbox-triage"]);
  assert.equal(readFileSync(join(repo, prefix, "SKILL.md"), "utf8"), source.replace("     \n", "\n"));
  const cleaned = readFileSync(join(repo, prefix, "assets/config.example.json"), "utf8");
  assert.equal(cleaned, '{"folder":"Keep  "}\n');
  assert.deepEqual(JSON.parse(cleaned), JSON.parse(config));
  assert.equal(git(repo, "show", `${upstreamRef}:${prefix}/SKILL.md`), source.trim());
  git(repo, "add", prefix);
  assert.equal(git(repo, "diff", "--cached", "--check"), "");
  assert.equal(verifySyncWorktree({ repoRoot: repo, newSlugs: ["inbox-triage"], generatedSlugs: [], upstreamRef }).changed, true);
});

test("rejects non-portable upstream paths without leaving a partial submission", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  git(repo, "switch", "-c", "microsoft-main");
  write(repo, "submissions/path-alias/metadata.json", '{"name":"Path Alias"}\n');
  write(repo, "submissions/path-alias/SKILL.md", "instructions\n");
  write(repo, "submissions/path-alias/zz\\..\\SKILL.md", "shadow instructions\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "unsafe upstream path alias");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  assert.throws(
    () => syncUpstreamSubmissions({ repoRoot: repo, upstreamRef, logger: () => {} }),
    /backslashes are not portable path separators/,
  );
  assert.equal(existsSync(join(repo, "submissions/path-alias")), false);
});

test("refuses a new upstream slug when generated artifacts already collide", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  write(repo, "src/content/skills/colliding-skill.md", "orphan page\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "local orphan");
  git(repo, "switch", "-c", "microsoft-main");
  write(repo, "submissions/colliding-skill/metadata.json", '{"name":"Collision"}\n');
  write(repo, "submissions/colliding-skill/SKILL.md", "instructions\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "upstream collision");
  const upstreamRef = git(repo, "rev-parse", "HEAD");
  git(repo, "switch", "main");

  assert.throws(
    () => planUpstreamSync({ repoRoot: repo, upstreamRef }),
    /generated path\(s\) already exist/,
  );
});

test("does not generate fork-only submissions that Microsoft does not publish", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  const sharedBase = git(repo, "rev-parse", "HEAD");
  write(repo, "submissions/fork-only/metadata.json", '{"name":"Fork Only"}\n');
  write(repo, "submissions/fork-only/SKILL.md", "local instructions\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "local-only submission");

  git(repo, "branch", "microsoft-main", sharedBase);
  const plan = planUpstreamSync({ repoRoot: repo, upstreamRef: "microsoft-main" });
  assert.deepEqual(plan.newSlugs, []);
  assert.deepEqual(plan.pendingGeneratedSlugs, []);
  assert.equal(plan.catalogChanged, true);
  const first = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef: "microsoft-main", logger: () => {} });
  assert.equal(first.catalogChanged, true);
  assert.deepEqual(
    JSON.parse(readFileSync(join(repo, "src/data/microsoft-catalog.json"), "utf8")),
    ["existing"],
  );
  assert.equal(existsSync(join(repo, "src/content/skills/fork-only.md")), false);
  const second = syncUpstreamSubmissions({ repoRoot: repo, upstreamRef: "microsoft-main", logger: () => {} });
  assert.equal(second.catalogChanged, false);
});

test("catalog-only updates permit the rebuilt public catalog and reject invented Microsoft sources", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  git(repo, "branch", "microsoft-main");
  syncUpstreamSubmissions({ repoRoot: repo, upstreamRef: "microsoft-main", logger: () => {} });
  write(repo, "public/assets.json", "[]\n");
  assert.equal(verifySyncWorktree({
    repoRoot: repo,
    newSlugs: [],
    generatedSlugs: [],
    upstreamRef: "microsoft-main",
  }).changed, true);
  write(repo, "src/data/microsoft-catalog.json", '["fork-only"]\n');
  assert.throws(() => verifySyncWorktree({
    repoRoot: repo,
    newSlugs: [],
    generatedSlugs: [],
    upstreamRef: "microsoft-main",
  }), /differs from the fetched upstream submissions/);
});

test("recognizes a generic artifact page as an existing generated catalog entry", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  write(repo, "submissions/existing-artifact/metadata.json", '{"name":"Artifact"}\n');
  write(repo, "submissions/existing-artifact/AGENTS.md", "instructions\n");
  write(repo, "src/content/artifacts/existing-artifact.md", "generated artifact\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "add generated generic artifact");
  git(repo, "branch", "microsoft-main");

  const plan = planUpstreamSync({ repoRoot: repo, upstreamRef: "microsoft-main" });
  assert.deepEqual(plan.pendingGeneratedSlugs, []);
});

test("allows one generated generic page, its payload tree, and the shared catalog", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  write(repo, "public/assets.json", "[]\n");
  git(repo, "add", ".");
  git(repo, "commit", "-m", "track public catalog");

  write(repo, "src/content/artifacts/new-instructions.md", "generated page\n");
  write(repo, "src/content/guides/new-instructions.md", "generated guide\n");
  write(repo, "public/bundles/new-instructions/rules/AGENTS.md", "payload\n");
  write(repo, "public/assets.json", '[{"slug":"new-instructions"}]\n');

  const scope = verifySyncWorktree({
    repoRoot: repo,
    newSlugs: [],
    generatedSlugs: ["new-instructions"],
  });
  assert.equal(scope.changed, true);
  assert.ok(scope.entries.some((entry) => entry.path === "public/assets.json"));

  write(repo, "src/content/prompts/new-instructions.md", "ambiguous page\n");
  assert.throws(
    () =>
      verifySyncWorktree({
        repoRoot: repo,
        newSlugs: [],
        generatedSlugs: ["new-instructions"],
      }),
    /multiple generated library pages/,
  );
});

test("does not allow the shared catalog to change without generated slugs", (t) => {
  const repo = initializeRepository();
  t.after(() => rmSync(repo, { recursive: true, force: true }));

  write(repo, "public/assets.json", "[]\n");
  assert.throws(
    () => verifySyncWorktree({ repoRoot: repo, newSlugs: [], generatedSlugs: [] }),
    /outside the addition-only allowlist/,
  );
});
