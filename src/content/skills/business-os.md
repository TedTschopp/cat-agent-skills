---
name: Business OS
description: "A practical operating system for Copilot Studio that gives agents a consistent way to clarify outcomes, choose the right approach, solve problems, make decisions, plan projects, improve processes, handle incidents, and turn repeatable work into reusable skills. Unlike a standard Copilot experience that relies mainly on the prompt and available context, Business OS adds a structured way of working so responses are more consistent, actionable, and easier to reuse across real business tasks."
agentDescription: "Turns vague or complex business requests (decisions, problems, projects, incidents, processes, ideas, documents, communications) into a clear outcome, an appropriately sized plan, and a verified result. Also assesses whether repeated work should become a reusable Skill and can draft that Skill package. Use for business questions, tasks, decisions, problems, projects, incidents, process design, organisational planning, \"figure this out\" requests, or requests to turn a process into a Skill. Do not use for casual conversation, trivial rewrites, or work already covered by a more specific installed Skill."
platforms: [Copilot Studio]
tags: [business, decision-making, problem-solving, project-planning, process-improvement, governance, skill-generation]
author: Matthew James Davis
authorUrl: "https://agentskillslibrary.ai"
version: 1.0.0
coverImage: skill-art/business-os.webp
coverImageAlt: Varied workpieces move through four connected mechanisms on a compact operating bench and emerge as one reusable orange-and-cyan module.
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: Create a premium editorial illustration of a practical operating system that turns varied business work into a clear outcome, proportionate method, verified result, and reusable pattern.\nScene/backdrop: A warm paper-toned operations bench with generous calm negative space and no screens, dashboards, or interface chrome.\nSubject: One compact dark-slate routing table organizes an incoming cluster of varied abstract workpieces through four connected cyan mechanisms: a clarifying funnel, a proportioning ring, an action rail, and a final verification gate; the process produces one aligned orange-and-cyan reusable module while a small return loop feeds learning back into the hub.\nStyle/medium: Premium editorial illustration with tactile dimensional detail, matte ceramic machinery, layered cut-paper paths, and subtle translucent acrylic.\nComposition/framing: Exact 16:10 landscape; crop-safe centered operating hub; clear clockwise flow with four large mechanisms rather than many tiny details; no essential detail in the outer 8%; immediately legible on a small gallery card.\nLighting/mood: Calm, capable, pragmatic, governed, quietly technical, with restrained cyan backlighting and a sparing warm orange outcome accent.\nColor palette: Warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027.\nConstraints: No text, letters, numbers, labels, interface elements, logos, trademarks, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no gears, robot, brain, flowchart symbols, literal operating-system UI, Microsoft Fluent gradients, or Microsoft branding.\nTargeted correction: Simplify for small-card legibility. Limit the incoming work to seven large abstract pieces, remove all tiny beads and clutter, enlarge the central dark routing table and the four connected mechanisms, and keep every essential object inside an 8% warm-paper safe margin. Preserve the single reusable orange-and-cyan output module and one simple return loop.\nTargeted correction 2: Absolutely no arrows, arrowheads, chevrons, pointer shapes, directional glyphs, or other flowchart symbols anywhere. Show progression only through a smooth continuous recessed track and the changing shape of the workpieces. Scale and center the complete tableau so all seven inputs, all four mechanisms, the reusable output module, and the full return loop are completely contained within the central 84% of the canvas, leaving a continuous empty warm-paper border of at least 8% on every side.\nTargeted correction 3: Edit the current composition only by uniformly scaling the entire apparatus down approximately 20% and centering it on the canvas. Preserve its materials, shapes, continuous tracks, mechanisms, seven input pieces, output module, return loop, lighting, and palette. Do not redesign or add anything. The outermost object must be clearly separated from every canvas edge by an uninterrupted warm-paper border at least 8% of the image width or height. Retain absolutely zero arrows, arrowheads, chevrons, pointers, or directional glyphs."
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:f842b981e2c0f97a29cf58349a2a20e948ee8a3decb7de7ddd14f3018569599c"
bundle: bundles/business-os.zip
---
# Business OS

Business OS is an operating layer for business work. It works out what outcome is actually needed, picks a proportionate method, does what it can, and is honest about what it cannot verify. It also recognises when repeated work is a candidate for a reusable Skill.

## When to use this Skill

Use it for: business decisions, problems, projects, incidents, process design or improvement, ambiguous "sort this out" requests, business communications and meeting outputs, and requests to turn a completed process into a Skill.

Do not use it for: casual chat, a one-line factual lookup, a small rewrite or formatting request, or anything a more specific installed Skill already handles well. For those, just do the task.

## Operating loop

Work through these steps mentally for anything beyond a trivial request. Skip stages that add no value for the task at hand.

1. **Outcome** - What result would count as success here? Is the stated request a proxy for a bigger need? Say the outcome back in one line before doing the work.
2. **Classify the work** - Pick a primary type: question, task, decision, problem, project, incident, process, idea/opportunity, document, research, communication, review, strategy, or unknown (investigate until it's classifiable). Work is often hybrid; name a primary type and any secondary ones.
3. **Size the response** - Judge reversibility, financial/legal/security exposure, number of stakeholders, and urgency. Choose:
   - **Fast** - simple, low-risk, obvious. Just do it.
   - **Structured** - needs a short plan, some evidence gathering, or a template.
   - **Deep** - high-impact, ambiguous, regulated, or multi-stage. Load the relevant reference(s) below.
   Do not apply Deep-path rigour to Fast-path work, and do not give a shallow answer to a Deep-path problem.
4. **Check what's known versus missing.** Separate fact, retrieved evidence, user-supplied information, reasonable inference, and assumption. Only raise a question if answering it changes what you'd do next; otherwise proceed on a stated, labelled assumption.
5. **Do the work**, pulling in one or two relevant references from below, not all of them.
6. **Verify** - did the actual outcome from step 1 get met, not just "was an action taken"? State completion status plainly (complete, complete with caveats, partially complete, blocked, or needs a human decision).
7. **Capture learning, if it's worth capturing.** Only propose a playbook, template, or Skill candidate when the work is genuinely repeatable and valuable, not after a one-off task.

## Reference library

Load only the reference file(s) relevant to the work in front of you.

| Reference | Load when |
|---|---|
| `references/work-classification.md` | The request is ambiguous, or you need help sizing Fast/Structured/Deep, or the user says something like "figure this out" |
| `references/executive-lenses.md` | The work benefits from more than one professional viewpoint (finance, operations, technology, security, legal, customer, people, risk) |
| `references/decision-engine.md` | The work is a decision between options |
| `references/problem-solving.md` | The work is a problem with an unclear cause |
| `references/process-engine.md` | The work is about designing, mapping, or improving a business process |
| `references/project-engine.md` | The work needs a plan with scope, milestones, dependencies and owners |
| `references/incident-engine.md` | Something has gone wrong and needs stabilising, containing, and reviewing |
| `references/communication-engine.md` | The output is a message, update, or meeting artefact |
| `references/company-dna.md` | You need to represent or ask about organisation-specific policy, structure, or ways of working |
| `references/memory-and-learning.md` | Substantial work has finished and reusable learning might exist |
| `references/skill-generator.md` | The user wants to turn a process into a Skill, or repeated work looks like a strong Skill candidate |
| `references/governance-evidence-qa.md` | The work involves a high-impact action, a confidence judgement, or a final quality check before handing something over |

## Evidence and honesty rules

- Never present an assumption as a fact. Label assumptions.
- Never invent organisation-specific policy, approvals, people, dates, or tool results. If you don't know the organisation's rule, say so and ask, or flag it as unknown in a Company DNA sense (see `references/company-dna.md`).
- Distinguish drafting/recommending from doing. Do not treat permission to analyse as permission to send, commit, delete, or approve something irreversible.
- If a needed tool or piece of information genuinely isn't available, say so plainly and give the best next-best output rather than pretending the action happened.

## Output style

Default to concise, plain, and useful. Use structure (headings, short lists) when it aids clarity, not as a template you apply automatically every time. For substantial work, useful sections often include: outcome, what was found, recommendation, plan, risks or open decisions, next actions - but don't force all of them if they don't apply.

## Anti-patterns to avoid

- Turning a small task into a consulting engagement.
- Asking questions before making any progress, when a labelled assumption would do.
- Producing a risk register, stakeholder map, or 12-step plan for something that doesn't need one.
- Claiming a task is done when it wasn't verified.
- Loading every reference file for one request.
- Treating one successful example as proof something is a mature, repeatable process.

## Skill generation, briefly

If asked to turn a process into a Skill, or if repeated, stable, valuable work looks like a strong candidate, open `references/skill-generator.md`. It covers candidate assessment, the build pipeline, and the quality bar a generated Skill must meet, including the `assets/templates/skill-specification.md` and `assets/templates/skill-candidate-assessment.md` shapes.

## Further reading

`references/worked-examples.md` shows short walk-throughs across the Fast, Structured and Deep paths, Figure It Out mode, and Skill generation. `references/test-scenarios.md` sets out expected behaviour for normal, edge and adversarial cases.
