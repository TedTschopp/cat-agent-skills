/**
 * Copy only submission directories that exist in Microsoft's catalog but not
 * in this fork. Existing submissions and all fork-owned application code are
 * deliberately immutable. The local importer generates library artifacts for
 * the copied slugs in a later, separately validated workflow step.
 */
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { assertUniquePortablePaths } from "./portable-paths.mjs";

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_FILES_PER_SUBMISSION = 2_000;
const MAX_TOTAL_BYTES_PER_SUBMISSION = 100 * 1024 * 1024;

const GENERATED_CONTENT_PATHS = (slug) => [
  `src/content/skills/${slug}.md`,
  `src/content/prompts/${slug}.md`,
  `src/content/artifacts/${slug}.md`,
];
const GENERATED_PATHS = (slug) => [
  ...GENERATED_CONTENT_PATHS(slug),
  `src/content/artifact-payloads/${slug}.json`,
  `src/content/guides/${slug}.md`,
  `public/bundles/${slug}.zip`,
  `public/bundles/${slug}.json`,
  `public/bundles/${slug}.prompt.md`,
  `public/bundles/${slug}`,
];
const PUBLIC_CATALOG_PATH = "public/assets.json";

function gitText(repoRoot, args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function gitBuffer(repoRoot, args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "buffer",
    maxBuffer: 256 * 1024 * 1024,
  });
}

function assertSafeSlug(slug, source) {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(`${source} contains an unsafe submission directory: ${slug}`);
  }
}

function listUpstreamSubmissionSlugs(repoRoot, upstreamRef) {
  const output = gitText(repoRoot, [
    "ls-tree",
    "-z",
    "-d",
    "--name-only",
    `${upstreamRef}:submissions`,
  ]);

  const slugs = [];
  for (const name of output.split("\0").filter(Boolean)) {
    if (name.startsWith(".") || name.startsWith("_")) continue;
    assertSafeSlug(name, upstreamRef);
    slugs.push(name);
  }
  return slugs.sort();
}

function listLocalSubmissionSlugs(repoRoot) {
  const submissionsDir = join(repoRoot, "submissions");
  if (!existsSync(submissionsDir)) return [];

  return readdirSync(submissionsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith(".") && !name.startsWith("_"))
    .map((name) => {
      assertSafeSlug(name, "the local repository");
      return name;
    })
    .sort();
}

function existingGeneratedPaths(repoRoot, slug) {
  return GENERATED_PATHS(slug).filter((path) => existsSync(join(repoRoot, path)));
}

function existingGeneratedContentPaths(repoRoot, slug) {
  return GENERATED_CONTENT_PATHS(slug).filter((path) => existsSync(join(repoRoot, path)));
}

function isGeneratedPathForSlug(path, slug) {
  return (
    GENERATED_PATHS(slug).includes(path) ||
    path.startsWith(`public/bundles/${slug}/`)
  );
}

/** Build a fail-closed plan without changing the worktree. */
export function planUpstreamSync({ repoRoot, upstreamRef }) {
  const root = resolve(repoRoot);
  const upstreamSha = gitText(root, ["rev-parse", `${upstreamRef}^{commit}`]).trim();
  const upstreamSlugs = listUpstreamSubmissionSlugs(root, upstreamRef);
  const localSlugs = listLocalSubmissionSlugs(root);
  const newSlugs = [];

  for (const slug of upstreamSlugs) {
    const localPath = join(root, "submissions", slug);
    if (existsSync(localPath)) {
      if (!lstatSync(localPath).isDirectory()) {
        throw new Error(`refusing to overwrite non-directory path: submissions/${slug}`);
      }
      continue;
    }

    const collisions = existingGeneratedPaths(root, slug);
    if (collisions.length > 0) {
      throw new Error(
        `submission ${slug} is new, but generated path(s) already exist: ${collisions.join(", ")}`,
      );
    }
    newSlugs.push(slug);
  }

  // Reconcile only slugs Microsoft actually publishes. Local-only submissions
  // remain under the fork's normal contribution workflow.
  const pendingGeneratedSlugs = upstreamSlugs.filter((slug) => {
    const contentPaths = existingGeneratedContentPaths(root, slug);
    if (contentPaths.length > 1) {
      throw new Error(
        `submission ${slug} has multiple generated catalog pages: ${contentPaths.join(", ")}`,
      );
    }
    return contentPaths.length === 0;
  }).sort();

  for (const slug of pendingGeneratedSlugs) {
    const partialArtifacts = existingGeneratedPaths(root, slug);
    if (partialArtifacts.length > 0) {
      throw new Error(
        `submission ${slug} is only partially generated; refusing automatic overwrite: ` +
          partialArtifacts.join(", "),
      );
    }
  }

  return {
    upstreamRef,
    upstreamSha,
    upstreamSlugs,
    localSlugs,
    newSlugs,
    pendingGeneratedSlugs,
    existingUpstreamSlugCount: upstreamSlugs.length - newSlugs.length,
  };
}

function readSubmissionTree(repoRoot, upstreamRef, slug) {
  const prefix = `submissions/${slug}/`;
  const output = gitText(repoRoot, [
    "ls-tree",
    "-r",
    "-z",
    "--full-tree",
    upstreamRef,
    "--",
    `submissions/${slug}`,
  ]);
  const records = output.split("\0").filter(Boolean);

  if (records.length === 0) {
    throw new Error(`${upstreamRef}:${prefix} contains no files`);
  }
  if (records.length > MAX_FILES_PER_SUBMISSION) {
    throw new Error(`${slug} exceeds the ${MAX_FILES_PER_SUBMISSION}-file safety limit`);
  }

  const treeEntries = [];
  for (const record of records) {
    const match = /^(\d{6}) (\w+) ([0-9a-f]+)\t(.+)$/.exec(record);
    if (!match) throw new Error(`could not parse upstream tree entry: ${record}`);

    const [, mode, type, objectId, path] = match;
    if (type !== "blob" || (mode !== "100644" && mode !== "100755")) {
      throw new Error(`unsupported upstream entry ${path} (${mode} ${type}); symlinks are not copied`);
    }
    if (!path.startsWith(prefix)) {
      throw new Error(`upstream tree escaped the expected submission path: ${path}`);
    }

    const relativePath = path.slice(prefix.length);
    const segments = relativePath.split("/");
    if (
      !relativePath ||
      relativePath.startsWith("/") ||
      segments.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          segment.toLowerCase() === ".git" ||
          /[\u0000-\u001f\u007f]/.test(segment),
      )
    ) {
      throw new Error(`unsafe upstream path: ${path}`);
    }

    treeEntries.push({ mode, objectId, path, relativePath });
  }

  assertUniquePortablePaths(
    treeEntries.map((entry) => entry.relativePath),
    `${upstreamRef}:submissions/${slug}`,
  );

  const files = [];
  let totalBytes = 0;
  for (const entry of treeEntries) {
    const data = gitBuffer(repoRoot, ["cat-file", "blob", entry.objectId]);
    totalBytes += data.length;
    if (totalBytes > MAX_TOTAL_BYTES_PER_SUBMISSION) {
      throw new Error(`${slug} exceeds the 100 MiB safety limit`);
    }
    files.push({ mode: entry.mode, relativePath: entry.relativePath, data });
  }
  return files;
}

function copyNewSubmissions(repoRoot, upstreamRef, slugs) {
  if (slugs.length === 0) return;

  const submissionsDir = join(repoRoot, "submissions");
  mkdirSync(submissionsDir, { recursive: true });
  const stagingRoot = mkdtempSync(join(submissionsDir, ".upstream-sync-"));
  const movedTargets = [];

  try {
    for (const slug of slugs) {
      const files = readSubmissionTree(repoRoot, upstreamRef, slug);
      const stagedSubmission = join(stagingRoot, slug);
      for (const file of files) {
        const destination = join(stagedSubmission, ...file.relativePath.split("/"));
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, file.data);
        chmodSync(destination, file.mode === "100755" ? 0o755 : 0o644);
      }
    }

    for (const slug of slugs) {
      const target = join(submissionsDir, slug);
      if (existsSync(target)) {
        throw new Error(`submission appeared during sync; refusing to overwrite: ${slug}`);
      }
      renameSync(join(stagingRoot, slug), target);
      movedTargets.push(target);
    }
  } catch (error) {
    for (const target of movedTargets.reverse()) {
      rmSync(target, { recursive: true, force: true });
    }
    throw error;
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true });
  }
}

/** Copy the planned new directories atomically; checkOnly returns the same plan. */
export function syncUpstreamSubmissions({
  repoRoot,
  upstreamRef,
  checkOnly = false,
  logger = console.log,
}) {
  const plan = planUpstreamSync({ repoRoot, upstreamRef });
  if (!checkOnly) copyNewSubmissions(resolve(repoRoot), upstreamRef, plan.newSlugs);

  if (plan.newSlugs.length > 0) {
    logger(
      `${checkOnly ? "Would copy" : "Copied"} ${plan.newSlugs.length} new Microsoft ` +
        `submission(s): ${plan.newSlugs.join(", ")}`,
    );
  } else {
    logger("No new Microsoft submission directories were found.");
  }

  if (plan.pendingGeneratedSlugs.length > 0) {
    logger(
      `Gallery artifacts are missing for ${plan.pendingGeneratedSlugs.length} submission(s): ` +
        plan.pendingGeneratedSlugs.join(", "),
    );
  } else {
    logger("Every local submission already has a generated gallery entry.");
  }
  return plan;
}

function parseStatus(repoRoot) {
  const output = gitBuffer(repoRoot, [
    "status",
    "--porcelain=v1",
    "-z",
    "--untracked-files=all",
  ]).toString("utf8");
  const chunks = output.split("\0");
  const entries = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const record = chunks[index];
    if (!record) continue;
    const status = record.slice(0, 2);
    const path = record.slice(3);
    entries.push({ status, path });
    if (status.includes("R") || status.includes("C")) {
      const sourcePath = chunks[index + 1];
      if (sourcePath) entries.push({ status, path: sourcePath });
      index += 1;
    }
  }
  return entries;
}

function parseSlugList(value, label) {
  if (!value) return [];
  const slugs = [...new Set(value.split(",").filter(Boolean))];
  for (const slug of slugs) assertSafeSlug(slug, label);
  return slugs.sort();
}

/** Ensure the generator created additions only, within the exact slug allowlist. */
export function verifySyncWorktree({ repoRoot, newSlugs, generatedSlugs }) {
  const root = resolve(repoRoot);
  const newSet = new Set(newSlugs);
  const entries = parseStatus(root);
  const unexpected = [];

  for (const entry of entries) {
    const submissionSlug = entry.path.startsWith("submissions/")
      ? entry.path.split("/")[1]
      : undefined;
    const allowed =
      (submissionSlug && newSet.has(submissionSlug)) ||
      generatedSlugs.some((slug) => isGeneratedPathForSlug(entry.path, slug)) ||
      (generatedSlugs.length > 0 && entry.path === PUBLIC_CATALOG_PATH);
    const additionOnly = entry.status === "??" || entry.status === "A ";
    const catalogUpdate =
      entry.path === PUBLIC_CATALOG_PATH &&
      generatedSlugs.length > 0 &&
      ["??", "A ", " M", "M ", "MM"].includes(entry.status);
    if (!allowed || (!additionOnly && !catalogUpdate)) {
      unexpected.push(`${entry.status} ${entry.path}`);
    }
  }

  for (const slug of newSlugs) {
    if (!entries.some((entry) => entry.path.startsWith(`submissions/${slug}/`))) {
      unexpected.push(`missing copied submission files for ${slug}`);
    }
  }
  for (const slug of generatedSlugs) {
    const generatedContent = entries.filter((entry) =>
      GENERATED_CONTENT_PATHS(slug).includes(entry.path),
    );
    if (generatedContent.length === 0) {
      unexpected.push(`missing generated library page for ${slug}`);
    } else if (generatedContent.length > 1) {
      unexpected.push(
        `multiple generated library pages for ${slug}: ` +
          generatedContent.map((entry) => entry.path).join(", "),
      );
    }
  }

  if (unexpected.length > 0) {
    throw new Error(
      "upstream sync changed files outside the addition-only allowlist:\n" +
        unexpected.map((item) => `  - ${item}`).join("\n"),
    );
  }

  return { changed: entries.length > 0, entries };
}

function appendOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${String(value)}\n`);
}

function appendSummary(markdown) {
  if (!process.env.GITHUB_STEP_SUMMARY) return;
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}

function parseCliArgs(args) {
  const options = {
    checkOnly: false,
    repoRoot: process.cwd(),
    upstreamRef: "upstream/main",
    verifyWorktree: false,
    newSlugs: [],
    generatedSlugs: [],
  };

  const nextValue = (index, flag, allowEmpty = false) => {
    if (index + 1 >= args.length) throw new Error(`${flag} requires a value`);
    const value = args[index + 1];
    if (!allowEmpty && !value) throw new Error(`${flag} requires a value`);
    return value;
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--check") options.checkOnly = true;
    else if (arg === "--verify-worktree") options.verifyWorktree = true;
    else if (arg === "--repo-root") {
      options.repoRoot = nextValue(index, arg);
      index += 1;
    } else if (arg === "--upstream-ref") {
      options.upstreamRef = nextValue(index, arg);
      index += 1;
    } else if (arg === "--new-slugs") {
      options.newSlugs = parseSlugList(nextValue(index, arg, true), "--new-slugs");
      index += 1;
    } else if (arg === "--generated-slugs") {
      options.generatedSlugs = parseSlugList(
        nextValue(index, arg, true),
        "--generated-slugs",
      );
      index += 1;
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  return options;
}

function main() {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.verifyWorktree) {
    const result = verifySyncWorktree({
      repoRoot: options.repoRoot,
      newSlugs: options.newSlugs,
      generatedSlugs: options.generatedSlugs,
    });
    appendOutput("changed", result.changed);
    appendOutput("changed_count", result.entries.length);
    appendSummary(
      `\n### Addition-only scope check\n\n` +
        `Validated ${result.entries.length} changed path(s); no existing files were overwritten.\n`,
    );
    console.log(`Addition-only scope check passed for ${result.entries.length} changed path(s).`);
    return;
  }

  const plan = syncUpstreamSubmissions({
    repoRoot: options.repoRoot,
    upstreamRef: options.upstreamRef,
    checkOnly: options.checkOnly,
  });
  const importArgs = plan.pendingGeneratedSlugs
    .flatMap((slug) => ["--slug", slug])
    .join(" ");

  appendOutput("upstream_sha", plan.upstreamSha);
  appendOutput("new_submission_count", plan.newSlugs.length);
  appendOutput("new_submission_slugs", plan.newSlugs.join(","));
  appendOutput("pending_count", plan.pendingGeneratedSlugs.length);
  appendOutput("pending_slugs", plan.pendingGeneratedSlugs.join(","));
  appendOutput("import_args", importArgs);
  appendOutput("needs_import", plan.pendingGeneratedSlugs.length > 0);

  const newList = plan.newSlugs.length > 0 ? plan.newSlugs.join(", ") : "None";
  const pendingList =
    plan.pendingGeneratedSlugs.length > 0
      ? plan.pendingGeneratedSlugs.join(", ")
      : "None";
  appendSummary(
    `## Microsoft Catalog Sync\n\n` +
      `- Upstream commit: \`${plan.upstreamSha}\`\n` +
      `- New submission directories: ${newList}\n` +
      `- Gallery entries to generate: ${pendingList}\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n\u2717 ${message}`);
    process.exit(1);
  }
}
