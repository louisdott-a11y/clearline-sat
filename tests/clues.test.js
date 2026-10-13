// Self-check: every clue sits inside one rendered text run of its question (passage, notes, second text or prompt).
global.window = global;
require("../assets/bank.js");
require("../assets/clues.js");
const assert = require("assert");
const items = Object.fromEntries(window.CL_BANK.items.map((q) => [q.id, q]));
const rw = window.CL_BANK.items.filter((q) => q.section === "rw");
for (const [id, clue] of Object.entries(window.CL_CLUES)) {
  const q = items[id];
  assert(q, `clue for unknown question ${id}`);
  const runs = [...(q.passage || []), ...(q.list || []), q.passage2 || "", q.prompt].flatMap((s) => s.split(/\{blank\}|\{u\}|\{\/u\}/));
  assert(runs.some((r) => r.includes(clue)), `${id}: clue not found in one text run: "${clue}"`);
}
assert.strictEqual(rw.filter((q) => !window.CL_CLUES[q.id]).length, 0, "every R&W question has a clue");
console.log(`clues ok: ${Object.keys(window.CL_CLUES).length} clues for ${rw.length} R&W questions`);
