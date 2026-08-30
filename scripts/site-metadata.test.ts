import assert from "node:assert/strict";
import test from "node:test";
import { compactDescription, toIsoDate } from "../src/lib/site-metadata";

test("compactDescription normalizes whitespace without changing short prose", () => {
  assert.equal(compactDescription("A short\n description.  "), "A short description.");
});

test("compactDescription shortens long prose at a word boundary", () => {
  const result = compactDescription("word ".repeat(80), 100);
  assert.ok(result.length <= 100);
  assert.ok(result.endsWith("…"));
  assert.ok(!result.endsWith(" …"));
});

test("toIsoDate accepts valid dates and rejects invalid values", () => {
  assert.equal(toIsoDate("2026-08-29"), "2026-08-29T00:00:00.000Z");
  assert.equal(toIsoDate("not-a-date"), undefined);
});
