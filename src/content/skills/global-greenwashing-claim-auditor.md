---
name: Global Greenwashing Claim Auditor
description: "Audit environmental claims in CSV, XLSX, DOCX, PPTX, conversational text, and public websites with separate ANY, CA, EU, and UK findings."
agentDescription: "Use this skill whenever the user asks to audit, scan, review, classify, or de-risk environmental, sustainability, climate, circularity, recycling, emissions, or green marketing claims in pasted conversational content, CSV files, XLSX workbooks, DOCX documents, PPTX presentations, or website URLs. Report universal vocabulary risks separately from Canadian (CA), European Union (EU), and United Kingdom (UK) legal and guidance findings."
platforms: [Cowork, Copilot Studio, Scout]
tags: [greenwashing, environmental claims, sustainability, compliance, canada, european union, united kingdom, documents, spreadsheets, web]
author: Chris Garty
authorUrl: "https://github.com/ChrisGarty"
authorGithub: ChrisGarty
version: 1.0.0
createdAt: 2026-07-26
updatedAt: 2026-07-28
coverImage: skill-art/global-greenwashing-claim-auditor.webp
coverImageAlt: A cyan inspection lens reveals the hollow veneer and rooted core of a leaf-shaped claim token.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: A precision inspection lens scans a polished leaf-shaped claim token and reveals a hollow veneer on one side and a firmly rooted, evidence-backed core on the other, a single clear metaphor for auditing environmental claims.\nScene/backdrop: An uncluttered warm-paper inspection table with a small recessed slate work surface, no scenery and no interface.\nSubject: One large tactile leaf-shaped token, one cyan optical inspection lens, and a few restrained orange evidence markers, all completely blank and unmarked.\nStyle/medium: premium editorial illustration with tactile dimensional detail, cut-paper fibers, frosted glass, matte ceramic, and subtle carved depth\nComposition/framing: exact 16:10 landscape; centered three-quarter view; the complete subject group contained within the central 76% of the frame; at least 12% calm empty border on all four sides; no essential detail in the outer 8%; bold silhouette legible at small card size\nLighting/mood: calm, capable, evidence-led, quietly technical, with restrained cyan backlighting and soft directional shadows\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, pseudo-writing, labels, flags, maps, logos, trademarks, seals, badges, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI, no Microsoft Fluent gradients, and no Microsoft branding; every visible surface must remain blank and unmarked"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:402957e434d7de12328efc7af2198b0cf6a1dde13a2e8ea855a33f19f03c95a7"
bundle: bundles/global-greenwashing-claim-auditor.zip
---
# Global Greenwashing Claim Auditor

Audit public-facing environmental claims using the bundled global vocabulary, regional taxonomy, legal research, and detection method. Treat the result as compliance triage, not legal advice.

## Required references

Read these before making final findings:

1. `references/Greenwashing-vocab.md`
2. `references/greenwashing-risk-taxonomy.md`
3. `references/greenwashing-detection.md`
4. `references/greenwashing-analysis-research.md`

Use `ANY` only for universal vocabulary and claim-construction risks. Use `CA`, `EU`, and `UK` only when the corresponding regional rule, law, regulation, or guidance supports the finding.

## Workflow

1. Determine the input type and intended markets. If markets are unknown, analyze `ANY`, `CA`, `EU`, and `UK`, but mark regional applicability as unconfirmed.
2. Extract all claim-bearing text while preserving source locations:
   - CSV: row and column.
   - XLSX: sheet and cell.
   - DOCX: paragraph or table cell.
   - PPTX: slide and shape.
   - Conversation: supplied text block.
   - URL: page URL and extracted block.
3. Run the matching script for first-pass triage.
4. Review every flagged unit against the full references. Keyword matches are leads, not verdicts.
5. Add claims missed by keywords, including implied claims, imagery, omissions, comparisons, labels, scope overreach, lifecycle issues, and unsupported future commitments.
6. Report separate findings for every applicable jurisdiction and retain the highest risk as the overall rating.
7. Suggest a bounded rewrite, but never invent evidence, percentages, certifications, methods, or environmental benefits.

## Scripts

Run scripts from the skill directory with Python 3. Use workspace-relative paths so commands remain portable across supported environments.

### CSV

```sh
python scripts/analyze_csv.py "claims.csv" --jurisdictions CA EU UK --out audit.json
```

Use `--text-column NAME` repeatedly to choose columns. Without it, the script scans text-like columns and then all string columns if necessary.

### XLSX

```sh
python scripts/analyze_xlsx.py "claims.xlsx" --sheet "Posts" --jurisdictions CA EU UK --out audit.json
```

Use `--max-items 1000` for a bounded first pass.

### DOCX

```sh
python scripts/analyze_docx.py "document.docx" --jurisdictions CA EU UK --out audit.json
```

### PPTX

```sh
python scripts/analyze_pptx.py "presentation.pptx" --jurisdictions CA EU UK --out audit.json
```

### Conversational content

For short content, analyze it directly using the references. For repeatable scripted triage:

```sh
python scripts/analyze_text.py --text "Our product is carbon neutral and eco-friendly." --jurisdictions CA EU UK --out audit.json
```

For long content:

```sh
python scripts/analyze_text.py --text-file "content.txt" --jurisdictions CA EU UK --out audit.json
```

### Website URL

```sh
python scripts/analyze_url.py "https://example.com/product" --jurisdictions CA EU UK --out audit.json
```

Only fetch public HTTP/HTTPS pages. Do not attempt to bypass authentication, paywalls, robots controls, or access restrictions.

### Markdown output

All entry scripts accept `--format markdown`:

```sh
python scripts/analyze_docx.py "document.docx" --format markdown --out audit.md
```

## Review requirements

Always manually inspect:

- Red findings.
- Generic claims such as `green`, `eco-friendly`, and `sustainable`.
- Carbon-neutral, climate-neutral, net-zero, or offset claims.
- Sustainability labels, seals, certifications, and badges.
- Recyclable, compostable, biodegradable, reusable, and circularity claims.
- Comparisons and future targets.
- Qualifications in footnotes, small print, links, notes, or other slides/pages.

Apply date-sensitive EU rules using the content's intended publication date. If no date is supplied, use the current date and state that assumption.

## Output

Return:

1. Scope, sources, assumed publication date, and applicable jurisdictions.
2. Counts by overall risk and jurisdiction tag.
3. One finding per claim and region, including exact quote, source location, finding code, risk, basis, reason, and remediation.
4. Highest-priority fixes.
5. Limitations, inaccessible evidence, and items requiring legal or technical review.

## Guardrails

- Do not describe `ANY` as a legal violation.
- Do not declare legal compliance; state that no issue was detected under the checks performed.
- Do not treat a keyword match alone as proof of greenwashing.
- Do not invent or assume substantiation.
- Do not ignore visual or contextual implications merely because extracted text appears qualified.
- Do not apply withdrawn proposed legislation as enacted law.
- Escalate high-risk claims for qualified legal review before publication.

## Tone

Be precise, evidence-led, constructive, and explicit about jurisdiction. Every Yellow or Red finding should include a practical remediation.
