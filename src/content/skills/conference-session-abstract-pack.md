---
name: Conference Session Abstract Pack
description: "Create CFP-ready talk titles, abstracts, takeaways, speaker notes, and submission copy from a topic."
agentDescription: "Use this skill when the user asks to create a conference session proposal, talk abstract, CFP submission, session title, description, learning objectives, takeaways, or speaker bio."
platforms: [Cowork, Copilot Studio, Scout]
tags: [writing, conference, abstract, speaking, content, productivity]
author: Simon Owen
authorUrl: "https://github.com/SimonOwenDigital"
authorGithub: SimonOwenDigital
version: 0.1.0
createdAt: 2026-07-17
updatedAt: 2026-07-17
coverImage: skill-art/conference-session-abstract-pack.webp
coverImageAlt: Blank paper sheets form a compact conference stage beneath three focused lights.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a small stack of completely blank paper sheets folding upward into a polished conference stage, turning an initial idea into a coherent talk proposal\nScene/backdrop: a quiet warm-paper architectural space with a slate floor and three restrained overhead light cones, uncluttered and editorial\nSubject: one compact central stage formed from layered blank sheets, a simple unmarked lectern silhouette, and three converging light beams that imply title, abstract, and takeaways without displaying content\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; scale down and center the complete stage, every paper edge, all three full light fixtures, every light cone, and every shadow so all remain between 18% and 82% of both canvas axes; outer 18% on every edge remains calm empty atmosphere with no objects, fixtures, beams, paper, stage surface, or shadows; no essential detail in the outer 8%\nLighting/mood: calm, capable, quietly technical, with restrained cyan backlighting and a sparing orange stage accent\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: every sheet and lectern surface must be completely blank and unmarked; no audience figures; no text, letters, numbers, symbols, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:d72c33ebc69929737ad340d8b771c92037c34b50761e73ce1386c08671ea90f7"
bundle: bundles/conference-session-abstract-pack.zip
---
# Conference Session Abstract Pack

Use this skill to turn a topic, idea, draft, or talk outline into a submission-ready conference session pack.

## Evidence and positioning rules

- Do not invent speaker credentials, awards, employers, clients, or events.
- Use only the speaker bio information provided by the user or available in connected sources.
- Tailor the submission to the named event, audience, track, format, and session length when supplied.
- If the event constraints are unknown, produce a flexible draft and list assumptions.

## Inputs to look for

- Topic or rough idea.
- Target event or community.
- Audience level: beginner, intermediate, advanced, executive, maker, developer, architect, practitioner.
- Format: session, workshop, lightning talk, panel, keynote, theatre session.
- Desired tone: practical, provocative, technical, strategic, hands-on, story-led.
- Speaker bio or credentials.
- Character or word limits.

## Workflow

1. Identify the central promise of the session.
2. Define the audience and why they should attend.
3. Create several title options with different emphasis.
4. Draft the main abstract in a clear, credible style.
5. Produce learning objectives or takeaways.
6. Add a short audience-fit note and optional speaker notes.
7. If constraints are missing, include a compact assumptions section.

## Output format

```markdown
# Conference session abstract pack

## Recommended title

[Title]

## Alternative titles

1. [Alternative]
2. [Alternative]
3. [Alternative]

## Abstract

[Submission-ready abstract]

## Audience

[Who this is for]

## Key takeaways

- [Takeaway]
- [Takeaway]
- [Takeaway]

## Why this session matters now

[Short positioning paragraph]

## Speaker bio

[Bio if source material is available, otherwise: "Speaker bio not supplied."]

## Optional short version

[Short abstract for tighter submission forms]

## Assumptions or gaps

- [Only include if needed]
```

## Writing guidance

- Make the title specific, not generic.
- Show what the audience will be able to do or understand afterwards.
- Avoid hype and empty trend language.
- Use confident but evidence-led phrasing.
- Keep the abstract readable aloud.


## References

This skill includes supporting reference material. Read the relevant reference file when the task needs additional structure, rubric detail, examples, or checklist support.

- `references/cfp-quality-checklist.md` - use this when additional structure, examples, or checks are useful for the task.

## Quality checklist

Before responding, check:

- The title is memorable and relevant.
- The abstract has a clear promise.
- The takeaways are practical and distinct.
- No credentials or event details have been invented.
- The pack can be pasted into a CFP form with minimal editing.
