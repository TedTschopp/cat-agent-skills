---
name: Agent Evaluation Designer
description: "Design a rigorous, platform-aware evaluation for an AI agent - define what good looks like, pick the right grading method, build a test set, and turn results into a defensible go/no-go decision."
agentDescription: "Use this skill whenever the user wants to evaluate, test, or validate an AI agent, decide whether an agent is ready to ship or go live, choose how to grade an agent's answers (exact match, similarity, meaning, keywords, quality, or custom), design a test set of questions and expected answers, or interpret evaluation results into a go/no-go decision. Invoke it before the user hand-builds tests or declares an agent \"done.\""
platforms: [Copilot Studio]
tags: [evaluation, testing, quality-assurance, go-live, decision-making]
author: James Papadimitriou
authorUrl: "https://github.com/jpapadimitriou"
authorGithub: jpapadimitriou
version: 1.0.0
createdAt: 2026-07-23
updatedAt: 2026-07-23
coverImage: skill-art/agent-evaluation-designer.webp
coverImageAlt: "A complete input ramp carries varied test pieces through a faceted agent core, balance, and fully visible release gate."
coverImagePrompt: "Use case: stylized-concept\nAsset type: AI.Tedt.org skill gallery cover\nPrimary request: a rigorous agent evaluation made visible as varied test objects moving through a calibrated physical proving ground toward one defensible release gate\nScene/backdrop: quiet deep-slate testing chamber with warm-paper platforms and restrained navy structure, surrounded by generous clean negative space\nSubject: a central faceted agent core surrounded by diverse geometric test pieces, comparison rails, a balanced grading apparatus, one complete input ramp, and one complete final release gate with its exit ramp illuminated only when the pieces align\nStyle/medium: premium editorial illustration with tactile dimensional detail\nComposition/framing: exact 16:10 landscape; zoomed out orthographic three-quarter view; every essential before-and-after endpoint, the complete input ramp, all test pieces and rails, the central core, balance, complete release gate and exit ramp, and the full focal system must fit entirely within the central 84% of the canvas; leave clean uninterrupted negative space in the outer 8% on all four sides; nothing may touch or be clipped by any frame edge; clear left-to-right evaluation flow without arrows or labels; readable at card size\nLighting/mood: calm, capable, quietly technical; cyan measurement light with one sparing orange decision accent\nColor palette: warm paper #F8F6F0, slate #101820, navy #00446F, cyan #00A9E0, sparing orange #E86027\nConstraints: no text, letters, numbers, logos, trademarks, symbols, interface labels, score markings, or watermark; no paw imagery or paw logo; no cats or cat silhouettes; no product UI or Microsoft Fluent branding\nTargeted correction: preserve the proving-ground metaphor while making the entire ramp-to-gate sequence visibly complete; do not crop, truncate, or run any platform, ramp, gate, rail, test object, or focal element beyond the central safe area\nSecond-pass targeted correction: the previous attempt was still too large; render the entire input ramp, test platform, rails, balance, central core, complete release gate, exit ramp, and supporting base as one small centered tabletop miniature occupying no more than 70% of the canvas width and 65% of its height, with at least 15% visibly empty background on the left, right, top, and bottom; do not let any structure or object approach a frame edge"
coverImageAspectRatio: "16:10"
coverImageWidth: 1600
coverImageHeight: 1000
coverImageGenerator: OpenAI image generation via Codex
coverImageGeneratedAt: 2026-08-29
coverImageSourceHash: "sha256:adea0c486af54dd856a366a14bc752086f548fb52f309c870a5a0101ab0512a5"
bundle: bundles/agent-evaluation-designer.zip
---
# Agent Evaluation Designer

You help the user design and run a **rigorous, defensible evaluation** of an AI
agent and turn the results into a clear **go / no-go** decision. Evaluation is a
product discipline, not a technical formality: your job is to make the user
define what "good" means *before* testing, pick the right way to measure it, and
stay accountable to the result.

Work through the five stages below in order. Do not skip stage 1 - most bad
evaluations fail because "good" was never defined. Ask concise questions when you
lack the information a stage needs; otherwise proceed and state your assumptions.

## Stage 1 - Define what "good" means

Establish the evaluation's purpose before writing a single test.

1. Ask what decision the evaluation must support (ship / don't ship, compare two
   versions, catch regressions, satisfy a stakeholder or compliance gate).
2. Ask who the agent serves and the top real-world tasks it must get right.
3. For each task, define the **quality dimensions** that matter, choosing from:
   - **Correctness / groundedness** - is the answer factually right and grounded
     in the agent's sources?
   - **Completeness** - does it cover the required points?
   - **Relevance** - does it answer what was asked?
   - **Tone / format / compliance** - does it meet wording, safety, or policy rules?
   - **Tool / action use** - did it call the right capability or resource?
4. Write a one-line **success bar** per dimension (e.g. "names the correct return
   window and the required proof of purchase, in a friendly tone").

Output of this stage: a short list of prioritized scenarios, each with the
dimensions and success bar that define a pass.

## Stage 2 - Choose the grading method per scenario

Pick the *cheapest method that actually measures the dimension you care about*.
Never default to exact/verbatim matching for long generative answers - it fails
good answers for trivial wording differences. Use this decision guide:

| If you need to check… | Use | Needs an expected answer? |
| --- | --- | --- |
| Overall quality with no reference answer | **General quality** (LLM judge on relevance/groundedness/completeness) | No |
| The answer *means* the same as a reference | **Compare meaning** (semantic) | Short reference answer |
| Specific required facts/phrases are present | **Keyword match** | Keywords/phrases only |
| The right tool/capability/resource was used | **Tool use** | Expected capabilities |
| Close textual match to a canonical answer | **Text similarity** | Full reference answer |
| An exact, deterministic string (IDs, codes, short canned replies) | **Exact match** | Exact answer |
| A bespoke pass/fail rule you define | **Custom** (your criteria + labels) | Your instructions |

Rules of thumb:
- **Long, free-form responses → Compare meaning, Keyword match, General quality,
  or Custom.** Not Exact match or Text similarity.
- You can combine methods on one test set (e.g. Keyword match for required facts
  + General quality for tone).
- Reserve Exact match for short, deterministic outputs only.

## Stage 3 - Build the test set

1. Aim for coverage over volume: start with 5-30 high-impact cases for fast
   iteration; grow to 50-200+ for regression/coverage once the agent stabilizes.
2. Include **happy paths, edge cases, paraphrases, and known failure modes**.
3. For methods that need a reference, write the **shortest reference that still
   captures the required meaning or keywords** - a rubric ("must mention X, Y, Z"),
   not a full essay. This keeps cases robust and avoids fragile verbatim matching.
4. Never bake secrets, personal data, or environment-specific paths into cases.
5. Note the user profile / auth context each case needs, if the agent behaves
   differently per user.

## Stage 4 - Run and interpret

1. Run the test set; if the platform limits concurrency, run one at a time and
   plan batches so you don't hit daily throttles (see the platform reference).
2. Read results at two levels: the **aggregate score** (are we broadly good?) and
   **individual failures** (what exactly broke, and why?).
3. Cluster failures by root cause: missing knowledge, wrong tool call, poor
   grounding, tone/format, or an over-strict expected answer (fix the test, not
   the agent, when the answer was actually fine).
4. Prioritize fixes by user impact × frequency.

## Stage 5 - Decide go / no-go

Produce a short, defensible readiness summary:
- **Verdict:** Go / Go-with-caveats / No-go.
- **Evidence:** pass rate per priority scenario against the success bars from
  stage 1.
- **Top risks** still open, and what would clear them.
- **Recommended next actions**, ordered.

State the verdict plainly and own it. Evaluation measures correctness and
quality - it does **not** replace responsible-AI, safety, or content-policy
review, so call those out as a separate gate when relevant.

## Copilot Studio specifics

This skill targets **Microsoft Copilot Studio**, whose built-in agent evaluation
provides these grading methods, test sets, and quotas natively. Read
`references/copilot-studio-evaluation.md` for the exact native test-method names,
field limits, and quotas so your recommendations fit what the product enforces
(for example, the ~1,000-character expected-response cap and the per-agent daily
evaluation throttle). The five-stage methodology itself is sound for evaluating
any agent, but the concrete method names and limits here are Copilot Studio's.
