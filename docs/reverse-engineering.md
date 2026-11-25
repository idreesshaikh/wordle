# Reverse-engineering notes

This document records the observable behavior used to build the clone. It is
deliberately about mechanics and accessibility language, not copied code or
assets.

## Scope and method

On **November 24, 2026**, a live session of NYT Wordle was captured at
`https://www.nytimes.com/games/wordle/index.html` using the REA browser
scenario provider in launch mode with headless Chromium 158. The scenario:

1. dismissed the ad-consent prompt;
2. selected **Play**;
3. waited for the game shell and help dialog;
4. closed help;
5. entered `CRANE` with the physical keyboard;
6. pressed Enter;
7. captured the board, keyboard, and accessibility tree after the reveal.

The live page displayed **No. 1984**. That number, the live answer, and all NYT
copy/data are not used by the clone. The clone numbers its puzzles from its own
epoch and ships its own curated answer list.

REA's CDP connect mode returned `execution_failure` during setup, so all browser
observation used provider-owned launch mode. Static bundle inspection was used
only for provenance checks; no NYT JavaScript was copied into this project.

## Observed structure

- Six guess rows of five tiles, plus an on-screen QWERTY keyboard.
- Daily puzzle metadata: a full date and a puzzle number.
- Help opens before play on a fresh visit.
- Help summarizes the loop as: guess a five-letter word in six tries; guesses
  must be valid five-letter words; tile colors show how close the guess was.
- Help contains three example rows using the observed words `WORDY`, `LIGHT`,
  and `ROGUE` to demonstrate correct, present, and absent states.
- A daily reset at midnight is stated in help.
- The live page also presented account/login and subscription prompts. Those
  are commercial surface, not game mechanics, and are intentionally absent from
  the clone.

## Observed accessibility language

The live game exposes useful text that a visual clone would miss. Representative
captured labels are reproduced here as behavioral evidence:

| Element | Observed label |
| --- | --- |
| Empty tile | `1st letter, empty` |
| Typed tile | `1st letter, C` |
| Correct tile | `1st letter, C, correct` |
| Present tile | `2nd letter, R, present in another position` |
| Absent tile | `3rd letter, A, absent` |
| Unused key | `add q` |
| Present key | `r present` |
| Absent key | `a absent` |
| Empty keyboard action | `enter` / `backspace` |

Rows were grouped as `Row 1` through `Row 6`. The keyboard was exposed as a
group with buttons for each letter plus Enter and Backspace. Empty-state Enter
and Backspace were disabled. The clone follows this language so screen-reader
users hear row, position, letter, and state rather than only color.

## Observed `CRANE` result

After submitting `CRANE`, the live board reported:

- C — absent
- R — present in another position
- A — absent
- N — present in another position
- E — present in another position

The matching keyboard keys changed to `c absent`, `r present`, `a absent`,
`n present`, and `e present`. This observation is the source of the clone's help
example. It is not a claim about the live answer.

## Observed browser storage names

REA's storage-key inspection (values redacted) observed these NYT key names:

- `wordle-has-played`
- `wordle-help-dismissed`
- `nyt-wordle-darkmode`

The clone does not reuse these keys. It uses namespaced
`wordle-clone:*:v1` keys for its own daily game, practice game, stats, settings,
mode, and help-seen state.

## What was not observed

The single session did not capture:

- the daily result/share dialog;
- the statistics screen after a completed daily puzzle;
- exhaustive duplicate-letter edge cases;
- every invalid-word/error message;
- behavior after local midnight;
- the full settings surface.

The clone implements these areas from the public rules plus its own product
decisions, and covers them with unit and browser tests. Duplicate-letter
feedback uses a two-pass scoring rule: exact matches are claimed first, then
remaining answer letters are matched left-to-right. This is a deliberate,
tested implementation choice, not a claim that every live edge case was probed.

## How the clone differs

- **Own data:** 741 curated answers and 15,880 allowed guesses from a
  public-domain list. No NYT answer or guess list.
- **Own numbering:** epoch `2026-01-01`, puzzle No. 1.
- **Own surface:** custom type, color system, print-inspired frame, dateline,
  receipt-style result, and copy. No NYT screenshots, images, or typefaces.
- **Local-only:** no accounts, ads, remote stats, backend, or runtime network
  requests.
- **Practice mode:** unlimited random rounds that never touch daily stats.
- **Settings:** system/light/dark theme, blue/orange high-contrast option, and a
  reduced-motion option in addition to `prefers-reduced-motion`.
- **No hard mode:** deliberately out of scope for this version.

## Evidence and reproducibility

- Product truth and constraints: `PRODUCT.md`.
- Behavioral mirrors: `test/game.test.js` asserts the observed tile and key
  label forms plus a full `CRANE` announcement; Help reuses the observed
  `CRANE` states as its worked example.
- Browser QA was performed separately against the clone with Chrome 158 and
  Playwright, covering portrait, landscape, short-height, dialog, focus,
  persistence, practice, loss, and sharing flows.
- Raw REA captures were written under `/tmp` during development and are not
  distributed. They are observations of a third-party site, not inputs to the
  application.

## Limitations

This is one session on one date and is not a specification. The live product may
change, vary by experiment, or differ by region/account. Anything not listed
above should be treated as unverified rather than inferred from the NYT bundle.
