# Submit an Asset

Add one `submissions/<slug>/` folder and open a pull request. Do not edit the
generated files in `src/content/`, `src/content/guides/`, `public/bundles/`, or
`public/assets.json`. CI validates the authored files, rejects unsafe rendered
Markdown, and generates the catalog record, detail-page content, and downloads.

The folder name is the asset slug. Use lowercase letters, numbers, and hyphens,
such as `repository-instructions`. The slug remains the asset identity when you
update it later.

## Choose an Asset Type

The importer accepts these new submission formats:

| Asset type | Authored payload |
| --- | --- |
| Agent Skill | A root `SKILL.md` with optional `scripts/`, `references/`, and `assets/` |
| Scout Automation | One importable `.json` export |
| Prompt Template File | One `<slug>.prompt.md` file |
| Agent Instruction File | One or more explicitly declared `.md` or `.mdc` files |
| Scoped Agent Instruction File | One or more explicitly declared `.md` or `.mdc` files |
| Agent Definition File | One or more explicitly declared `.md` or `.mdc` files |
| Work Specification File | One or more explicitly declared `.md` or `.mdc` files |

New packaged `.zip` submissions are not accepted because a packed file hides
its contents from review. Existing grandfathered plugins and automation
installers remain published, but contributors cannot add new ones.

## Common Folder Rules

Every submission uses a metadata sidecar and one supported payload. A root
`README.md` is optional human-facing guidance:

```text
submissions/<slug>/
├── metadata.json       # or metadata.yaml or metadata.yml
├── README.md           # optional human-facing guide
└── payload files       # exact files installed or imported by the user
```

- Metadata and the optional guide are sidecars. They are not downloads.
- For a generic file asset, a root `README.md` becomes the guide unless its
  exact path is included in `payloadPaths`; when declared there, it is a payload
  instead.
- Payload paths are relative POSIX paths. Do not use absolute paths,
  backslashes, `.` or `..` segments, empty segments, or symlinks.
- Generic file payloads must end in `.md` or `.mdc`, contain valid UTF-8, and
  contain non-whitespace text.
- Filenames, relative paths, and payload bytes are preserved.

## Submit a Generic File Asset

Use this contract for an Agent Instruction File, Scoped Agent Instruction File,
Agent Definition File, or Work Specification File:

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
  "tags": ["engineering", "governance"],
  "author": "Your Name",
  "entrypoint": "AGENTS.md",
  "payloadPaths": ["AGENTS.md"],
  "compatibility": ["codex", "github-copilot"]
}
```

Required contributor fields are:

| Field | Requirement |
| --- | --- |
| `kind` | One of `agent-instruction`, `scoped-agent-instruction`, `agent-definition`, or `work-specification` |
| `name` | Human-readable catalog name |
| `description` | Human-readable catalog summary |
| `tags` | One or more search and topic labels |
| `author` | Person or team responsible for the asset |
| `entrypoint` | Exact path of the primary file; it must also appear in `payloadPaths` |
| `payloadPaths` | Complete, nonempty list of payload files in install-relative order |

The importer derives `slug` from the folder, copies `tags` to `topics` when
`topics` is omitted, mirrors `compatibility` and `worksWith` when only one is
provided, and derives the download path. If metadata supplies `slug`, it must
match the folder name.

Optional catalog fields include `keywords`, `models`, `compatibility`,
`worksWith`, `authorUrl`, `authorGithub`, `authorAvatar`, `createdAt`,
`updatedAt`, `subtitle`, `summaryBullets`, `seoDescription`, `version`,
`featured`, `series`, `relatedAssetIds`, and `provenance`. Unknown metadata
fields fail validation instead of being ignored.

Every declared payload is published separately at
`public/bundles/<slug>/<payloadPath>`. A submission with more than one payload
also gets a deterministic `public/bundles/<slug>.zip` containing exactly the
declared payload files.

## Submit a Prompt Template File

A prompt template contains exactly one `<slug>.prompt.md` payload. It may also
have an optional root `README.md` guide.

```text
submissions/decision-brief/
├── metadata.json
├── README.md
└── decision-brief.prompt.md
```

```json
{
  "kind": "prompt-template",
  "slug": "decision-brief",
  "name": "Decision Brief",
  "description": "Turn evidence and tradeoffs into a concise decision brief.",
  "topics": ["Decision-Making"],
  "tags": ["Decision-Making"],
  "author": "Your Name",
  "entrypoint": "decision-brief.prompt.md",
  "payloadPaths": ["decision-brief.prompt.md"],
  "downloadPath": "bundles/decision-brief.prompt.md"
}
```

The prompt body may contain `{{variable_name}}` placeholders. Define matching
entries in the optional `variables` array to give visitors typed customization
controls. Supported variable types are `text`, `textarea`, `number`, `select`,
`radio`, and `checkbox`.

## Submit an Agent Skill

Copy [`_template/`](./_template) to start. A skill is an unpacked, canonical
Agent Skill:

```text
submissions/meeting-summarizer/
├── metadata.json
├── README.md          # optional human-facing guide
├── SKILL.md
├── scripts/           # optional executable code
├── references/        # optional supporting documents
└── assets/            # optional templates or data
```

The root `SKILL.md` requires a slug `name` that matches the folder, an
agent-facing `description`, and a nonempty instruction body:

```markdown
---
name: meeting-summarizer
description: Use this skill whenever the user asks to summarize a meeting transcript.
---

Turn the transcript into concise notes and action items.
```

The metadata sidecar provides the human-facing catalog fields:

```json
{
  "name": "Meeting Summarizer",
  "description": "Turn a meeting transcript into concise notes and action items.",
  "platforms": ["Cowork", "Copilot Studio"],
  "tags": ["meetings", "productivity"],
  "author": "Your Name",
  "authorUrl": "https://example.com",
  "version": "1.0.0"
}
```

`name`, `description`, `platforms`, `tags`, and `author` are required in skill
metadata. `platforms` must contain one or more of `Cowork`, `Copilot Studio`,
and `Scout`. Optional fields include `authorUrl`, `authorGithub`, `version`,
`createdAt`, `updatedAt`, `coverColor`, and `featured`. The importer derives
`authorGithub` from a direct GitHub profile `authorUrl` when possible.

### Two Descriptions With Different Audiences

| Description | Source | Audience |
| --- | --- | --- |
| Agent description | `SKILL.md` frontmatter | The model deciding when to invoke the skill |
| Catalog description | `metadata.*` | People browsing the AI Library |

An optional root `README.md` is written for people and becomes the guide on the
detail page. It is never part of the skill bundle. Without it, the page uses the
skill instructions as its main explanatory content.

If a skill contains files beyond `SKILL.md`, the importer creates a
deterministic ZIP with the canonical root `SKILL.md` and every declared helper
file verbatim. Metadata and the optional guide stay outside the bundle.

## Submit a Scout Automation

Copy [`_template-automation/`](./_template-automation) to start. A Scout
automation is one importable `.json` export beside the metadata sidecar:

```text
submissions/follow-up-reminder/
├── metadata.json
└── follow-up-reminder.json
```

The automation file requires a nonempty `name`, a valid `schedule`, and ordered
`steps` with a `label` and `prompt`. The importer publishes the JSON verbatim,
sets its type to Automation, and limits compatibility to Scout. Remove secrets,
personal paths, and private data before submitting it.

## Publication and Artwork

New Prompt Template Files and generic file assets are fail-closed. Do not add
`publicationStatus` or generated artwork fields to the initial submission. The
importer stages the source as `blocked-pending-artwork`, which keeps it out of
public routes, sitemaps, catalog cards, and `public/assets.json`.

After an approved 1600×1000 WebP cover exists, a maintainer runs:

```bash
npm run artwork:prepare -- --slug <slug> --source <image.webp> --alt "<alt text>" --prompt-file <prompt.txt>
```

That command writes the complete artwork provenance and changes publication to
`published` as one operation. Do not hand-author a partial artwork record or set
`publicationStatus` to `published` first.

## Generated Outputs

Depending on the asset type, the importer maintains:

- `src/content/skills/<slug>.md`
- `src/content/prompts/<slug>.md`
- `src/content/artifacts/<slug>.md`
- `src/content/artifact-payloads/<slug>.json`
- `src/content/guides/<slug>.md`
- `public/bundles/`
- `public/assets.json`

CI may commit these generated files back to a same-repository pull request.
Fork pull requests receive validation only.

## Update an Existing Asset

Edit the existing `submissions/<slug>/` folder and open a pull request. Do not
rename the folder unless you intend to create a different asset. Grandfathered
legacy `.zip` submissions are the only exception to the unpacked-source rule;
maintainers may replace the existing package at the same path.

## Validate Locally

```bash
npm install
npm run check:submissions     # validate authored submissions without writing
npm run import:submissions    # regenerate content, downloads, and assets.json
npm run check:generated-content
npm test
npm run build
```
