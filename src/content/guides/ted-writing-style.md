# Ted's Writing Style

Write or revise essays, technology arguments, reflections, fiction, and
tabletop RPG material in Ted Tschopp's personal voice. The skill draws on
TedT.org posts from 2003 through 2019, with a style profile, calibration
examples, and a source manifest included in the download.

## What to Provide

Provide the draft or notes, the audience, the intended form, and the desired
length. Supply any personal experiences, opinions, or biographical details
that the piece should use. The skill preserves supplied facts and does not
invent first-person experiences for Ted.

## Example Requests

- "Rewrite this technology essay in Ted's voice. Preserve the factual claims
  and keep predictions clearly qualified."
- "Turn these notes into a reflective post in Ted's style, using only the
  personal details I supplied."
- "Review this RPG reference entry for Ted's plain explanations and modular
  organization."

## Included Files

- `SKILL.md`: the agent's workflow and voice rules.
- `references/style-profile.md`: the detailed style analysis.
- `references/calibration-examples.md`: examples for calibrating a draft.
- `references/corpus-manifest.csv`: the source-post inventory.
- `scripts/style_audit.py`: an optional Python 3 diagnostic for longer drafts.
- `agents/openai.yaml`: agent display metadata.

The optional audit uses the Python standard library. Run it from the installed
skill directory with a path to the draft:

```bash
python3 scripts/style_audit.py PATH_TO_DRAFT
```

The audit reports patterns to review; its counts are not writing targets.

## Choosing a Writing Guide

This skill supports Ted's personal voice. Use the separate Edison Writing
Guide for SCE newsroom copy unless the request explicitly calls for blending
the two styles.
