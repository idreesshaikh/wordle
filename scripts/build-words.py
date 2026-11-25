#!/usr/bin/env python3
"""Rebuild js/words.js from the curated answers and the public word source.

The curated answer order is the project's own. This script preserves that
order and only rebuilds the allowed-guess set. It does not download or use an
NYT word list.
"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_ANSWERS = ROOT / "js" / "words.js"
DEFAULT_OUTPUT = ROOT / "js" / "words.js"
DEFAULT_BLOCKLIST = ROOT / "scripts" / "blocklist.txt"
DEFAULT_SOURCE_URL = (
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
)


def read_answers(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"export const ANSWERS = \[(.*?)\n\];", text, re.DOTALL)
    if not match:
        raise ValueError(f"Could not find the ANSWERS array in {path}")
    answers = re.findall(r'"([a-z]{5})"', match.group(1))
    if not answers:
        raise ValueError(f"No answers found in {path}")
    if len(answers) != len(set(answers)):
        raise ValueError("The curated answer list contains duplicates")
    return answers


def read_blocklist(path: Path) -> set[str]:
    words: set[str] = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        word = raw_line.split("#", 1)[0].strip().lower()
        if not word:
            continue
        if len(word) != 5 or not word.isalpha() or not word.isascii():
            raise ValueError(f"Blocklist entry must be a five-letter ASCII word: {word!r}")
        words.add(word)
    return words


def read_source(path: Path | None, url: str) -> set[str]:
    if path:
        text = path.read_text(encoding="utf-8")
        origin = str(path)
    else:
        print(f"Downloading {url} ...")
        request = urllib.request.Request(
            url, headers={"User-Agent": "wordle-clone-word-builder/1.0"}
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            text = response.read().decode("utf-8")
        origin = url

    words = {
        line.strip().lower()
        for line in text.splitlines()
        if len(line.strip()) == 5
        and line.strip().isalpha()
        and line.strip().isascii()
    }
    if not words:
        raise ValueError(f"No five-letter words found in {origin}")
    return words


def format_words(words: list[str], per_line: int = 8) -> str:
    lines = []
    for index in range(0, len(words), per_line):
        chunk = ", ".join(f'"{word}"' for word in words[index : index + per_line])
        lines.append(f"  {chunk},")
    return "\n".join(lines)


def render(answers: list[str], allowed: list[str]) -> str:
    header = f"""// Word data for the Wordle clone.
//
// ANSWERS: {len(answers)} curated common five-letter English words. The order
// is this project's own and is preserved by scripts/build-words.py.
//
// ALLOWED_GUESSES: {len(allowed)} five-letter words from dwyl/english-words
// (https://github.com/dwyl/english-words, Unlicense), plus every answer, minus
// the small slur/explicit-word list in scripts/blocklist.txt.
//
// Frequency reference for the curated selection: first20hours/google-10000-english
// (Google Web Trillion Word Corpus; personal/research use per its notice).
// That list is a reference only; it is not shipped wholesale and no NYT answer
// or guess list is used.
//
// Regenerate with: npm run words
"""
    return (
        header
        + "\n"
        + "export const ANSWERS = [\n"
        + format_words(answers)
        + "\n];\n\n"
        + "export const ANSWER_SET = new Set(ANSWERS);\n\n"
        + "export const ALLOWED_GUESSES = new Set([\n"
        + format_words(allowed)
        + "\n]);\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--answers",
        type=Path,
        default=DEFAULT_ANSWERS,
        help="File containing the curated ANSWERS array (default: js/words.js)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Output module path (default: js/words.js)",
    )
    parser.add_argument(
        "--source",
        type=Path,
        help="Local five-letter word source, one word per line (default: download)",
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_SOURCE_URL,
        help="Word source URL used when --source is not provided",
    )
    parser.add_argument(
        "--blocklist",
        type=Path,
        default=DEFAULT_BLOCKLIST,
        help="File of words to exclude (default: scripts/blocklist.txt)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify that the output is current instead of writing it",
    )
    args = parser.parse_args()

    answers = read_answers(args.answers)
    blocklist = read_blocklist(args.blocklist)
    source_words = read_source(args.source, args.url)

    blocked_answers = sorted(set(answers) & blocklist)
    if blocked_answers:
        raise ValueError(f"Curated answers are blocked: {', '.join(blocked_answers)}")

    missing = sorted(set(answers) - source_words)
    if missing:
        print(
            "Warning: answers missing from the public source will still be allowed: "
            + ", ".join(missing),
            file=sys.stderr,
        )

    allowed = sorted((source_words | set(answers)) - blocklist)
    rendered = render(answers, allowed)

    if args.check:
        current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
        if current != rendered:
            print(
                f"{args.output} is out of date; run `npm run words` to rebuild it.",
                file=sys.stderr,
            )
            return 1
        print(f"{args.output} is up to date ({len(answers)} answers, {len(allowed)} guesses).")
        return 0

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(rendered, encoding="utf-8")
    print(f"Wrote {args.output} ({len(answers)} answers, {len(allowed)} guesses).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
