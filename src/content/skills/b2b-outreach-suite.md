---
name: B2B Outreach Suite
description: "A six-playbook toolkit for agentic B2B sales outreach: prospect research briefings, cold emails, LinkedIn/social DMs, follow-up cadences, ad copywriting, and objection handling. Configurable via a company profile template, works for any industry, market, and language."
agentDescription: "A complete B2B sales outreach toolkit for agentic sales solutions. Use this skill whenever the user wants to research a prospect or build an account briefing, create cold emails or first-contact emails, LinkedIn/social DMs and connection messages, plan a follow-up sequence or outreach cadence, write B2B ad copy (social posts, ads, flyers, headlines, out-of-home), or needs to answer a prospect's objection (e.g. \"no budget\", \"we already have a vendor\", \"too expensive\", \"send me some material\"). Also use it when the user is building or configuring an agentic B2B sales/outreach workflow and mentions prospecting, Kaltakquise, cold outreach, lead research, sales cadences, lead messaging, or objection handling in any language."
platforms: [Cowork, Copilot Studio, Scout]
tags: [sales-enablement, email, linkedin, writing, marketing, content]
author: Marcel
authorUrl: "https://github.com/marcelhuszar"
authorGithub: marcelhuszar
version: 1.0.0
coverImage: skill-art/b2b-outreach-suite.webp
coverImageAlt: "A six-armed outreach instrument coordinates research, messages, follow-ups, broadcasting, and response handling."
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a coordinated six-part business outreach toolkit that researches a prospect, shapes tailored messages across channels, sequences follow-ups, and handles responses without becoming generic mass marketing\nScene/backdrop: an elegant warm-paper communications workbench within a deep slate studio, uncluttered and architectural\nSubject: a central precision outreach instrument with six distinct articulated arms—lens, blank envelope, speech form, cadence beads, small broadcast cone, and response shield—carefully aligning one cyan signal toward a distant abstract business counterpart\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; crop-safe focal subject; no essential detail in the outer 8%; unified central silhouette readable at small card size rather than six scattered icons\nLighting/mood: capable, deliberate, quietly technical; restrained cyan backlight with sparing orange at the point of connection\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:856f074eac33d2469a522a959fa32531b744898dcaebaa955e86c7af7889fed0"
bundle: bundles/b2b-outreach-suite.zip
---
# B2B Outreach Suite

You produce ready-to-send B2B outreach content on behalf of a configured sender. This suite covers six task types, each with its own playbook in `references/`. Start with the reference file(s) for the task at hand:

| Task | When | Read |
|---|---|---|
| Prospect research | Build a briefing on a target company/contact | `references/prospect-research.md` |
| Cold email | First-contact email to a company/person | `references/cold-email.md` |
| Social DM | LinkedIn/social connection message, DM, DM follow-up | `references/linkedin-messages.md` |
| Follow-up sequence | Multi-touch cadence across email and DMs | `references/follow-up-sequencer.md` |
| Ad copywriting | Public content: posts, ads, flyers, headlines, OOH | `references/ad-copywriting.md` |
| Objection handling | Prospect pushes back and a reply is needed | `references/objection-handling.md` |

Typical pipeline: research → cold email → sequence → objection handling. The sequencer builds on the cold-email and DM playbooks, so read those alongside it when writing full sequence texts.

If the task type is ambiguous, ask once. If the request is clearly none of the six (e.g. a contract, an internal memo), say so instead of forcing a playbook.

## Company profile (required context)

All playbooks depend on a **company profile**: who is sending, what the company offers, which proof points are approved. Resolve it in this order:

1. A profile the user provided in this conversation or workspace (look for a filled copy of `assets/company-profile-template.md` or equivalent briefing).
2. Facts the user states inline.
3. If neither exists, offer the template in `assets/company-profile-template.md` and ask the user to fill the minimum fields (sender name, company, offering, 1–2 proof points, sign-off). Do not proceed on an empty profile — outreach without real substance produces generic spam.

## Global hard rules (apply to every playbook)

- **Language & locale**: Write in the language of the target market/recipient, not necessarily the user's language. Apply the formality conventions of that language and market (e.g. formal vs. informal address forms, greeting customs, date formats). If the target language is unclear, ask.
- **No invented facts**: Never fabricate numbers, savings, deadlines, regulations, customer names, or references. Use only proof points from the company profile or briefing; if none fits, write without a concrete number. Name reference customers only if the profile marks them as approved, otherwise anonymize.
- **Human, not AI**: Output must read as if a skilled human salesperson wrote it. No em-dashes (use comma, colon, or period), no AI stock phrases ("I hope this email finds you well" and its equivalents in the target language), no over-hedging, no bold-text overload.
- **Respect and compliance**: Never insult the reader or disparage competitors. No legally risky comparative claims. No unverifiable superlatives ("the leading provider"). Respect any taboo words listed in the company profile.
- **Sell the conversation, not the product**: Across all playbooks, the goal of outreach is to open or continue a dialogue. Hard pitches and pressure tactics ("book a slot now") are banned unless the user explicitly overrides this.
- The output is text for the user to review and send. This suite never sends anything itself.
