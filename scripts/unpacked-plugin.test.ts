import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSubmission } from "./import-submissions.ts";
import { validatePluginFiles } from "./validate-plugin.ts";

function fixture(t: { after: (fn: () => void) => void }) {
  const root = mkdtempSync(join(tmpdir(), "cat-unpacked-plugin-"));
  const folder = join(root, "sample-plugin");
  mkdirSync(join(folder, "skills", "sample-skill"), { recursive: true });
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const manifest = {
    manifestVersion: "devPreview", id: "79fbc1b3-7cc9-5122-9153-a13f559ec701",
    name: { short: "Sample Plugin" }, description: { short: "A plugin." },
    icons: { color: "color.png", outline: "outline.png" },
    agentSkills: [{ folder: "./skills/sample-skill" }],
  };
  writeFileSync(join(folder, "manifest.json"), JSON.stringify(manifest));
  writeFileSync(join(folder, "metadata.json"), JSON.stringify({ name: "Catalog Title", description: "Catalog description", platforms: ["Cowork"], tags: ["test"] }));
  writeFileSync(join(folder, "README.md"), "Human-facing companion documentation.\n");
  writeFileSync(join(folder, "skills/sample-skill/SKILL.md"), "---\nname: sample-skill\ndescription: A contained skill.\n---\nFollow these instructions.\n");
  for (const [name, size] of [["color.png", 192], ["outline.png", 32]] as const) {
    const png = Buffer.alloc(24);
    Buffer.from([0x89, 0x50, 0x4e, 0x47]).copy(png);
    png.write("IHDR", 12); png.writeUInt32BE(size, 16); png.writeUInt32BE(size, 20);
    writeFileSync(join(folder, name), png);
  }
  return { root, folder, manifest };
}

test("unpacked Cowork manifests use existing plugin validation and retain nested skills", t => {
  const { folder } = fixture(t);
  const submission = loadSubmission(folder);
  assert.equal(submission.kind, "plugin");
  assert.equal(submission.loadProblems, undefined);
  assert.equal(submission.automationJson, undefined);
  assert.deepEqual(submission.pluginFiles!.map(f => f.path).sort(),
    ["color.png", "manifest.json", "outline.png", "skills/sample-skill/SKILL.md"]);
  const result = validatePluginFiles(submission.pluginFiles!, "sample");
  assert.deepEqual(result.problems, []);
  assert.equal(result.skills[0].name, "sample-skill");
});

test("malformed and unsafe plugin manifests fail plugin validation", t => {
  const { folder, manifest } = fixture(t);
  writeFileSync(join(folder, "manifest.json"), "invalid JSON");
  let submission = loadSubmission(folder);
  assert.equal(submission.kind, "plugin");
  assert.match(validatePluginFiles(submission.pluginFiles!, "sample").problems.join(" "), /not valid JSON/);
  manifest.agentSkills[0].folder = "../outside";
  writeFileSync(join(folder, "manifest.json"), JSON.stringify(manifest));
  submission = loadSubmission(folder);
  assert.equal(validatePluginFiles(submission.pluginFiles!, "sample").ok, false);
});

test("unpacked plugins reject mixed payloads and nested symlinks before bundling", t => {
  const { root, folder } = fixture(t);
  writeFileSync(join(folder, "SKILL.md"), "---\nname: sample-plugin\ndescription: Root skill.\n---\n");
  assert.match(loadSubmission(folder).loadProblems!.join(" "), /cannot also declare/);
  rmSync(join(folder, "SKILL.md"));
  writeFileSync(join(root, "outside.txt"), "never include");
  symlinkSync(join(root, "outside.txt"), join(folder, "skills/sample-skill/leak.txt"));
  assert.throws(() => loadSubmission(folder), /unsupported symlink/);
});

test("ordinary Scout JSON remains an automation", t => {
  const { folder } = fixture(t);
  rmSync(join(folder, "manifest.json"));
  writeFileSync(join(folder, "sample.json"), '{"name":"Scout job","description":"A job","schedule":{},"steps":[]}');
  const submission = loadSubmission(folder);
  assert.equal(submission.kind, "automation");
  assert.equal(submission.automationJsonName, "sample.json");
});
