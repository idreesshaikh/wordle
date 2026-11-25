---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# index.html

## Surface

Single-page daily word game. Mode: **Operate**. Audience: a casual player taking a five-minute daily break. Task: make six five-letter guesses, read the board, then share a result or open stats. Required content: board, keyboard, date/puzzle number, result slip, stats, help, settings. Constraints: independent implementation; no NYT source, assets, screenshots, or proprietary word list; static and local-first; user pinned a quiet, familiar Wordle-like UI.

## Direction contract

**THESIS** A puzzle page torn from a well-made daily paper: the grid is the hero, held by a dateline and print-registration marks, never a dashboard.

**OWN-WORLD** Chalk-white paper with a faint dot field; ink-black rules; deep green, ochre, and slate state tiles; Archivo grotesque; 2px tile borders, keycap depth, 6px radius; crop-mark frame.

**STORY** Rules read at a glance; six fair guesses; one clean result slip; a spoiler-free share; a reason to return tomorrow.

**FIRST VIEWPORT** Full-height centered column. Crop-marked page; wordmark, Daily/Practice switch, and icon rail in the header; dateline over a six-by-five board at the visual center; keyboard docked at the bottom; result slip rises after the last guess.

**FORM** Inherited Wordle board and keyboard, precisely specified clone. Seed: n/a — no concept roll.

**FINISH** Unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Interaction

Tile-flip reveal after a guess; a compact row shake for an invalid word; the result slip slides up from the keyboard edge. Motion collapses under reduced motion.
