// Clearline SAT: math question generators.
// Each generator is deterministic for a seed, computes its own answer, and builds wrong choices from real mistakes.
window.CL_MATH = (() => {
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const nz = (r, a, b) => { let v = 0; while (v === 0) v = ri(r, a, b); return v; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const fmt = (n) => { const v = round(n, 4); return v < 0 ? "−" + Math.abs(v) : String(v); };
  const money = (n) => "$" + (Number.isInteger(round(n)) ? round(n) : round(n).toFixed(2));
  const sgn = (n) => (n < 0 ? "− " + Math.abs(n) : "+ " + n);           // "+ 3" / "− 3"
  const sgn0 = (n) => (n === 0 ? "" : " " + sgn(n));                   // omits zero
  const cx = (c, v = "x") => (c === 1 ? v : c === -1 ? "−" + v : fmt(c) + v);
  function poly(terms) {
    let out = "";
    for (const [c, v] of terms) {
      if (c === 0) continue;
      const body = v ? (Math.abs(c) === 1 ? v : Math.abs(c) + v) : String(Math.abs(c));
      out += out ? (c < 0 ? " − " : " + ") + body : (c < 0 ? "−" : "") + body;
    }
    return out || "0";
  }
  function frac(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    return d === 1 ? fmt(n) : (n < 0 ? "−" : "") + Math.abs(n) + "/" + d;
  }
  function rat(v) { // show a rational with a small denominator as a fraction
    for (let d = 1; d <= 12; d++) { const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9) return frac(Math.round(n), d); }
    return fmt(v);
  }
  // Desmos walkthroughs (step format: see the WALKS note in desmos.js). ks: a signed term as typed in Desmos.
  const ks = (n) => (n < 0 ? "- " + -n : "+ " + n);
  const around = (x, y, sx = 6, sy = sx) => [x - sx, x + sx, y - sy, y + sy];
  function shuffle(r, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // Build a 4-choice question. distractors: [{v, why}]. show: value → label.
  function mc(r, correct, distractors, show = fmt) {
    const opts = [{ v: correct, ok: true }];
    const seen = new Set([show(correct)]);
    for (const d of distractors) {
      if (opts.length === 4) break;
      if (typeof d.v === "number" && !Number.isFinite(d.v)) continue;
      const s = show(d.v);
      if (!seen.has(s)) { seen.add(s); opts.push(d); }
    }
    let k = 1;
    while (opts.length < 4 && typeof correct === "number") {
      const v = correct + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (Number.isInteger(correct) ? 1 : 0.5);
      k++;
      const s = show(v);
      if (!seen.has(s)) { seen.add(s); opts.push({ v, why: "This value doesn't satisfy the conditions in the question. Substitute it back to check." }); }
    }
    if (opts.length < 4) throw new Error("not enough distinct choices"); // make() retries with the next seed
    const order = shuffle(r, [0, 1, 2, 3]);
    const why = {};
    order.forEach((src, pos) => { if (!opts[src].ok) why[pos] = opts[src].why; });
    return { type: "mc", choices: order.map((i) => show(opts[i].v)), answer: order.indexOf(0), why };
  }
  const spr = (value, text) => ({ type: "spr", accept: [value], answerText: text ?? fmt(value) });

  const G = {};
  const def = (id, domain, diff, fn) => { G[id] = { id, domain, diff, fn }; };

  // ---------------- Algebra ----------------
  def("lin_expr", "ALG", 1, (r) => {
    const a = ri(r, 2, 5), x = ri(r, 2, 9), b = ri(r, 1, 9), m = ri(r, 1, 9);
    const c = a * x - b, ans = 2 * a * x - m;
    return { prompt: `If ${a}x − ${b} = ${fmt(c)}, what is the value of ${2 * a}x − ${m}?`,
      steps: [`Add ${b} to both sides: ${a}x = ${a * x}.`, `Divide by ${a}: x = ${x}.`, `Substitute: ${2 * a}(${x}) − ${m} = ${2 * a * x} − ${m} = ${ans}.`, `Shortcut: ${2 * a}x is 2 × ${a}x = ${2 * a * x}, so you never need x itself.`],
      walk: [
        { say: "Split the equation: y = left side, y = right side.", why: `Where they cross, ${a}x − ${b} equals ${fmt(c)}.`, keys: [`y = ${a}x - ${b}`, `y = ${c}`], view: around(x, c, 6, Math.max(8, Math.abs(c) + 4)) },
        { say: "Click the crossing.", why: "Its x-coordinate solves the equation.", mark: [x, c, `x = ${x}`] },
        { say: `${2 * a}x − ${m} = ${2 * a}(${x}) − ${m} = ${fmt(ans)}.`, why: `The question asks for ${2 * a}x − ${m}, not x.`, keys: [`${2 * a}(${x}) - ${m}`], shows: { "=": ans }, pick: fmt(ans), ask: `Your turn: work out ${2 * a}x − ${m} with that x.`, tip: `Faster: ${2 * a}x is 2 × ${a}x = ${2 * a * x}, so you never need x.` }],
      ...mc(r, ans, [{ v: a * x - m, why: `This is ${a}x − ${m}. The question asks for ${2 * a}x − ${m}.` }, { v: 2 * a * x, why: `This is ${2 * a}x. You still need to subtract ${m}.` }, { v: x, why: `This is the value of x, not ${2 * a}x − ${m}.` }]) };
  });
  def("lin_both", "ALG", 2, (r) => {
    const x = nz(r, -6, 9), a = ri(r, 3, 9), c = ri(r, 1, a - 1), b = nz(r, -12, 12);
    const d = a * x + b - c * x;
    if (d === 0) return null;
    const move = b < 0 ? `Add ${-b} to both sides` : `Subtract ${b} from both sides`;
    return { passage: [`${cx(a)} ${sgn(b)} = ${cx(c)} ${sgn(d)}`], prompt: "What value of x is the solution to the equation above?",
      steps: [`Subtract ${cx(c)} from both sides: ${cx(a - c)} ${sgn(b)} = ${fmt(d)}.`, `${move}: ${cx(a - c)} = ${fmt(d - b)}.`, `Divide by ${a - c}: x = ${fmt(x)}.`, `Check: both sides equal ${fmt(a * x + b)} when x = ${fmt(x)}.`],
      walk: [
        { say: "Graph each side as its own y = ….", why: "Where they cross, the two sides are equal.", keys: [`y = ${a}x ${ks(b)}`, `y = ${c}x ${ks(d)}`], view: around(x, a * x + b, 6, Math.abs(a * x + b) / 2 + 10) },
        { say: "Click the crossing.", why: "Its x-coordinate is the solution.", mark: [x, a * x + b, "crossing"] },
        { say: `The crossing's x-coordinate is ${fmt(x)}.`, why: "The answer is the x-coordinate, not the y.", mark: [x, a * x + b, `x = ${fmt(x)}`], pick: x, ask: "Your turn: click the crossing. What's x?" }],
      ...spr(x) };
  });
  def("fee_rate", "ALG", 2, (r) => {
    const ctx = pick(r, [["gym", "membership", "month", "monthly"], ["storage company", "rental", "month", "monthly"], ["music school", "lesson plan", "week", "weekly"]]);
    const m1 = ri(r, 2, 5), m2 = m1 + ri(r, 3, 8), rate = pick(r, [15, 20, 25, 30, 35, 40, 45]), fee = pick(r, [40, 50, 60, 75, 80, 90, 100, 120]);
    const t1 = fee + m1 * rate, t2 = fee + m2 * rate;
    return { passage: [`A ${ctx[0]} charges a one-time sign-up fee plus the same fee each ${ctx[2]}. A ${m1}-${ctx[2]} ${ctx[1]} costs ${money(t1)} in total, and a ${m2}-${ctx[2]} ${ctx[1]} costs ${money(t2)} in total.`],
      prompt: "What is the one-time sign-up fee?",
      steps: [`The extra ${m2 - m1} ${ctx[2]}s cost ${money(t2)} − ${money(t1)} = ${money(t2 - t1)}.`, `So the ${ctx[3]} fee is ${money(t2 - t1)} ÷ ${m2 - m1} = ${money(rate)}.`, `${m1} ${ctx[2]}s of fees cost ${m1} × ${money(rate)} = ${money(m1 * rate)}.`, `Sign-up fee = ${money(t1)} − ${money(m1 * rate)} = ${money(fee)}.`],
      walk: [
        { say: `Each plan is a point (${ctx[2]}s, total). Put both in a table.`, why: "A one-time fee plus a constant rate is a line.", table: [[m1, m2], [t1, t2]], view: [-1, m2 + 2, -t2 / 10, t2 * 1.1] },
        { say: "Fit a line through them.", why: `m is the ${ctx[3]} fee; b is the cost at 0 ${ctx[2]}s, the sign-up fee.`, keys: ["y1 ~ m x1 + b"], shows: { m: rate, b: fee } },
        { say: `b = ${fee}, so the sign-up fee is ${money(fee)}.`, why: `At 0 ${ctx[2]}s you pay only the sign-up fee.`, mark: [0, fee, `b = ${fee}`], pick: money(fee), ask: "Your turn: which number under the regression is the sign-up fee?" }],
      ...mc(r, fee, [{ v: rate, why: `This is the ${ctx[3]} fee, not the sign-up fee.` }, { v: fee + rate, why: `This is the sign-up fee plus one ${ctx[2]}.` }, { v: t1 / m1, why: `This divides the total by the number of ${ctx[2]}s, which ignores the sign-up fee.` }], money) };
  });
  def("system_sum", "ALG", 2, (r) => {
    const x = ri(r, 1, 8), y = ri(r, 1, 8), a = ri(r, 2, 4);
    return { passage: [`${a}x + y = ${a * x + y}`, `x − y = ${fmt(x - y)}`], prompt: "If (x, y) is the solution to the system of equations above, what is the value of x + y?",
      steps: [`Add the equations to eliminate y: ${a + 1}x = ${(a + 1) * x}, so x = ${x}.`, `Substitute into x − y = ${fmt(x - y)}: ${x} − y = ${fmt(x - y)}, so y = ${y}.`, `x + y = ${x} + ${y} = ${x + y}.`],
      walk: [
        { say: "Type both equations.", why: "Desmos graphs any form, so there's no need to solve for y.", keys: [`${a}x + y = ${a * x + y}`, `x - y = ${x - y}`], view: around(x, y, 6) },
        { say: "Click the crossing.", why: "The crossing is the one (x, y) that works in both.", mark: [x, y, `(${x}, ${y})`] },
        { say: `x + y = ${x} + ${y} = ${x + y}.`, why: "The question asks for the sum.", mark: [x, y, `${x} + ${y} = ${x + y}`], pick: fmt(x + y), ask: "Your turn: what is x + y at the crossing?", tip: `Faster: adding the equations gives ${a + 1}x = ${(a + 1) * x} straight away.` }],
      ...mc(r, x + y, [{ v: x, why: "This is the value of x alone." }, { v: y, why: "This is the value of y alone." }, { v: (a + 1) * x, why: `This is ${a + 1}x, the result of adding the equations.` }]) };
  });
  def("slope_pts", "ALG", 1, (r) => {
    const x1 = ri(r, -5, 3), run = ri(r, 1, 6), x2 = x1 + run, rise = nz(r, -9, 9), y1 = ri(r, -6, 6), y2 = y1 + rise;
    const ans = frac(rise, run);
    return { prompt: `A line in the xy-plane passes through the points (${fmt(x1)}, ${fmt(y1)}) and (${fmt(x2)}, ${fmt(y2)}). What is the slope of the line?`,
      steps: ["Slope = (change in y) ÷ (change in x).", `Change in y: ${fmt(y2)} − (${fmt(y1)}) = ${fmt(rise)}.`, `Change in x: ${fmt(x2)} − (${fmt(x1)}) = ${run}.`, `Slope = ${fmt(rise)}/${run}${ans !== `${fmt(rise)}/${run}` ? " = " + ans : ""}.`],
      walk: [
        { say: "Put the two points in a table.", why: "Desmos can fit a line through points in a table.", table: [[x1, x2], [y1, y2]], view: around((x1 + x2) / 2, (y1 + y2) / 2, 8) },
        { say: "Fit a line through them.", why: "m in y1 ~ m x1 + b is the slope.", keys: ["y1 ~ m x1 + b"], shows: { m: rise / run, b: y1 - (rise / run) * x1 }, mark: [[x1, y1, "point 1"], [x2, y2, "point 2"]] },
        { say: Number.isInteger(rise / run) ? `m = ${fmt(rise / run)}.` : `Type \`m\` on its own line and click the fraction icon at its left: ${ans}.`, why: Number.isInteger(rise / run) ? "m is the slope." : "The exact fraction is safer than a long decimal.", keys: ["m"], shows: { "=": rise / run }, pick: rise / run, ask: "Your turn: read m, the slope." }],
      ...spr(rise / run, ans) };
  });
  def("no_solution", "ALG", 3, (r) => {
    const d = ri(r, 2, 6), t = d % 2 === 0 ? pick(r, [2, 3, 0.5]) : pick(r, [2, 3]);
    const a = t * d, e = ri(r, 2, 5), k = -t * e, c2 = ri(r, 1, 9), c1 = t * c2 + ri(r, 1, 5);
    const tt = rat(t);
    return { passage: [`${a}x + ky = ${fmt(c1)}`, `${d}x − ${e}y = ${c2}`], prompt: "In the system of equations above, k is a constant. For what value of k does the system have no solution?",
      steps: ["A system has no solution when the lines are parallel: the x- and y-coefficients are proportional, but the constants are not.", `The x-coefficients have ratio ${a} ÷ ${d} = ${tt}.`, `So k must be ${tt} × (−${e}) = ${rat(k)}.`, `Check the constants: ${tt} × ${c2} = ${rat(t * c2)}, which is not ${fmt(c1)}, so the lines never meet.`],
      walk: [
        { say: "Desmos works: graph both with a slider for k.", why: "No solution means the lines are parallel.", keys: [`${a}x + k y = ${c1}`, `${d}x - ${e}y = ${c2}`, "k = 1"], view: [-6, 6, -6, 6] },
        { say: `Faster by hand: parallel means the coefficients share a ratio, ${a}/${d} = k/(−${e}).`, why: "The same ratio gives the same slope.", hand: true },
        { say: `So k = ${rat(k)}, and the constants don't share that ratio, so the lines never meet.`, why: "Different constants keep parallel lines apart.", hand: true, keys: [`k = ${k}`], pick: rat(k), ask: `Your turn: solve ${a}/${d} = k/(−${e}).` }],
      ...mc(r, k, [{ v: -k, why: "The sign is flipped. The y-coefficient in the second equation is negative, so k must be too." }, { v: -e / t, why: "This uses the ratio of the coefficients upside down." }, { v: e / t, why: "This uses the ratio upside down and flips the sign." }], rat) };
  });
  def("budget", "ALG", 2, (r) => {
    const name = pick(r, ["Maya", "Luis", "Priya", "Jordan", "Amara", "Theo"]);
    const B = pick(r, [50, 60, 75, 80, 100, 120, 150]), F = ri(r, 5, 25), p = pick(r, [3, 4, 6, 7, 8, 9, 12]);
    const n = Math.floor((B - F) / p);
    return { prompt: `${name} has $${B} to spend at a craft fair. The entry fee is $${F}, and each handmade card costs $${p}. What is the greatest number of cards ${name} can buy?`,
      steps: [`Money left after the fee: $${B} − $${F} = $${B - F}.`, `The number of cards n must satisfy ${p}n ≤ ${B - F}, so n ≤ ${round((B - F) / p)}.`, `n must be a whole number, so the greatest value is ${n}.`],
      walk: [
        { say: "Graph the total cost for x cards, and the budget.", why: "Where the cost line meets the budget, the money runs out.", keys: [`y = ${F} + ${p}x`, `y = ${B}`], view: [-2, (B - F) / p + 4, -10, B * 1.3] },
        { say: "Click the crossing.", why: `Past it, the cards cost more than ${name} has.`, mark: [(B - F) / p, B, "crossing"] },
        { say: `The crossing is at x ≈ ${fmt(round((B - F) / p, 2))}. Cards come whole, so round down: ${n}.`, why: "Rounding up would go over budget.", mark: [n, F + p * n, `${n} cards`], pick: n, ask: "Your turn: read the crossing's x. How many whole cards?" }],
      ...spr(n) };
  });
  def("interpret", "ALG", 2, (r) => {
    const ctx = pick(r, [
      { eq: "C = {r}h + {f}", desc: "the total charge C, in dollars, for a plumbing job that takes h hours", rate: "The charge for each hour of work", fixed: "A flat fee charged for every job", one: "The total charge for a 1-hour job", v: "The number of hours the job takes" },
      { eq: "C = {r}g + {f}", desc: "the monthly cost C, in dollars, of a phone plan when g gigabytes of data are used", rate: "The cost for each gigabyte of data", fixed: "The base monthly cost before any data is used", one: "The monthly cost when 1 gigabyte is used", v: "The number of gigabytes used" },
      { eq: "V = {r}t + {f}", desc: "the number of gallons of water V in a pool t minutes after a hose is turned on", rate: "The number of gallons added each minute", fixed: "The number of gallons in the pool when the hose is turned on", one: "The number of gallons after 1 minute", v: "The number of minutes the hose has run" }]);
    const rate = ri(r, 12, 60), fixed = ri(r, 25, 150), askRate = r() < 0.5;
    const eq = ctx.eq.replace("{r}", rate).replace("{f}", fixed);
    const n = askRate ? rate : fixed;
    const right = askRate ? ctx.rate : ctx.fixed;
    const wrong = askRate
      ? [{ v: ctx.fixed, why: `That is ${fixed}, the constant term.` }, { v: ctx.one, why: `The value for 1 unit is ${rate} + ${fixed} = ${rate + fixed}, not ${rate}.` }, { v: ctx.v, why: "That is the variable itself, not the number multiplying it." }]
      : [{ v: ctx.rate, why: `That is ${rate}, the number multiplying the variable.` }, { v: ctx.one, why: `The value for 1 unit is ${rate} + ${fixed} = ${rate + fixed}, not ${fixed}.` }, { v: ctx.v, why: "That is the variable, not a constant." }];
    return { passage: [`The equation ${eq} gives ${ctx.desc}.`], prompt: `What does ${n} represent in this equation?`,
      steps: ["In a linear model, the number multiplying the variable is the rate of change, and the constant term is the starting value.", `${n} is ${askRate ? "the number multiplying the variable" : "the constant term"}, so: ${right.charAt(0).toLowerCase() + right.slice(1)}.`],
      walk: [
        { say: "Skip Desmos: the question is about meaning, so there's nothing to graph.", why: "A graph finds numbers; it can't say what they stand for.", hand: true },
        { say: "The number multiplying the variable is the rate; the constant term is the starting value.", why: "That's what every linear model y = mx + b means.", hand: true },
        { say: `${n} is ${askRate ? "the number multiplying the variable" : "the constant term"}.`, why: askRate ? "It's added once for every unit of the variable." : "It's there even when the variable is 0.", hand: true, pick: right }],
      ...mc(r, right, wrong, (s) => s) };
  });

  // ---------------- Advanced Math ----------------
  def("f_eval", "ADV", 1, (r) => {
    const b = nz(r, -7, 7), c = nz(r, -9, 9), x = -ri(r, 1, 4);
    const ans = x * x + b * x + c;
    return { prompt: `If f(x) = ${poly([[1, "x²"], [b, "x"], [c, ""]])}, what is the value of f(${fmt(x)})?`,
      steps: [`Substitute ${fmt(x)} for every x: f(${fmt(x)}) = (${fmt(x)})² ${b < 0 ? "−" : "+"} ${Math.abs(b)}(${fmt(x)}) ${sgn(c)}.`, `(${fmt(x)})² = ${x * x}, and ${fmt(b)}(${fmt(x)}) = ${fmt(b * x)}.`, `${x * x} ${sgn(b * x)} ${sgn(c)} = ${fmt(ans)}.`],
      walk: [
        { say: "Name the function f.", why: "Once f is defined, f(anything) evaluates it.", keys: [`f(x) = x^2 ${ks(b)}x ${ks(c)}`], view: around(x, ans, 6, Math.abs(ans) / 2 + 10) },
        { say: `Type \`f(${x})\`: Desmos shows ${fmt(ans)}.`, why: "Desmos handles the negative signs for you.", keys: [`f(${x})`], shows: { "=": ans }, mark: [x, ans, `f(${fmt(x)}) = ${fmt(ans)}`], pick: fmt(ans), ask: `Your turn: type f(${x}) on the next line.` }],
      ...mc(r, ans, [{ v: -x * x + b * x + c, why: `This treats (${fmt(x)})² as ${fmt(-x * x)}. Squaring a negative gives a positive.` }, { v: x * x - b * x + c, why: `This gets the sign of ${fmt(b)}(${fmt(x)}) wrong.` }, { v: 2 * x + b * x + c, why: `This doubles ${fmt(x)} instead of squaring it.` }]) };
  });
  def("diff_sq", "ADV", 2, (r) => {
    const a = ri(r, 2, 9);
    return { prompt: `Which expression is equivalent to (x + ${a})² − (x − ${a})²?`,
      steps: [`Expand: (x + ${a})² = x² + ${2 * a}x + ${a * a} and (x − ${a})² = x² − ${2 * a}x + ${a * a}.`, `Subtract: the x² and ${a * a} terms cancel, and ${2 * a}x − (−${2 * a}x) = ${4 * a}x.`],
      walk: [
        { say: "Graph the original expression.", why: "Equivalent expressions draw exactly the same graph.", keys: [`y = (x + ${a})^2 - (x - ${a})^2`], view: [-3, 3, -8 * a, 8 * a] },
        { say: `Try a choice: \`y = 2x^2 + ${2 * a * a}\` is a parabola, nowhere near it.`, why: "A different graph means not equivalent.", keys: [`y = 2x^2 + ${2 * a * a}`] },
        { say: `y = ${4 * a}x lands exactly on top.`, why: "One line, so they're equal for every x.", keys: [`y = ${4 * a}x`], mark: [1, 4 * a, "same line"], pick: `${4 * a}x`, ask: "Your turn: type the other choices. Which lands on top?", tip: `Faster: a² − b² = (a − b)(a + b) = (${2 * a})(2x).` }],
      ...mc(r, `${4 * a}x`, [{ v: "0", why: `The x² and ${a * a} terms cancel, but the middle terms don't: ${2 * a}x − (−${2 * a}x) = ${4 * a}x.` }, { v: String(2 * a * a), why: `This adds the ${a * a} terms instead of subtracting them.` }, { v: `2x² + ${2 * a * a}`, why: "This is the sum of the two squares, not the difference." }], (s) => s) };
  });
  def("one_sol", "ADV", 3, (r) => {
    const k = ri(r, 2, 9);
    return { prompt: `In the equation x² − ${2 * k}x + c = 0, c is a constant. If the equation has exactly one real solution, what is the value of c?`,
      steps: ["Exactly one real solution means the discriminant b² − 4ac equals 0.", `(−${2 * k})² − 4(1)(c) = 0, so ${4 * k * k} − 4c = 0.`, `c = ${k * k}. Check: x² − ${2 * k}x + ${k * k} = (x − ${k})², which has only the solution x = ${k}.`],
      walk: [
        { say: "Graph it with a slider for c.", why: "Solutions are where the parabola meets the x-axis.", keys: [`y = x^2 - ${2 * k}x + c`, "c = 0"], view: [k - 6, k + 6, -k * k - 4, 12] },
        { say: "Drag c up and watch the parabola rise.", why: "One solution means it just touches the x-axis.", keys: [`c = ${k * k - k}`] },
        { say: `It just touches at c = ${k * k}.`, why: `Then it's (x − ${k})², with one root.`, keys: [`c = ${k * k}`], mark: [k, 0, `c = ${k * k}`], pick: fmt(k * k), ask: "Your turn: drag c until it just touches. Which choice is it?", tip: `Faster: it's a perfect square when c = (${2 * k}/2)² = ${k * k}.` }],
      ...mc(r, k * k, [{ v: k, why: `${k} is the solution x, not c.` }, { v: 2 * k, why: `${2 * k} is the size of b, not c.` }, { v: -k * k, why: "With c negative, the discriminant is positive, which gives two solutions." }]) };
  });
  def("quad_root", "ADV", 2, (r) => {
    const r1 = ri(r, 1, 9), r2 = -ri(r, 1, 9);
    if (r1 === -r2) return null;
    const b = -(r1 + r2), c = r1 * r2;
    return { prompt: `What is the positive solution to the equation ${poly([[1, "x²"], [b, "x"], [c, ""]])} = 0?`,
      steps: [`Find two numbers that multiply to ${fmt(c)} and add to ${fmt(b)}: ${fmt(-r1)} and ${fmt(-r2)}.`, `So (x ${sgn(-r1)})(x ${sgn(-r2)}) = 0.`, `The solutions are x = ${r1} and x = ${fmt(r2)}. The positive one is ${r1}.`],
      walk: [
        { say: "Graph the left side as y = ….", why: "Solutions of = 0 are the x-intercepts.", keys: [`y = x^2 ${ks(b)}x ${ks(c)}`], view: [r2 - 3, r1 + 3, -((r1 - r2) ** 2) / 4 - 4, 10] },
        { say: "Click the curve to see both x-intercepts.", why: "The question wants the positive one.", mark: [[r2, 0, "zero"], [r1, 0, "zero"]] },
        { say: `The positive one is ${r1}.`, why: `The other, ${fmt(r2)}, is negative.`, mark: [r1, 0, `x = ${r1}`], pick: r1, ask: "Your turn: read the positive x-intercept." }],
      ...spr(r1) };
  });
  def("exp_model", "ADV", 2, (r) => {
    const P = pick(r, [500, 1200, 2400, 8000]), rt = pick(r, [3, 4, 5, 6, 8, 12, 15, 20]), grow = r() < 0.5;
    const f = grow ? round(1 + rt / 100, 2) : round(1 - rt / 100, 2);
    const right = grow ? `It increases by ${rt}% each year.` : `It decreases by ${rt}% each year.`;
    const wrong = grow
      ? [{ v: `It increases by ${100 + rt}% each year.`, why: `Multiplying by ${f} keeps 100% and adds ${rt}%. The increase is ${rt}%, not ${100 + rt}%.` }, { v: `It increases by ${f}% each year.`, why: `${f} is the growth factor, not a percent.` }, { v: `It decreases by ${rt}% each year.`, why: "A factor greater than 1 means growth, not decay." }]
      : [{ v: `It decreases by ${100 - rt}% each year.`, why: `f keeps ${100 - rt}% of its value each year, so it loses ${rt}%.` }, { v: `It increases by ${rt}% each year.`, why: "A factor less than 1 means decay, not growth." }, { v: `It decreases by ${f}% each year.`, why: `${f} is the decay factor, not a percent.` }];
    return { passage: [`The function f(t) = ${P.toLocaleString("en-US")}(${f})ᵗ gives the ${grow ? "value, in dollars, of an investment t years after it was made" : "mass, in grams, of a substance t years after it was first measured"}.`],
      prompt: "Which statement best describes how f(t) changes as t increases?",
      steps: ["In f(t) = a(b)ᵗ, the base b is the yearly factor.", grow ? `b = ${f} = 1 + ${round(rt / 100)}, so f grows by ${rt}% each year.` : `b = ${f} = 1 − ${round(rt / 100)}, so f keeps ${100 - rt}% and loses ${rt}% each year.`],
      walk: [
        { say: "Skip Desmos: the answer is in the base of the exponent.", why: "In a(b)ᵗ, b is what f is multiplied by each year.", hand: true },
        { say: grow ? `${f} is above 1: keep 100% and add the rest.` : `${f} is below 1: keep that share, lose the rest.`, why: "Subtract 1 from the base to read the percent change.", hand: true },
        { say: grow ? `${f} = 1 + ${round(rt / 100)}, so it grows by ${rt}% each year.` : `${f} = 1 − ${round(rt / 100)}, so it shrinks by ${rt}% each year.`, why: "The percent is the distance from 1.", hand: true, pick: right }],
      ...mc(r, right, wrong, (s) => s) };
  });
  def("compose", "ADV", 3, (r) => {
    const a = ri(r, 2, 5), b = nz(r, -6, 6), c = ri(r, 1, 9), k = nz(r, -3, 4);
    const g = k * k - c, ans = a * g + b;
    return { passage: [`f(x) = ${a}x ${sgn(b)}`, `g(x) = x² − ${c}`], prompt: `For the functions f and g defined above, what is the value of f(g(${fmt(k)}))?`,
      steps: [`Work from the inside out: g(${fmt(k)}) = (${fmt(k)})² − ${c} = ${fmt(g)}.`, `f(${fmt(g)}) = ${a}(${fmt(g)}) ${sgn(b)} = ${fmt(ans)}.`],
      walk: [
        { say: "Define both functions.", why: "Desmos can then nest them for you.", keys: [`f(x) = ${a}x ${ks(b)}`, `g(x) = x^2 - ${c}`] },
        { say: `Type it as written: Desmos shows ${fmt(ans)}.`, why: "Desmos works from the inside out, so the order can't slip.", keys: [`f(g(${k}))`], shows: { "=": ans }, pick: fmt(ans), ask: `Your turn: type f(g(${k})).` }],
      ...mc(r, ans, [{ v: (a * k + b) ** 2 - c, why: "This is g(f(k)): it applies the functions in the wrong order." }, { v: a * k * k + b, why: `This forgets to subtract ${c} inside g.` }, { v: (a * k + b) * g, why: "This multiplies f(k) by g(k) instead of composing them." }]) };
  });
  def("vertex", "ADV", 3, (r) => {
    const h = nz(r, -6, 6), k = nz(r, -9, 9);
    return { prompt: `The function f is defined by f(x) = ${poly([[1, "x²"], [-2 * h, "x"], [h * h + k, ""]])}. What is the minimum value of f(x)?`,
      steps: [`Complete the square: x² ${sgn(-2 * h)}x = (x ${sgn(-h)})² − ${h * h}.`, `So f(x) = (x ${sgn(-h)})²${sgn0(k)}.`, `A square is never negative, so the minimum value is ${fmt(k)}, reached when x = ${fmt(h)}.`],
      walk: [
        { say: "Graph f.", why: "The minimum value is the lowest point on the graph.", keys: [`f(x) = x^2 ${ks(-2 * h)}x ${ks(h * h + k)}`], view: around(h, k, 6, 10) },
        { say: "Click the lowest point, the vertex.", why: "Desmos shows a point's coordinates when you click it.", mark: [h, k, "vertex"] },
        { say: `The vertex is (${fmt(h)}, ${fmt(k)}), so the minimum value is ${fmt(k)}.`, why: "The minimum value is the y-coordinate, not the x.", mark: [h, k, `min = ${fmt(k)}`], pick: fmt(k), ask: "Your turn: read the vertex. Which coordinate is the minimum value?", tip: `Faster: the vertex is at x = −b/2a = ${fmt(h)}; plug it in.` }],
      ...mc(r, k, [{ v: h, why: "This is the x-value where the minimum happens, not the minimum value." }, { v: h * h + k, why: "This is f(0), the y-intercept." }, { v: -k, why: "The sign is flipped. Check your square completion." }]) };
  });

  // ---------------- Problem-Solving & Data Analysis ----------------
  def("proportion", "PSDA", 1, (r) => {
    const c = ri(r, 2, 5), per = ri(r, 4, 12), base = c * per, N = per * ri(r, c + 1, c + 5), ans = N / per;
    return { prompt: `A recipe uses ${c} cups of flour to make ${base} cookies. At this rate, how many cups of flour are needed to make ${N} cookies?`,
      steps: [`Find the rate: ${base} cookies ÷ ${c} cups = ${per} cookies per cup.`, `Divide: ${N} cookies ÷ ${per} cookies per cup = ${ans} cups.`],
      walk: [
        { say: "Find the cups for one cookie.", why: "A unit rate scales to any number of cookies.", keys: [`${c}/${base}`], shows: { "=": c / base } },
        { say: `Multiply by ${N} cookies: ${fmt(ans)} cups.`, why: "Cups per cookie times cookies gives cups.", keys: [`${N} · ${c}/${base}`], shows: { "=": ans }, pick: fmt(ans), ask: "Your turn: multiply by the number of cookies." }],
      ...mc(r, ans, [{ v: per, why: `${per} is the number of cookies per cup, not cups of flour.` }, { v: c + 1, why: `That adds only one cup for ${N - base} more cookies.` }, { v: 2 * c, why: `${2 * c} cups would make ${2 * base} cookies.` }]) };
  });
  def("succ_pct", "PSDA", 2, (r) => {
    const P = pick(r, [40, 60, 80, 120, 200, 250]), u = pick(r, [10, 20, 25, 50]), d = pick(r, [10, 20, 25]);
    const mid = round(P * (1 + u / 100)), fin = round(mid * (1 - d / 100));
    return { prompt: `A jacket's price of ${money(P)} is increased by ${u}%. The new price is then decreased by ${d}%. What is the final price?`,
      steps: [`Increase by ${u}%: ${money(P)} × ${round(1 + u / 100)} = ${money(mid)}.`, `Decrease by ${d}%: ${money(mid)} × ${round(1 - d / 100)} = ${money(fin)}.`, "Percent changes multiply; they don't simply add."],
      walk: [
        { say: `Percent changes multiply: up ${u}% is × ${round(1 + u / 100)}, down ${d}% is × ${round(1 - d / 100)}.`, why: "Each change acts on the current price, not the original.", keys: [`${round(1 + u / 100)} · ${round(1 - d / 100)}`], shows: { "=": (1 + u / 100) * (1 - d / 100) } },
        { say: `The final price is ${money(fin)}.`, why: "Multiply the starting price by both factors.", keys: [`${P} · ${round(1 + u / 100)} · ${round(1 - d / 100)}`], shows: { "=": fin }, pick: money(fin), ask: "Your turn: multiply the price by both factors." }],
      ...mc(r, fin, [{ v: round(P * (1 + (u - d) / 100)), why: "This adds the percents. Percent changes multiply." }, { v: P + u - d, why: "This treats the percents as dollar amounts." }, { v: mid, why: "This applies only the increase." }], money) };
  });
  def("mean_median", "PSDA", 2, (r) => {
    const a = ri(r, 1, 5), b = a + ri(r, 1, 3), c = b + ri(r, 0, 3), d = c + ri(r, 1, 3), e = d + ri(r, 2, 6), n = e + ri(r, 10, 25);
    const s1 = a + b + c + d + e, s2 = s1 - e + n;
    const choices = ["Only the mean increases.", "Only the median increases.", "Both the mean and the median increase.", "Neither the mean nor the median changes."];
    const out = mc(r, choices[0], [{ v: choices[1], why: `The largest value changed, but the middle value is still ${c}.` }, { v: choices[2], why: `The median depends only on the middle value, which stays ${c}.` }, { v: choices[3], why: "The mean uses every value, so increasing one value increases the mean." }], (s) => s);
    return { passage: [`A data set contains these five values: ${a}, ${b}, ${c}, ${d}, ${e}.`], prompt: `If the value ${e} is replaced with ${n}, which statement is true?`,
      steps: [`Median: the middle value of ${a}, ${b}, ${c}, ${d}, ${n} is still ${c}.`, `Mean: the sum rises by ${n - e}, so the mean rises from ${s1}/5 = ${round(s1 / 5)} to ${s2}/5 = ${round(s2 / 5)}.`],
      walk: [
        { say: "Put the old and new data in lists.", why: "Named lists let you compare statistics side by side.", keys: [`L = [${a}, ${b}, ${c}, ${d}, ${e}]`, `M = [${a}, ${b}, ${c}, ${d}, ${n}]`] },
        { say: "Compare the means.", why: "The mean uses every value.", keys: ["[mean(L), mean(M)]"], shows: { "=": [s1 / 5, s2 / 5] } },
        { say: `The medians are both ${c}, so only the mean increases.`, why: "The median depends only on the middle value.", keys: ["[median(L), median(M)]"], shows: { "=": [c, c] }, pick: choices[0], ask: "Your turn: compare the medians too. Which statement is true?" }], ...out };
  });
  def("pct_change", "PSDA", 1, (r) => {
    let A, pct, B;
    for (let i = 0; i < 20; i++) { A = pick(r, [20, 40, 50, 80, 120, 200, 250, 400]); pct = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]); B = A * (1 + pct / 100); if (Number.isInteger(B)) break; }
    if (!Number.isInteger(B)) return null;
    return { prompt: `The number of members in a club increased from ${A} to ${B}. By what percent did the number of members increase? (Enter the number without the % sign.)`,
      steps: [`Change: ${B} − ${A} = ${B - A}.`, `Divide by the original amount: ${B - A} ÷ ${A} = ${round(pct / 100)}.`, `${round(pct / 100)} = ${pct}%.`],
      walk: [
        { say: "Find the change first.", why: "Percent change compares the change with the original.", keys: [`${B} - ${A}`], shows: { "=": B - A } },
        { say: `Divide by the original and multiply by 100: ${pct}.`, why: "That turns the change into a percent of where it started.", keys: [`(${B} - ${A})/${A} · 100`], shows: { "=": pct }, pick: pct, ask: "Your turn: divide by the original and multiply by 100." }],
      ...spr(pct) };
  });
  def("rate_time", "PSDA", 2, (r) => {
    const p = pick(r, [12, 15, 20, 24, 30, 40]), h = pick(r, [0.5, 1, 1.5, 2, 2.5, 3]), N = p * 60 * h;
    return { prompt: `A printer prints ${p} pages per minute. At this rate, how many hours will it take to print ${N.toLocaleString("en-US")} pages?`,
      steps: [`Pages per hour: ${p} × 60 = ${p * 60}.`, `Hours: ${N.toLocaleString("en-US")} ÷ ${p * 60} = ${h}.`],
      walk: [
        { say: "Find the pages per hour.", why: "The question asks in hours, and the rate is per minute.", keys: [`${p} · 60`], shows: { "=": p * 60 } },
        { say: `Divide the pages by that: ${h} hours.`, why: "Pages ÷ pages per hour = hours.", keys: [`${N}/(${p} · 60)`], shows: { "=": h }, pick: h, ask: "Your turn: divide the pages by pages per hour." }],
      ...spr(h) };
  });
  def("two_way", "PSDA", 3, (r) => {
    let a, b, c, d;
    for (let i = 0; i < 30; i++) { a = ri(r, 8, 40); b = ri(r, 8, 40); c = ri(r, 8, 40); d = ri(r, 8, 40); if (b !== c && b !== d) break; }
    const T = a + b + c + d;
    return { passage: ["A school surveyed juniors and seniors about how they usually get to school. The results are shown in the table."],
      table: { head: ["", "Walk", "Bus", "Total"], rows: [["Juniors", a, b, a + b], ["Seniors", c, d, c + d], ["Total", a + c, b + d, T]].map((row) => row.map(String)) },
      prompt: "If one of the students who usually take the bus is chosen at random, what is the probability that the student is a senior?",
      steps: [`“Of the students who take the bus” means the denominator is the Bus total: ${b + d}.`, `Seniors who take the bus: ${d}.`, `Probability = ${d}/${b + d}.`],
      walk: [
        { say: "Skip Desmos: this is about reading the table.", why: "The hard part is choosing the right total, not the division.", hand: true },
        { say: `“Of the bus riders” means divide by the Bus total, ${b + d}.`, why: "The condition after “of” sets the denominator.", hand: true },
        { say: `${d} of them are seniors: ${d}/${b + d}.`, why: "Seniors who ride the bus, out of all bus riders.", hand: true, pick: `${d}/${b + d}` }],
      ...mc(r, `${d}/${b + d}`, [{ v: `${d}/${T}`, why: "This divides by all students surveyed, not just bus riders." }, { v: `${d}/${c + d}`, why: "This divides by all seniors, not bus riders." }, { v: `${b}/${b + d}`, why: "This is the probability the bus rider is a junior." }], (s) => s) };
  });

  // ---------------- Geometry & Trigonometry ----------------
  def("pyth", "GEO", 1, (r) => {
    const [p, q, h] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), s = p === 3 ? ri(r, 1, 4) : 1;
    const L1 = p * s, L2 = q * s, H = h * s;
    return { prompt: `A right triangle has legs of length ${L1} and ${L2}. What is the length of the hypotenuse?`,
      steps: [`Pythagorean theorem: c² = ${L1}² + ${L2}² = ${L1 * L1} + ${L2 * L2} = ${H * H}.`, `c = √${H * H} = ${H}.`],
      walk: [
        { say: "Square the legs and add.", why: "a² + b² = c² in a right triangle.", keys: [`${L1}^2 + ${L2}^2`], shows: { "=": H * H } },
        { say: `Take the square root: ${H}.`, why: "That sum is c², not c.", keys: [`sqrt(${L1}^2 + ${L2}^2)`], shows: { "=": H }, pick: String(H), ask: "Your turn: take the square root.", tip: `Faster: ${L1}-${L2}-${H} is the ${p}-${q}-${h} triangle${s > 1 ? ` times ${s}` : ""}.` }],
      ...mc(r, String(H), [{ v: String(L1 + L2), why: "This adds the legs. The hypotenuse is always shorter than the sum of the legs." }, { v: String(H * H), why: `${H * H} is c². Take the square root.` }, { v: `√${L1 + L2}`, why: "This takes the square root of the sum of the legs. Square each leg first." }], (s2) => s2) };
  });
  def("circle_r", "GEO", 2, (r) => {
    const h = nz(r, -6, 6), k = nz(r, -6, 6), rad = ri(r, 2, 9), C = rad * rad - h * h - k * k;
    const ds = [{ v: String(rad * rad), why: `${rad * rad} is r². Take the square root.` }];
    if (C > 0 && C !== rad && C !== rad * rad) ds.push({ v: String(C), why: "This is the constant before completing the square." });
    if (C > 0 && Math.sqrt(C) % 1 !== 0) ds.push({ v: `√${C}`, why: "This treats the constant as r² before completing the square." });
    ds.push({ v: String(Math.abs(h) + Math.abs(k)), why: "This adds the coordinates of the center; it isn't the radius." }, { v: String(2 * rad), why: "This is the diameter, not the radius." });
    return { prompt: `In the xy-plane, a circle has equation x² + y² ${sgn(-2 * h)}x ${sgn(-2 * k)}y = ${fmt(C)}. What is the radius of the circle?`,
      steps: [`Complete the square for x: x² ${sgn(-2 * h)}x = (x ${sgn(-h)})² − ${h * h}.`, `Complete the square for y: y² ${sgn(-2 * k)}y = (y ${sgn(-k)})² − ${k * k}.`, `So (x ${sgn(-h)})² + (y ${sgn(-k)})² = ${fmt(C)} + ${h * h} + ${k * k} = ${rad * rad}.`, `r² = ${rad * rad}, so r = ${rad}.`],
      walk: [
        { say: "Type the circle's equation.", why: "Desmos draws it without completing the square.", keys: [`x^2 + y^2 ${ks(-2 * h)}x ${ks(-2 * k)}y = ${C}`], view: around(h, k, rad + 3) },
        { say: "Click the top and bottom grey dots.", why: "They're the ends of a vertical diameter.", mark: [[h, k + rad, "top"], [h, k - rad, "bottom"]] },
        { say: `They're ${2 * rad} apart, so the radius is ${rad}.`, why: "The radius is half the diameter.", mark: [h, k, `r = ${rad}`], pick: String(rad), ask: "Your turn: halve the distance between the two dots." }],
      ...mc(r, String(rad), ds, (s) => s) };
  });
  def("trig", "GEO", 3, (r) => {
    const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), ask = r() < 0.5 ? "cos A" : "sin B";
    return { passage: [`In right triangle ABC, angle C is the right angle and sin A = ${a}/${c}.`], prompt: `What is the value of ${ask}?`,
      steps: [`sin A = opposite/hypotenuse = ${a}/${c}, so the side opposite A is ${a} and the hypotenuse is ${c}.`, `The third side is √(${c}² − ${a}²) = ${b}.`, ask === "cos A" ? `cos A = adjacent/hypotenuse = ${b}/${c}.` : `The side opposite B is the side adjacent to A, so sin B = ${b}/${c} (sin B always equals cos A in a right triangle).`],
      walk: [
        { say: "Find the third side.", why: "The Pythagorean theorem gives it from the two sides you know.", keys: [`sqrt(${c}^2 - ${a}^2)`], shows: { "=": b } },
        { say: `Type it and click the fraction icon at the line's left: ${b}/${c}.`, why: "The fraction icon turns the decimal into a fraction you can match to a choice.", keys: [`cos(arcsin(${a}/${c}))`], shows: { "=": b / c }, pick: `${b}/${c}`, ask: `Your turn: type cos(arcsin(${a}/${c})) and click the fraction icon at its left.`, tip: ask === "cos A" ? `Faster: cos A = adjacent/hypotenuse = ${b}/${c}.` : "Faster: sin B = cos A, because A and B add to 90°." }],
      ...mc(r, `${b}/${c}`, [{ v: `${a}/${c}`, why: ask === "cos A" ? "This is sin A, not cos A." : "This is sin A. Angle B's opposite side is different." }, { v: `${c}/${b}`, why: "This is the reciprocal; the hypotenuse belongs in the denominator." }, { v: `${a}/${b}`, why: "This is tan A, opposite over adjacent." }], (s) => s) };
  });
  def("angles", "GEO", 1, (r) => {
    const a = ri(r, 30, 80), b = ri(r, 30, 80);
    return { prompt: `In triangle PQR, the measure of angle P is ${a}° and the measure of angle Q is ${b}°. What is the measure, in degrees, of angle R?`,
      steps: ["The angles of a triangle add up to 180°.", `R = 180 − ${a} − ${b} = ${180 - a - b}.`],
      walk: [
        { say: "Skip Desmos: a triangle's angles add to 180°.", why: "One subtraction is faster than typing.", hand: true },
        { say: `180 − ${a} − ${b} = ${180 - a - b}.`, why: "Take the two known angles away from 180.", hand: true, pick: 180 - a - b }], ...spr(180 - a - b) };
  });
  def("cylinder", "GEO", 2, (r) => {
    const rad = ri(r, 2, 6), h = ri(r, 2, 12);
    return { prompt: `A right circular cylinder has a volume of ${rad * rad * h}π cubic centimeters and a radius of ${rad} centimeters. What is the height, in centimeters, of the cylinder?`,
      steps: ["Volume of a cylinder: V = πr²h.", `${rad * rad * h}π = π(${rad})²h = ${rad * rad}πh.`, `h = ${rad * rad * h} ÷ ${rad * rad} = ${h}.`],
      walk: [
        { say: "Desmos can solve it with ~, but by hand is just as fast.", why: "V = πr²h has only one unknown.", keys: [`${rad * rad * h}pi ~ pi · ${rad}^2 h`], shows: { h } },
        { say: `Cancel π on both sides: ${rad * rad * h} = ${rad * rad}h.`, why: "π appears on both sides.", hand: true },
        { say: `h = ${rad * rad * h} ÷ ${rad * rad} = ${h}.`, why: "Divide by r².", hand: true, pick: h }], ...spr(h) };
  });
  def("similar", "GEO", 3, (r) => {
    const A0 = pick(r, [6, 8, 10, 12, 15, 18, 20]), k = ri(r, 2, 4);
    return { prompt: `Triangle STU is similar to triangle PQR. Each side of STU is ${k} times as long as the corresponding side of PQR. If the area of PQR is ${A0} square units, what is the area of STU, in square units?`,
      steps: [`When lengths are multiplied by ${k}, areas are multiplied by ${k}² = ${k * k}.`, `${A0} × ${k * k} = ${A0 * k * k}.`],
      walk: [
        { say: "Skip Desmos: this is a scaling rule.", why: "There's no equation to graph.", hand: true },
        { say: `Lengths × ${k} means areas × ${k}² = ${k * k}.`, why: "Area is length times length, so the factor is squared.", hand: true },
        { say: `${A0} × ${k * k} = ${A0 * k * k}.`, why: "Scale the known area.", hand: true, pick: fmt(A0 * k * k) }],
      ...mc(r, A0 * k * k, [{ v: A0 * k, why: `This multiplies the area by ${k}. Area scales by the square of the length factor.` }, { v: A0 * k ** 3, why: `This uses ${k}³, which is how volume scales.` }, { v: A0 + k * k, why: `This adds ${k * k} instead of multiplying by it.` }]) };
  });
  def("arc", "GEO", 2, (r) => {
    const rad = pick(r, [3, 4, 6, 8, 9, 10, 12]), th = pick(r, [30, 45, 60, 90, 120, 135, 150]);
    const piText = (n, d) => { const g = gcd(n, d); n /= g; d /= g; const top = n === 1 ? "π" : n + "π"; return d === 1 ? top : top + "/" + d; };
    const ans = piText(th * rad, 180);
    return { prompt: `A circle has a radius of ${rad} inches. What is the length, in inches, of an arc of the circle with a central angle of ${th}°?`,
      steps: ["Arc length = (central angle ÷ 360°) × circumference.", `Circumference = 2π(${rad}) = ${2 * rad}π.`, `(${th} ÷ 360) × ${2 * rad}π = ${ans}.`],
      walk: [
        { say: "Skip Desmos: the answer is in terms of π, and Desmos gives a decimal.", why: "Matching a decimal to π choices is slower than the formula.", hand: true },
        { say: `The arc is ${th}/360 of the circumference, 2π(${rad}) = ${2 * rad}π.`, why: "An arc is a fraction of the whole circle.", hand: true },
        { say: `(${th}/360) × ${2 * rad}π = ${ans}.`, why: "Simplify the fraction.", hand: true, pick: ans }],
      ...mc(r, ans, [{ v: piText(th * rad * rad, 360), why: "This is the area of the sector, not the arc length." }, { v: piText(2 * rad, 1), why: "This is the whole circumference." }, { v: piText(th * rad, 360), why: "This forgets the 2 in 2πr." }], (s) => s) };
  });

  const GENS = Object.values(G);
  const cache = new Map();
  function make(genId, seed) {
    const id = `g-${genId}-${seed}`;
    if (cache.has(id)) return cache.get(id);
    const gen = G[genId];
    if (!gen) return null;
    let q = null;
    for (let s = seed, tries = 0; !q && tries < 25; s++, tries++) {
      try { q = gen.fn(rng(s * 7919 + 13)); } catch { q = null; }
    }
    if (!q) return null;
    const out = { id, section: "math", domain: gen.domain, diff: gen.diff, generated: true, gen: genId, passage: [], ...q };
    cache.set(id, out);
    return out;
  }
  function fromId(id) {
    const m = /^g-([a-z_]+)-(\d+)$/.exec(id);
    return m ? make(m[1], Number(m[2])) : null;
  }
  const newSeed = () => Math.floor(Math.random() * 1e9);
  function forDomain(domain, diff, exclude = new Set()) {
    const pool = GENS.filter((g) => g.domain === domain);
    const sorted = pool.slice().sort((a, b) => Math.abs(a.diff - diff) - Math.abs(b.diff - diff) || Math.random() - 0.5);
    const best = sorted.filter((g) => Math.abs(g.diff - diff) === Math.abs(sorted[0].diff - diff));
    const options = best.filter((g) => !exclude.has(g.id));
    const gen = (options.length ? options : best)[Math.floor(Math.random() * (options.length || best.length))];
    return make(gen.id, newSeed());
  }
  function variant(q) { return q && q.gen ? make(q.gen, newSeed()) : null; }
  return { GENS, make, fromId, forDomain, variant };
})();
