// Self-check for the Desmos walkthroughs: every Math question has one, every step is well-formed,
// and the last step's pick is the question's correct answer (choice text, or the typed value).
global.window = global;
require("../assets/bank.js");
require("../assets/mathgen.js");
require("../assets/desmos.js");
const assert = require("assert");

const isNum = (v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "");
function check(q) {
  const w = q.walk;
  assert(Array.isArray(w) && w.length >= 2, `${q.id}: needs a walkthrough of 2+ steps`);
  w.forEach((s, i) => {
    assert(typeof s.say === "string" && s.say.length > 4 && s.say.length < 160, `${q.id} step ${i + 1}: say should be one short sentence`);
    for (const k of s.keys || []) assert(typeof k === "string" && k.trim() && !/−/.test(k), `${q.id} step ${i + 1}: keys must use a plain minus`);
    if (s.table) assert(s.table.length === 2 && s.table[0].length === s.table[1].length && s.table.flat().every(Number.isFinite), `${q.id} step ${i + 1}: bad table`);
    if (s.view) assert(s.view.length === 4 && s.view.every(Number.isFinite) && s.view[0] < s.view[1] && s.view[2] < s.view[3], `${q.id} step ${i + 1}: bad view ${s.view}`);
    if (s.mark) for (const m of Array.isArray(s.mark[0]) ? s.mark : [s.mark]) assert(m.length === 3 && isNum(m[0]) && isNum(m[1]) && typeof m[2] === "string", `${q.id} step ${i + 1}: bad mark`);
    assert((i === w.length - 1) === ("pick" in s), `${q.id}: only the last step has a pick`);
  });
  const pick = w[w.length - 1].pick;
  if (q.type === "spr") assert(typeof pick === "number" && Math.abs(pick - q.accept[0]) < 1e-9, `${q.id}: walkthrough ends on ${pick}, answer is ${q.accept[0]}`);
  else assert.strictEqual(pick, q.choices[q.answer], `${q.id}: walkthrough ends on "${pick}", answer is "${q.choices[q.answer]}"`);
}

const bankMath = window.CL_BANK.items.filter((q) => q.section === "math");
bankMath.forEach(check);
window.CL_DESMOS.questions.forEach(check);
let gens = 0;
for (const g of window.CL_MATH.GENS) for (let seed = 1; seed <= 200; seed++) { const q = window.CL_MATH.make(g.id, seed); if (q) { check(q); gens++; } }
console.log(`walk ok: ${bankMath.length} bank + ${window.CL_DESMOS.questions.length} Desmos + ${gens} generated questions end on the right answer`);
