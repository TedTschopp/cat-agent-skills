#!/usr/bin/env python3
"""Validate ballot research data, calculate separate assessments, and render HTML."""

import argparse
import copy
import html
import json
import math
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlsplit

MIN_RANK_COVERAGE = 70


def require(condition, message):
    if not condition:
        raise ValueError(message)


def number(value, label, low=0, high=None):
    require(type(value) in (int, float) and math.isfinite(value), f"{label}: finite number required")
    require(value >= low and (high is None or value <= high), f"{label}: out of range")
    return value


def text(value, label):
    require(isinstance(value, str) and value.strip(), f"{label}: nonempty text required")
    return value


def registry(rows, label):
    require(isinstance(rows, list), f"{label}: list required")
    result = {}
    for row in rows:
        require(isinstance(row, dict), f"{label}: object required")
        key = text(row.get("id"), f"{label}.id")
        require(re.fullmatch(r"[A-Za-z0-9_-]+", key), f"{label}: unsafe id {key!r}")
        require(key not in result, f"{label}: duplicate id {key}")
        result[key] = row
    return result


def references(ids, sources, label, required=False):
    require(isinstance(ids, list), f"{label}: source_ids list required")
    require(all(isinstance(x, str) and x in sources for x in ids), f"{label}: unknown source id")
    require(len(ids) == len(set(ids)), f"{label}: duplicate source id")
    require(not required or bool(ids), f"{label}: a rated or verified claim needs a source")


def sourced(value, sources, label):
    require(isinstance(value, dict), f"{label}: sourced text object required")
    text(value.get("text"), label)
    status = value.get("status", "verified")
    require(status in ("verified", "candidate_claim", "uncertain", "unavailable"), f"{label}: invalid evidence status")
    references(value.get("source_ids", []), sources, label, status in ("verified", "candidate_claim"))


def normalized_priorities(priorities):
    registry(priorities, "priorities")
    for p in priorities:
        text(p.get("label"), "priority.label")
        text(p.get("desired_outcome"), "priority.desired_outcome")
        number(p.get("weight"), "priority.weight", 0.000001)
    total = sum(p["weight"] for p in priorities)
    return [dict(p, weight=p["weight"] * 100 / total) for p in priorities] if total else []


def assess(criteria, ratings, sources):
    expected = {c["id"] for c in criteria}
    actual = registry(ratings, "ratings")
    require(set(actual) == expected, "ratings must contain each applicable criterion exactly once")
    lower, covered = 0.0, 0.0
    missing = []
    for c in criteria:
        row = actual[c["id"]]
        rating = row.get("score")
        text(row.get("explanation"), "rating.explanation")
        references(row.get("source_ids", []), sources, "rating", rating is not None)
        if rating is None:
            missing.append(c["id"])
        else:
            number(rating, "rating.score", 0, 4)
            lower += c["weight"] * rating / 4
            covered += c["weight"]
    upper = min(100.0, lower + sum(c["weight"] for c in criteria if c["id"] in missing))
    return {"lower": lower, "upper": upper, "coverage": covered,
            "score": lower if not missing else None, "missing": missing}


def tiers(candidates):
    remaining = [c for c in candidates if c["eligibility"] == "confirmed"
                 and c["assessment"]["qualifications"]["coverage"] + 1e-9 >= MIN_RANK_COVERAGE]
    for c in candidates:
        c["assessment"]["tier"] = None
    tier = 1
    while remaining:
        top = [c for c in remaining if not any(
            other["assessment"]["qualifications"]["lower"] > c["assessment"]["qualifications"]["upper"] + 1e-9
            for other in remaining if other is not c)]
        require(bool(top), "cannot form supported tiers")
        for c in top:
            c["assessment"]["tier"] = tier
        remaining = [c for c in remaining if c not in top]
        tier += 1


def analyze(raw):
    data = copy.deepcopy(raw)
    election = data["election"]
    for field in ("name", "date", "jurisdiction", "research_as_of"):
        text(election.get(field), "election." + field)
    date.fromisoformat(election["date"])
    date.fromisoformat(election["research_as_of"])
    require(election.get("ballot_status") in ("official", "sample", "unconfirmed", "synthetic"), "invalid ballot status")
    sources = registry(data.get("sources", []), "sources")
    for s in sources.values():
        for key in ("title", "publisher", "accessed", "url"):
            text(s.get(key), "source." + key)
        date.fromisoformat(s["accessed"])
        parsed = urlsplit(s["url"])
        require(parsed.scheme in ("https", "http") and parsed.netloc and not parsed.username and not parsed.password,
                "source URL must be an ordinary http(s) URL")
        require(s.get("type") in ("official", "independent", "candidate", "advocacy", "synthetic"), "invalid source type")
        require(s.get("type") != "synthetic" or election["ballot_status"] == "synthetic", "synthetic sources require a synthetic report")
    references(election.get("source_ids", []), sources, "election", election["ballot_status"] in ("official", "sample"))
    data["priorities"] = normalized_priorities(data.get("priorities", []))
    rubrics = registry(data.get("rubrics", []), "rubrics")
    for rubric in rubrics.values():
        text(rubric.get("label"), "rubric.label")
        text(rubric.get("rationale"), "rubric.rationale")
        require(rubric.get("origin") in ("default", "adapted", "recovered", "synthetic"), "invalid rubric origin")
        require(rubric.get("origin") != "synthetic" or election["ballot_status"] == "synthetic", "synthetic rubric requires synthetic report")
        criteria = rubric.get("criteria", [])
        require(criteria, "rubric has no criteria")
        registry(criteria, "criteria")
        for c in criteria:
            text(c.get("label"), "criterion.label")
            number(c.get("weight"), "criterion.weight", 0.000001, 100)
            for anchor in ("0", "2", "4"):
                text(c.get("anchors", {}).get(anchor), "criterion anchor " + anchor)
        require(math.isclose(sum(c["weight"] for c in criteria), 100, abs_tol=1e-8), "rubric weights must total 100")
    contests = data.get("contests", [])
    require(contests, "at least one ballot item required")
    registry(contests, "contests")
    coverage = data["coverage"]
    expected = coverage.get("expected_items")
    require(type(expected) is int and expected >= len(contests), "expected_items cannot be below rendered item count")
    for field in ("unreadable", "omitted", "unverified"):
        require(isinstance(coverage.get(field), list) and all(isinstance(v, str) for v in coverage[field]), "coverage gaps must be text lists")
    require(expected == len(contests) or coverage["unreadable"] or coverage["omitted"], "missing ballot items must have explicit gaps")
    known_priorities = {p["id"] for p in data["priorities"]}
    for item in contests:
        for key in ("label", "summary"):
            text(item.get(key), "item." + key)
        require(item.get("kind") in ("candidate", "measure", "retention"), "invalid item kind")
        ids = item.get("applicable_priority_ids", [p["id"] for p in data["priorities"]])
        require(isinstance(ids, list) and all(isinstance(i, str) and i in known_priorities for i in ids)
                and len(ids) == len(set(ids)), "invalid applicable priority ids")
        excluded = known_priorities - set(ids)
        require(not excluded or item.get("priority_scope_note"), "explain excluded priorities for the whole contest")
        criteria = [p for p in data["priorities"] if p["id"] in ids]
        total = sum(p["weight"] for p in criteria)
        item["applicable_priorities"] = [dict(p, weight=p["weight"] * 100 / total) for p in criteria] if total else []
        if item["kind"] == "measure":
            for field in ("yes_effect", "no_effect", "fiscal_effect", "distribution", "implementation", "oversight", "expiration"):
                sourced(item.get(field), sources, "measure." + field)
            require(isinstance(item.get("uncertainties"), list), "measure uncertainties list required")
            item["assessment"] = {}
            for option in ("yes", "no"):
                ratings = item.get("policy_alignment", {}).get(option, [])
                require(bool(criteria) or ratings == [], "remove alignment ratings when no priorities apply")
                item["assessment"][option] = assess(item["applicable_priorities"], ratings, sources) if criteria else None
            continue
        require(item.get("rubric_id") in rubrics, "unknown rubric for candidate item")
        sourced(item.get("duties"), sources, "office duties")
        limit = item.get("vote_for")
        require(type(limit) is int and limit >= 1, "positive integer vote_for required")
        text(item.get("instructions"), "ballot instructions")
        candidates = item.get("candidates", [])
        require(candidates, "candidate roster is empty")
        registry(candidates, "candidates")
        if item["kind"] == "retention":
            require(len(candidates) == 1 and limit == 1, "retention requires exactly one incumbent")
            sourced(item.get("yes_effect"), sources, "retention yes_effect")
            sourced(item.get("no_effect"), sources, "retention no_effect")
        for c in candidates:
            text(c.get("name"), "candidate.name")
            text(c.get("record_summary"), "candidate.record_summary")
            require(c.get("eligibility") in ("confirmed", "uncertain", "ineligible"), "invalid candidate eligibility")
            sourced(c.get("eligibility_evidence"), sources, "candidate eligibility")
            require(c["eligibility"] != "confirmed" or c["eligibility_evidence"].get("status", "verified") == "verified", "confirmed eligibility needs verified evidence")
            confidence = c.get("confidence", {})
            require(confidence.get("level") in ("High", "Moderate", "Low"), "invalid confidence label")
            text(confidence.get("reason"), "confidence.reason")
            for finding in c.get("findings", []):
                require(finding.get("status") in ("official_finding", "pending_proceeding", "allegation", "candidate_claim", "disputed", "search_result"), "invalid finding status")
                text(finding.get("summary"), "finding.summary")
                references(finding.get("source_ids", []), sources, "finding", finding["status"] != "search_result")
            q = assess(rubrics[item["rubric_id"]]["criteria"], c.get("qualifications", []), sources)
            require(bool(criteria) or c.get("policy_alignment", []) == [], "remove alignment ratings when no priorities apply")
            p = assess(item["applicable_priorities"], c.get("policy_alignment", []), sources) if criteria else None
            c["assessment"] = {"qualifications": q, "policy_alignment": p}
        tiers(candidates)
    return data


def esc(value):
    return html.escape(str(value), quote=True)


def n(value):
    return f"{value:.1f}".removesuffix(".0")


def score_label(result):
    if result is None:
        return "Not assessed"
    if result["coverage"] <= 1e-9:
        return "Insufficient evidence"
    points = n(result["score"]) if result["score"] is not None else f'{n(result["lower"])}–{n(result["upper"])}'
    return f'{points}/100 · {n(result["coverage"])}% evidence coverage'


def cites(ids):
    return " ".join(f'<a class="cite" href="#source-{esc(s)}">[{esc(s)}]</a>' for s in ids)


def para(value):
    return f'<p>{esc(value)}</p>' if value else ""


def evidence(value):
    status = value.get("status", "verified")
    return f'<p>{esc(value["text"])} {cites(value.get("source_ids", []))} <span class="muted">({esc(status.replace("_", " "))})</span></p>'


def rating_table(criteria, ratings, policy=False):
    by_id = {r["id"]: r for r in ratings}
    rows = []
    for c in criteria:
        row = by_id[c["id"]]
        rating = row.get("score")
        raw = "Unrated" if rating is None else n(rating) + "/4"
        points = "Unrated" if rating is None else n(c["weight"] * rating / 4)
        outcome = para(c.get("desired_outcome")) if policy else ""
        anchors = "" if policy else '<details><summary>Rating anchors</summary>' + "".join(para(f'{k}: {c["anchors"][k]}') for k in ("0", "2", "4")) + '</details>'
        rows.append(f'<tr><th scope="row">{esc(c["label"])}{outcome}{anchors}</th><td>{n(c["weight"])}%</td><td>{raw}</td><td>{points}</td><td>{esc(row["explanation"])} {cites(row.get("source_ids", []))}</td></tr>')
    return '<div class="table-wrap"><table><thead><tr><th>Criterion</th><th>Weight</th><th>Rating</th><th>Points</th><th>Evidence and Reason</th></tr></thead><tbody>' + ''.join(rows) + '</tbody></table></div>'


def render(data):
    election = data["election"]
    rubrics = {r["id"]: r for r in data["rubrics"]}
    out = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
           '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">',
           '<title>' + esc(election["name"]) + ' — Ballot Review</title>', '<style>' + CSS + '</style></head><body><main>',
           '<header><p class="eyebrow">Ballot Candidate Review</p><h1>' + esc(election["name"]) + '</h1>',
           para(f'{election["jurisdiction"]} · Election: {election["date"]} · Research as of: {election["research_as_of"]}'),
           para(f'Ballot status: {election["ballot_status"]} · Items covered: {len(data["contests"])} of {data["coverage"]["expected_items"]}'),
           cites(election.get("source_ids", [])), '</header>']
    if election["ballot_status"] == "synthetic":
        out.append('<aside class="notice"><strong>Synthetic Demo — Not Election Research</strong><p>Names, ballot items, evidence, and sources are invented to test report behavior. These are not voting recommendations.</p></aside>')
    for field in ("unreadable", "omitted", "unverified"):
        if data["coverage"][field]:
            out.append('<aside class="notice">' + para(field.capitalize() + ': ' + '; '.join(data["coverage"][field])) + '</aside>')
    priority_title = 'Illustrative Priorities for This Demo' if election["ballot_status"] == 'synthetic' else 'Your Priorities for This Election'
    out.append('<section aria-labelledby="priorities"><h2 id="priorities">' + priority_title + '</h2>')
    if data["priorities"]:
        out.append('<ul>' + ''.join(f'<li><strong>{esc(p["label"])}</strong> ({n(p["weight"])}%): {esc(p["desired_outcome"])}</li>' for p in data["priorities"]) + '</ul>')
    else:
        out.append(para('Priorities not supplied. Policy alignment has not been assessed.'))
    for note in data.get("priority_notes", []):
        out.append(para(note))
    out.append('</section><p class="muted">Qualifications and policy alignment are separate. A range reflects missing evidence, not statistical confidence. Supported tiers require confirmed eligibility and at least 70% qualification evidence coverage. Names inside a tier are alphabetical.</p><nav aria-label="Ballot items"><ol>')
    out.extend(f'<li><a href="#item-{esc(i["id"])}">{esc(i["label"])}</a></li>' for i in data["contests"])
    out.append('</ol></nav>')
    for index, item in enumerate(data["contests"], 1):
        out.append(f'<article id="item-{esc(item["id"])}"><p class="eyebrow">Ballot Item {index} · {esc(item["kind"].capitalize())}</p><h2>{esc(item["label"])}</h2>' + para(item["summary"]))
        out.append(para(item.get("priority_scope_note")))
        if item["kind"] == "measure":
            out.append(para('Yes alignment: ' + score_label(item["assessment"]["yes"])) + para('No alignment: ' + score_label(item["assessment"]["no"])))
            out.append('<details><summary>Effects, Costs, and Oversight</summary>')
            for field in ("yes_effect", "no_effect", "fiscal_effect", "distribution", "implementation", "oversight", "expiration"):
                out.append('<h3>' + field.replace('_', ' ').title() + '</h3>' + evidence(item[field]))
            out.append('<h3>Uncertainties</h3>' + para('; '.join(item["uncertainties"]) or 'No additional uncertainties recorded.'))
            for option in ("yes", "no"):
                if item["applicable_priorities"]:
                    out.append(f'<details><summary>{option.title()}: Policy Evidence</summary>' + rating_table(item["applicable_priorities"], item["policy_alignment"][option], True) + '</details>')
            out.append('</details></article>')
            continue
        out.append(para(item["instructions"]))
        if item["kind"] == "retention":
            out.append('<p><strong>Yes:</strong></p>' + evidence(item["yes_effect"]) + '<p><strong>No:</strong></p>' + evidence(item["no_effect"]))
        candidates = sorted(item["candidates"], key=lambda c: (c["assessment"]["tier"] or 999, c["name"].casefold()))
        leaders = [c["name"] for c in candidates if c["assessment"]["tier"] == 1]
        if item["kind"] != "retention":
            out.append(para('Strongest supported qualifications: ' + (', '.join(leaders) if leaders else 'No supported ordering; research or eligibility gaps remain.')))
        out.append('<details><summary>' + ('Incumbent Record and Scores' if item["kind"] == "retention" else 'Compare Candidates and Scores') + '</summary><div class="table-wrap"><table><thead><tr><th>Candidate</th><th>Qualifications</th><th>Policy Alignment</th><th>Supported Tier</th><th>Research Confidence</th></tr></thead><tbody>')
        for c in candidates:
            a = c["assessment"]
            tier = ('Tier ' + str(a["tier"])) if a["tier"] else 'Not rankable'
            out.append(f'<tr><th scope="row">{esc(c["name"])}<br><span class="muted">Eligibility: {esc(c["eligibility"])}</span></th><td>{score_label(a["qualifications"])}</td><td>{score_label(a["policy_alignment"])}</td><td>{tier}</td><td>{esc(c["confidence"]["level"])}</td></tr>')
        out.append('</tbody></table></div>' + para(item.get("sensitivity_note")))
        rubric = rubrics[item["rubric_id"]]
        out.append('<h3>Office Duties and Rubric</h3>' + evidence(item["duties"]) + para(rubric["label"] + ' · ' + rubric["origin"]) + para(rubric["rationale"]))
        for c in candidates:
            out.append('<details><summary>' + esc(c["name"]) + ': Evidence and Reasoning</summary>' + para(c["record_summary"]) + '<h3>Eligibility</h3>' + evidence(c["eligibility_evidence"]) + '<h3>Qualifications</h3>' + rating_table(rubric["criteria"], c["qualifications"]))
            out.append('<h3>Policy Alignment</h3>' + (rating_table(item["applicable_priorities"], c["policy_alignment"], True) if item["applicable_priorities"] else para('Not assessed: priorities were not supplied or none apply to this item.')))
            out.append('<h3>Findings and Counterevidence</h3>')
            for finding in c.get("findings", []):
                out.append(para(finding["status"].replace('_', ' ').capitalize() + ': ' + finding["summary"]) + cites(finding.get("source_ids", [])))
            out.append('<h3>Research Confidence and Gaps</h3>' + para(c["confidence"]["level"] + ': ' + c["confidence"]["reason"]))
            for gap in c.get("research_gaps", []):
                out.append(para(gap))
            out.append('</details>')
        out.append('</details></article>')
    out.append('<details id="sources"><summary>Source Register</summary><ol>')
    for source in data["sources"]:
        out.append(f'<li id="source-{esc(source["id"])}"><strong>[{esc(source["id"])}] {esc(source["title"])}</strong>' + para(f'{source["publisher"]} · {source["type"]} · Published: {source.get("published") or "not stated"} · Accessed: {source["accessed"]}') + f'<a href="{esc(source["url"])}" target="_blank" rel="noopener noreferrer">{esc(source["url"])}</a>' + para(source.get("note")) + '</li>')
    out.append('</ol></details><footer>' + para('Scores express documented judgments under the displayed rubric. Missing evidence remains visible. No combined qualification-and-policy score is calculated.') + '</footer></main><script>' + JS + '</script></body></html>')
    return ''.join(out)


CSS = """
:root{color-scheme:light;--ink:#172b34;--muted:#52636b;--accent:#176967;--line:#cfdbdf}
*{box-sizing:border-box}body{margin:0;background:#f4f7f8;color:var(--ink);font:16px/1.6 system-ui,-apple-system,sans-serif}
main{max-width:1100px;margin:auto;padding:40px 24px}h1{font-size:2.4rem;line-height:1.15}h2{font-size:1.5rem;line-height:1.3}h3{font-size:1.05rem;margin:24px 0 8px}p{margin:8px 0 16px}
header{border-bottom:3px solid var(--accent);padding-bottom:22px}section,nav{margin:28px 0}.eyebrow{color:var(--accent);font-weight:700;font-size:.8rem;letter-spacing:.09em;text-transform:uppercase}.muted{color:var(--muted);font-size:.9rem}
article{background:white;border:1px solid var(--line);border-radius:12px;padding:24px;margin:24px 0;scroll-margin-top:20px}.notice{border-left:5px solid #a36a16;background:#fff2d6;padding:16px;margin:24px 0}
details{border:1px solid var(--line);border-radius:7px;padding:12px 16px;margin:16px 0;background:white}details details{background:#f8fbfb}summary{cursor:pointer;font-weight:650;color:var(--accent);padding:4px 0}summary:focus-visible,a:focus-visible{outline:3px solid #a36a16;outline-offset:4px}
a{color:var(--accent);overflow-wrap:anywhere}.cite{font-size:.85rem;white-space:nowrap}.table-wrap{overflow-x:auto}table{border-collapse:collapse;width:100%;font-size:.9rem;margin:14px 0}th,td{text-align:left;vertical-align:top;padding:12px;border-bottom:1px solid var(--line)}thead{background:#edf3f4}th p{font-weight:400}td{min-width:90px}td:last-child{min-width:180px}th details{font-size:.8rem;font-weight:400;min-width:180px}footer{margin-top:36px;color:var(--muted);font-size:.85rem}li{margin:10px 0}
@media(max-width:600px){main{padding:20px 12px}h1{font-size:1.9rem}article{padding:16px}details{padding:10px}th,td{padding:9px}}
@media print{body{background:white;font-size:10pt}main{max-width:none;padding:0}article,details{border-radius:0}summary{color:black}nav{display:none}a{color:black}.table-wrap{overflow:visible}table{font-size:9pt}thead{display:table-header-group}tr,summary{break-inside:avoid}article{break-before:auto}h2,h3{break-after:avoid}}
"""

JS = """
document.querySelectorAll('a.cite').forEach(a=>a.addEventListener('click',()=>{document.getElementById('sources').open=true;}));
let printState=[];
addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('details')].map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);});
addEventListener('afterprint',()=>printState.forEach(([d,open])=>d.open=open));
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--analysis-json", type=Path)
    args = parser.parse_args()
    outputs = [p for p in (args.output, args.analysis_json) if p is not None]
    require(len({p.resolve() for p in outputs}) == len(outputs), "output paths must differ")
    require(all(p.resolve() != args.input.resolve() for p in outputs), "outputs cannot replace input data")
    data = analyze(json.loads(args.input.read_text()))
    report = render(data)
    for path in outputs:
        path.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(report, encoding="utf-8")
    if args.analysis_json:
        args.analysis_json.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"report": str(args.output), "items": len(data["contests"]),
                      "candidates": sum(len(i.get("candidates", [])) for i in data["contests"]),
                      "synthetic": data["election"]["ballot_status"] == "synthetic"}))


if __name__ == "__main__":
    main()
