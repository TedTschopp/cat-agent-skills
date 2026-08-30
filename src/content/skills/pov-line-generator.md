---
name: POV Line Generator
description: "Generate sharp, specific point-of-view lines for posts, slides, talks, campaigns, or positioning work."
agentDescription: "Use this skill when the user asks for a point of view, punchy line, positioning sentence, provocative statement, headline angle, opinion line, or concise strategic stance."
platforms: [Cowork, Copilot Studio, Scout]
tags: [writing, positioning, marketing, content, social-media]
author: Simon Owen
authorUrl: "https://github.com/SimonOwenDigital"
authorGithub: SimonOwenDigital
version: 0.1.0
createdAt: 2026-07-17
updatedAt: 2026-07-17
coverImage: skill-art/pov-line-generator.webp
coverImageAlt: Tangled cyan and paper ribbons pass through a navy prism and resolve into one sharp orange-edged beam.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: A tangled bundle of muted idea ribbons enters a precision prism and emerges as one sharp orange-edged beam that holds a clear course between two opposing planes, expressing a concise point of view with useful tension.\nScene/backdrop: An uncluttered slate editorial studio with warm paper planes and restrained negative space.\nSubject: One central navy prism, a small bundle of incoming cyan and paper ribbons, and one strong resolved beam with a sparing orange edge.\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; crop-safe focal subject; no essential detail in the outer 8%\nLighting/mood: calm, capable, quietly technical\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding\nCorrection: Make the ribbon bundle, prism, resolved beam, and two opposing planes a finite compact tabletop sculpture entirely inside the inner 84% with a clearly empty border; no ribbon, beam, point, plane, or other form may enter from or exit through a frame edge."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:d1eb3126037e3ab2b2070d73852080bd26e3ac670a7805206fb99a96c27729ac"
bundle: bundles/pov-line-generator.zip
---
# POV Line Generator

Use this skill to generate concise, distinctive point-of-view lines that help a user frame an argument, post, slide, campaign, or talk.

## What makes a good POV line

A strong POV line should:

- Take a clear stance.
- Be specific enough to be meaningful.
- Avoid generic trend commentary.
- Create useful tension without becoming clickbait.
- Be easy to reuse as a post opener, slide headline, talk premise, campaign angle, or executive summary line.

## Inputs to look for

- Topic or theme.
- Audience.
- Desired stance or tension.
- Channel: LinkedIn, slide, keynote, blog, proposal, campaign, workshop.
- Tone: practical, provocative, premium, accessible, technical, executive, conversational.
- Words to include or avoid.

## Workflow

1. Identify the underlying argument, not just the topic.
2. Look for a tension: common belief vs better belief, adoption vs transformation, activity vs value, tooling vs operating model, speed vs control, scale vs quality.
3. Generate one recommended line first.
4. Provide alternatives grouped by style.
5. Keep each line concise and useful.
6. Do not invent evidence or claims.

## Output format

```markdown
## Recommended POV line

[One strong line]

## Alternatives

### More direct
- [Line]
- [Line]

### More provocative
- [Line]
- [Line]

### More executive
- [Line]
- [Line]

## Why the recommended line works

[One short explanation]
```


## References

This skill includes supporting reference material. Read the relevant reference file when the task needs additional structure, rubric detail, examples, or checklist support.

- `references/pov-patterns.md` - use this when additional structure, examples, or checks are useful for the task.

## Quality checklist

Before responding, check:

- The line has a clear point of view.
- It is not interchangeable with any other topic.
- It avoids empty hype.
- It can plausibly open a post, slide, talk, or section.
- The alternatives are meaningfully different, not minor rewrites.
