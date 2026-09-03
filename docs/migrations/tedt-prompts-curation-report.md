# Prompt Migration Curation Report

Source snapshot: [https://github.com/TedTschopp/tedt.org](https://github.com/TedTschopp/tedt.org/tree/61d55789c8754fec010824ccccb893e25f19ccb3/_posts/prompts) at `61d55789c8754fec010824ccccb893e25f19ccb3`  
Source commit date: 2026-09-01T12:56:25Z  
Manifest: [tedt-prompts-inventory.json](./tedt-prompts-inventory.json)  
Manifest digest: `sha256:7c60d5d86e2708139359fa69aae895b251436ebce5dc3f88671f0efd8cdb5473`

Inventory scope: `_posts/prompts` contains the 56 published prompt posts. The separate tracked `prompts/` tree (100 Markdown files) is not the published alpha collection and is explicitly excluded from this gate.

## Approval Requested

Approve the global defaults and recommended treatments below. This report accounts for all 56 published prompt sources. The default is to recommend every prompt for migration; no source is deleted or merged without an explicit override.

Expected curation result if every recommendation is approved: **56 approved for migration · 0 held for curation · 56 still blocked from publication pending new artwork**.

Approval authorizes curation decisions only. It does not authorize prompt import, image generation, deployment, deletion, or redirect activation.

## Decision Summary

| Total | Visible in Alpha Index | Missing From Alpha Index | Series Records | Recommended for Migration | Curation Hold | Publication-Blocked Pending Artwork |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 56 | 43 | 13 | 3 | 56 | 0 | 56 |

### Alpha Content Captured

| Content | Sources With Content | Captured Amount | Migration Treatment |
| --- | ---: | ---: | --- |
| Prompt bodies | 56 | 1,687,972 characters | Hash now; write approved content to `.prompt.md` during import |
| Detail-page guides | 56 | 76,711 characters | Hash now; map unchanged to the unified asset guide during import |
| Descriptions | 56 | — | Map to catalog descriptions |
| Subtitles | 46 | — | Preserve where present |
| Summary bullet arrays | 52 | 241 bullets | Preserve source order |
| SEO descriptions | 42 | — | Preserve where present |
| Updated dates | 3 | — | Preserve where present |
| Customization variables | 4 source prompts | 24 source definitions | 5 prompts and 25 definitions after approving E05 |
| Legacy image provenance | 41 | 15 unique binary hashes; 15 fallback pages | Retain only in the migration manifest |
| Replacement artwork | 56 | 0 generated; 56 pending approval | Generate through the AI.Tedt.org artwork pipeline after this gate |

## Global Defaults

| ID | Default Rule |
| --- | --- |
| D01 | Approve all 56 sources for migration unless an explicit override places one on curation hold. Publication remains blocked until every later release gate passes. |
| D02 | Store the unified kind identifier as `prompt-template` and display its proper type label as **Prompt Template File**. |
| D03 | Preserve decoded prompt content and all 56 explanatory guide bodies exactly except CRLF or CR line endings normalize to LF. Record the exact source-file hash plus separate normalized prompt and guide hashes. |
| D04 | Use a safe lowercase canonical slug and preserve the exact Tedt.org path as a redirect alias. |
| D05 | Apply AP headline-style capitalization only to proposed catalog titles. Preserve source titles in provenance and map subtitles, descriptions, ordered summary bullets, SEO descriptions, authors, and published/updated dates without inventing missing values. |
| D06 | Present source tags as Topics and retain keywords as search aliases. |
| D07 | Map model strings to provider/product compatibility while retaining every original identifier in provenance. |
| D08 | Preserve variables, defaults, help, validation rules, and series evidence. Apply only the explicitly approved variable and two-workflow repairs listed below. |
| D09 | Before publication, generate a new, unique AI.Tedt.org editorial cover for every migrated prompt with the existing built-in artwork workflow. Never copy, crop, trace, recolor, or use legacy artwork as an image-generation reference. A missing, blocked, partial, or stale cover blocks that prompt. |
| D10 | Preserve legacy image paths, metadata, credits, dimensions, and binary hashes only as migration provenance. Do not map them into active `coverImage*` fields or credit replacement art with legacy metadata. |
| D11 | Start AI.Tedt.org ratings and discussions fresh. Do not migrate alpha Webmentions, Mastodon threads, or browser-local likes. |
| D12 | Preserve every source separately by default. A merge requires explicit approval. |

## Decisions Requiring Approval

| ID | Exception | Affected | Prompts | Recommended Treatment | Recommended Disposition |
| --- | --- | ---: | --- | --- | --- |
| E01 | Exact duplicate prompt body | 2 | [Architecture Product Requirements Document (PRD) Template 2](https://tedt.org/prompts/product-requirements-document-prd-template-2/); [Architecture Product Requirements Document (PRD) Template 3](https://tedt.org/prompts/product-requirements-document-prd-template-3/) | Retain each prompt as a distinct version. Do not merge either record without a separate explicit approval. | APPROVE FOR MIGRATION |
| E02 | Work-in-progress title | 1 | [Work In Progress: Technology Architecture Generator](https://tedt.org/prompts/technology-architecture-as-markdown/) | Remove the work-in-progress prefix from the catalog title and migrate the asset with BETA status. | APPROVE FOR MIGRATION AS BETA |
| E03 | Title needs editorial repair | 5 | [Business Business Skills Prompts](https://tedt.org/prompts/business-skills-prompts/); [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/); [Communications expert novelist](https://tedt.org/prompts/expert-novelist/); [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/); [Risk Assessment clean up](https://tedt.org/prompts/risk-assessment-clean-up/) | Use each record's proposed catalog title and preserve its original title in migration provenance. | APPROVE FOR MIGRATION |
| E04 | Description names the wrong version | 1 | [Architecture Product Requirements Document (PRD) Template 3](https://tedt.org/prompts/product-requirements-document-prd-template-3/) | Correct Template 3 catalog and SEO descriptions to identify Template 3; preserve the prompt body. | APPROVE FOR MIGRATION |
| E05 | Prompt token has no variable definition | 1 | [Architecture PRD Generator](https://tedt.org/prompts/prd-generator/) | Add a required textarea variable named prd_instructions without changing the prompt body. Treat capitalized and prose-filled double braces as literal authoring placeholders, not app variables. | APPROVE AFTER VARIABLE REPAIR |
| E06 | Declared variable is unused | 1 | [Academic Content Critique Template](https://tedt.org/prompts/academic-critique-content/) | Approve the proposed one-line prompt-body repair that references include_grading, then record and verify the resulting new body hash. | APPROVE AFTER EXACT BODY REPAIR |
| E07 | Broken series target | 3 | [Academic Content Critique Template](https://tedt.org/prompts/academic-critique-content/); [Simple Blog Post Generator](https://tedt.org/prompts/simple-blog-generator/); [Universal Content Creator - Variable Types Demo](https://tedt.org/prompts/universal-content-creator-demo/) | Replace the missing filename with prompt:academic-critique-content and represent the two source branches as the proposed simple-blog-review and universal-content-review workflows. | APPROVE FOR MIGRATION |
| E08 | Legacy route requires an explicit alias | 3 | [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/); [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/); [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/) | Use each safe lowercase canonical slug and retain its exact unusual Tedt.org route as an explicit redirect alias. | APPROVE FOR MIGRATION |
| E09 | Published prompt missing from the alpha index | 13 | [Communications Be an Expert and Give Advice](https://tedt.org/prompts/be-an-expert-and-give-advice/); [Business Case and Requirements Assistant](https://tedt.org/prompts/business-case-and-requirements-assistant/); [Communications expert novelist](https://tedt.org/prompts/expert-novelist/); [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/); [TTRPG Module Builder](https://tedt.org/prompts/module-builder/); [TTRPG Module Format](https://tedt.org/prompts/module-format/); and 7 more (see the manifest) | Include the prompt in the unified catalog and preserve the malformed legacy category only in migration provenance. | APPROVE FOR MIGRATION |
| E10 | Malformed model identifier | 10 | [AI Simulation Creator – Scenario-Based Skill Practice](https://tedt.org/prompts/ai-simulation-creator/); [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/); [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/); [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/); [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/); [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/); and 4 more (see the manifest) | Normalize 04-mini to o4-mini and 04-mini-high to o4-mini-high while preserving every original value in provenance. | APPROVE FOR MIGRATION |
| E11 | Ambiguous model identifier | 10 | [AI Simulation Creator – Scenario-Based Skill Practice](https://tedt.org/prompts/ai-simulation-creator/); [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/); [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/); [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/); [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/); [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/); and 4 more (see the manifest) | Preserve numeric model value 3 as unresolved; do not infer a model, provider, or launch action. | APPROVE FOR MIGRATION |

Grouped decisions may be overridden for one asset with `E##/canonical-slug`, or for the entire group with `E##`. The complete map below names every affected asset and its record-specific evidence.

<details>
<summary>Complete Decision-to-Asset Map</summary>

| Override Key | Prompt | Evidence | Record-Specific Treatment | Recommended Disposition |
| --- | --- | --- | --- | --- |
| `E01/product-requirements-document-prd-template-2` | [Architecture Product Requirements Document (PRD) Template 2](https://tedt.org/prompts/product-requirements-document-prd-template-2/) | Exact body match: product-requirements-document-prd-template-2, product-requirements-document-prd-template-3. | Retain each as a distinct version by default; merge only with explicit approval. | APPROVE FOR MIGRATION |
| `E01/product-requirements-document-prd-template-3` | [Architecture Product Requirements Document (PRD) Template 3](https://tedt.org/prompts/product-requirements-document-prd-template-3/) | Exact body match: product-requirements-document-prd-template-2, product-requirements-document-prd-template-3. | Retain each as a distinct version by default; merge only with explicit approval. | APPROVE FOR MIGRATION |
| `E02/technology-architecture-as-markdown` | [Work In Progress: Technology Architecture Generator](https://tedt.org/prompts/technology-architecture-as-markdown/) | Work In Progress: Technology Architecture Generator | Publish as BETA with the proposed title “Technology Architecture Generator”. | APPROVE FOR MIGRATION AS BETA |
| `E03/business-skills-prompts` | [Business Business Skills Prompts](https://tedt.org/prompts/business-skills-prompts/) | Business Business Skills Prompts | Publish with the proposed catalog title “Business Skills Prompts”; preserve the source title in provenance. | APPROVE FOR MIGRATION |
| `E03/create-a-unforgettable-opening-to-a-ttrpg` | [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/) | Create a Unforgettable Opening to a TTRPG | Publish with the proposed catalog title “Create an Unforgettable Opening to a TTRPG”; preserve the source title in provenance. | APPROVE FOR MIGRATION |
| `E03/expert-novelist` | [Communications expert novelist](https://tedt.org/prompts/expert-novelist/) | Communications expert novelist | Publish with the proposed catalog title “Communications Expert Novelist”; preserve the source title in provenance. | APPROVE FOR MIGRATION |
| `E03/find-your-super-power` | [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/) | Self Improvement Find your super power | Publish with the proposed catalog title “Find Your Superpower”; preserve the source title in provenance. | APPROVE FOR MIGRATION |
| `E03/risk-assessment-clean-up` | [Risk Assessment clean up](https://tedt.org/prompts/risk-assessment-clean-up/) | Risk Assessment clean up | Publish with the proposed catalog title “Risk Assessment Cleanup”; preserve the source title in provenance. | APPROVE FOR MIGRATION |
| `E04/product-requirements-document-prd-template-3` | [Architecture Product Requirements Document (PRD) Template 3](https://tedt.org/prompts/product-requirements-document-prd-template-3/) | Template 3 metadata describes template 2. | Correct catalog and SEO descriptions to identify Template 3; preserve the prompt body. | APPROVE FOR MIGRATION |
| `E05/prd-generator` | [Architecture PRD Generator](https://tedt.org/prompts/prd-generator/) | {{prd_instructions}} appears in the prompt but has no variable definition. | Add a required textarea variable named prd_instructions; preserve the prompt body. | APPROVE AFTER VARIABLE REPAIR |
| `E06/academic-critique-content` | [Academic Content Critique Template](https://tedt.org/prompts/academic-critique-content/) | include_grading is declared but never referenced by the prompt. | Add the approved line “Include a formal grading rubric: {{include_grading}}.” and record the new body hash. | APPROVE AFTER EXACT BODY REPAIR |
| `E07/academic-critique-content` | [Academic Content Critique Template](https://tedt.org/prompts/academic-critique-content/) | 2025-08-01-Critique-Content.md does not exist. | Map the relationship to 2025-08-01-Academic-Critique-Content.md by canonical slug. | APPROVE FOR MIGRATION |
| `E07/simple-blog-generator` | [Simple Blog Post Generator](https://tedt.org/prompts/simple-blog-generator/) | 2025-08-01-Critique-Content.md does not exist. | Map the relationship to 2025-08-01-Academic-Critique-Content.md by canonical slug. | APPROVE FOR MIGRATION |
| `E07/universal-content-creator-demo` | [Universal Content Creator - Variable Types Demo](https://tedt.org/prompts/universal-content-creator-demo/) | 2025-08-01-Critique-Content.md does not exist. | Map the relationship to 2025-08-01-Academic-Critique-Content.md by canonical slug. | APPROVE FOR MIGRATION |
| `E08/artistic-analysis` | [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/) | /prompts/artistic-Analysis/ | Use artistic-analysis as the canonical slug and preserve /prompts/artistic-Analysis/ as an exact redirect alias. | APPROVE FOR MIGRATION |
| `E08/create-a-unforgettable-opening-to-a-ttrpg` | [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/) | /prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/ | Use create-a-unforgettable-opening-to-a-ttrpg as the canonical slug and preserve /prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/ as an exact redirect alias. | APPROVE FOR MIGRATION |
| `E08/midjourney-v6-1-prompt-template` | [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/) | /prompts/midjourney-v6.1-prompt-template/ | Use midjourney-v6-1-prompt-template as the canonical slug and preserve /prompts/midjourney-v6.1-prompt-template/ as an exact redirect alias. | APPROVE FOR MIGRATION |
| `E09/be-an-expert-and-give-advice` | [Communications Be an Expert and Give Advice](https://tedt.org/prompts/be-an-expert-and-give-advice/) | categories=["Prompts - Communications"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/business-case-and-requirements-assistant` | [Business Case and Requirements Assistant](https://tedt.org/prompts/business-case-and-requirements-assistant/) | categories=["Prompts - Business"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/expert-novelist` | [Communications expert novelist](https://tedt.org/prompts/expert-novelist/) | categories=["Prompts - Communications"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/find-your-super-power` | [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/) | categories=["Prompts - Philosophy"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/module-builder` | [TTRPG Module Builder](https://tedt.org/prompts/module-builder/) | categories=["Prompts - Role Playing Games"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/module-format` | [TTRPG Module Format](https://tedt.org/prompts/module-format/) | categories=["Prompts - Role Playing Games"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/risk-assessment-clean-up` | [Risk Assessment clean up](https://tedt.org/prompts/risk-assessment-clean-up/) | categories=["Prompts - Opinion"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/role-and-objective` | [Role and Objective](https://tedt.org/prompts/role-and-objective/) | categories=["Prompts - AI"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/script-a-podcast` | [Communications Script a Podcast](https://tedt.org/prompts/script-a-podcast/) | categories=["Prompts - Communications"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/skill-profile-generator` | [TTRPG Skill Profile Generator](https://tedt.org/prompts/skill-profile-generator/) | categories=["Prompts - Role Playing Games"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/sora-prompt` | [Sora Prompt](https://tedt.org/prompts/sora-prompt/) | categories=["Prompts - AI"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/tiered-messaging-framework` | [Communications Tiered Messaging Framework](https://tedt.org/prompts/tiered-messaging-framework/) | categories=["Prompts - Communications"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E09/weapon-descriptions` | [TTRPG Weapon Descriptions](https://tedt.org/prompts/weapon-descriptions/) | categories=["Prompts - Role Playing Games"] | Publish in the unified catalog and normalize the legacy category only in mapped metadata. | APPROVE FOR MIGRATION |
| `E10/ai-simulation-creator` | [AI Simulation Creator – Scenario-Based Skill Practice](https://tedt.org/prompts/ai-simulation-creator/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/ai-simulation-creator-roleplay-prompt` | [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/ai-teaching-assistant-prompt-creator` | [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/ai-tutoring-prompt-designer` | [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/artistic-analysis` | [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/create-a-unforgettable-opening-to-a-ttrpg` | [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/marketing-copy-evaluation-template` | [Marketing Copy Evaluation & Rewrite Template](https://tedt.org/prompts/marketing-copy-evaluation-template/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/midjourney-v6-1-prompt-template` | [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/midjourney-v7-prompt-template` | [Midjourney Version 7 Prompt Generator Template](https://tedt.org/prompts/midjourney-v7-prompt-template/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E10/social-media-repurposing-template` | [Cross-Platform Social Media Repurposing Template](https://tedt.org/prompts/social-media-repurposing-template/) | 04-mini, 04-mini-high | Preserve the original identifiers in provenance and map them to ChatGPT compatibility. | APPROVE FOR MIGRATION |
| `E11/ai-simulation-creator` | [AI Simulation Creator – Scenario-Based Skill Practice](https://tedt.org/prompts/ai-simulation-creator/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/ai-simulation-creator-roleplay-prompt` | [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/ai-teaching-assistant-prompt-creator` | [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/ai-tutoring-prompt-designer` | [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/artistic-analysis` | [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/create-a-unforgettable-opening-to-a-ttrpg` | [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/marketing-copy-evaluation-template` | [Marketing Copy Evaluation & Rewrite Template](https://tedt.org/prompts/marketing-copy-evaluation-template/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/midjourney-v6-1-prompt-template` | [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/midjourney-v7-prompt-template` | [Midjourney Version 7 Prompt Generator Template](https://tedt.org/prompts/midjourney-v7-prompt-template/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |
| `E11/social-media-repurposing-template` | [Cross-Platform Social Media Repurposing Template](https://tedt.org/prompts/social-media-repurposing-template/) | 3 | Preserve the numeric value in provenance; do not infer a model or provider from it. | APPROVE FOR MIGRATION |

</details>

## Exact Catalog Metadata Repairs

These are the complete source-to-proposed values for E02, E03, E04. They do not change prompt bodies.

| Repair ID | Asset | Field | Source Value | Proposed Value |
| --- | --- | --- | --- | --- |
| `repair-title-business-skills-prompts` | `prompt:business-skills-prompts` | `title` | Business Business Skills Prompts | Business Skills Prompts |
| `repair-title-create-a-unforgettable-opening-to-a-ttrpg` | `prompt:create-a-unforgettable-opening-to-a-ttrpg` | `title` | Create a Unforgettable Opening to a TTRPG | Create an Unforgettable Opening to a TTRPG |
| `repair-title-expert-novelist` | `prompt:expert-novelist` | `title` | Communications expert novelist | Communications Expert Novelist |
| `repair-title-find-your-super-power` | `prompt:find-your-super-power` | `title` | Self Improvement Find your super power | Find Your Superpower |
| `repair-title-risk-assessment-clean-up` | `prompt:risk-assessment-clean-up` | `title` | Risk Assessment clean up | Risk Assessment Cleanup |
| `repair-title-technology-architecture-as-markdown` | `prompt:technology-architecture-as-markdown` | `title` | Work In Progress: Technology Architecture Generator | Technology Architecture Generator |
| `repair-prd-template-3-description` | `prompt:product-requirements-document-prd-template-3` | `description` | Professional architecture product requirements document (prd) template 2 prompt designed for high-quality content generation and structured analysis. | Professional architecture product requirements document (PRD) Template 3 prompt designed for high-quality content generation and structured analysis. |
| `repair-prd-template-3-description` | `prompt:product-requirements-document-prd-template-3` | `seoDescription` | Master architecture product requirements document (prd) template 2 with this comprehensive AI prompt featuring structured templates and best practices. | Master architecture product requirements document (PRD) Template 3 with this comprehensive AI prompt featuring structured templates and best practices. |

## Exact Variable Repair

E05 adds this complete customization definition. Capitalized and prose-filled double braces remain literal authoring placeholders.

| Repair ID | Asset | Name | Label | Type | Required | Default | Placeholder | Help | Rows |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: |
| `add-prd-instructions-variable` | `prompt:prd-generator` | `prd_instructions` | PRD Instructions | textarea | Yes | None | Enter the project-specific instructions for the PRD. | Describe the product, users, goals, constraints, and requirements the PRD must address. | 8 |

## Proposed Workflow Repair

The alpha has no series identifier and points three times to a filename that does not exist. Approval of D08 and E07 approves these two derived workflows:

| Workflow ID | Label | Ordered Assets | Status |
| --- | --- | --- | --- |
| `simple-blog-review` | Simple Blog Review | 1. `prompt:simple-blog-generator` → 2. `prompt:academic-critique-content` | Derived from the alpha series metadata; pending this approval |
| `universal-content-review` | Universal Content Review | 1. `prompt:universal-content-creator-demo` → 2. `prompt:academic-critique-content` | Derived from the alpha series metadata; pending this approval |

## Exact Prompt-Body Repair

E06 is the only proposed prompt-body change. The exact-once replacement and resulting normalized hash are:

| Repair ID | Asset | Source Prompt Hash | Match Exactly Once | Replacement | Resulting Prompt Hash |
| --- | --- | --- | --- | --- | --- |
| `use-academic-include-grading-variable` | `prompt:academic-critique-content` | `sha256:11b8ebb5651e29fc61ad0ced36cf7e261a3790ed2a351df708f31116b777350a` | `{{author_names}}\n\n## Introduction` | `{{author_names}}\nInclude a formal grading rubric: {{include_grading}}.\n\n## Introduction` | `sha256:9aa30870344493843ad9ad33cba8d9b50a8707fa5890044b2d1e864a3986bd61` |

If E06 is not explicitly approved, `prompt:academic-critique-content` will be held. All other proposed repairs leave decoded prompt content unchanged apart from line-ending normalization.

## Informational Findings Covered by Defaults

These findings require no separate decision. D04, D09, and D10 already define their handling.

| ID | Finding | Affected | Examples | Handling |
| --- | --- | ---: | --- | --- |
| F01 | Source filename misspells Midjourney | 2 | [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/); [Midjourney Version 7 Prompt Generator Template](https://tedt.org/prompts/midjourney-v7-prompt-template/) | Preserve each exact source filename in provenance and use the correctly spelled canonical slug. |
| F02 | Legacy image dimension has an invalid type | 1 | [Communications \[Ted's Writing Style\]](https://tedt.org/prompts/teds-writing-style/) | Preserve the raw dimension value in provenance; do not use it for generated-cover dimensions. |
| F03 | Legacy image reused by multiple prompts | 31 | [Architecture ABB SBB UBB Builder](https://tedt.org/prompts/abb-sbb-ubb-builder/); [Architecture AI Document Generator](https://tedt.org/prompts/ai-document-generator/); [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/); [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/); [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/); [Architecture Application Architecture as Markdown](https://tedt.org/prompts/application-architecture-as-markdown/); and 25 more (see the manifest) | Keep the shared-image hashes as provenance and generate a unique, unrelated AI.Tedt.org cover for every prompt. |
| F04 | No dedicated legacy image | 15 | [Architecture Business Requirements Builder](https://tedt.org/prompts/business-requirements-builder/); [Business Business Skills Prompts](https://tedt.org/prompts/business-skills-prompts/); [Communications expert novelist](https://tedt.org/prompts/expert-novelist/); [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/); [Business Lean Six Sigma Analysis](https://tedt.org/prompts/lean-six-sigma-analysis/); [Business Objectives Key Results](https://tedt.org/prompts/objectives-key-results/); and 9 more (see the manifest) | Generate a new, prompt-specific AI.Tedt.org cover before publication. |

## Ted’s Overrides

Use `E##` to override a whole decision group or `E##/canonical-slug` to override one asset. Approval accepts the remaining recommended treatments.

- Decision or compound override key:
- Replacement decision:
- Notes:

If an override or declined repair holds an asset, list each distinct held asset ID and recalculate the curation outcome. Relationship-only changes under E07 do not change asset counts.

- Distinct held asset IDs:
- Revised recommended-for-migration count: 56 minus distinct held assets =
- Revised curation-hold count: 0 plus distinct held assets =

## Final Approval

- [ ] Approve global defaults D01–D12
- [ ] Approve E01, E02, E03, E04, E08, E09, E10, E11 except listed overrides
- [ ] Approve E05 exactly as specified in **Exact Variable Repair**; otherwise hold `prompt:prd-generator`
- [ ] Approve E06 exactly as specified in **Exact Prompt-Body Repair**; otherwise hold `prompt:academic-critique-content`
- [ ] Approve E07 exactly as specified in **Proposed Workflow Repair**; otherwise hold the three series relationships, not their prompt assets
- [ ] Approve the baseline 56 migration / 0 curation-hold recommendation when there are no held-asset overrides; otherwise approve the completed revised counts above. Every migration-approved asset remains publication-blocked pending validated new artwork.

Name:  
Date:

<details>
<summary>Complete 56-Prompt Coverage Table</summary>

| Prompt | Canonical Slug | In Alpha Index | Size | Characters | Variables | Old Cover | Issues | Recommended Catalog Status |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| [Architecture ABB SBB UBB Builder](https://tedt.org/prompts/abb-sbb-ubb-builder/) | `abb-sbb-ubb-builder` | Yes | M | 8,926 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Academic Content Critique Template](https://tedt.org/prompts/academic-critique-content/) | `academic-critique-content` | Yes | M | 18,278 | 6 | Legacy image | unused-variable, missing-series-target | ACTIVE |
| [Active-Learning Teaching Assistant](https://tedt.org/prompts/active-learning-teaching-assistant/) | `active-learning-teaching-assistant` | Yes | S | 3,065 | 0 | Legacy image | none | ACTIVE |
| [Architecture AI Document Generator](https://tedt.org/prompts/ai-document-generator/) | `ai-document-generator` | Yes | S | 2,939 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [AI Simulation Creator – Scenario-Based Skill Practice](https://tedt.org/prompts/ai-simulation-creator/) | `ai-simulation-creator` | Yes | S | 3,786 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier | ACTIVE |
| [AI Simulation Creator Prompt – Roleplay-Based Learning Scenarios](https://tedt.org/prompts/ai-simulation-creator-roleplay-prompt/) | `ai-simulation-creator-roleplay-prompt` | Yes | S | 3,800 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier, legacy-image-reused | ACTIVE |
| [AI Teaching Assistant Prompt Creator](https://tedt.org/prompts/ai-teaching-assistant-prompt-creator/) | `ai-teaching-assistant-prompt-creator` | Yes | S | 2,668 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier, legacy-image-reused | ACTIVE |
| [AI Tutoring Prompt Designer – Help Others Learn What You Know](https://tedt.org/prompts/ai-tutoring-prompt-designer/) | `ai-tutoring-prompt-designer` | Yes | S | 4,396 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier, legacy-image-reused | ACTIVE |
| [Architecture Application Architecture as Markdown](https://tedt.org/prompts/application-architecture-as-markdown/) | `application-architecture-as-markdown` | Yes | XL | 190,945 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Automation Architecture Designer](https://tedt.org/prompts/architecture-designer/) | `architecture-designer` | Yes | S | 7,391 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Architecture Prompt](https://tedt.org/prompts/architecture-prompt/) | `architecture-prompt` | Yes | S | 3,557 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Artistic Analysis Prompt – Deep Analysis of Artistic Works](https://tedt.org/prompts/artistic-Analysis/) | `artistic-analysis` | Yes | S | 6,743 | 0 | Legacy image | legacy-route-needs-alias, model-alias-needs-normalization, ambiguous-model-identifier | ACTIVE |
| [Architecture AVD as Markdown](https://tedt.org/prompts/avd-as-markdown/) | `avd-as-markdown` | Yes | XL | 104,816 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Communications Be an Expert and Give Advice](https://tedt.org/prompts/be-an-expert-and-give-advice/) | `be-an-expert-and-give-advice` | No | S | 1,724 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |
| [Architecture Building Block](https://tedt.org/prompts/building-block/) | `building-block` | Yes | S | 4,353 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Architecture Business Architecture as Markdown](https://tedt.org/prompts/business-architecture-as-markdown/) | `business-architecture-as-markdown` | Yes | L | 63,276 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Business Case and Requirements Assistant](https://tedt.org/prompts/business-case-and-requirements-assistant/) | `business-case-and-requirements-assistant` | No | L | 42,463 | 0 | Legacy image | hidden-from-alpha-index | ACTIVE |
| [Architecture Business Requirements Builder](https://tedt.org/prompts/business-requirements-builder/) | `business-requirements-builder` | Yes | M | 8,772 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Business Business Skills Prompts](https://tedt.org/prompts/business-skills-prompts/) | `business-skills-prompts` | Yes | L | 60,957 | 0 | Fallback | title-needs-editorial-repair, legacy-image-fallback | ACTIVE |
| [Create a Unforgettable Opening to a TTRPG](https://tedt.org/prompts/Create-a-Unforgettable-Opening-to-a-TTRPG/) | `create-a-unforgettable-opening-to-a-ttrpg` | Yes | M | 10,469 | 0 | Legacy image | title-needs-editorial-repair, legacy-route-needs-alias, model-alias-needs-normalization, ambiguous-model-identifier, legacy-image-reused | ACTIVE |
| [Architecture Data Architecture as Markdown](https://tedt.org/prompts/data-architecture-as-markdown/) | `data-architecture-as-markdown` | Yes | XL | 132,655 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Executive Keynote Generator](https://tedt.org/prompts/executive-keynote-generator/) | `executive-keynote-generator` | Yes | S | 3,195 | 7 | Legacy image | legacy-image-reused | ACTIVE |
| [Communications expert novelist](https://tedt.org/prompts/expert-novelist/) | `expert-novelist` | No | S | 3,206 | 0 | Fallback | title-needs-editorial-repair, hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Self Improvement Find your super power](https://tedt.org/prompts/find-your-super-power/) | `find-your-super-power` | No | S | 2,043 | 0 | Fallback | title-needs-editorial-repair, hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Business Lean Six Sigma Analysis](https://tedt.org/prompts/lean-six-sigma-analysis/) | `lean-six-sigma-analysis` | Yes | S | 949 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Marketing Copy Evaluation & Rewrite Template](https://tedt.org/prompts/marketing-copy-evaluation-template/) | `marketing-copy-evaluation-template` | Yes | S | 3,403 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier | ACTIVE |
| [Architecture Microsoft Power Automate Systems Architect](https://tedt.org/prompts/microsoft-power-automate-systems-architect/) | `microsoft-power-automate-systems-architect` | Yes | S | 5,980 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Midjourney V6.1 Prompt Generator Template](https://tedt.org/prompts/midjourney-v6.1-prompt-template/) | `midjourney-v6-1-prompt-template` | Yes | M | 9,386 | 0 | Legacy image | legacy-route-needs-alias, model-alias-needs-normalization, ambiguous-model-identifier, source-filename-misspelling, legacy-image-reused | ACTIVE |
| [Midjourney Version 7 Prompt Generator Template](https://tedt.org/prompts/midjourney-v7-prompt-template/) | `midjourney-v7-prompt-template` | Yes | S | 4,168 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier, source-filename-misspelling, legacy-image-reused | ACTIVE |
| [TTRPG Module Builder](https://tedt.org/prompts/module-builder/) | `module-builder` | No | M | 16,627 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |
| [TTRPG Module Format](https://tedt.org/prompts/module-format/) | `module-format` | No | L | 33,892 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |
| [Business Objectives Key Results](https://tedt.org/prompts/objectives-key-results/) | `objectives-key-results` | Yes | S | 3,609 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Architecture PRD Agent](https://tedt.org/prompts/prd-agent/) | `prd-agent` | Yes | S | 6,161 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Architecture PRD Generator](https://tedt.org/prompts/prd-generator/) | `prd-generator` | Yes | M | 11,707 | 0 | Fallback | undeclared-variable, legacy-image-fallback | ACTIVE |
| [Architecture Product Requirements Document (PRD) for Power Platform](https://tedt.org/prompts/product-requirements-document-prd-for-power-platform/) | `product-requirements-document-prd-for-power-platform` | Yes | XL | 109,220 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Architecture Product Requirements Document (PRD) Template](https://tedt.org/prompts/product-requirements-document-prd-template/) | `product-requirements-document-prd-template` | Yes | XL | 120,408 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Architecture Product Requirements Document (PRD) Template 2](https://tedt.org/prompts/product-requirements-document-prd-template-2/) | `product-requirements-document-prd-template-2` | Yes | XL | 127,211 | 0 | Legacy image | duplicate-prompt-body, legacy-image-reused | ACTIVE |
| [Architecture Product Requirements Document (PRD) Template 3](https://tedt.org/prompts/product-requirements-document-prd-template-3/) | `product-requirements-document-prd-template-3` | Yes | XL | 127,211 | 0 | Legacy image | duplicate-prompt-body, description-version-mismatch, legacy-image-reused | ACTIVE |
| [Architecture Product Requirements Document (PRD) Template 4](https://tedt.org/prompts/product-requirements-document-prd-template-4/) | `product-requirements-document-prd-template-4` | Yes | XL | 137,692 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Architecture Requirements Analyst - ISO/IEC/IEEE 29148:2018 SRS Generator](https://tedt.org/prompts/requirements-analyst/) | `requirements-analyst` | Yes | S | 3,450 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Architecture Requirements Analyst Quality Review](https://tedt.org/prompts/requirements-analyst-quality-review/) | `requirements-analyst-quality-review` | Yes | S | 3,140 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [RFP Response Evaluation Prompt](https://tedt.org/prompts/rfp-response-review/) | `rfp-response-review` | Yes | S | 6,682 | 0 | Legacy image | none | ACTIVE |
| [Risk Assessment clean up](https://tedt.org/prompts/risk-assessment-clean-up/) | `risk-assessment-clean-up` | No | M | 10,493 | 0 | Fallback | title-needs-editorial-repair, hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Risk Assessment for IT](https://tedt.org/prompts/risk-assessment-for-it/) | `risk-assessment-for-it` | Yes | M | 28,000 | 0 | Fallback | legacy-image-fallback | ACTIVE |
| [Role and Objective](https://tedt.org/prompts/role-and-objective/) | `role-and-objective` | No | S | 1,611 | 0 | Fallback | hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Communications Script a Podcast](https://tedt.org/prompts/script-a-podcast/) | `script-a-podcast` | No | S | 3,080 | 0 | Fallback | hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Simple Blog Post Generator](https://tedt.org/prompts/simple-blog-generator/) | `simple-blog-generator` | Yes | S | 377 | 3 | Fallback | missing-series-target, legacy-image-fallback | ACTIVE |
| [TTRPG Skill Profile Generator](https://tedt.org/prompts/skill-profile-generator/) | `skill-profile-generator` | No | S | 5,183 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |
| [Cross-Platform Social Media Repurposing Template](https://tedt.org/prompts/social-media-repurposing-template/) | `social-media-repurposing-template` | Yes | S | 4,783 | 0 | Legacy image | model-alias-needs-normalization, ambiguous-model-identifier | ACTIVE |
| [Sora Prompt](https://tedt.org/prompts/sora-prompt/) | `sora-prompt` | No | M | 16,548 | 0 | Fallback | hidden-from-alpha-index, legacy-image-fallback | ACTIVE |
| [Work In Progress: Technology Architecture Generator](https://tedt.org/prompts/technology-architecture-as-markdown/) | `technology-architecture-as-markdown` | Yes | XL | 158,304 | 0 | Legacy image | work-in-progress-title, legacy-image-reused | BETA |
| [Communications \[Ted's Writing Style\]](https://tedt.org/prompts/teds-writing-style/) | `teds-writing-style` | Yes | S | 2,065 | 0 | Legacy image | legacy-image-dimension-invalid | ACTIVE |
| [Requirements / Test Analyst Prompt](https://tedt.org/prompts/testing-analyst/) | `testing-analyst` | Yes | M | 16,446 | 0 | Legacy image | legacy-image-reused | ACTIVE |
| [Communications Tiered Messaging Framework](https://tedt.org/prompts/tiered-messaging-framework/) | `tiered-messaging-framework` | No | S | 6,320 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |
| [Universal Content Creator - Variable Types Demo](https://tedt.org/prompts/universal-content-creator-demo/) | `universal-content-creator-demo` | Yes | S | 1,195 | 8 | Legacy image | missing-series-target | ACTIVE |
| [TTRPG Weapon Descriptions](https://tedt.org/prompts/weapon-descriptions/) | `weapon-descriptions` | No | M | 8,248 | 0 | Legacy image | hidden-from-alpha-index, legacy-image-reused | ACTIVE |

</details>
