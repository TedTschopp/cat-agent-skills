#!/usr/bin/env python3
"""Print non-prescriptive diagnostics for a prose draft."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys


WORD_RE = re.compile(r"\b[A-Za-z]+(?:[’'][A-Za-z]+)?\b")
SENTENCE_RE = re.compile(r"(?<=[.!?])(?:[”’\"']*)\s+(?=[A-Z0-9“\"'])")
FIRST = {"i", "i'm", "i've", "i'd", "i'll", "me", "my", "mine", "we", "we're", "we've", "we'd", "we'll", "us", "our", "ours"}
SECOND = {"you", "you're", "you've", "you'd", "you'll", "your", "yours"}
CLICHES = (
    "in today's rapidly evolving",
    "ever-evolving landscape",
    "it is important to note",
    "game-changer",
    "unlock the power",
    "delve into",
    "in conclusion",
    "leverage synergies",
)


def rate(count: int, total: int, scale: int = 1000) -> float:
    return round(count * scale / total, 2) if total else 0.0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", help="Draft path; omit to read stdin")
    args = parser.parse_args()
    text = Path(args.path).read_text(encoding="utf-8") if args.path else sys.stdin.read()

    paragraphs = [line.strip() for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#")]
    sentences = []
    for paragraph in paragraphs:
        sentences.extend(part.strip() for part in SENTENCE_RE.split(paragraph) if part.strip())
    words = [word.casefold().replace("’", "'") for word in WORD_RE.findall(text)]
    sentence_lengths = [len(WORD_RE.findall(sentence)) for sentence in sentences]
    paragraph_lengths = [len(WORD_RE.findall(paragraph)) for paragraph in paragraphs]

    print("Ted writing-style diagnostic (guidance, not a score)")
    print(f"Words: {len(words)}")
    print(f"Paragraphs: {len(paragraphs)}")
    print(f"Sentences: {len(sentences)}")
    if sentence_lengths:
        ordered = sorted(sentence_lengths)
        print(f"Mean sentence length: {sum(sentence_lengths) / len(sentence_lengths):.1f} words")
        print(f"Median sentence length: {ordered[len(ordered) // 2]} words")
        print(f"Questions: {rate(sum(s.rstrip('”\"\' ').endswith('?') for s in sentences), len(sentences), 100)}% of sentences")
        print(f"Exclamations: {rate(sum(s.rstrip('”\"\' ').endswith('!') for s in sentences), len(sentences), 100)}% of sentences")
    if paragraph_lengths:
        ordered = sorted(paragraph_lengths)
        print(f"Median paragraph length: {ordered[len(ordered) // 2]} words")
    print(f"First person: {rate(sum(word in FIRST for word in words), len(words))} per 1,000 words")
    print(f"Second person: {rate(sum(word in SECOND for word in words), len(words))} per 1,000 words")
    print(f"Semicolons: {rate(text.count(';'), len(words))} per 1,000 words")
    print(f"Em dashes: {rate(text.count('—'), len(words))} per 1,000 words")

    found = [phrase for phrase in CLICHES if phrase in text.casefold()]
    if found:
        print("Generic phrases to inspect:")
        for phrase in found:
            print(f"- {phrase}")
    else:
        print("Generic phrase check: none found")

    print("Manual checks:")
    print("- Does the opening give the reader a scene, claim, comparison, or real question?")
    print("- Is the reasoning visible from observation to consequence?")
    print("- Do analogies explain a mechanism?")
    print("- Does the ending land on a challenge, consequence, hope, or image?")
    print("- Are all first-person experiences and beliefs true and supplied?")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
