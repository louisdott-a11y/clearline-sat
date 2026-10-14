// Clearline SAT: the read-only progress report a student downloads and sends to a teacher.
// One self-contained HTML file (no scripts, no network), so it opens anywhere and can't change anything.
window.CL_REPORT = (() => {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pct = (r) => (r == null ? "—" : Math.round(r * 100) + "%");
  const table = (head, rows, empty, numFrom = 1) => rows.length
    ? `<table><thead><tr>${head.map((h, i) => `<th${i >= numFrom ? ' class="n"' : ""}>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i >= numFrom ? ' class="n"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
    : `<p class="soft">${esc(empty)}</p>`;
  // d: { name, generated, time: {total, last7, last30}, estimate: {total, rw, math, basis} | null, target,
  //      scores: [{label, rw, math}], skills: [{skill, area, rate, total}], weakest: [same], days: [{date, time, questions, rate}] }
  function html(d) {
    const who = d.name ? `${esc(d.name)}'s` : "Student";
    const est = d.estimate
      ? `<div class="big">${esc(d.estimate.total)}</div><p class="soft">Reading and Writing ${esc(d.estimate.rw)} · Math ${esc(d.estimate.math)}<br>Based on: ${esc(d.estimate.basis)}</p>`
      : `<div class="big">—</div><p class="soft">No practice test or imported score yet.</p>`;
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${who} SAT progress · Clearline</title>
<style>
:root{--bg:#f5f1e4;--card:#fffcf2;--ink:#2c2e2a;--soft:#5c5e55;--line:#d9d1b8;--coral:#ff705d;--sky:#2ba0ff;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#141813;--card:#1c211a;--ink:#f5f1e4;--soft:#b9b5a6;--line:#343c30;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Segoe UI",system-ui,-apple-system,sans-serif}
main{max-width:860px;margin:0 auto;padding:28px 16px 48px}h1{font-size:30px;line-height:1.1;margin:0 0 4px;letter-spacing:-.02em}h2{font-size:18px;margin:0 0 10px}
.soft{color:var(--soft);margin:4px 0 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px;margin:18px 0}
section,.tile{background:var(--card);border:2px solid var(--ink);border-radius:16px;padding:16px 18px}section{margin-top:14px}
.tile small{display:block;color:var(--soft);font-size:12.5px}.tile b,.big{font-size:30px;font-weight:800;font-variant-numeric:tabular-nums}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{text-align:left;padding:7px 6px;border-bottom:1px solid var(--line)}th{font-size:12.5px;color:var(--soft);font-weight:600}.n{text-align:right}
.note{font-size:12.5px;color:var(--soft);margin-top:22px}@media print{body{background:#fff}section,.tile{break-inside:avoid}}
</style></head><body><main>
<h1>${who} SAT progress</h1>
<p class="soft">Read-only report made in Clearline on ${esc(d.generated)}. It's a snapshot: it won't update on its own.</p>
<div class="grid">
<div class="tile"><small>Time practiced, all time</small><b>${esc(d.time.total)}</b></div>
<div class="tile"><small>Last 7 days</small><b>${esc(d.time.last7)}</b></div>
<div class="tile"><small>Last 30 days</small><b>${esc(d.time.last30)}</b></div>
<div class="tile"><small>Questions answered</small><b>${esc(d.answered)}</b></div>
</div>
<section><h2>Score estimate</h2>${est}${d.target ? `<p class="soft">Target: ${esc(d.target)}</p>` : ""}
<p class="soft">An estimate from Clearline's practice tests and any scores the student entered. Not an official College Board score.</p>
${d.scores.length ? table(["Test", "R&W", "Math", "Total"], d.scores.map((s) => [s.label, s.rw, s.math, s.rw + s.math]), "") : ""}</section>
<section><h2>Weakest skills</h2>${table(["Skill", "Area", "Accuracy", "Answered"], d.weakest.map((s) => [s.skill, s.area, pct(s.rate), s.total]), "Not enough answers yet to rank skills (3 or more per skill).", 2)}</section>
<section><h2>Accuracy by skill</h2>${table(["Skill", "Area", "Accuracy", "Answered"], d.skills.map((s) => [s.skill, s.area, pct(s.rate), s.total]), "No questions answered yet.", 2)}</section>
<section><h2>Recent activity (last 14 days)</h2>${table(["Day", "Time", "Questions", "Accuracy"], d.days.map((x) => [x.date, x.time, x.questions, pct(x.rate)]), "No activity in the last 14 days.")}</section>
<p class="note">Time counts while Clearline is open and the student is active. Clearline has no accounts: the student made this file from their own browser and chose to share it.</p>
</main></body></html>`;
  }
  return { html, esc };
})();
