---
name: Grab My Files
description: One-tap way to bundle every file your Copilot Studio agent produced in a session into a single timestamped .zip and hand it back as a download.
agentDescription: "Bundle every file the agent produced in this session into a single timestamped .zip and hand it back as a download. Use when the user asks to \"export all produced files\", \"zip my files\", \"package everything you made\", \"bundle my files\", \"give me all the files\", or similar. Files are read from /app/created/. Do NOT use to fetch a single named file the user can already download on its own, to create or convert a file, or to save/persist files to SharePoint, OneDrive, or Dataverse — those are separate flows, not a local zip-and-download."
platforms: [Copilot Studio]
tags: [files, export, zip, download, productivity]
author: Rafael Alcaraz
authorUrl: "https://github.com/rafalcaraz"
authorGithub: rafalcaraz
version: 1.0.0
createdAt: 2026-07-24
updatedAt: 2026-07-24
coverImage: skill-art/grab-my-files.webp
coverImageAlt: Blank file sheets converge through a clasp into a single zippered archive pouch.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Several varied blank file sheets and media tiles sweep together through a precise mechanical clasp and emerge as one compact zippered archive pouch, a single clear metaphor for collecting every session output into one download.\nScene/backdrop: An uncluttered warm-paper tabletop with a centered slate assembly platform, no room scenery and no interface.\nSubject: A compact navy archive pouch with a cyan zipper and sparing orange pull tab, plus a small fan of completely blank paper sheets and unlabeled media tiles converging into it.\nStyle/medium: premium editorial illustration with tactile dimensional detail, folded paper, woven canvas, matte metal, and subtle embossed depth\nComposition/framing: exact 16:10 landscape; centered slightly top-down view at a noticeably smaller scale; use a short compact file fan and keep every sheet, tile, clasp, platform edge, pouch, zipper, and pull tab fully inside the central 68% of the frame; leave at least 16% completely empty warm-paper border on all four sides; no object may enter the outer 12%; simple silhouette legible at small card size\nLighting/mood: calm, capable, orderly, quietly technical, with restrained cyan backlighting and soft directional shadows\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, pseudo-writing, filenames, labels, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI, no Microsoft Fluent gradients, and no Microsoft branding; all papers, tiles, and pouch surfaces must be completely blank and unmarked"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:cb6c5e20c58b9e8d16f1cda3fca6f4e131f659a5402300a8567161c2d0382f87"
---
# Grab My Files

## When to use

Invoke when the user says anything like:
- "export all produced files" / "package everything"
- "zip up my files" / "bundle my files"
- "give me everything you made" / "download all the outputs"

If the user names a subset ("just the PDFs", "only the report"), honor that and zip
only the matching files, but still follow the rules below.

## How to export

1. **Inspect the folder.** List `/app/created/` **recursively** so nested outputs
   (e.g. `/app/created/charts/foo.png`) are included, not just top-level files.
2. **Decide what goes in.** Include every produced file **except**:
   - any previous export archive (files named `all_files_produced_*.zip`), and
   - hidden/system junk (`.DS_Store`, `Thumbs.db`, `*.tmp`, dotfiles).
3. **Prune old exports *after* the new one is written.** Build the new archive
   first, then delete any *other* `all_files_produced_*.zip` in `/app/created/`.
   Doing it in this order means a failed build never destroys the user's previous
   bundle, and no old export gets nested inside the new one.
4. **Handle the empty case.** If nothing qualifies, tell the user there are no
   produced files to export and stop — do not create an empty zip.
5. **Name the archive** `all_files_produced_<YYYYMMDD_HHMMSS>.zip` — a sortable,
   UTC timestamp — and write it to `/app/created/`.
6. **Preserve structure.** Keep the relative folder layout inside the zip so files
   restore to the same subfolders they came from.
7. **Deliver it.** Return the finished `.zip` to the user as a download — don't just
   report that it was created. In Copilot Studio, writing the file to `/app/created/`
   surfaces it as a downloadable attachment; make sure the user gets that link.

## Confirm to the user

After the zip is written, reply with:
- the archive name (including its timestamp),
- the total count of files packaged, plus a list of up to 50 packaged paths (sorted). If there are more than 50, list the first 50 and say how many additional files were included, and
- a note that the zip is attached and ready to download.

> I've packaged **3 file(s)** into **`all_files_produced_20260724_215812.zip`**:
> - `onboarding_overview.pdf`
> - `onboarding_overview.docx`
> - `charts/headcount.png`
>
> It's attached above and ready to download. 📦
