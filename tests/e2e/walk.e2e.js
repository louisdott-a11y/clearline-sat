// Browser check for the Desmos walkthroughs (needs network for Desmos, so it isn't part of npm test).
// Run: npm start (in another terminal), then  PW=/path/to/node_modules/playwright node tests/e2e/walk.e2e.js
// 1. Every walkthrough's final graph loads in real Desmos with no expression errors.
// 2. Back/Next, the final answer, Try it yourself, Show me again, switching questions and refresh,
//    on desktop and phone, light and dark. Screenshots go to $OUT (default: tests/e2e/out).
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
async function openWalk(page, id, i) {
  await page.evaluate(([id, i]) => sessionStorage.setItem("cl-walk", JSON.stringify({ id, i })), [id, i]);
  await page.reload();
  await page.waitForSelector(".dock.walk .wt");
  await page.waitForFunction(() => window.__calc && document.querySelector(".dock.walk .desmos"));
  await page.waitForTimeout(250);
}
const stepText = (page) => page.locator(".wt-top .tiny").innerText();
const errors = (page) => page.evaluate(() => Object.entries(window.__calc.expressionAnalysis).filter(([, a]) => a.isError).map(([id, a]) => `${id}: ${a.errorMessage}`));

(async () => {
  const browser = await chromium.launch();
  const logs = [];

  // ---- 1. every walkthrough's expressions parse in Desmos (SKIP_PARSE=1 to skip the slow part)
  if (!process.env.SKIP_PARSE) {
    const page = await browser.newPage();
    await page.addInitScript(hook);
    page.on("pageerror", (e) => logs.push("pageerror " + e.message));
    await page.goto(URL + "#practice");
    const qs = [...window.CL_BANK.items.filter((q) => q.walk), ...window.CL_DESMOS.questions, ...window.CL_MATH.GENS.flatMap((g) => [1, 2, 3].map((s) => window.CL_MATH.make(g.id, s)))];
    const bad = [];
    for (const q of qs) {
      if (!q.walk.some((s) => s.keys || s.table)) continue;
      // Check every step (sliders are replaced on later steps), clicking Next through the walkthrough.
      await openWalk(page, q.id, 0);
      for (let i = 0; i < q.walk.length; i++) {
        if (i) { await page.locator("#walk-next").click(); await page.waitForTimeout(120); }
        const e = await errors(page);
        if (e.length) bad.push(`${q.id} step ${i + 1}: ${e.join("; ")}`);
      }
    }
    console.log(`desmos parse: ${qs.length} walkthroughs checked, ${bad.length} problems`);
    bad.forEach((b) => console.log("  " + b));
    assert.strictEqual(bad.length, 0);
    await page.close();
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
    await page.getByRole("button", { name: "Desmos way" }).click();
    await page.waitForSelector(".dock.walk .wt");
    await page.waitForTimeout(400);
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    await page.screenshot({ path: `${OUT}/${name}-1-start.png` });
    if (name.startsWith("desktop")) {
      const q = await page.locator(".qsheet").boundingBox(), d = await page.locator(".dock.walk").boundingBox();
      assert(q.x + q.width <= d.x + 1, `${name}: question sits beside the panel, not under it`);
    }
    await page.locator("#walk-next").click();
    assert.strictEqual(await stepText(page), "Step 2 of 3");
    await page.waitForTimeout(300);
    assert(await page.evaluate(() => window.__calc.getExpressions().some((e) => e.id === "mk0" && e.label === "(4, 3)")), "step 2 marks the crossing");
    await page.screenshot({ path: `${OUT}/${name}-2-crossing.png` });
    await page.getByRole("button", { name: "Back" }).click();
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    assert(!(await page.evaluate(() => window.__calc.getExpressions().some((e) => e.id === "mk0"))), "Back removes the mark");
    await page.locator("#walk-next").click(); await page.locator("#walk-next").click();
    assert.strictEqual(await stepText(page), "Step 3 of 3");
    const end = await page.locator(".wt-end").innerText();
    const letter = /choice ([A-D])/.exec(end)[1];
    const right = await page.locator(".choice").nth("ABCD".indexOf(letter)).innerText();
    assert(/\b7\b/.test(right), `${name}: final step points at the choice that says 7 (${letter}: ${right})`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}-3-answer.png` });
    // Refresh mid-walkthrough: same question, same step.
    await page.reload(); await page.waitForSelector(".dock.walk .wt");
    assert.strictEqual(await stepText(page), "Step 3 of 3", "refresh keeps the step");
    await page.waitForFunction(() => window.__calc);
    await page.getByRole("button", { name: "Try it yourself" }).click();
    assert.strictEqual(await stepText(page), "Your turn");
    assert.strictEqual(await page.evaluate(() => window.__calc.getExpressions().filter((e) => e.latex).length), 0, "Try it yourself clears the calculator");
    await page.getByRole("button", { name: "Show me again" }).click();
    assert.strictEqual(await stepText(page), "Step 1 of 3");
    // Switching questions mid-walkthrough: the panel follows the new question from step 1.
    await page.locator("#walk-next").click();
    await page.getByRole("button", { name: /Remix/ }).dispatchEvent("click"); // on phones the sticky top bar can sit over it mid-scroll
    await page.waitForTimeout(300);
    const qid = await page.locator(".dock.walk").getAttribute("data-q");
    assert(qid && qid !== "m3", `${name}: panel follows the remixed question (${qid})`);
    assert(/^Step 1 of/.test(await stepText(page)));
    // A lesson-18 question says "Why not Desmos?" and shows a by-hand step.
    await openWalk(page, "d18-3", 1);
    assert.strictEqual(await page.locator(".dock-head span").innerText(), "Why not Desmos?");
    assert.strictEqual(await page.locator(".wt-top .chip").innerText(), "By hand");
    await page.screenshot({ path: `${OUT}/${name}-4-by-hand.png` });
    // An answer typed in: the final step gives the box-filling tip from lesson 1.
    await openWalk(page, "d1-1", 2);
    assert(/fill the box/.test(await page.locator(".wt-end").innerText()));
    await page.screenshot({ path: `${OUT}/${name}-5-entry-tip.png` });
    await ctx.close();
    console.log(`${name}: ok`);
  }
  await browser.close();
  if (logs.length) { console.log(logs.join("\n")); process.exit(1); }
  console.log("walk e2e ok");
})().catch((e) => { console.error(e); process.exit(1); });
