---
name: Copilot & Agents News Scout
description: "A Monday-morning Scout automation that scans authoritative Microsoft sources for the past week's Copilot, Copilot Studio, and agent news and posts a concise, linked digest to Teams."
platforms: [Scout]
type: automation
tags: [news, copilot, agent, digest, automation, weekly, teams]
author: Elliot Margot
authorUrl: "https://e-margot.ch"
authorGithub: OwnOptic
version: 1.0.0
createdAt: 2026-07-18
updatedAt: 2026-07-18
coverImage: skill-art/copilot-agents-news-scout.webp
coverImageAlt: Abstract signal observatory gathering selected cyan pulses into a compact orange-and-cyan prism.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: an abstract signal observatory calmly scanning many distant information sources and concentrating only the strongest useful signals into one compact weekly pulse\nScene/backdrop: a quiet terraced field on warm paper, with widely spaced slate source pillars and a central navy optical beacon\nSubject: one sculptural cyan lens sweeps across several unmarked pillars; a few distinct light pulses converge into a single faceted orange-and-cyan prism at the center, expressing search, filtering, and concise delivery without showing a screen or document\nStyle/medium: premium editorial illustration with tactile dimensional detail, matte paper-cut forms, ceramic surfaces, and subtle architectural depth\nComposition/framing: exact 16:10 landscape; low three-quarter view; the observatory and converging pulse remain fully inside the central 84%; generous calm negative space; no essential detail in the outer 8%\nTargeted correction: preserve the exact signal-observatory metaphor, but scale down and recenter the complete terraced diorama so every terrain edge, every source pillar, every signal path, the full observatory, and the prism all sit comfortably inside the central 78%; leave a continuous uninterrupted warm-paper background border of at least 11% on all four sides with no object or glow approaching the frame\nLighting/mood: calm, capable, quietly technical, with restrained cyan backlighting and one small warm orange accent\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: all surfaces completely blank; no text, pseudo-writing, glyphs, letters, numbers, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no people; no robot or brain motif; no product UI, screen, news page, newspaper, email, vendor branding, Microsoft branding, or Microsoft Fluent gradients"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:140ad981c869f12ab77bfe2b297f55424268cd4100e20f801c72e14b9764ba5e"
bundle: bundles/copilot-agents-news-scout.json
---
A Monday-morning Scout automation that scans authoritative Microsoft sources for the past week's Copilot, Copilot Studio, and agent news and posts a concise, linked digest to Teams.

> **Scout automation.** This is a Microsoft **Scout** automation (a `.json` of a schedule plus ordered prompt steps). It runs on Scout only.

## Trigger

Runs on a **schedule** — every Monday at 8:00 AM.

## Steps

### 1. Gather the week's updates

```text
Search authoritative Microsoft sources published or updated in the last 7 days for news about Microsoft 365 Copilot, Copilot Studio, Copilot agents, and Microsoft Scout. Prioritize: the Microsoft 365 and Copilot blogs (microsoft.com/blog), Microsoft Learn 'what's new' and release pages, the Message Center and Microsoft 365 roadmap, and the Power Platform / Copilot Studio release plans. For each item, capture the title, the canonical URL, the publish or update date, and a one-sentence summary in your own words. Collect everything relevant now; do not filter yet.
```

### 2. Filter to what matters

```text
From the items gathered, keep only material changes a Copilot Studio maker or M365 admin would act on: general availability, public preview, deprecations and breaking changes, pricing or Copilot Credits changes, new connectors or capabilities, and roadmap dates. Drop marketing recaps, opinion pieces, and anything older than 7 days. Deduplicate items that cover the same announcement, keeping the most authoritative source. If nothing material shipped this week, note that plainly rather than padding the list.
```

### 3. Write and post the Teams digest

```text
Write a concise digest titled 'Copilot & Agents - week of <date>'. Group items under headings: Microsoft 365 Copilot, Copilot Studio, Agents & Scout, and Governance & Admin (omit any empty group). For each item give the title as a link, the date, and a one-line 'why it matters'. Keep the whole digest scannable in under two minutes. Post it to Teams. Do not invent items, dates, or links; include only what the previous step verified. Do not use the em dash character.
```

## Import into Scout

1. Download the automation (the `.json` on this page).
2. In **Scout › Automations**, choose **Import** and select the file (or paste its contents). Review the schedule and steps, then enable it.

You can also point Scout's **Import from GitHub** at a repository directory of automation `.json` files (a `skills/` subfolder is installed automatically). This automation's file is `submissions/copilot-agents-news-scout/` in this repo.

> Review the steps before enabling — automations act on your behalf on a schedule.
