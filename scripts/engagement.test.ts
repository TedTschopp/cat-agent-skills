import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getSkillEngagement,
  normalizeSkillEngagement,
} from "../src/lib/engagement.ts";
import { getRating } from "../src/lib/ratings.ts";

const responses = {
  microsoft: {
    rating: 12,
    comments: 8,
    discussions: [{ number: 1, url: "https://github.com/microsoft/cat-agent-skills/discussions/1" }],
  },
  local: {
    rating: 3,
    comments: 2,
    discussions: [{ number: 2, url: "https://github.com/TedTschopp/cat-agent-skills/discussions/2" }],
  },
  total: { rating: 999, comments: 999 },
};

test("local-only engagement ignores Microsoft responses while preserving local counts and threads", () => {
  const engagement = normalizeSkillEngagement(responses, false);
  assert.deepEqual(engagement.microsoft, { rating: 0, comments: 0, discussions: [] });
  assert.deepEqual(engagement.local, responses.local);
  assert.deepEqual(engagement.total, { rating: 3, comments: 2 });
});

test("upstream engagement combines source counts without trusting redundant totals", () => {
  const engagement = normalizeSkillEngagement(responses, true);
  assert.deepEqual(engagement.microsoft, responses.microsoft);
  assert.deepEqual(engagement.local, responses.local);
  assert.deepEqual(engagement.total, { rating: 15, comments: 10 });
});

test("ratings used by sorting and badges agree with the source-aware engagement total", () => {
  for (const slug of ["chart-builder", "breathing-room", "ted-writing-style", "unknown-entry"]) {
    assert.equal(getRating(slug), getSkillEngagement(slug).total.rating);
  }
  assert.equal(getRating("unknown-entry"), 0);
});
