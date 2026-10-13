// Self-check for the math display pattern in app.js: what stacks as a fraction, what stays as written.
const fs = require("fs");
const assert = require("assert");
const src = fs.readFileSync(__dirname + "/../assets/app.js", "utf8");
const grab = (name) => src.match(new RegExp(`const ${name} = (String\\.raw\`[^\`]*\`|new RegExp\\(.*\\));`))[1];
const PAREN = eval(grab("PAREN")), BARE = eval(grab("BARE"));
const MATH_RE = eval(grab("MATH_RE")); // evaluated with PAREN and BARE in scope, exactly as app.js builds it
const fracs = (s) => [...s.matchAll(MATH_RE)].filter((m) => !m[1] && !(/^[a-zA-Z]+$/.test(m[2]) && /^[a-zA-Z]+$/.test(m[3]) && (m[2].length > 1 || m[3].length > 1))).map((m) => `${m[2]} | ${m[3]}`);
const sups = (s) => [...s.matchAll(MATH_RE)].filter((m) => m[1]).map((m) => m[1]);

assert.deepStrictEqual(fracs("like (r, (3r − 6)/2). As r changes"), ["(3r − 6) | 2"]);
assert.deepStrictEqual(fracs("C = 5(F − 32)/9"), ["5(F − 32) | 9"]);
assert.deepStrictEqual(fracs("Slope = (16 − 7)/(4 − 1) = 3."), ["(16 − 7) | (4 − 1)"]);
assert.deepStrictEqual(fracs("(x − 3)(x + 3)/(x + 3) = x − 3"), ["(x − 3)(x + 3) | (x + 3)"]);
assert.deepStrictEqual(fracs("1/2 + 1/3 = 5/6."), ["1 | 2", "1 | 3", "5 | 6"]);
assert.deepStrictEqual(fracs("−8/3 and 64π/3 and 2r/3"), ["8 | 3", "64π | 3", "2r | 3"]);
assert.deepStrictEqual(fracs("b = at/(a − t)"), ["at | (a − t)"]);
assert.deepStrictEqual(fracs("speed in km/h, and/or more"), []);
assert.deepStrictEqual(fracs("f(x)/2"), ["f(x) | 2"]);
assert.deepStrictEqual(fracs("1/cos A"), []);
assert.deepStrictEqual(sups("x^(1/2) and y^3"), ["(1/2)", "3"]);

global.window = global;
require("../assets/bank.js"); require("../assets/mathgen.js"); require("../assets/desmos.js");
const texts = [];
for (const q of [...window.CL_BANK.items, ...window.CL_DESMOS.questions]) texts.push(q.prompt, ...(q.passage || []), ...(q.plain ? [] : q.choices || []), ...q.steps, ...Object.values(q.why || {}), ...(q.desmos || []).map((t) => t.replace(/`[^`]*`/g, "")));
for (const g of window.CL_MATH.GENS) for (let seed = 1; seed < 8; seed++) { const q = window.CL_MATH.make(g.id, seed); texts.push(q.prompt, ...(q.passage || []), ...(q.choices || []), ...q.steps, ...Object.values(q.why || {})); }
for (const L of window.CL_DESMOS.lessons) texts.push(...L.body, L.watch);
const left = new Set();
for (const t of texts.filter(Boolean)) { const shown = String(t).replace(MATH_RE, " "); for (const m of shown.matchAll(/\S*\/\S*/g)) left.add(m[0]); }
console.log(`math ok: patterns pass; slashes still shown as written: ${[...left].join("  ") || "none"}`);
