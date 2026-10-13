# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary user:** teens studying for the SAT on their own. They mostly use a laptop, sometimes a phone.
- **Secondary user (wanted, not built):** a teacher who checks a student's progress, hours studied and scores.

## Product Purpose

Free SAT prep. Students:
- diagnose where they stand,
- get a tailored daily plan,
- practice Reading and Writing and Math,
- take adaptive mock tests,
- review their mistakes with explanations.

Success means the student studies regularly and their score estimate goes up.

## Positioning

- Every answer is checked and every wrong choice is explained.
- Reading and Writing questions are hand-checked. Math comes from tested templates that compute their own answers.
- Practice-test scores are honest estimates, shown next to imported real scores and labeled as not official College Board scores.
- No paywall.

## Operating Context

- Students study after school, often in short sessions.
- The mock test mirrors the Bluebook digital SAT: two modules per section, adaptive routing for module 2, a break, a calculator and a reference sheet.

## Capabilities and Constraints

- A single static page (`index.html` + `assets/*.js`). Progress is saved in browser storage, with optional sync when the page is opened in Claude.
- Gem, the coach, works only inside Claude using the student's own Claude account. Outside Claude it is unavailable.
- **Open decision:** a teacher view of student progress (hours, scores). It is not built, and how it would work (sharing, accounts) is undecided.

## Brand Commitments

- The name **Clearline** stays.
- The Gem coach can be renamed or turned into a mascot.
- The voice is honest and plain about scores and limits.
- The app shell (home, navigation, rewards) should feel fun, silly and unlike other websites.
- Question and mock-test screens stay calm and test-like, because they must feel like the real SAT.

## Evidence on Hand

- Question bank: `assets/bank.js`.
- Math generator: `assets/mathgen.js`.
- Vocabulary: `assets/vocab.js`.
- There are no testimonials, user counts or score-improvement claims. Do not invent any.

## Product Principles

1. Get a student practicing in one tap. Nothing is gated behind a score they don't have.
2. Be honest about scores, and never imply they are official.
3. The fun lives in the shell and the rewards. Test fidelity lives in the question screens.
4. The app is fully usable by keyboard and screen reader, including timed tests.

## Accessibility & Inclusion

WCAG AA. Timed tests need an extended-time option.
