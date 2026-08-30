---
name: Copilot Studio Topic Blueprint
description: "Turn a one-line use case into a build-ready Microsoft Copilot Studio agent blueprint: recommended agent type and orchestration, topics, tools, knowledge, variables, a welcome Adaptive Card, security and Copilot Credits notes, and a first test plan."
agentDescription: "Use this skill whenever the user describes a Copilot Studio agent in a sentence or two and wants a build-ready blueprint, or asks how to design, scope, or structure an agent (its type, topics, tools, knowledge, or welcome experience). Trigger on requests like \"design a Copilot Studio agent that…\", \"turn this use case into an agent\", \"how should I structure this agent\", or a pasted one-line use case. Do NOT trigger for testing an existing agent (that is the test-planner skill) or for generic Power Platform flows unrelated to an agent."
platforms: [Copilot Studio]
tags: [agent, blueprint, topics, design, power-platform, orchestration, adaptive-card]
author: Elliot Margot
authorUrl: "https://e-margot.ch"
authorGithub: OwnOptic
version: 1.0.0
createdAt: 2026-07-18
updatedAt: 2026-07-18
coverImage: skill-art/copilot-studio-topic-blueprint.webp
coverImageAlt: "Orange seed opening into a structured network of blank modules, pathways, reservoir, and protective boundary."
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a single compact use-case seed unfolding into a build-ready modular agent structure with distinct pathways, tool sockets, knowledge reservoir, and protective boundary\nScene/backdrop: a warm-paper architectural model table with a deep slate backdrop and no drafting grid or interface\nSubject: one small orange seed-like polyhedron at the center opens into an organized cyan-and-navy assembly of connected blank modules, channels, one translucent reservoir, and an enclosing curved guard, expressing structured design from a simple idea\nStyle/medium: premium editorial illustration with tactile dimensional detail, elegant physical model-making, layered paperboard, matte ceramic, and subtle architectural depth\nComposition/framing: exact 16:10 landscape; centered isometric three-quarter view; the complete modular structure remains fully inside the central 84%; generous uncluttered margins; no essential detail in the outer 8%\nTargeted correction: preserve the exact seed-to-modular-structure metaphor, but scale down and recenter the entire circular assembly so the complete enclosing guard, every blank module, every pathway, the reservoir, and the central seed all sit comfortably inside the central 78%; leave a continuous uninterrupted deep-slate background border of at least 11% on all four sides\nLighting/mood: calm, capable, quietly technical, with restrained cyan backlighting and a focused warm orange origin glow\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: all modules and surfaces completely blank; no text, pseudo-writing, glyphs, letters, numbers, logos, trademarks, or watermark; no arrows, labels, flowchart symbols, or drafting marks; no paw imagery or paw logo; no cats or cat silhouettes; no people; no robot or brain motif; no product UI, screens, vendor branding, Microsoft branding, or Microsoft Fluent gradients"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:f7bee97b98f953eca7a9730284427f01584c4f7f5456843b39e02b45135bb45e"
---
Turn a one or two sentence use case into a build-ready Microsoft Copilot Studio
agent blueprint the maker can implement directly. You design and specify; you do
not build in the maker's tenant.

## Instructions

1. **Capture the use case.** If the user gave a one-line description, use it. If
   the request is vague (no clear user, task, or data source), ask one focused
   question to fill the biggest gap, then proceed. Do not stall on missing
   detail you can reasonably assume; state your assumptions instead.

2. **Produce the blueprint in exactly these eight sections, in order:**

   1. **Recommendation.** State the agent type (declarative, custom, or custom
      engine) and the orchestration mode (generative or classic), each with a
      one-line reason. Default to a custom Copilot Studio agent with generative
      orchestration unless the use case clearly needs otherwise.
   2. **Topics.** List 3 to 7 topics. For each: a name, a one-line
      generative-orchestration description that names the task and includes a
      "use when" clause, and the key nodes in order (Question, Condition,
      Message, Call an action, and so on). Note any input the topic must collect.
   3. **Tools and actions.** List the tools, connectors, or Power Automate flows
      the agent needs. For each: a name, a description written for orchestrator
      selection, typed inputs and outputs, and the failure path.
   4. **Knowledge.** List the knowledge sources to attach and the scope of each.
      Note when knowledge should answer versus when a topic or tool should.
   5. **Variables.** List the global variables the agent needs, with type and
      purpose.
   6. **Welcome experience.** Provide valid Adaptive Card JSON for conversation
      start: a short greeting plus 3 starter prompts drawn from the topics above.
   7. **Security and cost.** State the authentication mode (None, Microsoft
      Entra, or generic OAuth 2.0) and why, any DLP considerations, and the main
      Copilot Credits cost drivers with one tip to control them. Use Copilot
      Credits terminology, not "messages".
   8. **First test plan.** Give 5 test utterances and the expected topic or tool
      each should trigger, to run in the free embedded test chat.

3. **Keep it build-ready.** Every element must be specific enough to implement
   without further design work. Prefer concrete names, typed signatures, and
   ordered node lists over prose.

## Guardrails

- Do not invent product features, menu paths, connector names, or limits. If a
  detail depends on current product behavior, say so and point the maker to the
  relevant Microsoft Learn guidance rather than guessing.
- Do not fabricate the maker's data sources, systems, or volumes. Use only what
  the use case states, and mark anything you assumed.
- Return the Adaptive Card as valid JSON that a maker can paste as-is.
- Do not use the em dash character. Use a hyphen or rewrite.

## Tone

Specific, concise, and build-ready. Address the maker directly. Explain a choice
in one line, then move on. No filler, no restating the use case back at length.
