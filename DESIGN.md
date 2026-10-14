---
name: Clearline
description: Free SAT prep drawn as a hand-made park guide map. You are the pin, the next step is the yellow path.
colors:
  sun: "#f5e211"
  coral: "#ff705d"
  sky: "#2ba0ff"
  lilac: "#ebc1ff"
  land: "#8ed462"
  swipe: "#5db33a"
  pen: "#1d3fbf"
  water: "#f5f1e4"
  card: "#fffcf2"
  card-2: "#ede7d3"
  hover: "#ebe4cd"
  ink: "#2c2e2a"
  ink-soft: "#5c5e55"
  line: "#d9d1b8"
  line-strong: "#a9a189"
  accent-text: "#0b62b3"
  accent-soft: "#d9edff"
  green-fill: "#2f7f22"
  green: "#2a6e1c"
  green-wash: "#e3f4d6"
  red-fill: "#d23b2f"
  red: "#b3261e"
  red-wash: "#fde7e2"
  amber-fill: "#f5a524"
  amber: "#8a5a00"
  dark-water: "#14161b"
  dark-card: "#1c1f25"
  dark-card-2: "#272b33"
  dark-hover: "#2b3038"
  dark-ink: "#ebe8e0"
  dark-ink-soft: "#a6a8ae"
  dark-line: "#3a3f48"
  dark-line-strong: "#6a707d"
  dark-edge: "#6a7080"
  dark-on-color: "#191b20"
  dark-sun: "#e8d55a"
  dark-coral: "#ef8778"
  dark-sky: "#6cb4ef"
  dark-lilac: "#c9aeea"
  dark-land: "#26392b"
  dark-swipe: "#4a7f3f"
  dark-mark: "#5ba84b"
  dark-pen: "#a9c0f7"
  dark-accent-soft: "#1b2b3e"
  dark-accent-text: "#8ec8f7"
  dark-green-fill: "#5ba84b"
  dark-green: "#8ccf7c"
  dark-green-wash: "#1b2a1f"
  dark-red-fill: "#e0685a"
  dark-red: "#ff9b8e"
  dark-red-wash: "#331f1d"
  dark-amber-fill: "#e3a94a"
  dark-amber: "#f0c060"
typography:
  display:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(44px, 5.4vw, 72px)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "14.5px"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.5
  reading:
    fontFamily: "Source Serif 4, Georgia, Times New Roman, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  map-lettering:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    letterSpacing: "0.06em"
  hand:
    fontFamily: "Caveat, Comic Sans MS, cursive"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1
  pen:
    fontFamily: "Caveat, Comic Sans MS, cursive"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  pen-plain:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.5
  trail-label:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
  clock:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
  small:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
  keys:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 500
    lineHeight: 1.65
rounded:
  pill: "999px"
  sheet: "18px"
  list: "16px"
  walk: "14px"
  field: "12px"
  inset: "10px"
  small: "8px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "22px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
    typography: "{typography.body}"
  button-next-step:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 22px"
  button-ghost:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.hover}"
  capsule-reading-writing:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 20px"
  capsule-math:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 20px"
  capsule-tool:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 6px 6px 20px"
  tag:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  nav-item-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
  sheet:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "20px 22px"
  answer-choice:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "11px 14px 11px 11px"
    typography: "{typography.reading}"
  answer-choice-selected:
    backgroundColor: "{colors.accent-soft}"
  answer-choice-right:
    backgroundColor: "{colors.green-wash}"
  answer-choice-wrong:
    backgroundColor: "{colors.red-wash}"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inset}"
    padding: "8px 11px"
  walkthrough:
    backgroundColor: "{colors.card}"
    textColor: "{colors.pen}"
    rounded: "{rounded.walk}"
    padding: "14px 18px 16px"
    typography: "{typography.pen}"
  pen-note:
    textColor: "{colors.pen}"
    typography: "{typography.pen}"
  miss-tag-pressed:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "5px 11px"
  miss-bar:
    backgroundColor: "{colors.coral}"
    rounded: "{rounded.pill}"
    height: "14px"
  rush-clock:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 14px"
    typography: "{typography.clock}"
  rushbar:
    backgroundColor: "{colors.card-2}"
    textColor: "{colors.ink}"
    padding: "12px 18px"
  trail-stop-done:
    backgroundColor: "{colors.sun}"
    rounded: "{rounded.pill}"
    size: "16px"
  trail-stop-now:
    backgroundColor: "{colors.coral}"
    rounded: "{rounded.pill}"
    size: "16px"
  trail-stop-ahead:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.pill}"
    size: "16px"
  skill-row:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.walk}"
    padding: "10px 12px"
  skill-stop-new:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "32px"
  skill-stop-practicing:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "32px"
  skill-stop-mastered:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "32px"
  skill-button:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
    typography: "{typography.small}"
  skill-button-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.water}"
  best-badge:
    backgroundColor: "{colors.lilac}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "1px 9px"
  keybox:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.walk}"
    padding: "14px 16px"
    typography: "{typography.keys}"
  desmos-way:
    textColor: "{colors.ink}"
    rounded: "{rounded.walk}"
    padding: "14px 18px"
  lesson-calc:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.sheet}"
    padding: "10px"
---

# Design System: Clearline

## Overview

**Creative North Star: "The Park Guide Map"**

Studying is a walk around a hand-drawn park map. The ground is cream water, subjects are flat colored regions, everything is outlined in a 2px ink pen line, and the student is a coral pin with a dotted yellow trail leading to the one next step. The shell (Home, navigation, rewards) is loud, flat and printed-looking: saturated fills, chunky Archivo, pill-shaped capsules with a round ink arrow chip. It rejects the category default of a grey SaaS dashboard with white cards and a violet accent.

Question and test screens set the land lobe and pin aside but keep the same paper, ink and voice. They switch reading text to Source Serif 4, step the outline down to hairlines, and keep the SAT layout (passage beside question, Bluebook-style header, timer, navigator grid) unchanged. They stay friendly: a flat four-stop trail shows where a mock test is, a coral or blue stripe under the test header names the section, and a tutor's blue pen marks wrong picks, circles walkthrough steps and leaves short notes between questions. The fun comes from voice, color, pen and feedback. Nothing changes how a question is asked or timed.

Density is relaxed on the shell (generous gutters, one big heading, one action) and tighter in practice and test views, where the work happens.

**Key Characteristics:**
- Cream water ground, green land lobes, 2px ink outlines.
- Region color coding: yellow next step, coral Reading and Writing, blue Math, lilac tools.
- Capsule buttons with a round ink arrow chip that slides forward on hover.
- Archivo for the shell; Source Serif 4 for question and passage text.
- One marker swipe per region; the Caveat hand is a tutor's blue pen that annotates practice, review and between-module screens, always switchable to typed text.
- Flat fills with a single soft lift shadow; no gradients.

## Colors

A flat, saturated map palette on warm cream paper, with ink lines doing the structural work.

### Primary
- **Trail Yellow** (sun): the next step and only the next step. It fills the primary call to action (the diagnostic capsule, "Start" on today's plan), the dotted trail, the progress meter fill, the map-key "Next step" swatch and text selection. On the test trail it fills the stops already passed, and on a Question Rush round it fills the clock, the only yellow on that view. On the Desmos skills checklist it fills mastered skill stops, the same "passed" meaning as the trail.

### Secondary
- **Coral Region** (coral): Reading and Writing. Also fills the "you are here" pin, the Flashcards capsule (vocabulary sits with R&W), the nav count badge, the Reading and Writing section stripe, the current stop on the test trail, a pressed miss-reason tag and the miss-pattern bars on Review.
- **Lake Blue** (sky): Math, including the Math section stripe under the test header. In the build the same blue is also `--accent`, which drives answer selection, answered-question cells, the activity heatmap and chart lines on every screen (see Do's and Don'ts).

### Tertiary
- **Lilac Kiosk** (lilac): tools and side paths (Question bank capsule, Ask Gem tag, the map-key "Tools" swatch). Desmos is a tool, so its subject takes lilac: the "Best trick" badge, the practicing skill stop and "The Desmos way" panel, which uses a 1.5px lilac border over a lilac tint (`color-mix(in srgb, lilac 18%, card)`).
- **Land Green** (land): the landmass lobe behind first-run Home and the brand mark disc. Never a button fill.
- **Marker Green** (swipe): the highlighter swipe behind one word per region ("score").
- **Pen Blue** (pen): the tutor's pen and nothing else: Caveat notes, walkthrough steps, hand-drawn rings, scratches and underlines, the wavy clue underline and pen hint links.

### Neutral
- **Water Cream** (water): page ground, sidebar and topbar.
- **Paper** (card): sheets, cards, answer choices, inputs, ghost buttons.
- **Shaded Paper** (card-2): question headers, chips, inset boxes, calculator keys.
- **Hover Paper** (hover): hover fill for nav, list rows, ghost buttons and choices.
- **Ink** (ink): all text, all 2px outlines, the dark capsule and the arrow chip. Doubles as `--black`; the system has no true black.
- **Soft Ink** (ink-soft): secondary text, captions, footers.
- **Hairline** (line) and **Strong Hairline** (line-strong): 1px dividers, test-screen borders, inputs.

### Feedback
- **Right** (green-fill / green / green-wash), **Wrong** (red-fill / red / red-wash), **Flagged** (amber-fill / amber): only for answer verdicts, the timer warning, flags and the review list. **Selection Blue** (accent-soft / accent-text) tints selected choices and checked filters.

### Dark Mode
Night at the park, not an inverted map (`prefers-color-scheme: dark` unless `data-theme="light"`, or `data-theme="dark"`). Rebuilt on 2026-10-14; before/after screenshots are in `research/screenshots/dark-mode/`.
- **Ground and surfaces:** cool neutral charcoal, never pure black, in three steps: dark-water (page, sidebar, topbar), dark-card (sheets, choices, inputs) and dark-card-2 (headers, chips, inset boxes), with dark-hover above them.
- **Text:** a soft off-white ink (dark-ink, 14.8:1 on the ground) and a muted gray Soft Ink (dark-ink-soft, at least 5.6:1 on every surface). Placeholders use Soft Ink, never the browser gray.
- **Edges:** the 2px outline becomes a calm gray (`--edge-c`, dark-edge, 3.3:1 or better) instead of cream, so fills are not ringed in light. Hairlines are dark-line and dark-line-strong.
- **Region colors:** sun, coral, sky and lilac are softened (less saturated, slightly lighter) and keep their meanings and the One Yellow Rule. Text on them is dark-on-color (6.9:1 or better). The round arrow chip stays a dark chip (`--chip`) with a light arrow in both themes.
- **Verdicts:** lighter green-fill and red-fill with dark text on filled bubbles (`--on-fill`), dark washes with lighter verdict text. Chart bars mix toward the card for easy and medium difficulty instead of fading with opacity.
- **Map and marks:** a deep green lobe (dark-land) with a gray edge, a brighter marker swipe (dark-swipe) and a mid-green brand disc (dark-mark). The pen is a light Pen Blue (dark-pen). Gem keeps its lilac body and dark face, with a gray outline.
- **Focus:** a light blue ring (dark-accent-text), not yellow, so focus never reads as a second next step.
- **Desmos:** the embedded calculator switches to its own `invertedColors`, so the graph never sits as a white slab.

### Named Rules
**The One Yellow Rule.** Yellow means "the next step". One yellow action per view; never use it for decoration, status or a second option.

**The Region Rule.** Coral is Reading and Writing, blue is Math, lilac is tools. A region fill always comes with a 2px ink edge and ink text, never white text.

## Typography

**Display Font:** Archivo (with Segoe UI, system-ui, sans-serif)
**Reading Font:** Source Serif 4 (with Georgia, Times New Roman, serif)
**Hand Font:** Caveat 600 (with Comic Sans MS, cursive), the tutor's pen

**Character:** Archivo at 800 with tight tracking reads like a park sign: bold, friendly, slightly condensed. Source Serif 4 brings the calm of a printed test booklet to questions. Caveat is the pen note someone scribbled on the map.

### Hierarchy
- **Display** (800, clamp(44px, 5.4vw, 72px), 1.05, max 11ch): the first-run Home heading only. 42px under 900px.
- **Headline** (800, 34px, 1.05): page-level greetings such as the returning-user Home.
- **Title** (700, 19px, 1.3; 15.5px small variant): sheet and section headings ("Or wander off the path", "Today's plan").
- **Lede** (400, 18px, max 46ch): the one line of sub copy under the display heading. 16.5px on mobile.
- **Body** (400, 14.5px, 1.5): shell copy; secondary copy uses Soft Ink at max 72ch.
- **Reading** (400 / 600 for the prompt, 17px, 1.7, max 64ch): passages, prompts, answer choices (16px), explanations. 16px on mobile.
- **Map lettering** (700, 12px, 0.06em, uppercase): the pin label and the map key, the printed lettering of the map itself.
- **Hand** (600, 24px, 1, rotated -4deg, Pen Blue): the one handwritten margin note on first-run Home.
- **Pen** (600, 22px, 1.2, Pen Blue, upright): tutor notes, walkthrough steps, Rush feedback, the miss-reason question. Smaller pen sizes: 20px for the note under a wrong pick and for pen hint links, 16px for the raised "clue" note. With typed text switched on, pen text becomes Archivo 500 at 15px, 1.5 (pen links 13px) and keeps Pen Blue.
- **Trail label** (600, 12px, Soft Ink; 10.5px under 900px): the four stop names on the test trail. The current stop goes to 800 and ink.
- **Clock** (800, 26px, tabular): the Question Rush countdown; the running score beside it is 22px.
- **Small** (400, 12.5px, Soft Ink): captions, legends, notices, skill-row status lines and small pill buttons.
- **Keys** (500, 13.5px, 1.65, system monospace): literal keystrokes in the copyable keystroke box. Inline `code` spans in "The Desmos way" steps use the same stack at 0.92em on Shaded Paper with a 1px hairline and 6px radius.
- **Subject headings:** the Desmos subject header runs Display at clamp(38px, 4.6vw, 60px), max 14ch, with a 17px lede; a lesson title runs clamp(32px, 3.6vw, 46px) with 16px, 1.6 body paragraphs. The "Watch out" pen note is 21px (15px typed).
- Numbers (stats, timer, scores) use tabular figures at 800.

### Named Rules
**The Two Registers Rule.** Archivo runs the shell and all chrome. Source Serif 4 is only for what a student reads to answer a question. Don't mix them inside one block.

**The One Note Rule.** On the shell, one decorative Caveat note and one marker swipe per region. More than one turns the map into a scrapbook. The tutor's pen on practice, review and between-module screens is not decoration and is not counted, but it only explains, encourages or marks a student's work.

**The Literal Keys Rule.** Monospace appears only for text a student types verbatim into Desmos. It never wraps (the box scrolls sideways instead), and it never sets headings, numbers or chrome.

**The Typed Text Rule.** Every pen surface has a typed equivalent. A visible "Switch to typed text" toggle swaps every pen line to Archivo while it keeps Pen Blue, and pen marks are hidden from assistive tech with the meaning repeated in text.

## Layout

A fixed 236px left sidebar and a fluid main column (content padded 32px 36px 64px, max 1240px). The sidebar becomes a horizontally scrolling top strip under 900px, and the sticky topbar becomes static.

First-run Home is a map composition. A two-column grid has a 120px gutter that holds the pin and the trail, and the copy sits in the second column. An SVG land lobe sits behind everything (`preserveAspectRatio: none`, non-scaling 2px stroke), with separate wide and tall lobe and trail paths for desktop and mobile. Padding is 112px 56px, minimum height min(580px, 74vh). The map key is pinned bottom-right and hidden on mobile. The coast row of capsules wraps below the lobe.

Spacing follows a loose 6 / 10 / 14 / 18 / 22 / 32px rhythm. Grids use `auto-fit` with `minmax(min(100%, N), 1fr)` (380px for column pairs, 240px for threes, 200px for stats). In test mode (`body.testing`) the sidebar, topbar and footer disappear and content centers. A four-column trail strip sits under the test header, and the same strip leads the results header (capped at 720px, unframed). The Rush bar wraps; its end-round button moves to the far right on desktop and returns to the flow on mobile. A Desmos lesson is a two-column grid (fluid / minmax(320px, 0.82fr), gaps 14px 28px): the intro and the practice stack in column one, and the live calculator spans both rows of column two, sticky at 76px from the top with a frame height of min(620px, 100vh - 160px). Under 900px it collapses to one column in reading order intro, calculator, practice; the calculator goes static at 420px. The skills checklist is an `auto-fill` grid of 300px-minimum rows. Miss-pattern bars use a label / bar / count grid (up to 210px, fluid, 28px) that tightens to a fluid label, 90px bar and 24px count on mobile.

## Elevation & Depth

The system is flat, and depth comes from ink outlines and paper tones (water, card, shaded card). One soft, ambient lift sits under shell sheets, stat tiles, flashcards, the active filter pill, the Desmos lesson calculator and the toast. Question sheets, test chrome and inset boxes do not lift.

### Shadow Vocabulary
- **Soft Lift** (`box-shadow: 0 1px 0 rgba(44,46,42,0.05), 0 10px 22px -14px rgba(44,46,42,0.35)`): the only shadow. Dark mode deepens it.
- **Ring** (`0 0 0 1px <state color> inset`): selected, right and wrong answer choices; the current navigator cell uses a 2px card + 2px ink double ring. The current trail stop carries a 4px coral halo at 30% strength.
- **Section stripe** (`inset 0 -4px 0 <region>`): a 4px coral or sky band along the bottom of the test header naming the section. Not a lift.
- **Result underline** (`inset 0 -3px 0 <verdict>`): a 3px green-fill or coral band under a Desmos lesson's question pill, for right or missed last time. Not a lift.

### Named Rules
**The Ink Edge Rule.** Shell surfaces get a 2px ink outline (`--edge`). Question and test surfaces step down to 1px Strong Hairline, and the walkthrough panel to a 1.5px dashed Strong Hairline, so a test screen still reads calmer than the map while it carries the trail, section stripe and pen. Pill controls (buttons, tags, the Rush clock) keep their 2px ink edge everywhere.

## Shapes

Capsules everywhere a finger goes: buttons, tags, nav items, filter pills, chips, the toast and the meter are all fully rounded (999px). Sheets are 18px, list and task containers 16px, the walkthrough panel, keystroke box, "Desmos way" panel and skill rows 14px, choices and inset boxes 12px, inputs and the embedded Desmos frame 10px, inline `code` 6px, small test controls (flag, strike, navigator cells) 8px. Round forms carry meaning: the ink arrow chip (34px, 44px on big buttons), the pin, answer bubbles (28px), numbered skill stops (32px) and map-key dots. The land lobe and the pen are the only freeform shapes: the lobe is a wobbly closed bezier with a 2px ink stroke, and pen marks are uneven hand-drawn strokes (2.5px, round caps). Walkthrough step numbers sit in a lopsided hand-drawn circle (26px, 2px stroke, radii 52% 46% 55% 44%, turned -6deg).

## Components

### Buttons
Tactile pill capsules with a confident ink outline.
- **Shape:** full capsule (999px), 2px ink edge.
- **Primary:** Ink fill, Water Cream text, 600 weight, 8px 16px. Small is 5px 12px at 13px; big is 12px 22px at 17px.
- **Next step:** Trail Yellow fill with ink text. Can carry a duration note after a 1.5px divider ("68 min") and the ink arrow chip.
- **Ghost:** Paper fill, ink text and edge; hover goes to Hover Paper.
- **Hover / Focus:** 120ms color transitions. The arrow chip slides 5px right on hover or focus-visible (260ms, cubic-bezier(0.16, 1, 0.3, 1)). Focus is a 3px ink outline at 3px offset (light blue in dark mode).
- **Link:** ink text, 600 weight, 2px underline at 4px offset; the underline disappears on hover.

### Coast Capsules (signature)
Region-colored capsules (coral, sky, lilac) with 20px left padding, 16px semibold ink text and an ink arrow chip flush in the right end. They sit in a wrapping row under the map as side paths.

### Chips and Tags
- **Tag:** Paper capsule with 2px ink edge, 13px medium text, bold tabular numbers (streak, minutes, focus timer). The tools variant fills lilac. Pressed tags invert to ink.
- **Chip:** quiet 1px hairline capsule on Shaded Paper with Soft Ink text, for question metadata.
- **Filter pills:** a segmented Shaded Paper track; the pressed pill turns to Paper with Soft Lift.

### Cards / Containers
- **Sheet:** Paper, 2px ink edge, 18px radius, 20px 22px padding, Soft Lift.
- **Lists and tasks:** a 16px ink-edged container with 1px hairline row dividers and hover fill.
- **Inset box / step:** 1px hairline, 12px radius, Shaded Paper or Paper.
- **Countdown (Home, with a plan):** a Paper box beside the greeting, 2px ink edge, Soft Lift, 10px 16px padding, max 300px. A 40px 800 tabular day count ("Today" on test day) next to a small line with the date and target. With no date, or a date already passed, it becomes a dashed, unlifted button ("?" or "✓") that opens the test-date field. The Trail Yellow "Start today's session" button leads the hero row and turns into "Continue today's session (n/total)" once a set is open.
- **Catch-up row (Today's plan):** a dashed box (1.5px dashed Strong Hairline, 12px radius, 10px 14px) under the plan tasks when recent plan days fell short. One no-guilt line naming the days, a small ink "Catch up (n)" button (at most 15) and a "Skip, start fresh" link. While the set is open it reads "Continue catch-up (i/n)".

### Inputs / Fields
- **Style:** Paper, 1px Strong Hairline, 10px radius (12px and 22px bold for answer entry).
- **Focus:** the border turns blue with a 3px Selection Blue halo.
- **Right / wrong:** green or red border plus wash.

### Navigation
Sidebar items are 15px medium pills with 19px line icons. Hover shows Hover Paper. The current page inverts to an Ink pill with cream text. A coral count badge marks missed questions. On mobile the sidebar becomes a scrolling row.

### Answer Choice
Paper row, 1px Strong Hairline, 12px radius, serif text, with a 28px round letter bubble. Selected: blue border and inset ring, Selection Blue wash, filled bubble. Right and wrong use green or red ring, wash and filled bubble. A struck choice is 45% opacity with a line-through.

### Highlighter and Notes (practice and mock tests)
Bluebook-style annotate. Selecting text in a passage or prompt opens a small Paper popover (2px ink edge, 14px radius, Soft Lift) with "Highlight" and "Add a note". Highlights are Lilac (a tool) with ink text in both themes, 3px radius; a highlight with a note gets a 2px ink underline and its note in a tooltip and in screen-reader text. Clicking or pressing Enter on a highlight opens the note box with "Save note" and "Remove highlight". Escape or a click outside closes it. Highlights are saved per question.

### Practice Analytics (top of Analytics)
One sheet with a filter-pill range picker (7, 30, 90 days, all time), four stat tiles (questions, accuracy, average time, streak), a stacked bar chart of right (green-fill) and wrong (red-fill) answers per day (per week past 30 days) where easy is 40%, medium 70% and hard full strength, and a "Lowest skills" list of the five weakest skills (3+ answers in range) with Practise buttons.

### Mistakes Notebook (Review)
Four filter-pill tabs (Mistakes, Marked for review, Notes, Collections) over a row of labelled selects (collection, section, status "never corrected / corrected since", 7 or 30 days), then the miss patterns sheet and one list sheet with an ink "Practise all n" button. Rows are the standard ink-edged list; a student note shows as an italic small line in ink. On a practice question, the "Note" ghost button opens a Shaded Paper strip under the question header with a note field, collection tags (pressed = in that collection) and "Save note".

### Pen (signature, practice and review)
A tutor's blue pen that works on the student's page. Upright Caveat, never rotated, never on the shell sheets.
- **Note:** a pen line under a heading or next to an action ("Beat it?", "Last stop. You've got this.").
- **Wrong-pick note:** a 20px pen note indented under the chosen wrong answer, explaining why it misleads.
- **Marks:** a ring around the right answer's bubble, a scratch through the wrong pick's text, an underline under a walkthrough answer. Drawn with stroke-dashoffset over 700ms; in a walkthrough each mark lands 400ms after its line.
- **Clue:** a wavy 1.5px Pen Blue underline (5px offset) on the passage words that hold the clue, with a raised 16px "clue" note after them. Screen readers hear "Clue:" instead.
- **Pen link:** a hint trigger set in 20px Caveat, underlined in Pen Blue at 45%.
- **Typed text:** the body-level switch sets all of the above in Archivo (see The Typed Text Rule).

### Walkthrough
A dashed panel (1.5px dashed Strong Hairline, 14px radius, Paper, 14px 18px 16px padding) holding numbered pen steps. Each number sits in a hand-drawn circle; the final "so" line drops the circle and gets a pen underline. Lines write in left to right one after another (600ms clip reveal, staggered), behind `prefers-reduced-motion: no-preference`. A smaller variant opens as the hint before answering.

### Miss Reasons
After a wrong answer, a pen question ("Why do you think you missed it?") over a wrapping group of tags. The pressed reason fills coral with ink text. Review totals them as pattern bars: 14px ink-edged pill tracks on Paper filled coral, with tabular counts and one pen tip naming the most common reason.

### Question Rush
- **Start / end card:** a headline with one marker-swiped word, a skill picker, one pen line about the personal best and one yellow "Start the clock" button.
- **Rush bar:** a Shaded Paper strip with a hairline bottom: the clock, the running score (22px tabular), spoken feedback and an end-round button.
- **Clock:** a Trail Yellow capsule with a 2px ink edge, 26px 800 tabular figures.
- **Feedback:** a pen line in a polite live region ("Right! ×3 combo!", "Not quite, it was B."), 16ch minimum so the bar does not jump.

### Challenge Set
A Practice source with a Rush-style start card: a headline with one marker-swiped word, a section filter-pill group, challenge accuracy by content area as green-fill bars (the miss bars' shape, green because it is accuracy), and one yellow "Start the challenge". The set runs 10 hard questions (hand-written hard R&W, fresh hard Math variants), each with a "Module 2 hard" chip.

### Settings
A round gear tag (Paper, 2px ink edge, icon only, labelled "Settings") ends the top bar; under 900px it moves to a "Settings" item at the end of the scrolling menu strip. It opens a small non-modal panel (Paper, 2px ink edge, 18px radius, Soft Lift, 360px, pinned under the top bar; full width minus 16px gutters on phones) with a ghost "Done" button and an "Appearance" filter-pill group of real radio buttons: Light, Dark, Match my device (default). The choice sets `data-theme` on the root immediately, is stored per device in localStorage (`clearline-theme`), and an inline script in `<head>` applies it before first paint. Esc, Done or a click outside closes it and returns focus to the trigger. Below Appearance, a "Your progress" group holds an ink "Back up my progress" button (downloads `clearline-backup-<date>.json`) and a ghost "Restore from backup" (file picker). A valid file swaps the buttons for an inline confirm ("Replace the progress on this device…?", "Yes, restore", "Cancel"); anything else gets a toast and changes nothing.

### Storage Tips
One dismissible note at a time in the page banner slot (the mock-paused banner wins): a private-window warning, or on iPhone Safari outside the Home Screen app, an "Add to Home Screen" tip. Each has a ghost "Got it" and is remembered per device (`clearline-tips-seen`).

### Gem Mascot
An original cut gem in Lilac (Gem is a tool) with a 2.5px ink outline, ink facet lines, dot eyes, coral cheeks and a smile (an open grin when cheering), 64px. Beside it sits a speech bubble: Paper, 2px ink edge, 16px radius, Soft Lift, a tail on the left, Archivo 14.5px (not Caveat, so it never counts against the One Note Rule). It appears on Home (both first-run and plan views), the test break and Question Rush results, with one short line that fits the moment. It bobs gently, and hops twice when cheering, behind `prefers-reduced-motion: no-preference`. Screen readers hear "Gem says:" before the line.

### Vocab Games
A filter-pill group (Flashcards, Match, Learn) heads the Vocab view. Match and Learn use the Rush start/end card (headline with one marker-swiped word, one pen line, one yellow start). Match is two columns (words in Archivo bold, definitions in serif) of answer-choice rows; the picked row takes the selected-choice look, a wrong pair flashes red for 700ms and adds 2 seconds, a matched pair turns right-green at 60% opacity. The clock is the Rush clock. Learn shows the deck's example sentence with a blank, four answer-choice rows and, after a pick, a walkthrough panel with the definition.

### Share My Progress
A sheet on Analytics with an optional name field and an ink "Download report" button. The report file is its own small page: the same cream, paper and 2px ink edge tokens (light and dark), tiles for time practiced, a score estimate labelled not official, and plain tables. No scripts.

### Test Trail and Section Stripe
- **Trail:** four stops (Reading and Writing 1 and 2, Math 1 and 2) joined by 2.5px dotted hairlines. Passed stops are Trail Yellow with an ink ring and an ink connector, the current stop is coral with an ink ring and a soft coral halo, stops ahead are hollow Paper. Shown on the test head, the module review, the break and the results header.
- **Section stripe:** coral under the header in Reading and Writing, sky in Math.
- **Results header ("You made it"):** the trail with every stop passed, a headline with one marker-swiped word and one pen line, before the score sheet.
- **Timing picker:** a labelled segmented pill group for standard or extended time, with a small note that scores are labelled with the timing used.

### Desmos Subject (a tool region, lilac)
- **Subject header:** a left-aligned stack: the subject heading with one marker-swiped word, a 17px lede, a Trail Yellow "Start" or "Continue" capsule beside a ghost "Mixed challenge", and one pen line counting tricks mastered.
- **Skills checklist:** a grid of Paper rows (1.5px Strong Hairline, 14px radius) each holding a numbered stop, a bold title with an optional badge over a small status line, and a pill button. Stops are 32px circles with a 2px ink edge and 800 13px numbers: Paper when not started, Lilac when practicing, Trail Yellow when mastered, and a mastered row's edge turns to ink. The pill button ("Learn" or "Review") is a small Paper capsule with a 2px ink edge that inverts to ink on hover.
- **Best trick badge:** a lilac capsule with a 1.5px ink edge, 11.5px 700 ink text (13px beside a lesson title).
- **Keystroke box:** a Paper box with a 2px ink edge, 14px radius and 14px 16px padding holding the exact keys in Keys type, no wrapping, sideways scroll, with a small ghost "Copy" button pinned top-right (text reserves 72px for it). The button confirms with "Copied".
- **Watch out:** a pen note with a bold "Watch out:" lead, under the keystroke box.
- **Lesson calculator:** the app's single Desmos instance, moved beside the lesson: a Paper sheet with a 2px ink edge, 18px radius, 10px padding and Soft Lift, a small label row with a "Reset to the example" link, and the Desmos frame clipped to 10px. When Desmos cannot load, the same frame holds a short note and a link out.
- **The Desmos way:** a lilac-tinted panel (1.5px lilac border, 14px radius, 14px 18px padding) with a heading and a numbered list of keystroke steps using inline `code`, set above the by-hand pen walkthrough on a Desmos question.
- **Question pills:** the standard filter-pill track, each pill underlined green (right last time) or coral (missed) with the Result underline.
- **Trick pick:** in the mixed challenge, a labelled select (max 360px) asking which trick the student will use, required before checking.

### Map Furniture (signature, first-run Home)
- **Land lobe:** a full-bleed Land Green SVG with a 2px ink stroke behind the hero.
- **Pin:** a coral map pin with an ink stroke and a Paper center, above uppercase map lettering ("You are here: the start"). It drops in with a 700ms overshoot.
- **Trail:** a dotted path made of a 10px ink stroke under a 6px yellow stroke with round caps and a `1 13` dash. It draws in over 1.6s. When the next-step button is hovered or focused, the trail marches toward it (0.7s linear loop) and the button's chip pushes 9px forward. All motion is gated on `prefers-reduced-motion: no-preference`.
- **Map key:** a row of 13px ink-ringed dots in the region colors with uppercase map lettering. Hidden on mobile.
- **Marker swipe:** a skewed polygon mask in Marker Green rotated -1.5deg behind one word.

## Do's and Don'ts

### Do:
- **Do** give every shell surface a 2px ink edge, and step down to 1px Strong Hairline on question and test screens.
- **Do** keep one Trail Yellow action per view and make it the next step.
- **Do** color subjects by region: coral for Reading and Writing, blue for Math, lilac for tools, always with ink text.
- **Do** end forward actions with the round ink arrow chip, and let it slide on hover and focus.
- **Do** set passages, prompts and choices in Source Serif 4 at 16 to 17px, 1.7 line height, 64ch maximum.
- **Do** gate every animation behind `prefers-reduced-motion: no-preference`.
- **Do** keep the pen in Pen Blue and give every pen surface the typed-text switch.
- **Do** mark the test section with its region stripe and show progress on the four-stop trail.
- **Do** put keystrokes students must type in the keystroke box or inline `code`, never in body prose.

### Don't:
- **Don't** drift back to a grey SaaS dashboard with white cards and a violet accent.
- **Don't** use yellow for anything but the next step and progress toward it.
- **Don't** put white text on a region color; ink is the text color on every fill.
- **Don't** bring the land lobe, pin or the drawn SVG trail into question or mock-test screens; the test's trail is the flat four-stop strip. Their fun comes from voice, color, pen and feedback, never from changing SAT format or timing.
- **Don't** put pen notes on a timed mock-test question; between-module, break and results screens carry them.
- **Don't** add a second decorative Caveat note or a second marker swipe to one shell region.
- **Don't** add gradients or extra shadow tokens; Soft Lift is the only shadow.
- **Don't** use monospace for anything but literal keystrokes, and don't let keystrokes wrap.
