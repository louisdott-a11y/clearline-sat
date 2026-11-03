# Clearline SAT: plain-English summary

Written from this folder's files, README and git history (as of October 17, 2026). Where the files don't say, it says "unknown."

## 1. Name and purpose

**Clearline SAT** is a free website for studying for the SAT. Its promise, in the README's words: "every answer is checked and every wrong choice is explained."

## 2. Who uses it and what problem it solves

- **Main users:** teenagers studying for the SAT on their own, mostly on a laptop, sometimes on a phone (from `PRODUCT.md`).
- **Second user:** a teacher or parent who wants to see a student's progress. They get a report file the student downloads and sends them.
- **The problem:** the README says good SAT prep is often expensive, and free tools rarely explain *why* an answer is wrong. Clearline is free, needs no account, has no ads, and explains every wrong choice.

## 3. Main features (what it does right now)

- **Practice questions:**
  - 90 hand-checked Reading and Writing questions.
  - 13 hand-written Math questions.
  - 28 Math "generators" that make unlimited new versions of a problem, work out the correct answer themselves, and build wrong choices from common student mistakes.
- **Explanations:** a step-by-step solution for every question, a reason why each wrong choice is wrong, and hints that underline the clue in the passage.
- **Full practice SAT:**
  - Built like the real digital SAT (the College Board's Bluebook app): two sections, two parts ("modules") each, a break, a calculator and a formula sheet.
  - The second module is harder or easier depending on how you did on the first: harder if you got 60% or more.
  - Options for extra time (1.5×, 2×, untimed).
  - The score is clearly labeled as an estimate, not official.
- **Desmos lessons:** 18 short lessons on using the Desmos graphing calculator (the one allowed on the real SAT), with 75 practice questions.
- **Desmos step-by-step walkthroughs:** every Math question has a "Desmos way" button. It opens the calculator next to the question, and a mascot named Gem walks through solving it one step at a time, saying what to type and why it works. The answer stays hidden until the student answers or asks for it.
- **Daily plan:** a countdown to the test date, a "Start today's session" button, and a catch-up set for days that fell short.
- **Analytics:** score estimate, accuracy by skill and difficulty, a study-time chart, and a place to add real SAT/PSAT scores.
- **Mistakes notebook:** review missed questions, tag why you missed them, write notes, and group them into collections.
- **Highlighter and notes** on question passages, like the real test.
- **Question Rush:** a timed speed round with combos and stars.
- **Vocab:** 42 words, studied three ways: flashcards, a timed Match game, and a fill-in-the-sentence Learn mode.
- **Teacher report:** a read-only progress file the student downloads and sends to a teacher or parent.
- **Settings:** light or dark mode, backup and restore of your progress, and a "Send feedback" email link.

## 4. A normal day for a student

1. Open the site. The Home screen shows days until the test and a "Start today's session" button. Gem, the mascot, says a short line of encouragement.
2. Tap "Start today's session" for a set picked from your weak spots. If you missed a planned day, a catch-up set appears.
3. Answer questions. After each one you see whether you were right, a step-by-step solution, and why each wrong choice is wrong.
4. On a Math question, tap "Desmos way" to be walked through it in the calculator, or "Why not Desmos?" when solving by hand is faster.
5. Optionally, do a timed Question Rush round or a few vocab games.
6. Later, open the mistakes notebook to redo missed questions, and check Analytics to see what to work on next.
7. Every so often, take a full practice SAT.
8. If a teacher asked, download the progress report and send it.

Progress saves automatically in the browser on that device.

## 5. Tech used

- **Languages:** plain HTML, CSS and JavaScript. No frameworks and no add-on libraries. The only outside service is the Desmos calculator, loaded from Desmos's website.
- **Database:** none. Each student's progress is saved in their own browser (`localStorage`), and nothing is sent to a server. A backup file can move progress to another device.
- **Where it runs:** a website. It works on laptops and phones and can be added to an iPhone home screen like an app. It's hosted on Vercel at clearline-sat.vercel.app (the old clearline-sat.pages.dev address forwards there, carrying saved progress along). A test report in `research/` describes testing the live site on October 14, 2026.
- **Tests:** small Node.js scripts that check the question data, plus a browser test (Playwright) for the Desmos walkthroughs.
- **How it was built:** the README says the student came up with the idea, researched competitors, chose and prioritized features, directed the design, and tested on real devices. It also says: "I used Claude Code as my coding tool: it wrote and tested the code under my direction." A few commits also look like they came from another AI coding tool, Aider, judging by their style and a commit titled "Ignore aider files." That part is a guess.

## 6. How far along it is

**Finished and live:** everything in section 3.

**Planned or not built** (from the README "Roadmap" and `research/oneprep-deep-dive.md`):
- accounts, so progress follows a student across devices without a backup file;
- more questions, especially hand-written Math and harder Reading and Writing;
- a live teacher dashboard for a whole class (today it's only the downloadable report);
- "Teach-back," where the student explains a skill to Gem in their own words (item 8 on the research list; no code found);
- a "here's what changed" note with Undo when the daily plan updates (part of item 1; no code found);
- custom vocab word lists (part of item 6; not built).

**Known loose ends** (from `research/stress-test-2026-10-14.md` and code comments):
- The Desmos calculator uses a free trial key. A "Desmos Trial Key" banner shows on the graph until a production key is bought.
- In Practice, the "Desmos" option keeps showing a skill filter that doesn't apply to it.

**Half-done code:** no TODO comments were found. Two "shortcut" comments note known limits: how math fractions are displayed, and how a private browser window is detected.

## 7. Problems and fixes found in the history

All dates are 2026. Dates come from commit dates; where a fix is described, the description comes from commit messages, code comments or `research/stress-test-2026-10-14.md`.

- **Oct 13:**
  - Fixed how the SAT answer box treats long decimals: a typed answer must fill the box (5 characters, 6 with a minus sign) to count (commit "SAT answer-box rule fix").
  - The hand-written questions had most correct answers in slot A. Fixed by spreading answers across A–D in a fixed, repeatable order (commit 6d8f946 and a code comment in `app.js`).
  - A home-page subtitle sounded too much like a competitor's and was replaced (commit 0b791b3).
  - A "marker swipe" highlight effect covered the space before a word; fixed (commit 16a629d).
- **Oct 14:**
  - **Redesign:** dark mode was rebuilt with cooler grays and softer colors (commit f0f27cb).
  - On phones, the calculator and past-test lists had disappeared; restored (commit b8119c5).
  - A stress test of the live site found three bugs, all fixed in commit 74235f6:
    - a damaged backup could permanently blank every screen, so the app now repairs or drops only the broken parts;
    - refreshing the page opened the wrong screen;
    - in a practice test, an answer chosen with the keyboard stayed crossed out.
  - In the Desmos walkthroughs, some steps added an expression before the line it depended on, so Desmos showed wrong values (for example a=4, b=1, c=1). Fixed by reordering, and a test now checks the values Desmos shows at every step. The same work fixed:
    - "32pi" not being read as π;
    - one calculation trying to reuse another's result;
    - "r = 1" being drawn as a circle;
    - a Desmos button covering "Next" on phones;
    - the graph shrinking to about 16 pixels on short screens (commit d04ef96).
  - **Redesign:** the walkthroughs were changed so they never state the answer before the last step (also d04ef96).
  - Test screenshots were committed by mistake and removed (commit b881ba9).
  - **Phone fixes** (commit 5de392f):
    - a tapped answer choice could stay grey and hide its "selected" color;
    - iPhones zoomed in when you tapped a text box;
    - visitors could keep running old code after an update until their browser's saved copy expired (fixed by adding a version number to each script file).
- **Before Oct 12:** unknown. The earliest commit is October 12, 2026. The README mentions "cleaning up history before going public," so earlier work may not be in the history.

## 8. Decisions that needed real-world knowledge

These come from knowing the real SAT and how students study, not from generic code:

- **Matching the real test exactly:** two modules per section, the second one adaptive, a break, the calculator and formula sheet, and the same timing as Bluebook.
- **The answer-box rule:** long decimals must fill 5 spaces (6 with a minus sign); 0.45 is not accepted for 5/11; never type mixed numbers like 3 1/2. This is Desmos lesson 1.
- **When to skip the calculator:** knowing which SAT questions are faster by hand (no-solution systems, word problems, most geometry). This became the "Why not Desmos?" lesson and walkthroughs.
- **Honest scoring:** scores are always labeled estimates, never official, and shown next to real imported scores.
- **"Keep tests fun":** `PRODUCT.md` says a scary test makes students shy away, so the fun goes in the voice, colors and feedback, but never in how a question is asked or timed.
- **Students study after school in short sessions,** so there's a one-button daily session and catch-up sets.
- **Extra time options** (1.5×, 2×, untimed) for students who get accommodations.
- **A downloadable report for teachers instead of accounts,** keeping students' data on their own device.
- **Wrong choices built from real mistakes,** like using area instead of arc length, or forgetting that squaring a negative gives a positive.
- **Competitor research:** `research/` holds notes on other SAT prep sites, including a ranked list of 10 features to build. Most were built in order over two days.

## 9. Rough size

- **Files:** 38 files tracked in git: 15 in `assets/` (the app's code and question data), 8 test files, the main page, and docs. The private `research/` notes folder isn't in git.
- **Code:** about 6,000 lines across the main page, scripts and tests. The question-data files have very long lines, so line count understates them.
- **Commits:** 49, all under the name Louis Gomez.
- **Started:** the first commit is October 12, 2026 (anything earlier is unknown).
- **Last changed:** October 14, 2026.

## 10. Three true, specific details an admissions reader might find interesting

1. **The answers are checked by code, not just trusted.** For all 75 Desmos practice questions, a test script works out the correct answer from scratch and confirms it's the only right choice. Another test steps through every calculator walkthrough in the real Desmos calculator (418 steps) and checks that the numbers on screen match.
2. **It's designed not to give answers away.** Gem, the mascot, walks students through each problem but never states the answer before the last step. The final step says "Your turn" until the student answers or chooses to see it.
3. **Student privacy was a deliberate choice.** There are no accounts and no database, and nothing a student does leaves their device. Teachers get a downloaded report file instead of a login. A stress test even caught a case where a damaged backup could permanently blank the app, and it was fixed so one bad file can't wipe out the experience.
