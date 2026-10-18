# Catalog Consolidation

The October 18 cleanup reduces the active catalog from 169 to 159 entries. Ten duplicate entrypoints are consolidated into eight maintained assets. Original sources remain in Git history, contributor attribution is retained in the replacement guides, old detail routes redirect, and historical downloads remain available.

| Retired Slug | Maintained Slug | Preserved Behavior |
| --- | --- | --- |
| `product-requirements-document-prd-template-2` | `product-requirements-document-prd-template` | Expanded metrics, instrumentation, and anti-goals |
| `product-requirements-document-prd-template-3` | `product-requirements-document-prd-template` | Identical to Template 2 |
| `product-requirements-document-prd-template-4` | `product-requirements-document-prd-template` | Source documents, output controls, release gates, and explicit unknowns |
| `ai-simulation-creator-roleplay-prompt` | `ai-simulation-creator` | Same roleplay and mentor procedure |
| `linkedin-content-system` | `linkedin-content-writer` | Newsletter and article formats, promotional posts, and carousel copy |
| `teds-writing-style` | `ted-writing-style` | Earlier literary and faith-oriented profile as a conditional reference |
| `style-analyzer` | `own-voice-builder` | Teams sampling, profile output, and explicitly requested memory storage |
| `blog-content-auditor` | `content-quality-auditor` | Blog rubric, editorial action labels, and library backlog |
| `building-block` | `abb-sbb-ubb-builder` | Batch lists and supplied compact templates |
| `script-a-podcast` | `generating-podcast-script` | Jane-and-guest interviews and script-only output |

The canonical PRD also retains creation, quality-review, and impact-analysis operations. Voice profiles distinguish current-conversation use, persistent memory, and a reusable skill. Podcast scripts distinguish interview and two-host casts, readable scripts, optional SSML, and optional audio. Existing covers remain byte-for-byte unchanged.

## Permanent Retirement Registry

`src/data/asset-consolidations.json` records each retired identity, replacement, source commit, original author and provenance, old routes, and hashes of frozen legacy downloads.

- The importer rejects a recreated retired submission and verifies all preserved download bytes before pruning retired generated pages and guides.
- Both catalog loaders remove stale retired records, resolve related-asset references, and keep the previous names searchable on the maintained entry.
- Static redirects resolve directly to a published replacement. The sitemap contains active canonical records only.
- Microsoft synchronization retains upstream attribution but skips retired sources and their generated records. Later syncs cannot restore the duplicates. The historical TedT.org migration also skips retired entries and preserves the maintained replacements.
- The artwork queue excludes retired identities. Active covers remain validated against their current sources.

Historical files in `public/bundles/` and the frozen `public/skills/style-analyzer.md` are deliberate compatibility downloads. They are excluded from the active catalog and are not editable submission sources. Their hashes are checked by the importer; do not regenerate or remove them incidentally.

## Retained Separate Workflows

The business-skills collection contains additional exercises and remains available alongside focused learning prompts. Requirements clarification, the Azure API Management use case, and test-coverage review remain distinct operations. Architecture viewpoints, platform choices, testing stages, regional compliance, and scheduled versus on-demand tools retain their separate identities.

## Validation

Run submission validation, unit tests, artwork validation, generated Markdown safety checks, and the full site build. Validate every retirement route, canonical target, sitemap exclusion, and frozen download. Compare the contents of generated ZIPs with the authored payloads; compression can differ between local and CI runtimes without changing their members.
