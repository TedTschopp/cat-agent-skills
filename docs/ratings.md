# Community Ratings and Comments

The gallery uses GitHub Discussions for per-skill ratings and comments. It has
two independent community sources:

- **Microsoft upstream** — the original Discussions in
  `microsoft/cat-agent-skills`.
- **AI.Tedt.org** — ratings and comments collected in
  `TedTschopp/cat-agent-skills`.

The sources are never copied into one another. This preserves the original
author, timestamp, reactions, edits, deletions, and moderation history for every
comment. Entries in Microsoft's catalog show both sources. Local-only entries
show only AI.Tedt.org ratings, comments, repository stars, and discussion.

## What the Numbers Mean

- A skill's **rating** is the sum of positive reactions on its slug-titled
  Discussions: 👍 ❤️ 🎉 🚀 😄. Negative and neutral reactions do not reduce the
  score.
- **Comments** include top-level comments and replies.
- The gallery's "Top rated" sort uses the combined Microsoft + AI.Tedt.org
  rating for entries with an upstream source, and only AI.Tedt.org reactions
  for local-only entries. The detail page shows the applicable sources.
- **Repository stars** are repository-level GitHub stars. They are shown by
  source and never treated as per-skill ratings.

Microsoft has several duplicate slug-titled Discussions. The snapshot sums all
of them and retains every Discussion URL so none of their comments becomes
invisible behind one canonical thread.

## How the Daily Sync Works

```text
Microsoft Discussions ─┐
                       ├─ scripts/fetch-engagement.ts
AI.Tedt.org Discussions ┘          │
                                   ├─ src/data/engagement.json
                                   └─ src/data/ratings.json
                                              │
                                              ▼
                             cards, detail pages, API, and Top rated
```

`src/data/engagement.json` is the provenance-rich read model. For each slug it
stores Microsoft, local, and combined reaction/comment totals plus all source
Discussion links. It also stores each repository's star count.

`src/data/ratings.json` remains the small `{ "<slug>": <combined-rating> }`
compatibility snapshot. Site totals, sorting, badges, and public catalogs use
the source-aware engagement reader, which excludes Microsoft data for local-only
entries. `src/data/microsoft-catalog.json` records the upstream submission slugs
and is refreshed by the catalog sync even when no entries need importing.

The Pages workflow refreshes both files at 3:30 a.m. in
`America/Los_Angeles`, after the 3:00 a.m. catalog sync. It commits and deploys
only when the stable JSON changes. API failures retain the last-known-good data
for the affected source rather than replacing it with zeroes, and fail the run
so stale data cannot look like a successful daily refresh.

The workflow's repository-scoped token reads AI.Tedt.org Discussions. If that
token cannot read Microsoft's separate repository, the refresh uses giscus's
public API, rechecks every retained Microsoft Discussion number, and queries
each catalog slug for newly created threads. This keeps all known legacy
duplicates current without storing a broad personal access token.

Full comment threads are read live from GitHub; the action synchronizes the
static counts and links needed elsewhere in the site.

## Local Community Setup

The local collector uses the fork's **Announcements** category:

- Repository: `TedTschopp/cat-agent-skills`
- Repository ID: `R_kgDOUII1_Q`
- Category: `Announcements`
- Category ID: `DIC_kwDOUII1_c4DEej4`

GitHub Discussions must remain enabled. To allow in-page local commenting,
install the [giscus GitHub App](https://github.com/apps/giscus) for this
repository. Until the app is installed, the site links directly to the fork's
Discussions rather than displaying a broken local embed.

After installation, set the repository Actions variable
`PUBLIC_LOCAL_GISCUS_ENABLED` to `true` and run the Pages workflow. The build
reads that variable; no source IDs or secrets need to change.

Microsoft's existing giscus panel remains an upstream view. AI.Tedt.org uses
the same skill slug as the discussion term, but writes only to this fork.

## Refresh on Demand

Run the **Deploy to GitHub Pages** workflow, or refresh locally with an
authenticated GitHub token:

```bash
GITHUB_TOKEN=$(gh auth token) npm run engagement:fetch
```

Without a token, the script leaves the committed snapshots unchanged so local
development remains deterministic.
