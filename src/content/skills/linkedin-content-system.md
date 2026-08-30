---
name: LinkedIn Content System
description: "Create evidence-led LinkedIn posts, promos, newsletter intros, and long-form copy from supplied facts or drafts."
agentDescription: "Use this skill when the user asks to create LinkedIn posts, promotional posts, thought-leadership posts, newsletter introductions, article intros, or long-form LinkedIn content from source notes, facts, or drafts."
platforms: [Cowork, Copilot Studio, Scout]
tags: [linkedin, social-media, writing, marketing, content]
author: Simon Owen
authorUrl: "https://github.com/SimonOwenDigital"
authorGithub: SimonOwenDigital
version: 0.1.0
createdAt: 2026-07-17
updatedAt: 2026-07-17
coverImage: skill-art/linkedin-content-system.webp
coverImageAlt: Blank evidence cards pass through an editorial loom and emerge as three coherent publication forms.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a grounded set of evidence fragments passes through an orderly editorial loom and resolves into several coherent publication forms, suggesting one reusable system for credible professional content\nScene/backdrop: an uncluttered warm-paper editorial workshop field with one compact centered slate plinth and no desk accessories\nSubject: a small fan of completely blank evidence cards feeding through a tactile navy-and-cyan weaving frame into three distinct blank portrait-format paper forms, with one restrained orange quality marker expressed only as material\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; centered frontal view at a compact scale; contain all cards, frame, finished forms, plinth, and shadows within the central 68% of the canvas; leave at least 16% calm empty border on every side; no object may enter the outer 12%\nLighting/mood: credible, composed, practical, quietly technical\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: every paper surface blank and unmarked; no social-network logos, brand colors, profile silhouettes, text, letters, numbers, pseudo-writing, hashtags, icons, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:5ffe1e3f252182e363149476413a27ea6fc9d7ae3882da799ae95d871ad0bb5b"
bundle: bundles/linkedin-content-system.zip
---
# LinkedIn Content System

Use this skill to create credible LinkedIn content from supplied facts, notes, drafts, articles, or source material.

## Core rules

1. **No invented evidence.** Do not invent metrics, client names, event details, quotes, claims, or results.
2. **No fake authority.** Do not imply the author has done, seen, led, or researched something unless supplied evidence supports it.
3. **Keep the voice human.** Avoid generic inspirational language, over-polished corporate phrasing, and forced hooks.
4. **Fit the format.** Match the output to the requested LinkedIn surface: short post, promotional post, event post, newsletter intro, article intro, carousel copy, or long-form article.
5. **Avoid unnecessary links or citations in the post body unless the user asks for them.** Keep LinkedIn copy clean and paste-ready.

## Inputs to look for

- Source article, draft, notes, or bullet points.
- Audience and desired action.
- Author voice guidance.
- Desired length.
- Specific announcement, event, launch, model, or point of view.
- Whether links, hashtags, mentions, or calls to action should be included.

## Workflow

1. Read the supplied source material.
2. Extract the central point, proof points, and intended reader response.
3. Choose the appropriate LinkedIn format.
4. Draft in a natural style with clear paragraphs.
5. Keep the post grounded in supplied content.
6. Provide variants if requested.

## Output formats

### Short post

```markdown
[Post copy]
```

### Promo post

```markdown
[Post copy]

[Optional CTA]
```

### Newsletter or article intro

```markdown
# [Title]

[Intro copy]
```

### Multi-variant output

```markdown
## Recommended version

[Post]

## Alternative angle

[Post]

## Shorter version

[Post]
```

## Style guidance

- Prefer concrete observations over broad claims.
- Use short paragraphs but avoid a stack of one-line fragments unless the user requests that style.
- Avoid manipulative hooks such as "Stop doing X" unless it genuinely fits the user's tone.
- Make the first line specific enough to be worth reading.
- End with a useful reflection, question, or action rather than a generic CTA.


## References

This skill includes supporting reference material. Read the relevant reference file when the task needs additional structure, rubric detail, examples, or checklist support.

- `references/linkedin-format-guide.md` - use this when additional structure, examples, or checks are useful for the task.

## Quality checklist

Before responding, check:

- The content is grounded in supplied facts.
- It reads like a credible human post.
- It fits the requested LinkedIn surface.
- It avoids unnecessary links, references, and invented proof.
- The user can paste it directly into LinkedIn.
