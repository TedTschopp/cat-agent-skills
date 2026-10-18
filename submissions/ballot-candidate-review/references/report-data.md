# Report Data

The report builder uses only Python 3.9+ standard-library modules. It validates structure and arithmetic, not election facts. Research and reconcile the ballot first. Invoke `scripts/build_report.py INPUT.json --output REPORT.html --analysis-json REPORT-data.json`.

## Root Objects

- `election`: `name`, `date` (YYYY-MM-DD), `jurisdiction`, `research_as_of` (local YYYY-MM-DD), `ballot_status` (`official`, `sample`, `unconfirmed`, or `synthetic`), and `source_ids`. Official and sample status require ballot sources. Synthetic status places an explicit demo banner on the report.
- `coverage`: `expected_items` (integer at least as large as the item array), and text lists `unreadable`, `omitted`, `unverified`. Explain every missing item. This is the extracted ballot inventory count, not a guessed precinct count.
- `priorities`: objects with unique `id`, `label`, `desired_outcome`, and positive relative `weight`. The builder normalizes to 100. Use `[]` when priorities are not supplied; do not fabricate them. Optional `priority_notes` is a text list for explicit voter tradeoffs or dealbreakers, which must also be discussed with supporting evidence in affected item/candidate reasoning.
- `sources`: unique `id`, `title`, `publisher`, `url` (direct http/https), `accessed` (YYYY-MM-DD), `type` (`official`, `independent`, `candidate`, `advocacy`, `synthetic`), optional `published`, and optional `note`. Synthetic sources are allowed only in synthetic reports.
- `rubrics`: objects with unique `id`, `label`, `origin` (`default`, `adapted`, `recovered`, `synthetic`), `rationale`, and `criteria`.
- `contests`: candidate, retention, or measure items in ballot order. Every item has unique `id`, `kind`, `label`, and a short `summary` written after evaluating the evidence. Do not place raw HTML in text fields; all text is escaped.

IDs use letters, digits, hyphens, and underscores. Links are generated from source IDs. Dates, names, priority directions, and summaries must reflect actual research; the renderer supplies no political facts.

## Rubrics and Ratings

Each rubric criterion has unique `id`, `label`, positive `weight`, and `anchors` with string keys `"0"`, `"2"`, `"4"`. Criterion weights total 100. Anchors describe concrete evidence relevant to this office and criterion.

Each rating has `id` matching its criterion or priority, `score` (number 0–4 or null), `explanation`, and `source_ids`. Include each applicable criterion/priority exactly once, including null ratings. A non-null score requires sources. Null explanations identify the evidence gap. A missing rating object is invalid, not an implicit zero.

```json
{
  "id": "integrity",
  "score": null,
  "explanation": "The relevant oversight records were inaccessible; this criterion remains unrated.",
  "source_ids": []
}
```

The script calculates each component as `weight * score / 4`. Missing weight remains in the upper bound. Complete evidence yields a point score; partial evidence yields a range and coverage. Candidates with uncertain eligibility or under 70% qualification coverage remain visible but outside supported tiers. Policy scores never determine qualification tiers.

## Sourced Text

Office duties, eligibility, and measure/retention effects use this object shape:

```json
{
  "text": "An accurate, concise statement established by the cited record.",
  "status": "verified",
  "source_ids": ["official-record"]
}
```

`status` defaults to `verified`. Allowed values are `verified`, `candidate_claim`, `uncertain`, and `unavailable`. Verified statements and candidate claims require sources. An uncertain or unavailable field must explain its limitation; it is not permission to make unsupported factual claims.

## Candidate Items

In addition to the common fields, supply:

- `vote_for`: positive integer; copy the actual ballot limit.
- `instructions`: verified ballot instructions in plain language.
- `duties`: sourced text describing actual office authority.
- `rubric_id`: a rubric from the root registry.
- `candidates`: each candidate's unique `id`, exact `name`, `eligibility` (`confirmed`, `uncertain`, `ineligible`), `eligibility_evidence` (sourced text), `record_summary`, `qualifications` (ratings), and `policy_alignment` (priority ratings).
- Candidate `confidence`: `level` (`High`, `Moderate`, `Low`) and a substantive `reason`.
- Optional candidate `research_gaps`: text list; optional `findings`: objects with `status`, `summary`, `source_ids`. Finding statuses: `official_finding`, `pending_proceeding`, `allegation`, `candidate_claim`, `disputed`, or `search_result`. All except a bounded search-result statement require sources. Include material favorable evidence and responses as well as adverse records.
- Optional item `sensitivity_note`: explain meaningful close calls, rank instability, and evidence that could alter the assessment. Do not claim a sensitivity calculation was run unless it was.

Confirmed eligibility requires verified eligibility evidence. Use uncertain eligibility and null ratings for unnamed write-ins. The source can establish that a write-in space exists without establishing an unnamed person's eligibility.

## Applicable Priorities

By default, every declared priority applies. To exclude a priority that has no meaningful relation to the office, provide the item's `applicable_priority_ids` list and a `priority_scope_note` explaining the exclusion for the entire contest. The script renormalizes that subset uniformly. Every candidate or both measure options must use the same subset. Missing positions remain null; they do not justify exclusions.

If the subset is empty, or there are no declared priorities, use empty alignment arrays and show an unassessed state. Do not preserve stale ratings from an earlier election.

## Retention Items

Use `kind: "retention"` and the candidate-item fields, but exactly one incumbent and `vote_for: 1`. Supply sourced `yes_effect` and `no_effect` describing the jurisdiction's actual consequences. The report shows an incumbent assessment, not a competition or fabricated opponent.

## Measure Items

Use `kind: "measure"`. Supply sourced `yes_effect`, `no_effect`, `fiscal_effect`, `distribution`, `implementation`, `oversight`, and `expiration`. Unknowns receive explicit uncertain/unavailable status. Include an `uncertainties` text list.

`policy_alignment` is an object with separate `yes` and `no` arrays of applicable priority ratings. Analyze both independently; neither is computed as the inverse of the other. Without applicable priorities, both arrays are empty. Measures have no rubric ID, candidate list, qualification score, or candidate tier.

## Deliverables and Review

The HTML opens with summaries, priorities, and inventory coverage. Comparisons and evidence use nested native disclosure controls; source citations open the source register. Print events expand disclosures for printing and restore the previous state afterward. The JSON output preserves research data and adds normalized applicable priorities and calculation results.

Check the actual output visually and reconcile counts with the supplied ballot. The builder rejects invalid weights, unknown citations, duplicate IDs, unsafe URL schemes, unsupported eligibility, and incomplete rating rows. It cannot discover omitted names, verify a claim, or certify the completeness of research.
