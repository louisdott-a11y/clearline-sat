// Self-check for the hand-written bank: every R&W item is complete, and the Module 2 hard set (h*) is balanced and distinct.
global.window = global;
require("../assets/bank.js");
const assert = require("assert");
const rw = window.CL_BANK.items.filter((q) => q.section === "rw");
assert.strictEqual(new Set(window.CL_BANK.items.map((q) => q.id)).size, window.CL_BANK.items.length, "ids are unique");
for (const q of rw) {
  assert.strictEqual(q.choices.length, 4, `${q.id}: 4 choices`);
  assert.strictEqual(new Set(q.choices).size, 4, `${q.id}: choices differ`);
  assert(q.answer >= 0 && q.answer < 4, `${q.id}: answer in range`);
  assert(q.steps.length >= 1, `${q.id}: has steps`);
  for (let i = 0; i < 4; i++) if (i !== q.answer) assert(q.why[i] && q.why[i].length > 10, `${q.id}: reason for wrong choice ${"ABCD"[i]}`);
  assert(!q.why[q.answer], `${q.id}: no wrong-choice reason on the answer`);
}
const hard = rw.filter((q) => /^h\d+$/.test(q.id));
assert.strictEqual(hard.length, 30, "30 Module 2 hard items");
assert(hard.every((q) => q.diff === 3 && q.placed && q.skill), "hard items are diff 3, placed, with a skill");
const byLetter = [0, 1, 2, 3].map((i) => hard.filter((q) => q.answer === i).length);
assert(Math.max(...byLetter) - Math.min(...byLetter) <= 1, `answers spread A–D: ${byLetter}`);
const skills = {}; for (const q of hard) skills[q.skill] = (skills[q.skill] || 0) + 1;
assert.strictEqual(Object.keys(skills).length, 10, "every R&W skill covered");
assert(Object.values(skills).every((n) => n === 3), "3 per skill");
// Near-duplicates: word overlap (Jaccard) of passage, notes and choices (shared stock prompts left out) against every other R&W item.
const words = (q) => new Set([...q.passage, ...(q.list || []), ...q.choices].join(" ").toLowerCase().match(/[a-z']{4,}/g));
const jac = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n / (a.size + b.size - n); };
for (const h of hard) for (const q of rw) if (q !== h) { const j = jac(words(h), words(q)); assert(j < 0.3, `${h.id} and ${q.id} look alike (${j.toFixed(2)})`); }
console.log(`bank ok: ${rw.length} R&W items; hard set answers A–D ${byLetter.join("/")}`);
