// Self-check for the AP course data (assets/ap.js): every built topic has questions, every question is complete,
// answers spread across A-D, every graph draws, and nothing copied in by mistake (class names, sources) slips through.
global.window = global;
require("../assets/ap.js");
const assert = require("assert");
const fs = require("fs");
const { courses, plot, cross } = window.CL_AP;
const C = courses.macro;

assert.deepStrictEqual(C.units.map((u) => u.n), [1, 2, 3, 4, 5, 6], "six CED units in order");
assert.deepStrictEqual(C.units.map((u) => u.topics.length), [6, 7, 9, 0, 0, 0], "units 1-3 built, 4-6 coming soon");
assert(C.units.slice(3).every((u) => u.soon), "units 4-6 marked coming soon");
const topics = C.units.flatMap((u) => u.topics.map(([t]) => t));
assert.deepStrictEqual(C.units[2].topics.map(([t]) => t), ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9"], "Unit 3 topics 3.1-3.9");
for (const t of topics) assert(C.questions.filter((q) => q.t === t).length >= 8, `topic ${t} has about 10 questions`);

const ids = new Set();
function drawable(g, where) {
  assert(typeof g.alt === "string" && g.alt.length > 10, `${where}: graph alt text`);
  const p = plot(g);
  assert(p.shapes.length > 0 && p.x && p.y, `${where}: graph draws`);
  for (const s of p.shapes) for (const k of ["x", "y", "x1", "y1", "x2", "y2"]) if (k in s) assert(Number.isFinite(s[k]), `${where}: finite ${k}`);
  return JSON.stringify(p.shapes);
}
for (const q of C.questions) {
  assert(!ids.has(q.id), `${q.id}: unique id`); ids.add(q.id);
  assert(topics.includes(q.t), `${q.id}: known topic`);
  assert.strictEqual(q.choices.length, 4, `${q.id}: 4 choices`);
  assert.strictEqual(q.why.length, 4, `${q.id}: an explanation for every choice`);
  assert(q.answer >= 0 && q.answer < 4, `${q.id}: answer in range`);
  if (q.g) drawable(q.g, q.id);
  if (typeof q.choices[0] !== "string") assert.strictEqual(new Set(q.choices.map((c, i) => drawable(c.g, `${q.id} choice ${i}`))).size, 4, `${q.id}: graph choices look different`);
}
const byLetter = [0, 1, 2, 3].map((i) => C.questions.filter((q) => q.answer === i).length);
assert(byLetter.every((n) => n > C.questions.length * 0.18), `answers spread A-D: ${byLetter}`);
for (const f of C.frqs) {
  assert([1, 2, 3].includes(f.unit) && f.parts.length && f.parts.every((p) => p.pts.length), `${f.id}: frq shape`);
  for (const p of f.parts) if (p.model) drawable(p.model, f.id);
}
for (const u of [1, 2, 3]) assert(C.frqs.some((f) => f.unit === u), `unit ${u} has a free-response prompt`);

// Geometry: AD and SRAS at the middle meet on LRAS; a recessionary gap sits left of it; self-adjustment returns to it at a lower PL.
assert.deepStrictEqual(cross(0, 0), { x: 50, y: 50 });
assert(cross(-1, 0).x < 50 && cross(-1, 1).x === 50 && cross(-1, 1).y < 50);
assert.deepStrictEqual(plot({ k: "adas", ad: 0, sras: 0, lras: 0 }).xl, [[50, "Y1 = Yf"]], "labels at the same spot merge");

// Original content only: no copied sources, class codes or teacher names, and the site's no-em-dash rule.
const src = fs.readFileSync(require.resolve("../assets/ap.js"), "utf8");
assert(!/nearpod|ap classroom|class code|\b(mr|mrs|ms|dr)\.\s|\bperiod \d/i.test(src), "no copied sources, class codes or teacher names");
assert(!/—/.test(src), "no em dashes");
console.log(`ap ok: ${C.questions.length} questions over ${topics.length} topics, answers A-D ${byLetter.join("/")}, ${C.frqs.length} free-response prompts`);
