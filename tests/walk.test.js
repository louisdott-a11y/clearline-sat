// Self-check for the Desmos walkthroughs: every Math question has one, every step is well-formed and says why,
// steps that make Desmos compute something say what it should show (tests/e2e/walk.e2e.js checks those values
// in real Desmos), no step before the last gives the answer away, and the last step's pick is the correct answer.
global.window = global;
require("../assets/bank.js");
require("../assets/mathgen.js");
require("../assets/desmos.js");
const assert = require("assert");

const isNum = (v) => typeof v === "number" || (typeof v === "string" && v.trim() !== "");
const oneSentence = (t) => typeof t === "string" && t.length > 4 && t.length <= 140 && !/[.!?]\s+[A-Z]/.test(t);
const plain = (t) => String(t).replace(/−/g, "-").replace(/\s+/g, "");
// How the answer could be written: the choice text, or the value (whole, or cut off / rounded to 2–3 places).
function answerTokens(q, pick) {
  if (q.type !== "spr") return [plain(pick)];
  const v = pick, out = new Set([String(v)]);
  if (!Number.isInteger(v)) for (const d of [2, 3]) { out.add(String(Math.round(v * 10 ** d) / 10 ** d)); out.add(String(Math.trunc(v * 10 ** d) / 10 ** d)); }
  return [...out].map(plain);
}
const has = (text, tok) => new RegExp(`(?<![\\w.-])${tok.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w.]|\\.\\d)`).test(plain(text));
// Desmos computes something when a key is a regression (~) or a bare expression (not an equation, inequality, point or list).
const computes = (k) => /~/.test(k) || (!/[=<>]/.test(k) && !/^\(|^midpoint/.test(k));

function check(q, { spoilers = true } = {}) {
  const w = q.walk, at = (i) => `${q.id} step ${i + 1}`;
  assert(Array.isArray(w) && w.length >= 2, `${q.id}: needs a walkthrough of 2+ steps`);
  const pick = w[w.length - 1].pick, toks = answerTokens(q, pick);
  w.forEach((s, i) => {
    const last = i === w.length - 1;
    assert(typeof s.say === "string" && s.say.length > 4 && s.say.length < 160, `${at(i)}: say should be short`);
    assert(oneSentence(s.why), `${at(i)}: why must be one short sentence (${s.why})`);
    for (const k of s.keys || []) assert(typeof k === "string" && k.trim() && !/−/.test(k), `${at(i)}: keys must use a plain minus`);
    if (s.table) assert(s.table.length === 2 && s.table[0].length === s.table[1].length && s.table.flat().every(Number.isFinite), `${at(i)}: bad table`);
    if (s.view) assert(s.view.length === 4 && s.view.every(Number.isFinite) && s.view[0] < s.view[1] && s.view[2] < s.view[3], `${at(i)}: bad view ${s.view}`);
    const marks = !s.mark ? [] : Array.isArray(s.mark[0]) ? s.mark : [s.mark];
    for (const m of marks) assert(m.length === 3 && isNum(m[0]) && isNum(m[1]) && typeof m[2] === "string", `${at(i)}: bad mark`);
    // Every computed value has an expected value, so the browser test can check Desmos shows it.
    const computed = (s.keys || []).filter(computes);
    if (computed.some((k) => /~/.test(k))) assert(s.shows && Object.keys(s.shows).some((n) => n !== "="), `${at(i)}: regression needs shows`);
    if (computed.some((k) => !/~/.test(k))) assert(s.shows && "=" in s.shows, `${at(i)}: computed value needs shows["="]`);
    assert(last === ("pick" in s), `${q.id}: only the last step has a pick`);
    assert(last || (!s.ask && !s.tip), `${at(i)}: ask and tip belong on the last step`);
    if (s.tip) assert(oneSentence(s.tip.replace(/^Faster: /, "")), `${at(i)}: tip must be one line`);
    // No spoilers: until the last step, nothing Gem writes states the answer.
    if (!last && spoilers) {
      for (const t of [s.say, s.why, ...marks.map((m) => m[2])]) for (const tok of toks) assert(!has(t, tok), `${at(i)} gives away the answer (${tok}): "${t}"`);
      // A key that is the right choice (typed as x = …, y = … or a point) gives it away too.
      if (q.type !== "spr") for (const k of s.keys || []) assert(plain(k.replace(/^[xy] = /, "")).replace(/sqrt\(x\)/, "√x").replace(/\^2/g, "²") !== toks[0], `${at(i)} types the right choice: ${k}`);
    }
  });
  if (q.type === "spr") assert(typeof pick === "number" && Math.abs(pick - q.accept[0]) < 1e-9, `${q.id}: walkthrough ends on ${pick}, answer is ${q.accept[0]}`);
  else assert.strictEqual(pick, q.choices[q.answer], `${q.id}: walkthrough ends on "${pick}", answer is "${q.choices[q.answer]}"`);
}

const bankMath = window.CL_BANK.items.filter((q) => q.section === "math");
bankMath.forEach((q) => check(q));
window.CL_DESMOS.questions.forEach((q) => check(q));
// Generated numbers can match the answer by coincidence (x = 2 when the answer is 2), so they're checked for shape only.
let gens = 0;
for (const g of window.CL_MATH.GENS) for (let seed = 1; seed <= 200; seed++) { const q = window.CL_MATH.make(g.id, seed); if (q) { check(q, { spoilers: false }); gens++; } }
console.log(`walk ok: ${bankMath.length} bank + ${window.CL_DESMOS.questions.length} Desmos + ${gens} generated walkthroughs: why on every step, no early answers, right final answer`);
