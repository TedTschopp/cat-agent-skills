# Personal Newspaper

Create a newspaper around the people, sources, and interests you choose. The
skill combines planning pages, family updates, selected reading, illustrations,
and playable puzzles in a PDF that the agent checks before handing it over.
It works for a solo reader, an adults-only household, or a family with children.

## What it includes

- Today, tomorrow, seven-day, and 30-day planning pages.
- Shared family pages, individual child pages, an adult personal desk, and
  discussion pages, with optional grades, current-term assignments, and tasks.
- Reading desks for selected publications, newsletters, public feeds, and
  organization notices, with source attribution and explicit coverage gaps.
- Optional illustrations, three-panel comics, and numbered drawing lessons.
- A crossword, Jumble, Sudoku, and chess mate-in-one, with checked solutions
  and separate answer keys.
- PDF rendering, page previews, review receipts, revision history, and
  delivery records.

Choose only the sections you need. The newspaper name, people, sources,
interests, artwork, paper size, and delivery preferences are configurable.

## Start a newspaper

Add the complete skill bundle to an agent with a Python runtime and file
access. Then ask:

> Use Personal Newspaper to set up a newspaper for my household and prepare a
> checked PDF.

The agent asks about your audience, location and time zone, sections, sources,
artwork, games, and delivery preferences. It presents a plan for confirmation
before configuring your private workspace. You can start with a local PDF
and add other capabilities later.

Private mail, calendars, task lists, and school information require your own
authorized connectors or supported browser access. Public adapters support
configured JSON Feed, RSS, Atom, and National Weather Service sources. The
agent reports partial or unavailable coverage when a source cannot be read.

## Runtime requirements

### Codex

Extract the complete bundle into
`<project>/.agents/skills/personal-newspaper/` for one repository, or
`~/.agents/skills/personal-newspaper/` for your user account. Keep `SKILL.md`,
`agents/`, `scripts/`, `references/`, and `assets/` together. Then invoke
`$personal-newspaper` in Codex. See the
[official skill documentation](https://learn.chatgpt.com/docs/build-skills)
for discovery and installation details.

Codex can use its bundled Python runtime when available, with the required
packages installed in a separate environment. The runtime note in
`references/codex.md` covers native libraries and optional tools. A Codex
session with Python and PDF dependencies can produce a local newspaper;
account access, artwork, email, scheduling, and printing depend on the tools
available in that session.

### Python and optional tools

The PDF tools require Python 3.12 or later, the packages in
`scripts/requirements.txt`, WeasyPrint's platform libraries, and Poppler's
`pdftoppm` command for page previews. Install them in the receiving agent's
environment. The bundle includes its fonts and their license files.

From the installed skill folder, inspect the available commands with:

```sh
python scripts/newspaper.py --help
python scripts/newspaper.py setup-questions
```

Image generation, account access, email, and scheduling use the host agent's
tools. Their availability determines which options can run in that
environment. Local printing uses CUPS; other printer systems need an adapter
that preserves the same review, physical-test, deadline, and duplicate-print
checks. Scheduling begins after a checked interactive sample and uses the
host's scheduler under your scheduling request.

## Try the fictional sample

The full offline sample demonstrates an 18-page newspaper with planning,
family and reading desks, two comics, a drawing lesson, and all four games.
It uses fictional people and records, with optional artwork on selected pages.
After installing the runtime requirements, run:

```sh
python scripts/newspaper.py validate --profile assets/full.profile.json --snapshot assets/full.snapshot.json --edition assets/full.edition.json
python scripts/newspaper.py render --profile assets/full.profile.json --snapshot assets/full.snapshot.json --edition assets/full.edition.json --output ./personal-newspaper-demo-r001
```

Use a new output directory for each render, and inspect every generated page
preview. The smaller `demo.*.json` fixtures provide a three-page example.
Run the bundled tests with:

```sh
python -m unittest discover -s scripts -p 'test_*.py'
```

## Privacy and delivery

Keep personal profiles, source snapshots, portraits, and finished editions in
your private workspace outside the shareable skill. The examples do not
provide account access, real likenesses, delivery permission, or a schedule.

A local PDF can be the complete deliverable. Email requires your configured
recipients and authorization; delivery is recorded only after the sent
message and attached PDF bytes have been checked. Printing starts disabled
and requires a physically confirmed printer test. A print queue accepting a
job does not establish that paper was produced.
