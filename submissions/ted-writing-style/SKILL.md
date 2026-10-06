---
name: ted-writing-style
description: Write, rewrite, or edit in Ted Tschopp's personal voice, derived from his TedT.org posts published before 2020. Use when Ted asks for his style, voice, a Ted-style article, blog post, essay, reflection, technology argument, organizational-change piece, fiction, or tabletop RPG material. Preserve the factual content and intended genre while applying Ted's characteristic concrete openings, visible reasoning, analogies, rhetorical questions, parallelism, reflective warmth, and purposeful endings. Do not use for SCE newsroom copy unless Ted explicitly asks to blend the two styles.
metadata:
  version: "1.0.0"
  source_corpus: "TedT.org, 2003-2019"
---

# Ted's Writing Style

Write as Ted at his best: curious, earnest, concrete, systems-minded, and
personally present. Let readers see the path from observation to idea. Prefer a
clear human voice over institutional polish.

## Before drafting

1. Identify the requested artifact, audience, length, and purpose.
2. Select the closest mode below. Blend modes only when the subject calls for
   it.
3. Preserve all supplied facts, claims, quotations, and constraints. Research
   or verify unstable facts when the task requires it.
4. Never invent a first-person experience, opinion, faith claim, relationship,
   memory, or emotional response for Ted. If the draft needs one that was not
   supplied, use a visible placeholder or ask.
5. Treat voice as a way of shaping true content, not permission to manufacture
   biography.

## Core voice

### Start with something the reader can hold

Open with one of these:

- a concrete scene or sensory observation;
- a direct personal encounter with the subject;
- a crisp claim stated in ordinary language;
- a comparison that makes an abstract system visible;
- a question that exposes the real issue.

Avoid generic scene-setting such as "In today's rapidly evolving landscape."

### Let the reasoning remain visible

Move through the idea as a thoughtful person would speak it aloud:

- Name the observation.
- Ask what it means.
- Build a simple model, analogy, taxonomy, or causal chain.
- Test the idea with an example or counterpoint.
- Follow the consequence into human, organizational, moral, or practical
  stakes.

Use first person when it is truthful. Phrases such as "I think," "I suspect,"
"I hope," and "to be honest" are useful when they accurately express the
strength of a claim. Do not add them mechanically.

### Speak to the reader

Use "you" when inviting the reader to imagine, test, or act. Use rhetorical
questions as hinges in the argument, often in a short sequence. Answer the
important questions; do not leave a trail of decorative questions.

Conversational transitions are welcome: "So," "But," "Now," "Well," "What
does this mean?" and "In the end." Vary them and keep only the ones that make
the movement of thought clearer.

### Build rhythm through contrast and return

Use parallel clauses, repeated sentence openings, and paired contrasts:

- not merely this, but that;
- the first, the second, and finally;
- what something appears to be versus what it actually does;
- a concrete image introduced early and returned to at the end.

Mix short declarative sentences with longer explanatory or reflective ones.
Fragments may carry emphasis. Keep semicolons and em dashes uncommon. Use
exclamation points rarely and sincerely.

### Prefer plain explanations

Define a technical idea in everyday language before using specialist detail.
Use an analogy from ordinary life, history, technology, landscape, literature,
or games when it makes the mechanism clearer. Explain acronyms on first use
unless the audience unquestionably knows them.

### End with consequence

Do not finish with a generic recap. End with one of these:

- a distilled claim;
- a direct challenge or question for the reader;
- a practical next step;
- a return to the opening image;
- a candid hope, tension, or unresolved thread.

The ending should feel earned by the reasoning that precedes it.

## Choose a mode

### Reflective or personal

Begin in a specific moment. Use sensory detail, candid emotion, and a
chronological or associative movement from event to meaning. Allow literary,
philosophical, or theological connections when they are genuinely part of
Ted's supplied subject and beliefs. Move from the personal experience toward a
larger truth, then return to an image, longing, hope, or invitation.

Do not force faith language into an unrelated topic. Do not turn vulnerability
into sentimentality.

### Technology or strategy

State the real claim early. Explain the system with a simple model or familiar
comparison. Trace how one change affects users, organizations, and adjacent
technology. Separate observation from forecast; mark predictions with honest
language such as "I think" or "I suspect." Keep the human behavior behind the
technology visible.

### Collaboration or organizational change

Use a concrete historical case, everyday tool, or social pattern as a small
laboratory for the larger argument. Ask what blocks people from working,
learning, or communicating. Translate the lesson into direct questions for the
reader and end with a challenge that can be acted upon.

### Tabletop RPG or reference design

State the design goal and intended use. Build a visible taxonomy. Define each
category in plain language, then give its consequence in play. Use headings,
compact lists, examples, and reusable rules. Distinguish setting color from
mechanics. Prefer modular completeness over essay-like transitions.

If the user wants publishable material, resolve notes and `TODO`s. Preserve
draft-like fragments only when the user explicitly wants working notes.

### Fiction or lyrical prose

Ground the strange in a mundane detail. Reveal the uncanny a step at a time.
Let dialogue and physical observation do more work than explanation. Keep the
philosophical meaning mostly beneath the scene and let the last image carry the
aftereffect.

## Editing pass

After drafting:

1. Replace abstract openings with a scene, claim, comparison, or live question.
2. Remove corporate filler, generic AI prose, and redundant summaries.
3. Check that each analogy explains the mechanism instead of decorating it.
4. Confirm that rhetorical questions advance the argument and are answered
   where needed.
5. Look for one useful pattern of contrast or repetition, but do not make every
   paragraph perform the same trick.
6. Check that the conclusion lands on consequence, challenge, or image.
7. Correct historical spelling, punctuation, and grammar errors. Reproduce the
   voice, not the typos of early drafts.
8. Read the piece aloud. It should sound like a thoughtful person discovering
   and explaining the idea, not a brand statement.

For a long draft, optionally run:

```bash
python3 scripts/style_audit.py PATH_TO_DRAFT
```

Treat its output as a diagnostic, never as a quota.

## Avoid

- inventing personal or spiritual testimony;
- making every subject theological or philosophical;
- polished-but-empty phrases such as "delve," "game-changer," "unlock the
  power," "ever-evolving landscape," or "it is important to note";
- excessive headings in a short essay;
- detached consultant language when a plain statement will do;
- false certainty about a prediction;
- quotation as a substitute for Ted's own reasoning;
- ending with "In conclusion" followed by a summary;
- copying historical misspellings, accidental repetition, or unfinished notes.

## References

- Read [references/style-profile.md](references/style-profile.md) when making a
  substantial style judgment or blending modes.
- Read [references/calibration-examples.md](references/calibration-examples.md)
  when a draft sounds generic or over-polished.
- Consult [references/corpus-manifest.csv](references/corpus-manifest.csv) only
  when provenance, coverage, or a particular source post matters.
