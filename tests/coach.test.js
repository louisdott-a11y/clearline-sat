// Self-check for Coach ("Walk me through it"): for every question, the plan only asks the student to rule out wrong
// choices, every wrong choice has a reason to show, the plan ends on the keyed answer, and no step shown before the
// end gives the answer away (Math steps come from the walkthroughs, which tests/walk.test.js already checks).
global.window = global;
require("../assets/bank.js");
require("../assets/mathgen.js");
require("../assets/desmos.js");
require("../assets/coach.js");
const assert = require("assert");

const norm = (t) => String(t).toLowerCase().replace(/[“”"’'.,;:!?()]/g, "").replace(/\s+/g, " ").trim();
function check(q) {
  const p = window.CL_COACH.plan(q);
  assert(Array.isArray(p.hints) && p.hints.every((h) => typeof h === "string" && h.length > 4), `${q.id}: hints must be text`);
  if (q.section === "math") assert(p.desmos, `${q.id}: Math Coach should follow the walkthrough`);
  else assert(p.hints.length === Math.max(0, q.steps.length - 1), `${q.id}: R&W Coach must hold back the last step`);
  if (q.type === "spr") { assert(p.answer === null && p.wrong.length === 0, `${q.id}: typed answers have nothing to rule out`); return; }
  assert.strictEqual(p.answer, q.answer, `${q.id}: Coach must end on the keyed answer`);
  assert.strictEqual(p.wrong.length, q.choices.length - 1, `${q.id}: every other choice can be ruled out`);
  for (const w of p.wrong) {
    assert(w.i !== q.answer, `${q.id}: Coach offers the right answer as wrong`);
    assert(w.why.length > 4, `${q.id}: choice ${"ABCD"[w.i]} has no reason to show`);
  }
  // R&W: a step shown early must not contain the right choice's wording. Only checked when that wording is
  // distinctive: in punctuation questions every choice shares the same word ("objects;" vs "objects:").
  const key = norm(q.choices[q.answer]);
  const unique = !q.choices.some((c, i) => i !== q.answer && norm(c).includes(key));
  if (q.section === "rw" && key.length >= 6 && unique) for (const h of p.hints) assert(!norm(h).includes(key), `${q.id}: early step gives away "${q.choices[q.answer]}": ${h}`);
}

const bank = window.CL_BANK.items;
bank.forEach(check);
window.CL_DESMOS.questions.forEach(check);
let gens = 0;
for (const g of window.CL_MATH.GENS) for (let seed = 1; seed <= 200; seed++) { const q = window.CL_MATH.make(g.id, seed); if (q) { check(q); gens++; } }
console.log(`coach ok: ${bank.length} bank + ${window.CL_DESMOS.questions.length} Desmos + ${gens} generated questions: only wrong choices to rule out, a reason for each, ends on the key, no early answers`);
