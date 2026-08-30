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

  const scope = verifySyncWorktree({
    repoRoot: repo,
    newSlugs: ["new-skill"],
    generatedSlugs: [],
  });
  assert.equal(scope.changed, true);
  assert.ok(scope.entries.every((entry) => entry.path.startsWith("submissions/new-skill/")));

  write(repo, "src/styles/unexpected.css", "unsafe\n");
  assert.throws(
    () =>
      verifySyncWorktree({
        repoRoot: repo,
        newSlugs: ["new-skill"],
        generatedSlugs: [],
      }),
    /outside the addition-only allowlist/,
  );
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
});
