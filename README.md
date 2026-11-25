# Wordle clone

An independent, local-first take on the daily five-letter word puzzle. One word
per local calendar day, six guesses, practice rounds, persistent statistics, and
a spoiler-free result you can copy. No account, backend, ads, or runtime network
requests.

This project is not affiliated with The New York Times. It was built from
observed public game behavior, not from NYT source code or assets. See
[`docs/reverse-engineering.md`](docs/reverse-engineering.md) for the evidence
and design decisions.

## Run

No install or build step is required.

```sh
npm run serve
```

Then open <http://localhost:8080>. Any static file server works. The app uses
browser-native ES modules, so opening `index.html` directly from the filesystem
may be blocked by browser module rules.

## Test

```sh
npm test
```

The suite covers duplicate-letter scoring, keyboard state, date/puzzle
selection, statistics, share text, error copy, and accessibility labels.

## Word data

- `js/words.js` contains 741 curated answers in project-defined order and 15,880
  accepted guesses.
- Allowed guesses come from
  [`dwyl/english-words`](https://github.com/dwyl/english-words), which is
  released under the Unlicense (public domain), plus every curated answer,
  minus the terms in [`scripts/blocklist.txt`](scripts/blocklist.txt).
- The curated answer selection used
  [`first20hours/google-10000-english`](https://github.com/first20hours/google-10000-english)
  as a frequency reference only. That list is not shipped wholesale. Its
  notice describes the data as derived from the Google Web Trillion Word Corpus
  for personal/research use.
- No NYT answer list, guess list, source code, or interface assets are used.

Rebuild the allowed-guess set after editing the curated `ANSWERS` array:

```sh
npm run words
```

The build script downloads the public source by default. To build offline:

```sh
python3 scripts/build-words.py --source /path/to/words_alpha.txt
```

Verify the committed data is current:

```sh
npm run words:check
```

The script preserves the curated answer order and only regenerates the allowed
guess list; it does not curate or reorder answers for you.

## Project layout

- `index.html` — page shell, dialogs, keyboard/status landmarks.
- `css/styles.css` — tokens, board, keyboard, modal/result slip, themes,
  reduced-motion rules, and portrait/landscape responsive layouts.
- `js/game.js` — pure game, date, stats, and share logic.
- `js/app.js` — DOM rendering, keyboard input, dialogs, settings, localStorage,
  and browser-facing announcements.
- `js/words.js` — answers and allowed guesses; generated guess list.
- `test/game.test.js` — `node:test` coverage for pure logic.
- `scripts/build-words.py` — deterministic word-data builder.
- `scripts/blocklist.txt` — intentional exclusions from the allowed list.
- `assets/fonts/` — self-hosted Archivo variable font and its OFL license.
- `DESIGN.md` — visual system, responsive behavior, and asset provenance.
- `docs/reverse-engineering.md` — observed behavior and implementation limits.

## Behavior and limits

- Daily selection is deterministic from the local date. The project epoch is
  January 1, 2026; the clone's puzzle numbers are independent of NYT's.
- Daily and practice games, stats, mode, theme, contrast, motion preference, and
  help-seen state live in `localStorage`.
- The answer is necessarily present in the browser data so the game can work
  offline; this is a client-side puzzle, not a server-authoritative game.
- Clearing site data resets games and statistics.
- Practice rounds are unlimited and never change daily statistics.
- Hard mode is intentionally out of scope.
- Touch targets are at least 44px for primary controls where the viewport
  allows; compact mode and keyboard controls stay above the WCAG 2.2 24px
  minimum.

## Accessibility

Targets WCAG 2.2 AA. Tiles and keys expose row, position, letter, and state;
submitted guesses and game outcomes are announced politely. Dialogs use native
`<dialog>`, focus is trapped by the platform, and focus returns to the opener.
The board is readable without color, and a blue/orange high-contrast setting is
available. Motion collapses under `prefers-reduced-motion` or the in-app motion
setting.

## Credits

- Archivo by Omnibus-Type, licensed under the SIL Open Font License 1.1. See
  `assets/fonts/OFL.txt`.
- English word list from `dwyl/english-words`, released under the Unlicense.
- Google 10k frequency list used as a reference only, as noted above.
- Game mechanics studied from public behavior with the REA browser-inspection
  toolkit; implementation and interface are original.

No license is asserted here for the Wordle name or NYT trademarks. This is an
independent fan-style implementation.
