# How Clearline works

A plain-language tour, short enough to explain in an interview.

## The big picture

Clearline is a **static website**: a set of files a browser downloads and runs. There is no server code and no database. That keeps it free to host, fast, and private, because a student's data never leaves their device.

```
index.html          the one page: layout and all the CSS
assets/
  config.js         site settings (the Desmos calculator key)
  bank.js           hand-written questions (Reading and Writing + classic Math)
  mathgen.js        Math question generators
  desmos.js         the 18 Desmos lessons and their questions
  vocab.js          vocabulary flashcards
  clues.js          the clue phrase in each Reading question, for hints
  calc.js           a safe math parser for the built-in calculator (no eval)
  report.js         builds the teacher progress report
  app.js            everything else: screens, practice, mock tests, scoring, saving
tests/              self-check scripts run with Node
build.sh            copies the public files into dist/ for deploys
_headers            security and caching rules for Cloudflare
```

## How the files fit together

`index.html` loads the scripts in order at the bottom of the page. Each data file puts one object on `window` (for example `window.CL_BANK` or `window.CL_MATH`). `app.js` loads last, reads those objects, and draws the app.

`app.js` works like a tiny homemade framework:
- One `ui` object holds what's on screen right now (current view, current question, open panels).
- One `progress` object holds everything worth keeping (answers, scores, notes, highlights, settings).
- A `render()` function rebuilds the current view from those two objects. Any click updates the state, then calls `render()`.
- Each sidebar item is a "view" (`home`, `practice`, `mock`, `stats`, ...). The view name also goes in the URL after `#`, so links like `/#practice` open straight to that screen.

## How progress is saved

- Every change to `progress` calls `save()`. It waits about a second (so rapid clicks become one save) and then writes the whole object as JSON to `localStorage` under the key `clearline-sat-progress-v1`.
- On page load, `loadLocal()` reads it back and `normalize()` repairs anything missing or malformed, so an old or damaged save never crashes the app.
- **Backup and restore:** Settings can download `progress` as a `.json` file. Restoring checks the file is really a Clearline backup before loading it (any file a student picks is untrusted).
- **Limits:** data lives in one browser on one device. Clearing browser data erases it, which is why backup exists and why accounts are on the roadmap.

## How questions work

There are three sources, and they all share one question shape (prompt, choices, answer, steps, and a reason for each wrong choice), so practice, mock tests, review and stats treat them the same way.

1. **Hand-written bank** (`bank.js`): 90 Reading and Writing questions and 13 Math questions, each checked by hand.
2. **Math generators** (`mathgen.js`): 28 templates. Each takes a number called a *seed*, uses it to pick random-looking values, then **computes the correct answer itself**. Wrong choices come from real mistakes (for example, using area instead of arc length), and each says why it's wrong. The same seed always gives the same question, so a question's ID like `g-arc-1234` is enough to rebuild it later.
3. **Desmos lessons** (`desmos.js`): 75 practice questions tied to calculator lessons.

## How Desmos walkthroughs work

Every Math question carries a `walk`: a few pre-written steps (what Gem says and why it works, what to type, the view, the point to highlight, what Desmos should show, and the answer it ends on). The answer stays hidden until the student answers or taps Show answer. "Desmos way" opens the live calculator beside the question and plays the steps one at a time, rebuilding the graph for each step so Back is exact. Generated questions build their walk from their own numbers. Nothing here is AI, so Gem appears on the normal website; the AI coach ("Ask Gem") still only appears inside Claude.

## How answer-checking works

`isCorrect(question, response)` in `app.js`:
- **Multiple choice:** the picked choice must match the answer index.
- **Typed answers** (like the SAT's student-produced responses): the text is parsed as a whole number, fraction (`3/4`) or decimal. It's correct if it equals an accepted value. Long decimals are accepted when they're correctly rounded, like the real SAT.

Every attempt is recorded with the skill, difficulty and time taken. Analytics, the daily plan and "weak spots" are all calculated from that history.

## How mock tests work

A mock test follows the digital SAT: Reading and Writing, then Math, two modules each. After module 1, the app scores it (harder questions count more). At 60% or above, module 2 is the **harder** version; otherwise it's the easier one. The final section score (200–800) blends both modules, and the easier module 2 caps how high it can go, just like the real test. The result is always labeled as an estimate, not an official score.

## How it's tested

`npm test` runs each file in `tests/`. They don't test the screens; they test the data and logic that would be embarrassing to get wrong:
- every question has 4 different choices, a valid answer, and a reason for each wrong choice;
- Desmos answers are recomputed from scratch, without trusting the stored key;
- every hint clue appears in its question;
- the teacher report escapes student text and contains no scripts;
- every Desmos walkthrough ends on the question's correct answer, explains each step, and never states the answer early.

`tests/e2e/walk.e2e.js` (Playwright, needs network) steps through every walkthrough in real Desmos, checking the values it shows at each step and that no highlighted point hides under the trial-key notice, then clicks through Back/Next, Try it yourself, switching questions and refreshing, on a laptop and phone size, light and dark.

The screens are tested by hand on a laptop and a phone, in light and dark mode.

## How it deploys

1. I push to the `main` branch on GitHub.
2. Cloudflare Pages notices the push and runs `sh build.sh`.
3. `build.sh` copies only `index.html`, `_headers` and `assets/` into `dist/`. Docs and tests never go online.
4. Cloudflare publishes `dist/` to https://clearline-sat.pages.dev within about a minute. `_headers` adds security headers and keeps script caching short so fixes show up quickly.
