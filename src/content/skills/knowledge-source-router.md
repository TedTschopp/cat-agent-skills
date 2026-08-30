---
name: Knowledge Source Router
description: "Route Copilot Studio knowledge searches to the right region-specific source (Americas, EMEA, APAC, or Global) based on where the user is, so answers stay locally accurate."
agentDescription: "Determines which region-specific knowledge source(s) to search based on the user's location. You MUST invoke this skill BEFORE calling the KnowledgeSearch tool, and pass the chosen source(s) as its `sources` parameter."
platforms: [Copilot Studio]
tags: [knowledge, routing, localization, location, grounding]
author: Adi Leibowitz
authorUrl: "https://microsoft.github.io/mcscatblog/"
authorGithub: adilei
version: 1.0.0
createdAt: 2026-06-23
updatedAt: 2026-06-23
coverImage: skill-art/knowledge-source-router.webp
coverImageAlt: "A central globe routes knowledge pathways to four region-specific archives, with one local path highlighted."
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a clear visual metaphor for routing knowledge to the correct region: one central globe-like routing core directs four precise pathways to four distinct knowledge vaults, with one pathway illuminated as the locally appropriate source\nScene/backdrop: an uncluttered slate field with subtle topographic relief contained near the center\nSubject: a large central spherical routing core, four compact archive-vault forms arranged closely around it, and clean cyan paths connecting them, with one selected path carrying a sparing orange confirmation glow\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; bold central hub-and-spoke silhouette, legible at small card size; contain the full globe, all four vaults, and every pathway inside the central 76% with no essential detail in the outer 8%\nLighting/mood: calm, precise, locally aware, quietly technical, with restrained cyan backlighting\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, map labels, flags, interface labels, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:51e237724a0dbd46a1cebc0aa26c094b251c1f7be8be7493593e9c4a5ece9a30"
featured: true
---
Pick the correct region-specific knowledge source(s) for a query based on the
**user's location**, so answers are grounded in content that is accurate for
where the user is. Always do this BEFORE calling the `KnowledgeSearch` tool, and
pass the chosen source(s) as the `sources` parameter of that call — on every
knowledge-grounded question. Policies, benefits, pricing, legal/compliance,
support hours, and product availability frequently differ by country or region,
so read from the source that matches the user's location before answering.

## Available sources
| Source | Use when the user is located in... |
| --- | --- |
| `Global` | Any location, for content that is the same everywhere (fallback / default). |
| `Americas` | United States, Canada, Mexico, Central & South America. |
| `EMEA` | Europe, the Middle East, and Africa. |
| `APAC` | Asia, Australia, and the Pacific. |
