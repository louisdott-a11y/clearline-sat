// Self-check for vocab Learn mode: every example sentence holds its word, so the blank always lands.
global.window = global;
require("../assets/vocab.js");
const assert = require("assert");
for (const v of window.CL_VOCAB) {
  const stem = v.w.slice(0, Math.max(4, v.w.length - 2)).toLowerCase(); // same rule as learnItem in app.js
  const tok = v.ex.split(/\s+/).map((t) => t.replace(/[^A-Za-z]/g, "")).find((t) => t.toLowerCase().startsWith(stem));
  assert(tok, `${v.w}: example sentence doesn't contain the word`);
  assert(tok.toLowerCase() === v.w || tok.toLowerCase() === v.w + "d" || tok.toLowerCase() === v.w + "ed", `${v.w}: example uses "${tok}", a form Learn can't match`);
}
assert(window.CL_VOCAB.length >= 6, "Match needs 6 words");
console.log(`vocab ok: ${window.CL_VOCAB.length} words blank cleanly`);
