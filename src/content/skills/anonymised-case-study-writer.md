---
name: Anonymised Case Study Writer
description: "Turn engagement notes into anonymised, publishable case studies without exposing client-confidential details."
agentDescription: "Use this skill when the user asks to create, improve, anonymise, structure, or publish a client case study, success story, engagement summary, or transformation story."
platforms: [Cowork, Copilot Studio, Scout]
tags: [writing, case-study, marketing, documents, content, privacy]
author: Simon Owen
authorUrl: "https://github.com/SimonOwenDigital"
authorGithub: SimonOwenDigital
version: 0.1.0
createdAt: 2026-07-17
updatedAt: 2026-07-17
coverImage: skill-art/anonymised-case-study-writer.webp
coverImageAlt: A complete confidential dossier passes through a privacy screen and becomes a complete blank case-study booklet with preserved evidence tokens.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Create a premium editorial illustration of a confidential project story passing through a privacy-preserving editorial process and emerging as a credible publishable case study while useful evidence survives and identifiable details disappear.\nScene/backdrop: A restrained warm-paper editorial table against a deep slate studio backdrop, with generous calm negative space and a clean uninterrupted margin on every side.\nSubject: A compact three-part horizontal transformation tableau: at left, one complete closed navy dossier with a few layered blank evidence cards and abstract distinctive shapes; at center, one translucent cyan privacy screen that converts those distinctive shapes into neutral geometric silhouettes; at right, one complete polished blank-bound case-study booklet accompanied by three small preserved evidence tokens. The entire incoming dossier, every card, the full privacy screen, every connecting strand, the complete outgoing booklet, and all tokens must be visible in full.\nStyle/medium: Premium editorial illustration with tactile dimensional detail, matte paper, woven binding, translucent acrylic, and subtle ceramic tokens.\nComposition/framing: Exact 16:10 landscape. Place the complete tableau within the central 76% of the canvas, leaving at least 8% empty margin on the left, right, top, and bottom. Every subject and every connecting strand must stay fully inside the central 84% safe area, from 8% to 92% of both width and height. Nothing may touch or cross the frame. Use a compact, centered left-to-right transformation with clear separation between the complete input dossier, privacy screen, and complete output booklet, legible at small card size.\nLighting/mood: Calm, trustworthy, quietly technical; soft cyan transmission glow with one restrained orange editorial accent.\nColor palette: Warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027.\nConstraints: No text, letters, numbers, quotations, interface labels, pseudo-writing, writing-like lines, logos, trademarks, or watermark; no person, face, portrait, city, map, address, location landmark, or other identifiable detail; no paw imagery or paw logo; no cats or cat silhouettes; no product UI, Microsoft Fluent gradients, or Microsoft branding. Do not crop or clip any dossier edge, card, screen, strand, booklet edge, or token.\nTargeted correction of the attached draft: Preserve the same premium three-part concept, materials, lighting, and left-to-right relationship, but uniformly scale the complete dossier-screen-booklet tableau down and center it so every object, strand, and token is contained between 12% and 88% of the canvas width and between 12% and 88% of the canvas height. Maintain an obvious uninterrupted empty margin on all four sides. Make the three evidence tokens plain unlabeled ceramic shapes with no shield, chart, checkmark, or other recognizable pictogram. Nothing may touch or approach the frame edge."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:82cc05c6cd2c4f3eae9a4b28b43d02a576e21feedf3c7958bd87609437b910cf"
bundle: bundles/anonymised-case-study-writer.zip
---
# Anonymised Case Study Writer

Use this skill to create credible, anonymised case studies from engagement notes, interview notes, project summaries, outcomes, or source documents.

## Core rules

1. **Protect confidentiality.** Remove or generalise names, client identifiers, locations, internal programme names, system names, and commercially sensitive details unless the user explicitly says they are public.
2. **Do not invent outcomes.** Only include outcomes, metrics, timelines, and benefits that appear in the source material or are supplied by the user.
3. **Preserve credibility.** Prefer specific operational detail over vague marketing claims, while keeping the client anonymised.
4. **Make the story reusable.** Structure the case study so it can be used in proposals, webpages, thought leadership, sales conversations, and internal learning.
5. **Separate unknowns.** If outcomes or proof points are missing, include a short "Evidence gaps" section rather than fabricating.

## Default anonymisation pattern

Use neutral descriptors such as:

- A large public sector organisation.
- A global consumer goods company.
- A regulated financial services organisation.
- A national healthcare provider.
- A multinational energy business.

Only describe sector, scale, geography, and technology where the source material supports it and doing so does not identify the client.

## Workflow

1. Read all supplied source material.
2. Extract the engagement context, problem, constraints, intervention, outcomes, and lessons.
3. Identify any confidential or identifying details and replace them with safe descriptors.
4. Draft the case study using the structure below.
5. Check every claim against the source material.
6. Add evidence gaps or suggested follow-up questions only where needed.
7. Return copy-ready Markdown.

## Default structure

```markdown
# [Case study title]

## At a glance

| Field | Summary |
|---|---|
| Client type | [Anonymised descriptor] |
| Sector | [Sector if known] |
| Challenge | [One-sentence challenge] |
| Work delivered | [One-sentence intervention] |
| Outcome | [Evidence-backed outcome or "Outcome evidence not provided"] |

## Context

[What was happening and why it mattered.]

## The challenge

[The specific business, operating, adoption, governance, delivery, or technology problem.]

## What we did

[Practical work performed. Use bullets only where they improve clarity.]

## What changed

[Evidence-backed outcomes, capability shifts, decisions enabled, delivery improvements, or learning generated.]

## Why it mattered

[Business relevance and wider lesson.]

## Reusable insight

[The portable lesson other organisations can learn from this case.]

## Evidence gaps

- [Only include if relevant.]
```

## Style guidance

- Write in a human, experienced, consultancy-literate voice.
- Avoid exaggerated sales language.
- Avoid implying certainty where the source only suggests possibility.
- Make the piece useful even if formal metrics are unavailable.
- Keep paragraphs short enough for web reading.


## References

This skill includes supporting reference material. Read the relevant reference file when the task needs additional structure, rubric detail, examples, or checklist support.

- `references/anonymisation-checklist.md` - use this when additional structure, examples, or checks are useful for the task.

## Quality checklist

Before responding, check:

- No client-confidential detail has leaked.
- Every outcome is backed by supplied evidence.
- The case study has a clear before / intervention / after shape.
- The writing is credible and not generic.
- Evidence gaps are visible rather than hidden.
