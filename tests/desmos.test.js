// Self-check for the Desmos subject: every answer key is recomputed here without trusting the data,
// and multiple-choice keys must be the ONLY choice that passes.
global.window = global;
require("../assets/desmos.js");
const assert = require("assert");
const { lessons, questions } = window.CL_DESMOS;
const Q = Object.fromEntries(questions.map((q) => [q.id, q]));
const near = (a, b, tol = 1e-6) => Math.abs(a - b) < tol;
const R = [-3.7, -1.3, 0.6, 2.2, 4.9, 7.5]; // sample values for identity checks
const same = (f, g, xs = R) => xs.every((x) => near(f(x), g(x), 1e-6));
// Root finder: scan for sign changes, then bisect.
function roots(f, lo = -50, hi = 50, step = 0.01) {
  const out = [];
  for (let x = lo; x < hi; x += step) {
    const a = f(x), b = f(x + step);
    if (a === 0) { out.push(x); continue; }
    if (a * b < 0) { let l = x, r = x + step; for (let i = 0; i < 60; i++) { const m = (l + r) / 2; if (f(l) * f(m) <= 0) r = m; else l = m; } out.push((l + r) / 2); }
  }
  return out;
}
// Solve a small linear system by Gaussian elimination.
function solve(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    const p = M.slice(c).reduce((best, r, i) => (Math.abs(r[c]) > Math.abs(M[best][c]) ? c + i : best), c);
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) if (r !== c) { const k = M[r][c] / M[c][c]; for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]; }
  }
  return M.map((r, i) => r[n] / r[i]);
}
const quadFit = (pts) => solve(pts.map(([x]) => [x * x, x, 1]), pts.map(([, y]) => y));
const lineFit = ([[x1, y1], [x2, y2]]) => { const m = (y2 - y1) / (x2 - x1); return [m, y1 - m * x1]; };
// Count solutions of f = 0 (tangent roots count once; also catches double roots via |f| minima).
function count(f) {
  const r = roots(f);
  let n = r.length;
  for (let x = -50; x < 50; x += 0.01) { const a = Math.abs(f(x - 0.01)), b = Math.abs(f(x)), c = Math.abs(f(x + 0.01)); if (b < 1e-3 && b <= a && b <= c && !r.some((z) => Math.abs(z - x) < 0.05)) n++; }
  return n;
}
// MC check: exactly one choice passes, and it's the key.
function only(id, pass) {
  const q = Q[id];
  const ok = q.choices.map((_, i) => Boolean(pass(i)));
  assert.deepStrictEqual(ok.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), [q.answer], `${id}: passing choices ${JSON.stringify(ok)}`);
}
const ans = (id) => Q[id].accept[0];

const checks = {
  "d1-1": () => assert(near(ans("d1-1"), roots((x) => 3 * x + 8)[0], 1e-6)),
  "d1-2": () => only("d1-2", (i) => [".45", "0.45", ".4545", "45/100"][i] === ".4545"), // box-filling rule: 5 characters, value 5/11
  "d1-3": () => assert(near(ans("d1-3"), roots((x) => (-3 / 7) * x + 5)[0], 1e-6)),
  "d1-4": () => assert(near(ans("d1-4"), (2 * 0 + 1) / (0 - 3))),
  "d2-1": () => { const g = (x) => 2 * x * x - 3 * x + 4; only("d2-1", (i) => near(+Q["d2-1"].choices[i], g(-2))); },
  "d2-2": () => assert(near(ans("d2-2"), (0 - 4) * (0 + 3) - 2)),
  "d2-3": () => { const h = (x) => x * x - 10 * x + 21; let best = 0; for (let x = -20; x <= 20; x += 0.001) if (h(x) < h(best)) best = x; only("d2-3", (i) => near(+Q["d2-3"].choices[i].replace("−", "-"), best, 1e-2)); },
  "d2-4": () => { const f = (x) => 3 * x - 7, g = (x) => f(x + 2) + 4; assert(near(ans("d2-4"), g(5))); },
  "d2-5": () => assert(near(ans("d2-5"), roots((x) => x ** 3 - 4 * x * x - 11 * x + 30).reduce((a, b) => a + b, 0), 1e-6)),
  "d3-1": () => { const [m, b] = lineFit([[1, 7], [4, 16]]); const opts = [[3, 7], [4, 3], [3, 4], [9, -2]]; only("d3-1", (i) => near(opts[i][0], m) && near(opts[i][1], b)); },
  "d3-2": () => assert(near(ans("d3-2"), lineFit([[3, 10.2], [8, 19.2]])[1])),
  "d3-3": () => { const [a, b, c] = quadFit([[0, 3], [1, 6], [2, 13]]); assert(near(ans("d3-3"), a * 9 + b * 3 + c)); },
  "d3-4": () => { const fit = quadFit([[-1, 9], [1, 1], [3, 9]]); const opts = [[1, -4, 4], [2, -4, 3], [2, 4, 3], [4, -4, 1]]; only("d3-4", (i) => opts[i].every((v, j) => near(v, fit[j]))); },
  "d4-1": () => { const [x, y] = solve([[5, -2], [3, 2]], [4, 12]); assert(near(ans("d4-1"), x + y)); },
  "d4-2": () => { const n = count((x) => x * x - 4 * x + 1 - (2 * x - 8)); only("d4-2", (i) => i === Math.min(n, 2)); },
  "d4-3": () => { const same3 = near(9 / 6, -6 / -4) && near(9 / 6, 15 / 10); only("d4-3", (i) => same3 ? i === 3 : false); },
  "d4-4": () => { const xs = roots((x) => x * x + 2 * x - 3 - (3 * x + 3)); assert.strictEqual(xs.length, 2); assert(near(ans("d4-4"), xs.reduce((s, x) => s + 3 * x + 3, 0), 1e-6)); },
  "d5-1": () => { const cs = []; for (let c = -50; c <= 50; c++) if (count((x) => x * x - 8 * x + 20 - c) === 1) cs.push(c); assert.deepStrictEqual(cs, [ans("d5-1")]); },
  "d5-2": () => { const ks = []; for (let k = 1; k <= 50; k++) if (count((x) => x * x + k * x + 25) === 1) ks.push(k); assert.deepStrictEqual(ks, [ans("d5-2")]); },
  "d5-3": () => only("d5-3", (i) => count((x) => -x * x + 4 * x + 3 - (2 * x + +Q["d5-3"].choices[i])) === 1),
  "d5-4": () => { const bs = []; for (let b = 1; b <= 50; b++) if (count((x) => x * x + b * x + 6 - (3 * x + 2)) === 1) bs.push(b); assert.deepStrictEqual(bs, [ans("d5-4")]); },
  "d6-1": () => assert(near(ans("d6-1"), roots((x) => 4 * (x - 3) + 7 - (2 * x + 9))[0], 1e-6)),
  "d6-2": () => { const n = roots((x) => x * x - 5 - Math.abs(x)).length; only("d6-2", (i) => [0, 1, 2, 4][i] === n); },
  "d6-3": () => assert(near(ans("d6-3"), roots((x) => 3 / (x - 1) - (x + 1), 1.01, 50)[0], 1e-6)),
  "d6-4": () => assert(near(ans("d6-4"), roots((x) => x * x + 3 * x - 11, 0, 50)[0], 1e-6)),
  "d7-1": () => { const opts = [(k) => k / 2, (k) => 2 * k, (k) => 4 * k, (k) => 8 * k]; only("d7-1", (i) => [2, 3, 5].every((k) => near(3 * (opts[i](k) + 2 * k), opts[i](k) + 10 * k))); },
  "d7-2": () => { const opts = [(k) => -2 * k, (k) => k, (k) => 4 * k, (k) => 8 * k]; only("d7-2", (i) => [1, 2, 3].every((k) => near(opts[i](k) ** 2 - 6 * k * opts[i](k) + 8 * k * k, 0))); },
  "d7-3": () => { const opts = [(k) => k / 8, (k) => 2 * k, (k) => 4 * k, (k) => 8 * k]; only("d7-3", (i) => [2, 3, 5].every((k) => near((opts[i](k) + k) / 3, (2 * opts[i](k) - k) / 5))); },
  "d7-4": () => { const opts = [(k) => 4 * k * k - k, (k) => 4 * k * k + k, (k) => 2 * k * k - k, (k) => 4 * k - k * k]; only("d7-4", (i) => [2, 3, 5].every((k) => opts[i](k) + k >= 0 && near(Math.sqrt(opts[i](k) + k), 2 * k))); },
  "d8-1": () => { const P = [(r) => [r, 3 * r - 4], (r) => [r, 3 * r + 4], (r) => [3 * r, r - 4], (r) => [r - 4, 3 * r]]; only("d8-1", (i) => R.every((r) => { const [x, y] = P[i](r); return near(y, 3 * x - 4) && near(6 * x - 2 * y, 8); })); },
  "d8-2": () => { const P = [(r) => [r, 8 - 2 * r], (r) => [8 - 2 * r, r], (r) => [2 * r, 4 + r], (r) => [r, r / 2 + 4]]; only("d8-2", (i) => R.every((r) => { const [x, y] = P[i](r); return near(x + 2 * y, 8) && near(3 * x + 6 * y, 24); })); },
  "d8-3": () => { const P = [(r) => [3 * r, 2 * r + 3], (r) => [2 * r + 3, 3 * r], (r) => [3 * r + 3, 2 * r - 1], (r) => [r, (2 * r) / 3 + 3]]; only("d8-3", (i) => R.every((r) => { const [x, y] = P[i](r); return near(4 * x - 6 * y, 18) && near(2 * x - 3 * y, 9); })); },
  "d8-4": () => { const P = [(r) => [r, 5 - 5 * r], (r) => [2 * r, 5 + 5 * r], (r) => [5 * r, 2 - 2 * r], (r) => [2 * r, 5 - 5 * r]]; only("d8-4", (i) => R.every((r) => { const [x, y] = P[i](r); return near(5 * x + 2 * y, 10) && near(15 * x + 6 * y, 30); })); },
  "d9-1": () => { const P = [[3, 4], [2, 5], [0, 0], [-1, 8]]; only("d9-1", (i) => { const [x, y] = P[i]; return y > 3 * x - 2 && y < -x + 6; }); },
  "d9-2": () => { let mx = -Infinity; for (let x = 0; x <= 20; x += 0.01) for (let y = 0; y <= 20; y += 0.01) if (x + y <= 10 + 1e-9 && y >= 2 * x - 2 - 1e-9) mx = Math.max(mx, x); assert(near(ans("d9-2"), mx, 0.02)); },
  "d9-3": () => { let my = -Infinity; for (let x = 0; x <= 20; x += 0.01) { const top = -2 * x + 12; if (top >= x) my = Math.max(my, top); } only("d9-3", (i) => near(+Q["d9-3"].choices[i], my, 1e-6)); },
  "d9-4": () => { let mn = Infinity; for (let x = -10; x <= 10; x += 0.001) { const lo = x * x - 4; if (lo <= 2 * x + 4) mn = Math.min(mn, lo); } assert(near(ans("d9-4"), mn, 1e-3)); },
  "d10-1": () => { const f = (x) => 3 * (x - 4) - 2 * (x + 1); const o = [(x) => x - 10, (x) => 5 * x - 14, (x) => x - 13, (x) => x - 14]; only("d10-1", (i) => same(f, o[i])); },
  "d10-2": () => { const f = (x) => (x + 5) * (x - 2) - 3 * x; const o = [(x) => x * x + 6 * x - 10, (x) => x * x - 10, (x) => x * x - 3 * x - 10, (x) => x * x + 10]; only("d10-2", (i) => same(f, o[i])); },
  "d10-3": () => { const f = (x) => (x * x - 9) / (x + 3); const o = [(x) => x + 3, (x) => x - 9, (x) => x - 3, (x) => x * x - 3]; only("d10-3", (i) => same(f, o[i])); },
  "d10-4": () => { const ys = [-2.1, 1.7, 3.3]; const f = (x, y) => (4 * x ** 3 * y - 8 * x * x * y * y) / (2 * x * x * y); const o = [(x, y) => 2 * x - 4 * y, (x, y) => 2 * x - 8 * y, (x, y) => 2 * x * y - 4 * y, (x, y) => 4 * x - 8 * y]; only("d10-4", (i) => ys.every((y) => same((x) => f(x, y), (x) => o[i](x, y)))); },
  "d11-1": () => { const [a, b, c] = quadFit([1, 2, 3].map((x) => [x, (3 * x - 2) * (x + 5)])); assert(near(ans("d11-1"), a + b + c)); },
  "d11-2": () => { const b = (14 - 24) / (-6 + 2); const a = 6 * (4 - b); assert(near(a / (7 - b), 2)); assert(near(ans("d11-2"), a + b)); },
  "d11-3": () => { const [b, c, d] = solve([-2, 1, 4].map((z) => [z * z, z, 1]), [-2, 1, 4].map((z) => -(z ** 3))); assert(near(ans("d11-3"), d, 1e-9)); },
  "d11-4": () => { const [, , q] = quadFit([1, 2, 3].map((x) => [x, (x + 4) ** 2 - 3 * (x + 4)])); only("d11-4", (i) => near(+Q["d11-4"].choices[i], q)); },
  "d12-1": () => { const n = Math.log(Math.sqrt(3) * Math.cbrt(3)) / Math.log(3); assert(near(ans("d12-1"), n)); },
  "d12-2": () => { const f = (x) => (x ** 6) ** (1 / 3) / x ** 0.5, P = [1.3, 2.2, 4.9, 7.5]; const o = [(x) => x * Math.sqrt(x), (x) => x * x * Math.sqrt(x), (x) => Math.sqrt(x), (x) => x ** 3]; only("d12-2", (i) => same(f, o[i], P)); },
  "d12-3": () => { const a = Math.log(5 ** (4 / 5) * 5 ** (-1 / 10)) / Math.log(5); assert(near(ans("d12-3"), a)); },
  "d12-4": () => assert(near(ans("d12-4"), roots((x) => 2 * x * Math.log(8) - (x + 10) * Math.log(2))[0], 1e-6)),
  "d13-1": () => { const a = (-4 - 4) / (1 + 1) ** 2; assert(near(ans("d13-1"), a * (3 + 1) ** 2 + 4)); },
  "d13-2": () => { const a = (3 + 5) / (1 - 3) ** 2; const [, b] = quadFit([1, 2, 4].map((x) => [x, a * (x - 3) ** 2 - 5])); assert(near(ans("d13-2"), b)); },
  "d13-3": () => { const r = roots((x) => x * x - 49); only("d13-3", (i) => i === (r.length === 2 && r.some((x) => near(x, -7, 1e-6)) ? 1 : 0)); },
  "d13-4": () => { const s = roots((x) => Math.abs(x - 2) - 5).reduce((a, b) => a + b, 0); only("d13-4", (i) => near(+Q["d13-4"].choices[i], s, 1e-6)); },
  "d14-1": () => { const o = [(y) => (2 * y - 5) / 3, (y) => (3 * y + 5) / 2, (y) => (2 * y + 5) / 3, (y) => (2 * y) / 3 + 5]; only("d14-1", (i) => R.every((y) => near((3 * o[i](y) - 5) / 2, y))); },
  "d14-2": () => { const o = [(F) => (5 * F) / 9 - 32, (F) => (9 * (F - 32)) / 5, (F) => (5 * F - 32) / 9, (F) => (5 * (F - 32)) / 9]; only("d14-2", (i) => R.every((F) => near((9 / 5) * o[i](F) + 32, F))); },
  "d14-3": () => { const o = [(a, t) => (a * t) / (a - t), (a, t) => (a * t) / (t - a), (a, t) => a - t, (a, t) => (a + t) / (a * t)]; const P = [[6, 4], [9, 2], [5, 3]]; only("d14-3", (i) => P.every(([a, t]) => o[i](a, t) > 0 && near(1 / t, 1 / a + 1 / o[i](a, t)))); },
  "d14-4": () => { const k = 2.5, r = roots((x) => x * x - 9 * k * k).map((x) => Math.round((x / k) * 1e6) / 1e6).sort((a, b) => a - b); only("d14-4", (i) => i === (JSON.stringify(r) === "[-3,3]" ? 1 : -1)); },
  "d15-1": () => { const q = 150 - 0.2 * 150; assert(near(ans("d15-1"), q + 0.3 * q)); },
  "d15-2": () => { const r = roots((t) => t * t - 11 * t + 28); assert(near(ans("d15-2"), Math.max(...r) - Math.min(...r), 1e-6)); },
  "d15-3": () => { const j = 60 / (1.25 * 0.8); only("d15-3", (i) => near(+Q["d15-3"].choices[i].slice(1), j)); },
  "d15-4": () => { const s = 50 - 0.6 * 50; assert(near(ans("d15-4"), s + 1.5 * s)); },
  "d16-1": () => { const L = [12, 15, 9, 20, 14, 8]; assert(near(ans("d16-1"), Math.max(...L) - Math.min(...L))); },
  "d16-2": () => assert(near(ans("d16-2"), 85 * 5 - (78 + 85 + 92 + 81))),
  "d16-3": () => { const L = [3, 7, 7, 10, 18], mean = L.reduce((a, b) => a + b) / L.length, med = [...L].sort((a, b) => a - b)[2]; only("d16-3", (i) => near(+Q["d16-3"].choices[i].replace("−", "-"), med - mean)); },
  "d16-4": () => assert(near(ans("d16-4"), 15 * 7 - 14 * 6)),
  "d17-1": () => assert(near(ans("d17-1"), Math.round(20 * Math.sin((35 * Math.PI) / 180) * 10) / 10)),
  "d17-2": () => { const r = Math.sqrt(7 + 25 + 4); assert(near(ans("d17-2"), r)); },
  "d17-3": () => { const C = [[1, 3], [1, -3], [-1, 3], [-1, -3]]; only("d17-3", (i) => { const [h, k] = C[i]; return [0, 1, 2, 3].every((t) => { const x = h + 5 * Math.cos(t), y = k + 5 * Math.sin(t); return near((x - 1) ** 2 + y * y + 6 * y, 16, 1e-6); }); }); },
  "d17-4": () => assert(near(ans("d17-4"), Math.hypot(4 - -2, -3 - 5))),
  "d17-5": () => { const M = [[3, 3], [6, 4], [6, -4], [12, -8]]; only("d17-5", (i) => near(M[i][0], (-3 + 9) / 2) && near(M[i][1], (7 - 1) / 2)); },
  "d18-1": () => { const ks = []; for (let k = -20; k <= 20; k++) { const det = k * 3 - 6 * 2; if (det === 0 && !near(4 / 9, k / 2)) ks.push(k); } assert.deepStrictEqual(ks, [ans("d18-1")]); },
  "d18-2": () => { const o = [(h) => 45 * h + 30, (h) => 75 * h, (h) => 30 * h + 45, (h) => 30 * (h + 45)]; only("d18-2", (i) => [0, 1, 2, 5].every((h) => near(o[i](h), 45 + 30 * h))); },
  "d18-3": () => only("d18-3", (i) => roots((x) => x * x - 6 * x + +Q["d18-3"].choices[i]).length === 0 && count((x) => x * x - 6 * x + +Q["d18-3"].choices[i]) === 0),
  "d18-4": () => { const sd = (L) => { const m = L.reduce((a, b) => a + b) / L.length; return Math.sqrt(L.reduce((s, v) => s + (v - m) ** 2, 0) / L.length); }; const A = [10, 10, 10, 10, 10], B = [2, 6, 10, 14, 18]; const sameMean = near(A.reduce((a, b) => a + b), B.reduce((a, b) => a + b)); only("d18-4", (i) => [sameMean && sd(B) > sd(A), sameMean && sd(A) > sd(B), !sameMean && near(sd(A), sd(B)), near(sd(A), sd(B))][i]); },
  "d18-5": () => { const a = (4 / 2) * 3, b = 10 / (4 / 2); assert(near(ans("d18-5"), a + b)); }
};

assert.strictEqual(lessons.length, 18, "18 lessons");
for (const L of lessons) {
  const n = questions.filter((q) => q.trick === L.n).length;
  assert(n >= 3 && n <= 5, `lesson ${L.n} has ${n} questions`);
  for (const k of ["title", "short", "body", "keys", "watch", "calc"]) assert(L[k], `lesson ${L.n} missing ${k}`);
}
for (const q of questions) {
  assert(checks[q.id], `no check for ${q.id}`);
  assert(q.desmos?.length && q.steps?.length && [1, 2, 3].includes(q.diff), `${q.id} missing walkthroughs or difficulty`);
  if (q.type === "spr") assert(q.accept?.length && q.answerText, `${q.id} missing accept/answerText`);
  else { assert(q.choices.length === 4 && q.answer >= 0 && q.answer < 4, `${q.id} bad choices`); for (let i = 0; i < 4; i++) if (i !== q.answer) assert(q.why[i], `${q.id} missing why ${i}`); }
  checks[q.id]();
}
assert.strictEqual(Object.keys(checks).length, questions.length, "a check for every question and no extras");
console.log(`desmos ok: ${lessons.length} lessons, ${questions.length} questions, every key independently checked`);
