---
name: Commenting Content
description: Comments Word or PowerPoint files with Comments.
agentDescription: "Analyzes a .docx or .pptx file, researches the topic using internal documents, emails, Microsoft Teams messages, and web sources, then adds native comments throughout the file authored by \"Copilot Studio AI\" — without modifying the original content."
platforms: [Cowork, Copilot Studio]
tags: [documents, productivity]
author: AndrewHessMSFT
authorUrl: "https://github.com/AndrewHessMSFT"
authorGithub: AndrewHessMSFT
version: 1.0.0
createdAt: 2026-07-08
updatedAt: 2026-07-08
coverImage: skill-art/commenting-content.webp
coverImageAlt: Blank paper stack surrounded by cyan research beacons casting precise light onto selected areas.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Show a pristine layered blank-document sculpture remaining untouched while small evidence beacons dock around its edges and cast precise pools of light onto selected areas, a visual metaphor for adding researched comments without altering the source content.\nScene/backdrop: quiet slate worktable against a warm paper field, uncluttered and architectural\nSubject: one central stack of sculptural blank paper layers; a restrained ring of cyan glass beacons with one sparing orange beacon around the perimeter; narrow clean light paths touch specific points on the paper while the paper itself remains intact\nStyle/medium: premium editorial illustration with tactile dimensional detail, hand-finished paper, frosted glass, and anodized metal\nComposition/framing: exact 16:10 landscape; strong centered silhouette; all paper, beacons, and light endpoints fully contained within the central 84% crop-safe area; calm negative space around the system\nLighting/mood: calm, capable, quietly technical; soft cyan backlight and restrained warm highlights\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, pseudo-writing, letters, numbers, symbols, icons, checkmarks, logos, trademarks, or watermark; no speech bubbles or comment bubbles; no product UI, document UI, chat UI, or Microsoft Fluent branding; no paw imagery or paw logo; no cats or cat silhouettes\nTargeted correction: preserve the concept exactly, but scale the complete paper-and-beacon apparatus down so every beacon sits at least 12% in from every canvas edge and the whole system occupies no more than about 72% of the frame width and height."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:f98b572a8a4a00b9085be5494f24c300ece277dce577d67baa2fdd6fa9afc2c2"
bundle: bundles/commenting-content.zip
---
# Comment Content

When this skill is activated:

1. Check the file extension of the attached document.
   - If `.docx` → follow the instructions in `REFERENCE-DOCX.md`
   - If `.pptx` → follow the instructions in `REFERENCE-PPTX.md`
   - If any other format → ask the user to convert to `.docx` or `.pptx` first.
2. Execute the full commenting workflow defined in the appropriate reference file.
3. Return the updated file with native comments embedded and a short chat summary of findings.

## Guidelines

- Never modify the original document content — add comments only.
- Set the comment author to `Copilot Studio AI` on every comment added.
- Research using any available sources: internal documents, emails, Microsoft Teams messages, approved knowledge sources, and web research tools.
- Only comment where it genuinely helps — do not comment on every sentence.
- The chat summary must include: comment count, main research findings, and top 1–3 priority issues for the author to review.

## Reference Files

- [`REFERENCE-DOCX.md`](./REFERENCE-DOCX.md) — Word document commenting instructions
- [`REFERENCE-PPTX.md`](./REFERENCE-PPTX.md) — PowerPoint presentation commenting instructions

## Examples

**Example 1: Word document**
- User request: "Add research comments to this report." (attaches report.docx)
- Expected behavior: Detect .docx, follow REFERENCE-DOCX.md, return commented .docx with summary.

**Example 2: PowerPoint presentation**
- User request: "Review this deck and add comments." (attaches deck.pptx)
- Expected behavior: Detect .pptx, follow REFERENCE-PPTX.md, return commented .pptx with summary.

## Notes

- If multiple files are attached, process them one at a time and produce a separate summary for each.
- If the file type is ambiguous, ask the user to confirm before proceeding.
