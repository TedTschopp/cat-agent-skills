---
name: Blog Post Structure Pass
description: Restructure draft or existing blog posts into a stronger narrative without inventing new claims.
agentDescription: "Use this skill when the user asks to restructure, reorganise, improve, rewrite, tighten, or strengthen a blog post, article, newsletter, essay, or thought-leadership draft."
platforms: [Cowork, Copilot Studio, Scout]
tags: [blog, writing, authoring, content, structure, productivity]
author: Simon Owen
authorUrl: "https://github.com/SimonOwenDigital"
authorGithub: SimonOwenDigital
version: 0.1.0
createdAt: 2026-07-17
updatedAt: 2026-07-17
coverImage: skill-art/blog-post-structure-pass.webp
coverImageAlt: Loose blank article cards travel through a cyan guide and lock into five ordered modules ending at a safely inset orange marker.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Create a premium editorial illustration of a blog draft being reorganized into a clear narrative spine without changing its underlying material.\nScene/backdrop: A sparse warm paper-toned composition bench with an open field and no software interface.\nSubject: Six blank tactile paper modules begin as a loose uneven cluster on the left, travel through one elegant cyan guide rail, and lock into a single coherent rising sequence on the right; the same small navy and orange geometric evidence pieces remain visibly preserved as they move into the stronger structure.\nStyle/medium: Premium editorial illustration with tactile dimensional detail, layered cut paper, matte ceramic joints, and restrained translucent acrylic.\nComposition/framing: Exact 16:10 landscape; one strong left-to-right transformation; crop-safe central guide rail and finished sequence; no essential detail in the outer 8%; simple silhouettes legible on a small gallery card.\nLighting/mood: Calm, editorial, purposeful, quietly technical, with soft studio light, restrained cyan backlighting, and a sparing orange focal accent.\nColor palette: Warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027.\nConstraints: No text, letters, numbers, headings, interface labels, logos, trademarks, or watermark; no pseudo-writing or writing-like lines; no paw imagery or paw logo; no cats or cat silhouettes; no literal browser, product UI, Microsoft Fluent gradients, or Microsoft branding.\nTargeted correction: Pull the entire finished sequence and orange endpoint inward so every object has at least 8% clear warm-paper margin from all edges. Use five finished modules rather than six, keep their heights moderately varied, and preserve the same simple geometric evidence pieces without adding any markings.\nTargeted correction 2: Scale down and recenter the entire transformation as one self-contained tabletop model. Every loose source card, every segment of the cyan guide tube, every white connector node, all five finished cards, and the final orange endpoint must be fully contained inside the central 84% of the canvas. Leave a continuous empty warm-paper border at least 8% wide on all four sides, with the orange endpoint clearly separated from the right border rather than touching or approaching it."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:37a00fd69439f28a3064df2c6e67ded0e9f7e5e688383884469421b84a3206d9"
bundle: bundles/blog-post-structure-pass.zip
---
# Blog Post Structure Pass

Use this skill to improve the structure, argument, flow, and readability of a blog post while preserving the source facts and the author's intended point of view.

## Core rules

- Do not invent evidence, examples, client stories, dates, results, or quotes.
- Preserve the author's stance unless asked to change it.
- Improve the shape of the argument before polishing sentences.
- Keep the revised post suitable for the intended audience and channel.
- If important evidence is missing, mark it as a gap rather than filling it in.

## Default post skeleton

Use this skeleton as a guide, not a rigid template:

1. **Hook / tension** - Why this matters now.
2. **Problem** - What people usually misunderstand or struggle with.
3. **Reframe** - The more useful way to think about it.
4. **Practical implications** - What changes in decisions, behaviour, governance, delivery, or operations.
5. **Example or proof** - Evidence from supplied material.
6. **Takeaway** - What the reader should do, question, or remember.

## Workflow

1. Read the source post or draft.
2. Identify the current thesis and intended audience.
3. Diagnose structural issues: weak opening, unclear argument, repetition, missing transitions, unsupported claims, premature solutioning, or weak ending.
4. Create a revised outline.
5. Rewrite the post into the improved structure.
6. Preserve factual claims from the source and avoid adding unsupported material.
7. Provide a short change note only if useful.

## Output format

```markdown
# [Revised title]

[Rewritten post]

---

## Change notes

- [Only include important changes, assumptions, or evidence gaps.]
```

If the user asks for the structure only, use:

```markdown
## Recommended structure

1. [Section]
2. [Section]
3. [Section]

## Rationale

[Short explanation]
```


## References

This skill includes supporting reference material. Read the relevant reference file when the task needs additional structure, rubric detail, examples, or checklist support.

- `references/post-structure-patterns.md` - use this when additional structure, examples, or checks are useful for the task.

## Quality checklist

Before responding, check:

- The revised post has a clear thesis.
- The opening creates relevance quickly.
- The middle develops the argument rather than listing points.
- The ending lands the insight or next action.
- No unsupported facts have been added.
- The copy sounds natural and human.
