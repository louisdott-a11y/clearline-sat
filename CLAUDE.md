# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with the owner

- Explain every change in plain words, as if the reader is new to coding. Say what changed, where, and why it matters, without jargon.
- Do not use em dashes anywhere: not in replies, code comments, commit messages or docs.
- Ask before pushing to GitHub. A push to `main` deploys the live site, so always confirm first.
- At the end of any session where code changed, run the `anthropic-skills:vault-session-log` skill without being asked. It writes a session log to the Obsidian vault and updates the Clearline project note there.

## What this is

Clearline SAT: a free, static SAT-prep site (live at https://clearlinesat.com; the old https://clearline-sat.pages.dev and https://clearline-sat.vercel.app forward there). Plain HTML, CSS and JavaScript. No framework, no bundler, no npm dependencies. One page (`index.html`, which also holds all the CSS) plus script files in `assets/`. All student progress lives in `localStorage`; nothing is sent to a server.

## Commands

```sh
npm start                 # python3 -m http.server 8000, then open http://localhost:8000
npm test                  # runs every tests/*.test.js with node, stops at the first failure
node tests/walk.test.js   # run a single test file
npm run build             # sh build.sh -> dist/ (what Vercel runs on push to main)
```

Browser test for the Desmos walkthroughs (needs network and Playwright; not part of `npm test`):

```sh
npm start   # in another terminal
PW=/path/to/node_modules/playwright node tests/e2e/walk.e2e.js
# SKIP_PARSE=1 skips the slow per-step Desmos value check; screenshots land in tests/e2e/out/
```

Deploy is automatic: push to `main`, Vercel runs `sh build.sh` and publishes `dist/`. `build.sh` copies only `index.html`, `404.html` and `assets/` and appends `?v=<commit>` to every script tag for cache busting. Never commit `dist/`. Cloudflare Pages still builds on push too, but `build.sh` detects it (`CF_PAGES`) and outputs only `bridge/index.html`, which forwards students with their progress packed into `#import=`. The same page ships as `dist/bridge.html`; an inline script at the top of `index.html` sends visitors on clearline-sat.vercel.app there. Chain: pages.dev, then vercel.app/bridge.html, then clearlinesat.com, where `importFromLink()` in `app.js` merges each bundle.

## Architecture

**Load order matters.** `index.html` loads scripts at the bottom in this order: `config.js`, `bank.js`, `mathgen.js`, `calc.js`, `vocab.js`, `clues.js`, `desmos.js`, `report.js`, `coach.js`, then `app.js`. Each data file sets one global (`window.CL_CONFIG`, `CL_BANK`, `CL_MATH`, `CL_CALC`, `CL_VOCAB`, `CL_CLUES`, `CL_DESMOS`, `CL_REPORT`, `CL_COACH`). `app.js` loads last and reads them all. Tests reuse the same files in Node via `global.window = global; require("../assets/x.js")`, so data files must stay free of DOM access at load time.

**`app.js` is a tiny homemade framework** (~2800 lines, one IIFE):
- `ui` holds transient screen state (current view, question, open dock panel). `progress` holds everything persisted.
- `render()` rebuilds the current view from those two objects; every click mutates state then calls `render()`.
- Views are listed in `VIEWS` (`home`, `practice`, `desmos`, `bank`, `mock`, `stats`, `review`, `vocab`, `guides`), each mapped to a `renderX` function. The view name mirrors into `location.hash`.
- `save()` debounces about a second and writes `progress` as JSON to `localStorage` key `clearline-sat-progress-v1`. `loadLocal()` + `normalize()` repair old or damaged saves on boot. Any new persisted field needs a default in `normalize()`.
- On boot, `balanceBankAnswers()` reshuffles each hand-written bank question's choices deterministically by id (the bank was authored with most answers in slot A). Items with `placed: true` are left alone. Choice-letter references in `why`/`steps` are rewritten to match.

**Three question sources, one shape.** Practice, mock tests, review and stats treat all questions alike: `prompt`, `choices`, `answer` (index), `steps`, `why` (reason per wrong choice index), `skill`, `diff`, plus `walk` on Math items. Typed-answer ("spr") items use `accept` instead of `choices`/`answer`.
1. `bank.js`: 90 hand-checked R&W items and 13 classic Math items. The 30 `h*` ids are the Module 2 hard set and the test enforces exactly 30, balanced A–D, 3 per skill, no near-duplicates.
2. `mathgen.js`: 28 generators. `CL_MATH.make(genId, seed)` is deterministic per seed, computes its own answer, and builds wrong choices from real student mistakes. Ids like `g-arc-1234` encode generator and seed so `fromId()` can rebuild the question.
3. `desmos.js`: 18 lessons and 75 questions tied to them.

**Desmos walkthroughs (`walk`).** Every Math question carries an array of steps: `say` (what Gem says), `why` (one short sentence), `keys` (expressions to type), optional `view`, `mark`, `table`, `shows` (expected Desmos values), and `pick` on the last step only. `tests/walk.test.js` enforces the shape, that no step before the last leaks the answer, that computed keys declare `shows`, and that `pick` equals the correct answer. `tests/e2e/walk.e2e.js` then checks `shows` against real Desmos. Use a plain `-` in `keys`, never the Unicode minus.

**Coach ("Walk me through it").** `coach.js` builds a plan from a question's own answer key: Math uses its `walk` steps (minus the last), R&W uses `steps` minus the last; wrong choices come with their `why`. `app.js` (`startCoach`, `renderCoach`) asks the student to rule out choices one at a time and shows the full solution only on request. No AI and no server. Practice only, never in mock tests. `tests/coach.test.js` checks every question: only wrong choices can be ruled out, each has a reason, no early step names the answer.

**Claude-only features.** `IN_CLAUDE = Boolean(window.claude?.use)`. Ask Gem (AI coach), the follow-up tutor and question flagging render only inside Claude's artifact runtime. On the public site they are hidden on purpose. Conversely, Desmos cannot load inside Claude (outside scripts blocked), so `calc.js` (a safe parser, no `eval`) stands in. Gem the mascot appears everywhere; only the AI coach is gated.

**Mock test routing.** Two modules per section. Module 1 at or above 60% (weighted by difficulty) routes to the harder Module 2; the easier Module 2 caps the section score. Scores are always labeled as estimates.

## Conventions worth knowing

- `tests/` checks data and logic, not screens. Adding a question, generator or walkthrough means `npm test` must still pass; the walk test runs every generator for 200 seeds.
- `report.js` output is an HTML file students send to teachers; it must escape all student text and contain no scripts (`tests/report.test.js`).
- Design tokens, voice and layout rules are in `DESIGN.md` (Trailhead: park-trail map, sage paper with contour lines, forest ink, one yellow trail-marker accent; Overpass, Literata, Caveat for pen notes only). The local `design-critic` agent (`.claude/agents/`) reviews screenshots against it. Product constraints and what not to build are in `PRODUCT.md`. Key rule from there: question and mock screens keep the exact SAT format and timing; fun lives in voice, color and feedback only.
- Never invent testimonials, user counts or score-improvement claims.
- `research/`, `.claude/`, `.impeccable/`, `.playwright-mcp/` and `.aider*` are gitignored private notes. `docs/` and `tests/` are committed but never deployed.
- `assets/config.js` holds the Desmos API key (currently the public demo key). `vercel.json` sets security headers and a 5-minute cache on `assets/*.js`.
