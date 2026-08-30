---
name: Iterative File Editing
description: "In Copilot Studio, re-sending an edited file under the same name fails to deliver it — the change is made but never reaches the user. This skill gives each iteration a new version-numbered filename (report_v1.docx, report_v2.docx…) so every update actually lands in the chat as its own attachment."
agentDescription: "Use this skill whenever you create or edit ANY file for the user in the Copilot Studio container — a document, spreadsheet, slide deck, code file, data export, anything. It keeps your work-in-progress durable and shows the user an updated version after every change, so the two of you refine the same file together across turns — the user sees real progress each round, earlier work is never lost, and neither of you has to start over. Apply it from the very first file you make."
platforms: [Copilot Studio]
tags: [files, iteration, workflow, collaboration, productivity]
author: Adi Leibowitz
authorUrl: "https://github.com/adilei"
authorGithub: adilei
version: 1.0.0
createdAt: 2026-07-21
updatedAt: 2026-07-21
coverImage: skill-art/iterative-file-editing.webp
coverImageAlt: "Four blank document panels advance through a bound revision cradle, with the newest panel highlighted in orange."
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a compact sequence of blank document panels becomes progressively more refined through layered physical revisions, with the newest complete panel presented clearly at the front\nScene/backdrop: an uncluttered warm-paper work surface with one small centered slate editing cradle and no office props\nSubject: four completely blank document panels nested in a shallow stepped stack, connected by one continuous cyan binding ribbon, with the frontmost finished panel carrying a plain orange edge accent\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; centered slightly top-down view; contain every document corner, the entire binding ribbon, cradle, and all shadows within the central 64% of the canvas; leave at least 18% calm empty border on all four sides; no object may enter the outer 12%; simple silhouette legible at small card size\nLighting/mood: calm, iterative, dependable, quietly technical\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: document surfaces completely blank; no arrows, chevrons, version numbers, filenames, text, letters, numbers, pseudo-writing, stamps, seals, icons, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:2cce44d69f7fa129baf9fece6d9b01ec561ef2da1664ff56202ae8fbb6b8895c"
featured: true
---
When you send the user an updated version of a file you've **already** sent them,
give it a new filename with an incremented version number — `report_v2.docx`,
`report_v3.docx`, and so on. If you reuse the filename the user has already
received, the delivery event won't fire and they'll never get the update, even
though the file changed. A filename they haven't seen before is what triggers the
send.

So annotate each iteration with the next version number, and the user receives
every version as its own attachment.

## Example
```
report_v1.docx   first version sent to the user
report_v2.docx   the same file after "make the timeline more detailed"
report_v3.docx   after "also add a budget table"
```
