# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JavaScript. No build step; served by any local static file server. Browser-native ES modules and `node --test` for pure game-logic tests.

## Users

Casual word-game players who want a short, repeatable daily puzzle in the browser. They play on desktop or phone, usually for five minutes in the morning or during a break, and return the next day for a fresh word. The project owner is also using the build to learn how a production puzzle game is structured.

## Product Purpose

An independent Wordle clone: one five-letter word per day, six guesses, immediate color feedback, a practice mode for extra rounds, persistent stats, and a spoiler-free result players can share. Success means the rules are understandable without a tutorial, every guess feels fair, and the next day's visit has a reason.

## Positioning

The mechanics were reconstructed from the public behavior of the live NYT Wordle using the REA browser-inspection toolkit. The implementation, interface code, and word data are independent: no NYT source, source maps, assets, screenshots, or proprietary answer/guess lists are used. Everything runs locally with no account and no backend.

## Operating Context

Players open a single page in a modern browser. The daily puzzle is selected deterministically from the local calendar date, so it is the same all day and changes at local midnight. Practice mode is available at any time and does not affect the daily streak. Game state, theme, and settings persist in `localStorage`. The app can be opened from any static server; no deployment target is required.

## Capabilities and Constraints

- Six guesses for a five-letter hidden word; green = correct place, yellow = present elsewhere, gray = absent.
- Correct handling of repeated letters in both the guess and the answer.
- Physical keyboard and on-screen keyboard input, with per-letter keyboard state.
- Daily puzzle with date and puzzle number; practice mode with a random word and a "new word" action.
- Win/loss result, spoiler-free share grid, daily stats (played, win rate, current/max streak, guess distribution), and a countdown to the next daily puzzle.
- Help, settings, dark theme, and a colorblind-friendly high-contrast palette.
- Local-only storage. No accounts, leaderboards, ads, network requests at runtime, or backend.
- Hard mode is explicitly out of scope for this version.
- Word list provenance must stay documented; the answer list is curated and the allowed-guess list is public-domain.
- The game is client-side; the answer is necessarily present in the browser data for daily selection and resume.

## Brand Commitments

Working title: **Wordle**. Quiet, plain, and familiar, with a little dry wit in status copy. The interface is an independent homage, not an official product; "Not affiliated with The New York Times" must remain visible in Help and the footer. No NYT logos, typefaces, screenshots, or copied interface assets.

## Evidence on Hand

- `docs/reverse-engineering.md` records the observed mechanics from a live session on November 24, 2026: six rows, tile accessibility labels, keyboard states, rules, storage keys, and a CRANE result (C absent; R, N, E present elsewhere; A absent). The live page showed puzzle No. 1984; this clone uses its own numbering.
- `js/words.js` carries the curated answer list and the public-domain allowed-guess list, with source and license notes in `README.md` and the file header.
- No real user accounts, testimonials, benchmarks, or commercial claims exist; do not fabricate them.

## Product Principles

1. **The grid is the product.** Every pixel around it exists to help the player read the board, not to sell, explain, or decorate.
2. **Fair feedback beats surprise.** The same guess must always produce the same marks, including duplicate letters; the keyboard must never disagree with the board.
3. **One daily ritual, no dark patterns.** No forced sign-in, no ads, no artificial scarcity, no streak guilt.
4. **Accessible by construction.** Keyboard, screen reader, reduced motion, contrast, and colorblind support are part of the game, not a later patch.
5. **Local-first and legible.** State lives in the browser, the code is inspectable, and word-list provenance is stated in plain language.

## Accessibility & Inclusion

Target WCAG 2.2 AA. All tiles and keys expose their row, position, letter, and state to assistive technology. The board is readable without color; a high-contrast blue/orange palette is available. Every action works from a physical keyboard, focus is visible, dialogs trap and restore focus, status changes are announced in a polite live region, and all motion collapses under `prefers-reduced-motion`. Touch targets are at least 44px where the viewport allows.
