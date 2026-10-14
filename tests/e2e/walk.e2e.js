// Browser check for the Desmos walkthroughs (needs network for Desmos, so it isn't part of npm test).
// Run: npm start (in another terminal), then  PW=/path/to/node_modules/playwright node tests/e2e/walk.e2e.js
// 1. Every step of every walkthrough, in real Desmos: no expression errors, the values Desmos shows match the
//    step's `shows`, and no highlighted point sits under Desmos's trial-key notice. (SKIP_PARSE=1 skips this slow part.)
// 2. The flow on desktop and phone, light and dark: Back/Next, the answer hidden until answered or Show answer,
//    a double-click guard, a fixed footer, Try it yourself, Show me again, switching questions, refresh, lesson pages.
//    Screenshots go to $OUT (default: tests/e2e/out).
const { chromium, devices } = require(process.env.PW || "playwright");
const assert = require("assert");
const fs = require("fs");
const URL = process.env.URL || "http://localhost:8000/";
const OUT = process.env.OUT || __dirname + "/out";
fs.mkdirSync(OUT, { recursive: true });
global.window = global;
require("../../assets/bank.js"); require("../../assets/mathgen.js"); require("../../assets/desmos.js");

// Keep the app's Desmos instance reachable from the test.
const hook = () => {
  let D;
  const wrap = () => { const G = D?.GraphingCalculator; if (G && !G.__w) { D.GraphingCalculator = Object.assign((...a) => (window.__calc = G(...a)), { __w: true }); } };
  Object.defineProperty(window, "Desmos", { configurable: true, get: () => (wrap(), D), set: (v) => { D = v; } });
};
async function openWalk(page, id, i, extra = {}) {
  await page.evaluate(([w]) => sessionStorage.setItem("cl-walk", JSON.stringify(w)), [{ id, i, ...extra }]);
  await page.reload();
  await page.waitForSelector(".dock.walk .wt");
  await page.waitForFunction(() => window.__calc && document.querySelector(".dock.walk .desmos"));
  await page.waitForTimeout(250);
}
const stepText = (page) => page.locator(".wt-top .tiny").innerText();
// In the page: expression errors, the values Desmos shows for `shows`, and marks hidden under the trial notice.
const inspect = (page, shows, lastId) => page.evaluate(async ([shows, lastId]) => {
  const c = window.__calc, sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(150);
  const errors = Object.entries(c.expressionAnalysis).filter(([, a]) => a.isError).map(([id, a]) => `${id}: ${a.errorMessage}`);
  const got = {};
  for (const name of Object.keys(shows || {})) {
    const h = name === "=" ? null : c.HelperExpression({ latex: name.replace(/([a-z])(\d)/g, "$1_$2") });
    for (let t = 0; t < 30; t++) {
      const v = h ? h.numericValue : c.expressionAnalysis[lastId]?.evaluation?.value;
      if (v != null && !(typeof v === "number" && Number.isNaN(v))) { got[name] = v; break; }
      await sleep(100);
    }
  }
  const el = document.querySelector(".dock.walk .desmos"), note = el?.querySelector(".dcg-api-trial-notice"), hidden = [];
  if (note && note.getClientRects().length && c.settings.graphpaper) {
    const box = el.getBoundingClientRect(), r = note.getBoundingClientRect();
    for (const e of c.getExpressions().filter((e) => /^mk/.test(e.id))) {
      const m = /^\(([-\d.e]+),([-\d.e]+)\)$/.exec(e.latex);
      if (!m) continue;
      const p = c.mathToPixels({ x: +m[1], y: +m[2] }), x = p.x + box.left, y = p.y + box.top;
      if (x > r.left && x < r.right && y > r.top && y < r.bottom) hidden.push(e.label);
    }
  }
  return { errors, got, hidden };
}, [shows, lastId]);
const near = (a, b) => (Array.isArray(b) ? Array.isArray(a) && a.length === b.length && a.every((v, i) => near(v, b[i])) : Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)));

(async () => {
  const browser = await chromium.launch();
  const logs = [];

  // ---- 1. every step of every walkthrough in real Desmos (phone size, where the notice sits over the graph)
  if (!process.env.SKIP_PARSE) {
    const ctx = await browser.newContext({ ...devices["iPhone 13"] });
    const page = await ctx.newPage();
    await page.addInitScript(hook);
    page.on("pageerror", (e) => logs.push("pageerror " + e.message));
    await page.goto(URL + "#practice");
    const qs = [...window.CL_BANK.items.filter((q) => q.walk), ...window.CL_DESMOS.questions, ...window.CL_MATH.GENS.flatMap((g) => [1, 2, 3].map((s) => window.CL_MATH.make(g.id, s)))];
    const bad = [];
    let steps = 0;
    for (const q of qs) {
      if (!q.walk.some((s) => s.keys || s.table)) continue;
      await openWalk(page, q.id, 0, { shown: true });
      for (let i = 0; i < q.walk.length; i++) {
        if (i) await page.locator("#walk-next").dispatchEvent("click");
        if (i) await page.waitForTimeout(450); // let the view glide finish (and the double-click guard pass)
        const s = q.walk[i], keys = s.keys || [];
        const j = keys.map((k, n) => (/^[a-z] = -?[\d.]+$/.test(k) ? -1 : n)).filter((n) => n >= 0).pop();
        const r = await inspect(page, s.shows, `w${i}-${j}`);
        const where = `${q.id} step ${i + 1}`;
        if (r.errors.length) bad.push(`${where}: ${r.errors.join("; ")}`);
        for (const [name, want] of Object.entries(s.shows || {})) if (!(name in r.got) || !near(r.got[name], want)) bad.push(`${where}: Desmos shows ${name} = ${JSON.stringify(r.got[name])}, expected ${JSON.stringify(want)}`);
        if (r.hidden.length) bad.push(`${where}: trial notice covers ${r.hidden.join(", ")}`);
        steps++;
      }
    }
    console.log(`desmos: ${qs.length} walkthroughs, ${steps} steps checked, ${bad.length} problems`);
    bad.forEach((b) => console.log("  " + b));
    assert.strictEqual(bad.length, 0);
    await ctx.close();
  }

  // ---- 2. the flow, on 4 setups
  const setups = [["desktop-light", { viewport: { width: 1280, height: 820 }, colorScheme: "light" }], ["desktop-dark", { viewport: { width: 1280, height: 820 }, colorScheme: "dark" }],
    ["phone-light", { ...devices["iPhone 13"], colorScheme: "light" }], ["phone-dark", { ...devices["iPhone 13"], colorScheme: "dark", reducedMotion: "reduce" }]];
  for (const [name, opts] of setups) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    await page.addInitScript(hook);
    page.on("pageerror", (e) => logs.push(`${name} pageerror ${e.message}`));
    page.on("requestfailed", (r) => { if (r.failure()?.errorText !== "net::ERR_ABORTED" && !/cloudflareinsights|fonts\.g/.test(r.url())) logs.push(`${name} request failed ${r.url()}`); });
    page.on("console", (m) => { if (/ERR_NAME_NOT_RESOLVED/.test(m.text())) return; // reported by requestfailed with its URL
      if (m.type() === "error" && !/favicon|cloudflareinsights|beacon/i.test(m.text())) logs.push(`${name} console ${m.text()}`); });
    await page.goto(URL + "#practice");
    await openWalk(page, "m3", 0);
    // The button on the question opens the same walkthrough.
    await page.locator(".dock.walk .dock-head button").click();
    assert.strictEqual(await page.locator(".dock.walk").count(), 0, "Close closes it");
    await page.getByRole("button", { name: "Desmos way" }).dispatchEvent("click");
    await page.waitForSelector(".dock.walk .wt");
    await page.waitForTimeout(400);
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    assert.strictEqual(await page.locator(".wt-why").count(), 1, "each step explains why");
    const footY = async () => (await page.locator(".wt-foot").boundingBox()).y;
    const y1 = await footY();
    await page.screenshot({ path: `${OUT}/${name}-1-start.png` });
    if (name.startsWith("desktop")) {
      const q = await page.locator(".qsheet").boundingBox(), d = await page.locator(".dock.walk").boundingBox();
      assert(q.x + q.width <= d.x + 1, `${name}: question sits beside the panel, not under it`);
    }
    await page.locator("#walk-next").click();
    assert.strictEqual(await stepText(page), "Step 2 of 3");
    assert.strictEqual(await footY(), y1, "footer stays put");
    await page.waitForTimeout(450);
    assert(await page.evaluate(() => window.__calc.getExpressions().some((e) => e.id === "mk0" && e.label === "(4, 3)")), "step 2 marks the crossing");
    await page.screenshot({ path: `${OUT}/${name}-2-crossing.png` });
    await page.getByRole("button", { name: "Back" }).click();
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    assert(!(await page.evaluate(() => window.__calc.getExpressions().some((e) => e.id === "mk0"))), "Back removes the mark");
    await page.waitForTimeout(450);
    await page.locator("#walk-next").click();
    await page.waitForTimeout(450);
    // A double-click on Next moves one step and can't land on the button that takes its place.
    await page.locator("#walk-next").dblclick();
    await page.waitForTimeout(450);
    assert.strictEqual(await stepText(page), "Step 3 of 3");
    assert.strictEqual(await footY(), y1, "footer stays put");
    // Not answered yet: no spoiler.
    assert.strictEqual(await page.locator(".wt-end").count(), 0, "double-click didn't press Show answer");
    assert(/Your turn/.test(await page.locator(".gem-bubble").innerText()));
    assert(!(await page.evaluate(() => window.__calc.getExpressions().some((e) => /= 7/.test(e.label || "")))), "the graph doesn't show the answer yet");
    await page.screenshot({ path: `${OUT}/${name}-3-your-turn.png` });
    await page.locator("#walk-show").click();
    await page.waitForTimeout(450);
    const end = await page.locator(".wt-end").innerText();
    const letter = /choice ([A-D])/.exec(end)[1];
    const right = await page.locator(".choice").nth("ABCD".indexOf(letter)).innerText();
    assert(/\b7\b/.test(right), `${name}: Show answer points at the choice that says 7 (${letter}: ${right})`);
    await page.screenshot({ path: `${OUT}/${name}-4-answer.png` });
    // Refresh mid-walkthrough: same question, same step, answer still shown.
    await page.reload(); await page.waitForSelector(".dock.walk .wt");
    assert.strictEqual(await stepText(page), "Step 3 of 3", "refresh keeps the step");
    assert.strictEqual(await page.locator(".wt-end").count(), 1, "refresh keeps Show answer");
    await page.waitForFunction(() => window.__calc);
    await page.getByRole("button", { name: "Try it yourself" }).click();
    assert.strictEqual(await stepText(page), "Your turn");
    assert.strictEqual(await page.evaluate(() => window.__calc.getExpressions().filter((e) => e.latex).length), 0, "Try it yourself clears the calculator");
    await page.waitForTimeout(450);
    await page.getByRole("button", { name: "Show me again" }).click();
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    // Answering the question reveals the last step on its own.
    await openWalk(page, "m3", 2);
    assert.strictEqual(await page.locator(".wt-end").count(), 0);
    await page.locator(".choice", { hasText: /^\s*[A-D]\s*7\s*$/ }).dispatchEvent("click");
    await page.locator("#check-btn").dispatchEvent("click");
    await page.waitForTimeout(450);
    assert.strictEqual(await page.locator(".wt-end").count(), 1, "answering reveals the answer step");
    // Switching questions mid-walkthrough: the panel follows the new question from step 1.
    await page.locator(".wt-foot").getByRole("button", { name: "Back" }).click();
    await page.getByRole("button", { name: /Remix/ }).dispatchEvent("click"); // on phones the sticky top bar can sit over it mid-scroll
    await page.waitForTimeout(300);
    const qid = await page.locator(".dock.walk").getAttribute("data-q");
    assert(qid && qid !== "m3", `${name}: panel follows the remixed question (${qid})`);
    assert(/^Step 1 of/.test(await stepText(page)));
    // A lesson-18 question says "Why not Desmos?" and shows a by-hand step.
    await openWalk(page, "d18-3", 1);
    assert.strictEqual(await page.locator(".dock-head span").innerText(), "Why not Desmos?");
    assert.strictEqual(await page.locator(".wt-top .chip").innerText(), "By hand");
    await page.screenshot({ path: `${OUT}/${name}-5-by-hand.png` });
    // Pure computation: no graph, the expression list gets the room.
    await openWalk(page, "d11-1", 2, { shown: true });
    assert.strictEqual(await page.evaluate(() => window.__calc.settings.graphpaper), false, "no graph for pure computation");
    await page.screenshot({ path: `${OUT}/${name}-6-no-graph.png` });
    // A typed answer: the revealed last step gives the box-filling tip from lesson 1.
    await openWalk(page, "d1-1", 2, { shown: true });
    assert(/fill the box/.test(await page.locator(".wt-end").innerText()));
    // A faster trick shows up once the answer is out.
    await openWalk(page, "g-trig-7", 1, { shown: true });
    assert(/Faster:/.test(await page.locator(".wt-tip").innerText()));
    await page.screenshot({ path: `${OUT}/${name}-7-tip.png` });
    // Lesson page: no leftover box where the lesson calculator was.
    await page.evaluate(() => sessionStorage.removeItem("cl-walk"));
    await page.goto(URL + "#desmos"); await page.reload();
    await page.getByRole("button", { name: "Open trick 4: Systems are intersections" }).dispatchEvent("click");
    await page.waitForSelector(".lesson-calc");
    await page.getByRole("button", { name: "Desmos way" }).first().dispatchEvent("click");
    await page.waitForSelector(".dock.walk .wt");
    assert.strictEqual(await page.locator(".lesson-calc, .empty-calc").count(), 0, "lesson calculator box is gone while the walkthrough has Desmos");
    await page.screenshot({ path: `${OUT}/${name}-8-lesson.png` });
    await page.locator(".dock.walk .dock-head button").click();
    await page.waitForSelector(".lesson-calc .desmos");
    await ctx.close();
    console.log(`${name}: ok`);
  }
  await browser.close();
  if (logs.length) { console.log(logs.join("\n")); process.exit(1); }
  console.log("walk e2e ok");
})().catch((e) => { console.error(e); process.exit(1); });
