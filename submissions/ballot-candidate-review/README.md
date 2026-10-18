# Ballot Candidate Review

Build a source-linked research report for a supplied U.S. sample or official
ballot. The skill covers candidates, judicial retention questions, and ballot
measures in ballot order, with short summaries and expandable evidence.

## What It Compares

Candidate qualifications and alignment with your stated policy priorities are
separate assessments. Office-specific rubrics explain the qualifications
comparison. Alignment uses only the priorities you provide for that election.
Evidence gaps and unresolved comparisons remain visible.

For measures, the report compares the verified effects of Yes and No, fiscal
assumptions, implementation, oversight, and uncertainty.

## How to Use It

Install the skill and provide your ballot as a PDF, image, or text. Supply the
election date and jurisdiction if they are not readable on the ballot. The
skill asks for your priorities before assessing policy alignment and verifies
the ballot against current official sources.

Example request:

> Research this ballot. Compare each candidate's qualifications for the office
> and ask me about my priorities before assessing policy alignment. Show the
> sources, conflicting evidence, and anything you could not verify.

The bundled Python script builds an HTML report and a JSON companion from the
research data using the standard library. It validates arithmetic and report
structure; the research still requires live sources and human review.

## Scope

The skill produces research and comparisons. It does not complete or transmit
a ballot, contact campaigns, or publish an endorsement on your behalf. If you
do not provide policy priorities, alignment remains unassessed.
