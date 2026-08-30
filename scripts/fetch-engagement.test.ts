import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aggregateDiscussions,
  buildSnapshot,
  dedupeGiscusRecords,
  deriveRatings,
  giscusRecordsToSkills,
  parseGiscusDiscussionPage,
  positiveGiscusScore,
  positiveScore,
  retainedMicrosoftDiscussions,
  type EngagementSnapshot,
  type SourceFetch,
} from "./fetch-engagement";

const groups = (...values: Array<[string, number]>) =>
  values.map(([content, totalCount]) => ({ content, reactors: { totalCount } }));

test("positiveScore includes only positive reactions", () => {
  assert.equal(
    positiveScore(
      groups(
        ["THUMBS_UP", 2],
        ["HEART", 3],
        ["ROCKET", 1],
        ["THUMBS_DOWN", 8],
        ["CONFUSED", 5],
        ["EYES", 4],
      ),
    ),
    6,
  );
});

test("public giscus pages validate provenance and count reactions plus comment types", () => {
  const page = parseGiscusDiscussionPage(
    {
      discussion: {
        url: "https://github.com/microsoft/cat-agent-skills/discussions/98",
        repository: { nameWithOwner: "microsoft/cat-agent-skills" },
        totalCommentCount: 2,
        totalReplyCount: 3,
        reactions: {
          THUMBS_UP: { count: 2 },
          HEART: { count: 3 },
          ROCKET: { count: 1 },
          THUMBS_DOWN: { count: 50 },
          CONFUSED: { count: 40 },
        },
        pageInfo: { hasNextPage: true, endCursor: "cursor-1" },
      },
    },
    { repository: "microsoft/cat-agent-skills", expectedNumber: 98 },
  );

  assert.deepEqual(page, {
    number: 98,
    url: "https://github.com/microsoft/cat-agent-skills/discussions/98",
    rating: 6,
    topLevelComments: 2,
    replyComments: 3,
    hasNextPage: true,
    endCursor: "cursor-1",
  });
  assert.equal(
    positiveGiscusScore({ LAUGH: { count: 2 }, EYES: { count: 99 }, HOORAY: { count: 1 } }),
    3,
  );
});

test("public giscus pages reject mismatched repositories and untrusted URLs", () => {
  const baseDiscussion = {
    repository: { nameWithOwner: "microsoft/cat-agent-skills" },
    totalCommentCount: 0,
    totalReplyCount: 0,
    reactions: {},
    pageInfo: { hasNextPage: false, endCursor: null },
  };
  assert.throws(
    () =>
      parseGiscusDiscussionPage(
        {
          discussion: {
            ...baseDiscussion,
            repository: { nameWithOwner: "attacker/cat-agent-skills" },
            url: "https://github.com/microsoft/cat-agent-skills/discussions/98",
          },
        },
        { repository: "microsoft/cat-agent-skills" },
      ),
    /unexpected repository/,
  );
  assert.throws(
    () =>
      parseGiscusDiscussionPage(
        {
          discussion: {
            ...baseDiscussion,
            url: "https://github.com/attacker/cat-agent-skills/discussions/98",
          },
        },
        { repository: "microsoft/cat-agent-skills" },
      ),
    /outside microsoft\/cat-agent-skills/,
  );
  assert.throws(
    () =>
      parseGiscusDiscussionPage(
        {
          discussion: {
            ...baseDiscussion,
            url: "https://github.com/microsoft/cat-agent-skills/discussions/98?redirect=true",
          },
        },
        { repository: "microsoft/cat-agent-skills" },
      ),
    /untrusted giscus discussion URL/,
  );
});

const retainedSnapshot = (): EngagementSnapshot => ({
  schemaVersion: 1,
  repositories: {
    microsoft: { repository: "microsoft/cat-agent-skills", stars: 62 },
    local: { repository: "TedTschopp/cat-agent-skills", stars: 3 },
  },
  skills: {
    "legacy-skill": {
      microsoft: {
        rating: 4,
        comments: 2,
        discussions: [
          {
            number: 41,
            url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
          },
          {
            number: 35,
            url: "https://github.com/microsoft/cat-agent-skills/discussions/35",
          },
          {
            number: 41,
            url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
          },
        ],
      },
      local: { rating: 0, comments: 0, discussions: [] },
      total: { rating: 4, comments: 2 },
    },
  },
});

test("retained Microsoft discussion numbers are validated and deduplicated", () => {
  assert.deepEqual(retainedMicrosoftDiscussions(retainedSnapshot()), [
    {
      slug: "legacy-skill",
      number: 35,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/35",
    },
    {
      slug: "legacy-skill",
      number: 41,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
    },
  ]);

  const conflicted = retainedSnapshot();
  conflicted.skills["other-skill"] = {
    microsoft: {
      rating: 1,
      comments: 0,
      discussions: [
        {
          number: 41,
          url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
        },
      ],
    },
    local: { rating: 0, comments: 0, discussions: [] },
    total: { rating: 1, comments: 0 },
  };
  assert.throws(
    () => retainedMicrosoftDiscussions(conflicted),
    /assigned to both legacy-skill and other-skill/,
  );
});

test("giscus records deduplicate repeated lookups but preserve distinct legacy discussions", () => {
  const records = [
    {
      slug: "legacy-skill",
      number: 41,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
      rating: 1,
      comments: 2,
    },
    {
      slug: "other-skill",
      number: 39,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/39",
      rating: 1,
      comments: 0,
    },
    {
      slug: "legacy-skill",
      number: 41,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
      rating: 4,
      comments: 5,
    },
    {
      slug: "legacy-skill",
      number: 35,
      url: "https://github.com/microsoft/cat-agent-skills/discussions/35",
      rating: 2,
      comments: 1,
    },
  ];

  assert.equal(dedupeGiscusRecords(records).length, 3);
  assert.deepEqual(giscusRecordsToSkills(records), {
    "legacy-skill": {
      rating: 6,
      comments: 6,
      discussions: [
        {
          number: 35,
          url: "https://github.com/microsoft/cat-agent-skills/discussions/35",
        },
        {
          number: 41,
          url: "https://github.com/microsoft/cat-agent-skills/discussions/41",
        },
      ],
    },
    "other-skill": {
      rating: 1,
      comments: 0,
      discussions: [
        {
          number: 39,
          url: "https://github.com/microsoft/cat-agent-skills/discussions/39",
        },
      ],
    },
  });
});

test("aggregateDiscussions sums duplicates and retains every source URL", () => {
  const aggregated = aggregateDiscussions([
    {
      title: "duplicate-skill",
      number: 41,
      url: "https://github.com/microsoft/example/discussions/41",
      category: { name: "Announcements" },
      reactionGroups: groups(["THUMBS_UP", 1]),
      commentCount: 2,
    },
    {
      title: "duplicate-skill",
      number: 35,
      url: "https://github.com/microsoft/example/discussions/35",
      category: { name: "Announcements" },
      reactionGroups: groups(["HEART", 2]),
      commentCount: 1,
    },
    {
      title: "not-a-skill!",
      number: 99,
      url: "https://example.invalid/99",
      category: { name: "Announcements" },
      reactionGroups: groups(["THUMBS_UP", 100]),
      commentCount: 100,
    },
    {
      title: "different-category",
      number: 100,
      url: "https://example.invalid/100",
      category: { name: "General" },
      reactionGroups: groups(["THUMBS_UP", 100]),
      commentCount: 100,
    },
  ]);

  assert.deepEqual(aggregated, {
    "duplicate-skill": {
      rating: 3,
      comments: 3,
      discussions: [
        { number: 35, url: "https://github.com/microsoft/example/discussions/35" },
        { number: 41, url: "https://github.com/microsoft/example/discussions/41" },
      ],
    },
  });
});

test("buildSnapshot keeps source provenance and derives compatible combined ratings", () => {
  const microsoft: SourceFetch = {
    repository: "microsoft/cat-agent-skills",
    stars: 62,
    skills: {
      "shared-skill": {
        rating: 4,
        comments: 2,
        discussions: [{ number: 8, url: "https://example.invalid/microsoft/8" }],
      },
      "upstream-only": {
        rating: 1,
        comments: 0,
        discussions: [{ number: 9, url: "https://example.invalid/microsoft/9" }],
      },
    },
  };
  const local: SourceFetch = {
    repository: "TedTschopp/cat-agent-skills",
    stars: 3,
    skills: {
      "shared-skill": {
        rating: 2,
        comments: 5,
        discussions: [{ number: 2, url: "https://example.invalid/local/2" }],
      },
      "local-only": {
        rating: 0,
        comments: 1,
        discussions: [{ number: 3, url: "https://example.invalid/local/3" }],
      },
    },
  };

  const snapshot = buildSnapshot({ microsoft, local });
  assert.deepEqual(snapshot.repositories, {
    microsoft: { repository: "microsoft/cat-agent-skills", stars: 62 },
    local: { repository: "TedTschopp/cat-agent-skills", stars: 3 },
  });
  assert.deepEqual(snapshot.skills["shared-skill"].total, { rating: 6, comments: 7 });
  assert.deepEqual(snapshot.skills["local-only"].microsoft, {
    rating: 0,
    comments: 0,
    discussions: [],
  });
  assert.deepEqual(deriveRatings(snapshot), {
    "local-only": 0,
    "shared-skill": 6,
    "upstream-only": 1,
  });
});
