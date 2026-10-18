---
name: ballot-candidate-review
description: Research candidates and measures on a supplied U.S. sample or official ballot, rank candidates by office-specific qualifications, and compare policy alignment against priorities requested for that election. Produce a source-linked report with short summaries and expandable evidence. Use for a voter's own national, state, and local ballot research, including judicial retention and ballot measures.
---

# Ballot Candidate Review

Turn a supplied ballot into a private research report. Cover every item, from national offices to local districts. Keep **qualifications for the job** and **alignment with the voter's stated policy priorities** as separate assessments. Start with short summaries and reveal comparisons, rubrics, and evidence progressively. Do not reuse old candidate rankings as current research.

## Establish the Ballot and Priorities

Read the ballot PDF, photos, screenshots, or text. Check image rendering when extraction is unclear. Inventory contests and measures in ballot order, including exact candidate names, running mates, office numbers, districts, vote limits, terms, retention questions, and write-in spaces. Track unreadable items explicitly.

Identify the election date, jurisdiction, and edition. Reconcile them with the official election authority's current sample ballot or roster. An official sample ballot can be authoritative; a user-created demonstration is not automatically an official roster. Do not substitute another precinct, party, date, or election. Ask only for missing location or district information needed to resolve the ballot.

Ask for priorities **for this election** before scoring alignment. Reuse answers already given for this election in the active task; do not repeat the interview or assume an earlier election's priorities remain valid. Bundle at most three short questions:

1. What are your top three to five priorities, and what outcomes do you want on each? A topic such as “housing” needs a direction or desired outcome.
2. Which matter most? Offer equal weights or relative importance from 1 to 5; explain the resulting weights.
3. Are there office-specific priorities, tradeoffs, or explicit dealbreakers? Which offices or measures do they apply to?

Suggest relevant topics only to help the voter express their own priorities. Do not infer priorities from demographics, religion, employment, neighborhood, party, voting history, or other personal attributes. Party and endorsements are not qualification scores.

While waiting, verify the inventory, office duties, and records. If the voter declines to supply priorities, finish qualifications and mark alignment **Not assessed — priorities not supplied**. Do not invent a neutral score. Priority answers are required for dependent alignment work, not independent research.

## Research and Evaluate

Read [references/research-and-scoring.md](references/research-and-scoring.md) for evidence rules, anchors, missing evidence, and supported ordering. Use live browsing for every real election report; prefer current official records and direct links. If browsing is unavailable, label the report incomplete and keep unverified or stale claims out of current rankings.

Read the relevant family in [references/office-rubrics.md](references/office-rubrics.md). Verify the office's current legal powers and duties first. Select or adapt a 100-point rubric **before scoring candidates**, explain changes, and apply the same rubric and evidence standards to every candidate in the contest. Weights are proposed assessment choices, not official certification. Do not tune them to favor a candidate after seeing results.

Evaluate demonstrated competence, transferable experience, performance, integrity, judgment, and readiness. Incumbency, years served, education, wealth, popularity, party, and endorsement counts do not earn automatic points. Evaluate promises for specificity, feasibility, and fit with actual authority separately from agreement with the policy goal.

Research every named candidate, including lesser-known and unopposed candidates. Distinguish final findings, pending proceedings, allegations, disputed claims, candidate statements, and absent evidence. Show material counterevidence. Score alignment using only declared desired outcomes and documented positions or records.

Preserve multi-seat vote limits and do not force distinctions inside unresolved tiers. For tickets, consider both nominees' roles. For ranked-choice races, distinguish comparison order from counting rules. For retention questions, compare the incumbent's record against the job standard and explain verified Yes/No effects; do not manufacture an opponent.

For measures, compare verified Yes and No effects, the status quo, fiscal assumptions, who benefits or bears costs, implementation, discretion, oversight, expiration, and uncertainties. Measures receive policy-alignment assessments, not candidate-qualification scores. Keep local measures and statewide propositions distinct. Do not derive No's alignment by subtracting Yes's score from 100.

## Build the Report

Read [references/report-data.md](references/report-data.md) when preparing report data. Use the bundled standard-library script for arithmetic, supported tiers, safe HTML, citations, and expandable sections:

```bash
python3 scripts/build_report.py work/ballot-review.json \
  --output outputs/ballot-review.html \
  --analysis-json outputs/ballot-review-data.json
```

Run paths relative to the current task, using the script's full skill path when needed. Use `work/` for intermediate research and the task's output directory for deliverables. The JSON companion preserves evidence and calculation inputs. Use election-specific filenames; do not overwrite an existing report without an update request.

The open view shows election metadata, research date, coverage, declared priorities, and a short summary for every item. Expandable comparisons show separate qualifications and alignment columns. Deeper candidate details contain the rubric, evidence, counterevidence, findings, citations, and gaps. Measures have expandable Yes/No analysis. The print view expands the evidence.

Keep every item and candidate visible, including uncertain eligibility, unnamed write-ins, incomplete research, and **Not rankable**. “Evidence coverage” is the share of weighted criteria with ratings, not a probability that a candidate is good. Give High/Moderate/Low confidence a written evidence rationale.

Inspect the generated HTML in a browser. Check collapsed and expanded views, keyboard disclosure controls, source links, item and candidate counts, mobile layout, and print view when available. If visual inspection is unavailable, state the limitation. The script validates arithmetic and structure; it does not verify political facts.

In chat, summarize coverage and findings, link the expandable report, and identify unresolved research. For an inline-only request, provide item summaries followed by details in ballot order; use disclosure blocks only if supported by the client.

## Completion and Scope

A complete report has a reconciled inventory, current evidence or explicit gaps, office-appropriate rubrics, declared priorities or an unassessed state, and verified calculations. Label synthetic previews clearly; they are not research on the user's ballot.

Produce research and comparisons. Do not fill, submit, or transmit a ballot, contact campaigns, or publish an endorsement on the voter's behalf. Do not persist political priorities as general memory unless explicitly requested.
