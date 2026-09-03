# Contributing an AI Library Asset

Thanks for helping grow the AI.Tedt.org AI Library. Add one
`submissions/<slug>/` folder and open a pull request. The importer accepts Agent
Skills, Scout automations, Prompt Template Files, Agent Instruction Files,
Scoped Agent Instruction Files, Agent Definition Files, and Work Specification
Files.

Read [`submissions/README.md`](submissions/README.md) for the exact metadata,
payload, download, artwork, and validation contracts for each asset type.

## Keep Authored and Generated Files Separate

Edit only the submission source. Do not hand-edit its generated files in
`src/content/skills/`, `src/content/prompts/`, `src/content/artifacts/`,
`src/content/artifact-payloads/`, `src/content/guides/`, `public/bundles/`, or
`public/assets.json`. CI regenerates those paths for same-repository pull
requests. Fork pull requests receive validation without writeback.

Use a lowercase, hyphenated folder name. That slug is the asset identity and
must remain stable across updates. Supply a `metadata.json`, `metadata.yaml`, or
`metadata.yml` sidecar and exactly one supported payload format.

## Write for the Right Audience

- Put the short, human-facing catalog summary in metadata `description`.
- Put an Agent Skill's model-facing invocation trigger in `SKILL.md`
  frontmatter `description`.
- Put optional setup notes and usage guidance in a root `README.md`. It becomes
  the detail-page guide and normally stays outside the downloadable payload.
- Remove secrets, personal paths, private data, and unreviewed executable
  instructions before submitting files.

## Preserve Install-Ready Source

Generic file assets list every install-ready `.md` or `.mdc` file in
`payloadPaths` and identify one of them as `entrypoint`. The importer preserves
their relative paths and contents, publishes every file separately, and adds a
deterministic ZIP when the asset contains multiple files.

Submit Agent Skills unpacked. New `.zip` packages are not accepted. Existing
grandfathered plugins and automation installers remain published, while new
Scout automations use one directly importable `.json` export.

## Let Publication Fail Closed

New Prompt Template Files and generic file assets remain unpublished until
their generated covers are complete. Do not set `publicationStatus` or
hand-author generated artwork fields in an initial submission. A maintainer uses
`artwork:prepare` to add the complete cover record and publish the asset as one
operation.

## Validate Before Opening a Pull Request

```bash
npm install
npm run check:submissions
npm run import:submissions
npm run check:generated-content
npm test
npm run build
```

On a pull request, CI repeats the import and validation, scans all generated
Markdown for active content, validates artwork, rebuilds `public/assets.json`,
and builds the static site. Merges to `main` deploy through GitHub Pages.

By contributing, you agree that your asset is shared under the repository's
[MIT License](LICENSE).
