import assert from "node:assert/strict";
import { test } from "node:test";
import { assertUniquePortablePaths, portablePathKey } from "./portable-paths.mjs";

test("rejects traversal aliases and platform-reserved path components", () => {
  assert.throws(
    () => portablePathKey("zz\\..\\SKILL.md", "test payload"),
    /backslashes are not portable path separators/,
  );
  assert.throws(() => portablePathKey("assets/CON.txt"), /reserved path component/);
  assert.throws(() => portablePathKey("assets/COM¹.log"), /reserved path component/);
  assert.throws(() => portablePathKey("assets/report. "), /end in a dot or space/);
});

test("rejects case-folded, Unicode-normalized, and file-directory collisions", () => {
  assert.throws(
    () => assertUniquePortablePaths(["assets/Guide.md", "assets/guide.md"]),
    /portable path collision/,
  );
  assert.throws(
    () => assertUniquePortablePaths(["Cafe\u0301/readme.txt", "Caf\u00e9/other.txt"]),
    /portable path collision/,
  );
  for (const aliases of [
    ["Σ.txt", "ς.txt"],
    ["ß.txt", "ss.txt"],
    ["ẞ.txt", "ss.txt"],
    ["ſ.txt", "s.txt"],
    ["ﬀ.txt", "ff.txt"],
  ]) {
    assert.throws(
      () => assertUniquePortablePaths(aliases),
      /portable path collision/,
      `expected Unicode case-fold aliases ${aliases.join(" and ")} to collide`,
    );
  }
  assert.throws(
    () => assertUniquePortablePaths(["assets", "assets/data.json"]),
    /portable path collision/,
  );
});

test("allows a normal portable hierarchy", () => {
  assert.doesNotThrow(() =>
    assertUniquePortablePaths([
      "SKILL.md",
      "assets/example.json",
      "references/guide.md",
      "scripts/run.sh",
    ]),
  );
});
