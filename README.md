# AI.Tedt.org AI Library

A unified library of reusable AI assets: Agent Skills, plugins, automations,
Agent Instruction Files, Scoped Agent Instruction Files, Agent Definition
Files, Prompt Template Files, and Work Specification Files. Every asset uses
the same searchable catalog, card system, detail shell, downloads, artwork,
ratings, and discussion experience.

Built with [Astro](https://astro.build/) + [Tailwind CSS](https://tailwindcss.com/),
deployed as a static site to GitHub Pages.

> **Mirror note:** This repository is an independently published mirror of
> [Microsoft's CAT Agent Skills repository](https://github.com/microsoft/cat-agent-skills).
> Microsoft engagement remains visible as a labeled upstream source, while
> AI.Tedt.org collects its own ratings and comments in this repository. The
> upstream Microsoft Clarity project is disabled in this deployment.

## Features

- **One AI Library** with search and filters for asset type, compatibility,
  topic, contributor, and sort order.
- **Shared asset pages** with a 16:10 cover, metadata, guide, exact source,
  related assets, downloads, ratings, discussion, and a contextual use panel.
- **Prompt customization** for text, textarea, number, select, radio, and
  checkbox variables, with defaults, validation, reset, live preview, download,
  clipboard copy, and provider launch. Prompt text is never placed in a URL.
- **Fresh generated artwork** with a validated 1600×1000 WebP and complete
  generation provenance for every newly published asset.
- **Federated community engagement**: rate and discuss an asset through GitHub
  Discussions. Microsoft and AI.Tedt.org activity stays separately attributed,
  while the gallery uses their combined positive reactions for "Top rated."
  See [`docs/ratings.md`](docs/ratings.md).
- **Exact downloads**: individual source files and deterministic ZIP bundles
  for multi-file assets.
- **Stable public interfaces**: existing `/skills/{slug}/` routes and
  `skills.json` remain compatible; the complete catalog is available in
  `assets.json`, with prompts at `/prompts/{slug}/` and other file assets at
  `/library/{slug}/`.

## Local Development

```bash
npm install
npm run dev      # start the dev server (http://localhost:4321/)
npm run build    # production build into ./dist + metadata/social asset audit
npm run preview  # preview the production build locally
```

> The production site is served from the root of the `ai.tedt.org` custom
> domain, so local URLs do not use a repository-name prefix.

## Adding an Asset

Add one folder to [`submissions/`](submissions/) and open a PR. Do not edit
generated files in `src/content/`, `src/content/guides/`, or `public/bundles/`
by hand. CI validates the submission and generates its page and downloads. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for the full guide.

Generic file submissions declare `kind`, `name`, `description`, `tags`,
`author`, `entrypoint`, and explicit `payloadPaths` in `metadata.json` or
`metadata.yaml`. The importer supports these generic file kinds:

- `agent-instruction`
- `scoped-agent-instruction`
- `agent-definition`
- `work-specification`

Optional fields include keywords, compatibility, status, versioning, and
provenance. The folder name supplies the slug, `topics` defaults to `tags`, and
the importer derives the download paths. Filenames and relative payload paths
are preserved. A root `README.md` is an optional human-facing guide and is not
included in the downloadable payload unless it is explicitly named in
`payloadPaths`.

For example, a generic Agent Instruction File submission can contain:

```text
submissions/repository-instructions/
├── metadata.json
├── README.md
└── AGENTS.md
```

```json
{
  "kind": "agent-instruction",
  "name": "Repository Instructions",
  "description": "Persistent operating instructions for a repository.",
  "tags": ["engineering"],
  "author": "Your Name",
  "entrypoint": "AGENTS.md",
  "payloadPaths": ["AGENTS.md"],
  "compatibility": ["codex", "github-copilot"]
}
```

Each generic payload is available as an individual source-file download. A
multi-file submission also receives a deterministic `<slug>.zip` containing
exactly the declared payloads. A prompt template uses one `<slug>.prompt.md`
entrypoint and may declare customization variables. Existing skill, plugin,
and automation submissions continue to work through the compatibility adapter.

Do not add `publicationStatus` or generated artwork fields to a new prompt or
generic file submission. The importer stages it as blocked, and
`npm run artwork:prepare -- --slug <slug>` writes the complete cover record and
publishes it atomically after the artwork is ready.

### Existing Agent Skill Format

Every submission is a `submissions/<slug>/` folder with a `metadata.json` sidecar
plus one skill payload — an **unpacked** `SKILL.md` (+ optional dirs):

```
submissions/<slug>/
├── metadata.json  # OR metadata.yaml — catalog details (sidecar, not bundled)
├── README.md      # OPTIONAL human-facing note (not bundled) — shown on the page
└── an unpacked skill:
    ├── SKILL.md    # name + agent description + instructions
    ├── scripts/    # optional executable code
    ├── references/ # optional docs
    └── assets/     # optional templates / data files
```

A skill carries **two** descriptions: the **agent** description in `SKILL.md`
frontmatter (what the model reads to decide when to invoke), and the **catalog**
description in `metadata.json` (the friendly one-liner shown in the gallery). An optional **`README.md`** adds a third, human-only voice: it never ships to the
agent and, when present, **becomes the main content** on the detail page — the
author's overview, setup, and usage — with the exact `SKILL.md` still offered as
the download.

`submissions/my-great-skill/SKILL.md`:

```markdown
---
name: my-great-skill
description: Use this skill whenever the user… (the agent-facing trigger).
---

Write the agent instructions here as Markdown — this body becomes the
"Instructions" section on the detail page.
```

`submissions/my-great-skill/metadata.json`:

```json
{
  "name": "My Great Skill",
  "description": "One-line catalog summary shown on the card and detail page.",
  "platforms": ["Cowork", "Copilot Studio", "Scout"],
  "tags": ["productivity", "automation"],
  "author": "Your Name",
  "authorUrl": "https://example.com",
  "version": "1.0.0"
}
```

> `name`, `description`, `platforms`, and `tags` are required (`platforms` must be
> one or more of `Cowork`, `Copilot Studio`, `Scout`). PRs run a build check that
> validates every skill against the schema.

> Besides single skills, you can submit a **Scout automation** (a `.json` export,
> Scout-only). It drops into `submissions/<slug>/` the same way and is
> auto-detected by its payload. (Cowork plugins and Scout automation installers
> were `.zip` packages and are **no longer accepted** — `.zip` payloads have
> been retired; existing ones stay published.) See
> [`submissions/README.md`](submissions/README.md) for the details.

## Project Structure

```
src/
  components/      shared catalog cards, detail shell, prompt workbench, and covers
  content/
    skills/        generated skills, plugins, and automations
    prompts/       generated prompt template files
    artifacts/     generated instruction, agent definition, and work specification files
    guides/        optional human-facing submission guides
  layouts/         base page layout and site metadata
  lib/             normalized LibraryAsset model, schemas, engagement, and helpers
  data/            engagement.json + derived ratings.json snapshots
  pages/
    index.astro          unified catalog search, filters, sort, and infinite scroll
    skills/[slug].astro  existing skill, plugin, and automation routes
    prompts/[slug].astro prompt template routes and approved legacy aliases
    library/[slug].astro other instruction, agent, and specification file routes
    tags/[tag].astro     normalized per-topic listings
    social/              generated 1200×630 site and per-asset preview images
    robots.txt.ts        crawler policy + sitemap discovery
    sitemap.xml.ts       canonical, indexable page inventory
    skills.json.ts       backward-compatible skill metadata endpoint
public/
  assets.json      complete published library catalog
  bundles/         exact individual payloads and deterministic ZIP bundles
  skill-art/       validated generated 1600×1000 WebP covers
  site.webmanifest + browser, Apple, and installable-app icons
submissions/       drop-in library submissions (folders imported by CI)
scripts/           import, content validation, metadata audit, icons, engagement
.github/workflows/ CI + Microsoft catalog sync + Pages/engagement refresh
```

## Deployment

Pull requests run `.github/workflows/ci.yml`, which imports submissions,
regenerates `assets.json`, validates content and artwork, and builds the site.
Pushing to `main` triggers
`.github/workflows/deploy.yml`, which builds and publishes the site to GitHub
Pages at `https://ai.tedt.org/`. Enable Pages in the repo settings with the
**GitHub Actions** source and assign `ai.tedt.org` as the custom domain.

Before each build, `deploy.yml` runs `npm run engagement:fetch` to snapshot
Microsoft and AI.Tedt.org reactions, comments, discussion links, and repository
stars. Its daily schedule runs at 3:30 a.m. Pacific, after the 3:00 a.m.
Microsoft catalog sync, and deploys only when the deterministic snapshots
change. See [`docs/ratings.md`](docs/ratings.md) for the source and ownership
model.

## Support

AI.Tedt.org is an independently published community library. Individual assets
are provided as-is; provider support policies apply to the tools with which
they are used. See
[`SUPPORT.md`](SUPPORT.md) for how to file issues and get help.

## License

[MIT](LICENSE)
