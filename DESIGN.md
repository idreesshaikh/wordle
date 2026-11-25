---
name: Wordle
description: "An independent daily five-letter puzzle set like a page from a well-made daily paper."
colors:
  paper: "#f2f3ee"
  surface: "#fbfbf7"
  surface-raised: "#ffffff"
  surface-muted: "#e7e9e2"
  ink: "#161815"
  ink-soft: "#596159"
  ink-faint: "#686f67"
  rule: "#c8ccc3"
  rule-strong: "#7e867d"
  accent: "#3f7d4e"
  accent-edge: "#2f633c"
  present: "#b8862f"
  present-edge: "#8d6620"
  absent: "#666d66"
  absent-edge: "#4e544e"
  key-bg: "#dfe2db"
  key-edge: "#b7bcb3"
  focus: "#2f6f9f"
  danger: "#9d3d2f"
typography:
  brand:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 780
    lineHeight: 1
    letterSpacing: "0.055em"
  display:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 780
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 620
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "9.5px"
    fontWeight: 620
    lineHeight: 1.2
    letterSpacing: "0.13em"
  action:
    fontFamily: "Archivo, Avenir Next, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 680
    lineHeight: 1.2
    letterSpacing: "0.015em"
rounded:
  mark: "2px"
  mini: "4px"
  control: "6px"
  icon: "7px"
  switch: "8px"
  panel: "9px"
  modal: "13px"
spacing:
  hairline: "1px"
  tight: "4px"
  tile-gap: "7px"
  control-gap: "8px"
  section: "14px"
  modal-padding: "23px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  icon-button:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink}"
    rounded: "{rounded.icon}"
    size: "44px"
  mode-switch:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.switch}"
    width: "188px"
    height: "44px"
  tile-empty:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "1fr"
  key-default:
    backgroundColor: "{colors.key-bg}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    height: "44px"
  modal-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.modal}"
    padding: "23px"
    width: "min(92vw, 460px)"
  receipt-cell:
    backgroundColor: "{colors.absent}"
    rounded: "{rounded.mark}"
    size: "18px"
---

# Design System: Wordle

## Overview

**Creative North Star: "A puzzle page torn from a well-made daily paper"**

Wordle is presented as a single printed page, not an app dashboard. The board is the front-page story; the dateline, rules, registration frame, and keycap keyboard behave like the printer's furniture around it. The interface is deliberately quiet because the six guesses are the content. Familiar Wordle mechanics meet an editorial surface: chalk-white paper with a faint dot field, ink-black rules, and a small, meaningful color vocabulary.

The system is light by default and has a complete dark remap; both keep the same semantic roles rather than swapping in a different brand. A high-contrast setting replaces the green/ochre success pair with blue/orange while preserving the same tile geometry and text/state labels. The page should remain legible as a black-and-white printout: shape, border, and copy carry meaning before color does.

**Key Characteristics:**
- The six-by-five grid is the focal point; chrome stays secondary.
- Print grammar: crop marks, hairlines, dotted paper, uppercase metadata, perforated receipt.
- One material gesture: a keycap edge, not a generic shadow system.
- Restrained motion: clears, flips, a short shake, and a result slip that rises.
- Independent surface: no NYT logos, screenshots, typefaces, or interface assets.

**Asset provenance.** Archivo is self-hosted from Omnibus-Type under the SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). The favicon and interface icons are original inline SVG drawn for this project. There are no shipping raster assets; the paper dot field is CSS. No NYT visual assets are used.

## Colors

A green-tinged chalk paper field, near-black ink, and three functional tile colors; color is a game signal, never decoration.

### Primary
- **Field Green** (`#3f7d4e`): the correct-position tile, the checked switch, the current-day distribution bar, and one square of the brand mark. Its edge tone is used only for the keycap depth beneath a green key.

### Secondary
- **Ochre** (`#b8862f`): the present-elsewhere tile and one square of the brand mark. It reads as warm ink on paper rather than a warning yellow.

### Tertiary
- **Slate** (`#666d66`): the absent tile, deliberately softer than the ink so a completed board still reads as a grid rather than a wall of black.

### Neutral
- **Chalk Paper** (`#f2f3ee`): the page field and the color behind the paper dot pattern.
- **Proof Surface** (`#fbfbf7`): empty tiles, modal cards, and the result slip.
- **Raised Proof** (`#ffffff`): reserved for small controls that need to lift off the paper.
- **Newsprint Shadow** (`#e7e9e2`): mode-switch trough, setting groups, keyboard key default, and inactive density.
- **Press Black** (`#161815`): primary text, primary buttons, mode-switch thumb, and the brand wordmark.
- **News Ink** (`#596159`): prose and secondary labels.
- **Faint Marginalia** (`#686f67`): timestamps, helper copy, and legal text that must remain readable but quiet.
- **Ruled Line** (`#c8ccc3`) / **Dark Rule** (`#7e867d`): hairlines, control borders, and the stronger frame around raised surfaces.
- **Proof Blue** (`#2f6f9f`): the only focus-ring color; visible on both paper and ink surfaces.
- **Correction Red** (`#9d3d2f`): clipboard/error feedback only, never a tile state.

Dark mode remaps the neutral field to near-black and lifts the ink to warm white; high contrast remaps correct/present to blue/orange and moves the focus ring to burnt orange. Those values are theme implementations of the same semantic tokens, not new roles.

**The Signal-Only Color Rule.** Green, ochre, and slate appear only where they describe game state, the selected mode, or the brand's four-tile mark. Never use them as ambient section tints, decorative bars, or "success" decoration around ordinary copy.

**The No-Color-Only Rule.** Every state also carries a border, position, label, or accessible text. A player who cannot distinguish the three fills must still be able to play.

## Typography

**Display Font:** Archivo (with Avenir Next, Segoe UI, system-ui, sans-serif)
**Body Font:** Archivo (same stack)
**Label Font:** Archivo, set in uppercase with tracked-out spacing

**Character:** One grotesque, used in two registers: compact, tightly tracked display type for results and dialog titles; plain, generously led body copy for rules. There is no decorative second face. The type feels like a well-set newspaper utility page, not a tech product.

### Hierarchy
- **Brand** (780, 19px, 1.0, +0.055em, uppercase): the wordmark; compact and letter-spaced so it reads as a masthead.
- **Display** (780, 26px, 1.08, -0.035em): dialog and result headings. Tight tracking is reserved for these short, large lines.
- **Headline** (620, 18px, 1.35, -0.015em): the lead sentence in Help and the result answer line.
- **Body** (400, 16px, 1.5): the page baseline; Help prose sits at 13.5px with 1.6 line-height to keep long instructions comfortable.
- **Label** (620, 9.5px, +0.13em, uppercase): dateline, puzzle number, modal sublabel, footer, and small state labels.
- **Action** (680, 12.5px, +0.015em): buttons, keys, and compact controls.

Board letters use the same Archivo at 0.96em and 720 weight, uppercase. Stat values use tabular numerals and tight negative tracking; metadata uses tabular numerals where timing is involved.

**The Two-Register Rule.** Sentence-case, normal tracking for reading; uppercase, tracked-out type for chrome. If a line is uppercase and larger than 11px, it needs a reason beyond styling.

**The Tile-Face Rule.** The board is the only place where large letters are centered in cells. Do not turn headings into tile-like blocks or use game colors behind type.

## Layout

The shell is a full-height flex column inside a fixed 14px page frame (10px on small phones) with registration marks at 8px. On desktop, a three-column header holds the masthead left, a centered 188px Daily/Practice switch, and a right-aligned 44px icon rail. A hairline separates the header from the game.

The play column is centered. A dateline row sits exactly above the board at the board's width, with date at the left edge and puzzle number at the right. The board is a square five-column grid with 7px gaps; its width is `min(350px, 86vw, 50svh)`, stepping down to 320px, 300px, and 240px at the 820px, 740px, and 620px height breakpoints. The keyboard is capped at 520px and pushed toward the bottom with `margin-top: auto`; rows use 6px gaps and keys use a 44–52px height. The footer is a single hairline-separated row of 8.5–10px text.

On phones at 720px and below, the mode switch wraps to its own centered row beneath the masthead and icon rail. At 430px and below, padding tightens, the board uses the compact height formula, and result actions stack. Short viewports at 740px and 620px remove the keyboard note and compress vertical padding rather than shrinking text below legibility.

Landscape phones (orientation landscape, max-height 560px) switch to a two-column composition: board and dateline on the left, keyboard on the right, with the header on one row. The board becomes `min(230px, 56svh, 30vw)` and the keyboard note and secondary footer text are removed. The footer remains visible at the bottom.

Dialogs are centered with a 460px maximum card width (410px for the result), 23px internal padding, and a maximum height of `min(88svh, 760px)`. Long Help content scrolls inside the card; the card itself never exceeds the viewport. The result card uses a perforated receipt silhouette inside the same rounded dialog shell.

Spacing is tight inside groups and loose between them: 4px within icon rows and result cells, 6–8px between keys and controls, 14px around modal sections, and 23px at the modal edge. Vertical rhythm is controlled by `svh` clamps so the board and keyboard can share one screen without overflow.

## Elevation & Depth

The page is flat. Depth is conveyed by ruled lines, tonal paper shifts, 1px frames, and the physical keycap edge, not by a stack of floating cards. Empty tiles sit on the paper, not above it.

### Shadow Vocabulary
- **Modal lift** (`0 22px 60px rgba(16,20,16,0.16), 0 3px 10px rgba(16,20,16,0.08)`): dialog and result cards only.
- **Toast lift** (`0 12px 30px rgba(16,20,16,0.2)`): transient status message.
- **Keycap edge** (`0 2px 0 var(--key-edge)`): each keyboard key's bottom edge; it collapses on press. This is a physical key affordance, not a decorative offset shadow.
- **Switch thumb** (`0 1px 2px rgba(16,20,16,0.16)`): only the moving mode-switch thumb.

The backdrop is a flat ink veil, never blur or glass. Dark mode deepens the modal shadow so cards still separate from the near-black page.

**The Flat-Page Rule.** Surfaces are flat at rest. If an element is not a dialog, a toast, a keycap, or the moving switch thumb, it does not get a shadow.

## Shapes

The form language is printed matter: square-ish tiles with gently eased corners, hairline rules, dashed perforations, and a rectangular page frame. Tiles use 6px radii and 2px borders; keys use 6px radii; icons sit in 7px-radius hit areas; the mode switch uses 8px; example panels use 9px; dialogs use 13px. Only the 46×28px switch is fully pill-shaped.

The result slip uses dashed perforation lines that run to the card's inner edges, a centered grid of 18px result cells, and uppercase receipt metadata. Crop marks are four L-shaped corners, not a full ornamental border. The dotted paper field is a 20px radial-dot grid with a faint fade near the top; it is texture, not a gradient wash.

**The Print-Not-Product Rule.** Corners stay small and purposeful. Do not round the board, keyboard, or page into pill shapes, and do not replace hairlines with thick dividers or cards.

## Components

### Buttons
- **Shape:** compact 6px radius, 44px minimum height, 16px horizontal padding; icons 17px with an 8px gap.
- **Primary:** Press Black fill, Chalk Paper text, 1px Press Black border. Used for Copy result, Done, and Let's play.
- **Secondary:** Proof Surface fill, Press Black text, 1px Dark Rule border. Used for Statistics and other reversible dialog actions.
- **Hover / Focus:** background shifts to Newsprint Shadow; active state moves down 1px; focus is a 2px Proof Blue outline at 3px offset. Text and icon never shift position on hover.

### Icon Buttons
- **Shape:** 44×44px, 7px radius, transparent at rest.
- **Treatment:** 20px authored line icons with 1.65px strokes and round joins. Hover fills with Newsprint Shadow; active moves down 1px. The accessible name lives on the button, not the SVG.

### Mode Switch
- **Shape:** 188px wide, 3px inner padding, 8px radius; two equal 38px-minimum buttons and a solid thumb.
- **Color:** Newsprint Shadow trough, Press Black thumb, Chalk Paper active label, News Ink inactive label.
- **Behavior:** the thumb slides 220ms with the editorial ease. Active state is also exposed as `aria-pressed`; the switch never relies on thumb position alone.
- **Compact:** 172px on phones, 160px in landscape, with a 34px minimum button height.

### Board and Tiles
- **Shape:** square cells, 6px radius, 2px borders, 7px gaps; the board is a five-column grid with each row as its own grid.
- **Empty:** Proof Surface fill, Slate border; filled but unrevealed tiles darken the border to near-ink.
- **Revealed:** green correct, ochre present, slate absent; the back face carries the state color and the letter in a contrasting ink.
- **Motion:** a 460ms perspective flip with an 88ms stagger; the active row shakes 340ms for invalid input; a win adds a 540ms pop. Reduced-motion mode removes all but an instant state change.
- **Type:** uppercase Archivo, 0.96em, 720 weight, centered.

### Keyboard
- **Shape:** rows of equal keys, 6px radii, 44–52px high (38px in the shortest portrait, 32–40px in landscape), 5–7px gaps, 520px maximum width.
- **Treatment:** Newsprint Shadow caps with a 2px keycap edge. Keys are uppercase, 13px/690, with wide Enter/Backspace keys at 10px/700.
- **States:** the key background changes to the same correct/present/absent fills as the board; disabled keys drop to 55% opacity and lose the keycap edge. Hover brightens a state fill rather than washing it out. Press collapses the edge and moves the cap down 2px.

### Dialogs and Receipt
- **Shape:** 460px card (410px result), 13px radius, 1px Dark Rule border, 23px padding, maximum `88svh`.
- **Surface:** Proof Surface with a soft modal lift; Help, Stats, and Settings use the same shell. The result card adds dashed perforations, uppercase receipt metadata, an 18px-cell share grid, a status note, and a two-column action row.
- **Behavior:** native `<dialog>` focus trapping and restoration; backdrop click closes; long content scrolls inside the card. Copy result confirms inline with a check icon and "Copied" copy; the word is never exposed in share text.

### Dateline, Stats, and Feedback
- **Dateline:** two uppercase 9.5px labels with tabular numerals, separated by space, under a hairline. Date truncates with an ellipsis before the puzzle number does.
- **Stats:** a four-column numeral row divided by 1px rules; 29px/760 values over 8.5px uppercase labels. Distribution bars are 18px tracks with a 2px radius; the current-day bar alone uses Field Green.
- **Toast:** Press Black capsule-free rectangle with 6px radius, 12.5px/620 paper-colored text, rising 7px into view. It is a status message, not a modal.

## Do's and Don'ts

### Do:
- **Do** keep the board as the largest, most contrasted object in the first viewport.
- **Do** use 2px tile borders, 6px tile radii, 7px gaps, and a visible rule above the keyboard.
- **Do** reserve green, ochre, and slate for game state; keep ordinary chrome ink, paper, and rule tones.
- **Do** set metadata in tracked uppercase at 9.5–11px and body copy in sentence case.
- **Do** use the keycap edge, the dashed receipt, and the crop-mark frame as the page's material signature.
- **Do** preserve 44px primary touch targets, visible focus, and reduced-motion parity.
- **Do** keep the "Not affiliated with The New York Times" statement visible in Help and the footer.

### Don't:
- **Don't** turn the page into a dashboard: no stat cards, chart panels, or hero-metric blocks outside the existing Stats dialog.
- **Don't** use gradients, glass, blur, or colored ambient sections; the dot field and flat ink veil are the only atmospheric treatments.
- **Don't** add drop shadows to tiles, keys, headers, or sections; only dialogs, toasts, keycaps, and the switch thumb lift.
- **Don't** use green or ochre as decorative success/notification colors, and never rely on color alone for game state.
- **Don't** use emoji, icon fonts, or a system display face as the brand voice.
- **Don't** use oversized pill radii, thick card borders, or hard offset decoration; the only pill is the 46×28px switch.
- **Don't** copy NYT logos, typefaces, screenshots, or interface assets into this surface.
