// Self-check for the teacher report: every section renders, user text is escaped, and the file runs no scripts.
global.window = global;
require("../assets/report.js");
const assert = require("assert");
const base = { name: "", generated: "Oct 13, 2026", time: { total: "3h 10m", last7: "1h", last30: "3h 10m" }, answered: 0, estimate: null, target: "", scores: [], skills: [], weakest: [], days: [] };
const empty = window.CL_REPORT.html(base);
for (const h of ["Score estimate", "Weakest skills", "Accuracy by skill", "Recent activity", "Not an official College Board score"]) assert(empty.includes(h), `has ${h}`);
const full = window.CL_REPORT.html({ ...base, name: `<script>alert(1)</script>`, answered: 12,
  estimate: { total: 1210, rw: 610, math: 600, basis: "Clearline practice test" }, target: "1400",
  scores: [{ label: "SAT (official) · Aug 23, 2026", rw: 580, math: 570 }],
  skills: [{ skill: "Transitions", area: "Expression of Ideas", rate: 0.5, total: 4 }], weakest: [{ skill: "Transitions", area: "Expression of Ideas", rate: 0.5, total: 4 }],
  days: [{ date: "Mon, Oct 12", time: "25m", questions: 12, rate: 0.75 }] });
assert(!/<script/i.test(full), "no script tags, and the name is escaped");
assert(full.includes("&lt;script&gt;"), "name shown as text");
for (const v of ["1210", "1150", "50%", "75%", "Transitions"]) assert(full.includes(v), `shows ${v}`);
console.log("report ok");
