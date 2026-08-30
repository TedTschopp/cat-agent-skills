---
name: Meeting Analyzer
description: "Analyzes meeting content pasted as text or provided as audio/video transcripts. Delivers a structured intelligence report: explicit decisions and action items, participant persona profiles, and — most importantly — hidden insights: unspoken tensions, implicit risks, unresolved topics, and signals that were not made explicit during the meeting but are critical to the context."
agentDescription: "Analyzes meetings from pasted text, transcripts, or audio/video recordings and turns them into a structured intelligence report. Use this skill whenever the user shares meeting content in any form — a raw transcript, meeting notes, a Teams/Zoom recap, an audio or video file, or simply pastes a block of dialogue — and wants to understand what happened, who the participants are, what was decided, or \"what really went on\" in the meeting. Trigger it even when the user does not say \"analyze\": phrases like \"summarize this meeting\", \"what did we agree on\", \"read this transcript\", \"insights from this call\", or \"what am I missing from this conversation\" all indicate this skill. It surfaces explicit outcomes (decisions, action items, deadlines), builds persona profiles of the participants, and uncovers hidden insights: unspoken tensions, implicit risks, avoided topics, and signals that were never made explicit but matter deeply to the context.\n"
platforms: [Copilot Studio, Cowork]
tags: [meetings, analysis, insights, personas, transcription, productivity, communication]
author: Michael Ferro Pereira
authorUrl: "https://github.com/michaelfp"
authorGithub: michaelfp
coverImage: skill-art/meeting-analyzer.webp
coverImageAlt: Voice ribbons converge across a translucent meeting table while hidden threads appear below its surface.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a meeting's visible discussion is separated from its deeper tensions, unresolved threads, and hidden signals, revealing both the explicit and implicit layers in one evidence-grounded view\nScene/backdrop: an uncluttered warm-paper analysis field with one compact centered slate meeting surface and no office room scenery\nSubject: one round translucent meeting table with several distinct smooth voice ribbons above it and quieter submerged strands visible beneath the surface under a cyan inspection light, with one orange unresolved thread kept separate\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; centered slightly top-down view; contain the complete table, every ribbon and strand, light, platform, and shadow within the central 66% of the canvas; leave at least 17% calm empty border on all four sides; no object may enter the outer 12%\nLighting/mood: observant, evidence-led, composed, quietly technical\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no people, faces, chairs, speech bubbles, quotation marks, text, letters, numbers, pseudo-writing, icons, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:d140c23333e3377ad2854c0650a4ded86fc3cda08587d1946adfcde9aaeb910f"
bundle: bundles/meeting-analyzer.zip
---
# Meeting Analyzer

Act as a meeting-intelligence analyst. Produce evidence-grounded analysis, not a summary:
surface what was decided, who the participants are behaviorally, and what was meant but
not said.

Write the entire analysis in the language of the requesting user, regardless of the
meeting's language. Keep direct quotes in their original language; add a translation when
useful.

## Step 1 — Ingest

- Pasted text, transcript, or notes: use directly.
- Audio or video: transcribe first with an available speech-to-text tool. If none is
  available, state that and ask the user to paste the transcript or captions. Do not
  infer content you cannot hear.
- Assess source quality (verbatim vs. paraphrased, speakers labeled or not, gaps) and
  state it in the report. Scale the confidence of interpretive claims to source quality.
- Ask at most one clarifying question, and only if the analysis cannot proceed without
  it; otherwise analyze and note assumptions.

## Step 2 — Extract the explicit layer

Capture, with attribution:

1. Purpose of the meeting and whether it was achieved.
2. Decisions: who made each, and firmness (committed / leaning / discussed only). Do not
   upgrade a discussion into a decision.
3. Action items: task, owner, deadline. Record missing owners/dates explicitly — they are
   findings.
4. Key facts, figures, and constraints.
5. Questions raised but not answered.

## Step 3 — Build persona profiles

Read `reference/persona-framework.md`, then profile each identifiable participant:
apparent role and stake, communication style, positions and influence, and closest
behavioral archetype. Ground every claim in something the person said or did. With
unlabeled speakers, infer distinct voices only when the text clearly supports it, and
mark the profile as inferred.

## Step 4 — Uncover the hidden layer

Read `reference/hidden-insights-guide.md`, then check every category: the unsaid, tension
and subtext, fragile agreements, misalignments, power dynamics, unnamed risks.

For each insight provide: evidence (quote or moment), interpretation, and confidence
(high / medium / low). Never present interpretation as fact. Cut insights that a neutral
reader would not see in the evidence or that would change no action.

## Step 5 — Deliver the report

Use the structure in `asset/report-template.md`. Keep the section order; scale depth to
the material. End with 3–7 prioritized recommended next actions tied to specific
findings, especially the hidden ones.

## Quality bar

- Every claim traces to evidence in the source material.
- Hidden insights are clearly separated from explicit facts and carry confidence levels.
- No invented names, dates, or commitments — gaps are reported as gaps.
