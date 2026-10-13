// Clearline SAT: app logic.
// Home plan, practice, question bank + drill builder, adaptive mock SAT, scores & stats, review, vocab,
// calculator/grapher, and the Gem coach.
(() => {
  "use strict";
  const BANK = window.CL_BANK.items;
  const MATH = window.CL_MATH;
  const CALC = window.CL_CALC;
  const VOCAB = window.CL_VOCAB;
  const CLUES = window.CL_CLUES || {};
  const BY_ID = Object.fromEntries(BANK.map((q) => [q.id, q]));

  // ------------------------------------------------------------------ taxonomy
  const DOMAINS = {
    CS: { name: "Craft & Structure", short: "craft", section: "rw", share: 0.28, skills: ["Words in Context", "Text Structure & Purpose", "Cross-Text Connections"] },
    II: { name: "Information & Ideas", short: "info & ideas", section: "rw", share: 0.26, skills: ["Central Ideas & Details", "Command of Evidence", "Inferences"] },
    SEC: { name: "Standard English Conventions", short: "grammar", section: "rw", share: 0.26, skills: ["Boundaries", "Form, Structure & Sense"] },
    EOI: { name: "Expression of Ideas", short: "expression", section: "rw", share: 0.2, skills: ["Transitions", "Rhetorical Synthesis"] },
    ALG: { name: "Algebra", short: "algebra", section: "math", share: 0.35, skills: ["Linear equations in one variable", "Linear equations in two variables", "Linear functions", "Systems of linear equations", "Linear inequalities"] },
    ADV: { name: "Advanced Math", short: "advanced math", section: "math", share: 0.35, skills: ["Equivalent expressions", "Nonlinear equations", "Nonlinear functions"] },
    PSDA: { name: "Problem-Solving & Data Analysis", short: "data", section: "math", share: 0.15, skills: ["Ratios, rates & units", "Percentages", "One-variable data", "Probability"] },
    GEO: { name: "Geometry & Trigonometry", short: "geometry", section: "math", share: 0.15, skills: ["Area & volume", "Lines, angles & triangles", "Right triangles & trigonometry", "Circles"] }
  };
  const DOM_KEYS = Object.keys(DOMAINS);
  const ALL_SKILLS = DOM_KEYS.flatMap((d) => DOMAINS[d].skills.map((s) => ({ skill: s, domain: d })));
  const GEN_SKILL = {
    lin_expr: "Linear equations in one variable", lin_both: "Linear equations in one variable", fee_rate: "Linear functions", interpret: "Linear functions",
    system_sum: "Systems of linear equations", no_solution: "Systems of linear equations", slope_pts: "Linear equations in two variables", budget: "Linear inequalities",
    f_eval: "Nonlinear functions", compose: "Nonlinear functions", vertex: "Nonlinear functions", exp_model: "Nonlinear functions", diff_sq: "Equivalent expressions",
    one_sol: "Nonlinear equations", quad_root: "Nonlinear equations", proportion: "Ratios, rates & units", rate_time: "Ratios, rates & units",
    succ_pct: "Percentages", pct_change: "Percentages", mean_median: "One-variable data", two_way: "Probability",
    pyth: "Right triangles & trigonometry", trig: "Right triangles & trigonometry", circle_r: "Circles", arc: "Circles", angles: "Lines, angles & triangles", similar: "Lines, angles & triangles", cylinder: "Area & volume"
  };
  const ID_SKILL = {
    m1: "Linear equations in one variable", m2: "Linear functions", m3: "Systems of linear equations", m4: "Systems of linear equations", m5: "Nonlinear functions", m6: "Equivalent expressions",
    m7: "Nonlinear equations", m8: "Ratios, rates & units", m9: "Percentages", m10: "One-variable data", m11: "Right triangles & trigonometry", m12: "Circles", m13: "Right triangles & trigonometry",
    r6: "Boundaries", s1: "Boundaries", s5: "Boundaries", s6: "Boundaries", s10: "Boundaries", c11: "Cross-Text Connections"
  };
  function skillOf(q) {
    if (!q) return "";
    if (q.gen) return GEN_SKILL[q.gen];
    if (ID_SKILL[q.id]) return ID_SKILL[q.id];
    const p = q.prompt;
    if (q.domain === "SEC") return "Form, Structure & Sense";
    if (q.domain === "EOI") return q.list ? "Rhetorical Synthesis" : "Transitions";
    if (/precise word/.test(p)) return "Words in Context";
    if (/structure|main purpose|function of the underlined/.test(p)) return "Text Structure & Purpose";
    if (/main idea|According to the text/.test(p)) return "Central Ideas & Details";
    if (/data|directly support/.test(p)) return "Command of Evidence";
    if (/most logically completes/.test(p)) return "Inferences";
    return DOMAINS[q.domain].skills[0];
  }
  const SECTION = { rw: "Reading and Writing", math: "Math" };
  const LETTERS = "ABCD";
  const DIFF = { 1: "easy", 2: "medium", 3: "hard" };
  const W = { 1: 1, 2: 1.6, 3: 2.2 };
  const PACE = { rw: 71, math: 95 };
  const LOCAL_KEY = "clearline-sat-progress-v1";
  const MOCK_SPEC = {
    full: { label: "Full-length SAT", rw: { counts: { CS: 7, II: 7, SEC: 7, EOI: 6 }, secs: 32 * 60 }, math: { counts: { ALG: 8, ADV: 7, PSDA: 4, GEO: 3 }, secs: 35 * 60 }, breakSecs: 600 },
    quick: { label: "Quick mock", rw: { counts: { CS: 4, II: 3, SEC: 3, EOI: 3 }, secs: 16 * 60 }, math: { counts: { ALG: 4, ADV: 4, PSDA: 2, GEO: 1 }, secs: 18 * 60 }, breakSecs: 300 }
  };
  const DIFF_MIX = { m1: { 1: 0.3, 2: 0.4, 3: 0.3 }, hard: { 1: 0.15, 2: 0.35, 3: 0.5 }, easy: { 1: 0.5, 2: 0.35, 3: 0.15 } };
  const SCORE_KINDS = {
    sat: { label: "SAT (official)", min: 200, max: 800 },
    bluebook: { label: "Bluebook practice test", min: 200, max: 800 },
    psat: { label: "PSAT/NMSQT or PSAT 10", min: 160, max: 760 },
    psat89: { label: "PSAT 8/9", min: 120, max: 720 },
    other: { label: "Other practice test", min: 200, max: 800 }
  };
  const VIEWS = [["home", "Home"], ["practice", "Practice"], ["bank", "Question bank"], ["mock", "Practice tests"], ["stats", "Analytics & scores"], ["review", "Review"], ["vocab", "Flashcards"], ["guides", "Guides"]];
  const ICONS = {
    home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
    practice: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
    bank: "M4 6h16M4 12h16M4 18h10",
    mock: "M9 3h6M12 3v3M5.5 13a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0M12 13V10",
    stats: "M5 20V11M12 20V5M19 20v-6",
    review: "M4 12a8 8 0 1 0 2.5-5.8M4 4v5h5",
    vocab: "M7 4h12v14H7zM4 7v13h12",
    guides: "M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"
  };
  // Desmos's public demo key, for development. Request your own free key at desmos.com/api before you launch publicly.
  const DESMOS_API_KEY = "dcb31709b452b1cf9dc26972add0fda6";

  // ------------------------------------------------------------------ state
  const blankProgress = () => ({ v: 3, attempts: {}, study: {}, timer: { focus: 25, rest: 5 }, scores: [], target: { total: null, date: "" }, mocks: [], activeMock: null, set: null, saved: {}, drills: [], vocab: {}, rush: {}, timeMult: 1, plainNotes: false });
  let progress = blankProgress();
  let db = null, uid = null, sample = null, tutorCtl = null, gemCtl = null;
  const ui = {
    view: "home",
    pr: { source: "mixed", skill: "all", diff: "any", q: null, picked: null, spr: "", checked: false, shownAt: 0, hint: false },
    rush: null, rushScope: "all",
    bank: { section: "all", domain: "all", skill: "all", diff: "any", status: "all", limit: 40 },
    drill: { skills: [], diff: "any", count: 10, timed: false, name: "" },
    reviewTab: "missed",
    guides: { rw: 40, math: 30 },
    qCount: 1,
    vocab: { flipped: false, word: null, mode: "due" },
    dock: null,
    calc: { tab: "calc", expr: "", out: "", err: "", hist: [], deg: false, fns: ["x^2 - 4", "2x + 1", ""], range: 10 },
    gemTurns: [],
    mockResult: null, pendingSubmit: false, navOpen: false, refOpen: false, hideTimer: false, elimMode: false,
    armed: {}, restoreText: "", lastActive: Date.now()
  };
  const getQ = (id) => BY_ID[id] || MATH.fromId(id);

  function normalize(p) {
    const b = blankProgress();
    if (!p || typeof p !== "object") return b;
    const out = { ...b, ...p, v: 3 };
    for (const k of ["attempts", "study", "timer", "target", "saved", "vocab", "rush"]) if (!out[k] || typeof out[k] !== "object" || Array.isArray(out[k])) out[k] = b[k];
    for (const k of ["scores", "mocks", "drills"]) if (!Array.isArray(out[k])) out[k] = [];
    if (![0, 1, 1.5, 2].includes(out.timeMult)) out.timeMult = 1;
    for (const [id, list] of Object.entries(out.attempts)) {
      if (!Array.isArray(list)) { delete out.attempts[id]; continue; }
      const q = getQ(id);
      for (const a of list) if (q) { if (a.d == null) a.d = q.domain; if (a.f == null) a.f = q.diff; if (a.s == null) a.s = skillOf(q); }
    }
    return out;
  }
  function loadLocal() { try { return normalize(JSON.parse(localStorage.getItem(LOCAL_KEY))); } catch { return blankProgress(); } }
  let saveTimer = null;
  function save(now = false) {
    clearTimeout(saveTimer);
    const run = async () => {
      try { localStorage.setItem(LOCAL_KEY, JSON.stringify(progress)); } catch {}
      if (db && uid) {
        try { await db.doc("data/users/" + uid + "/progress").set(JSON.parse(JSON.stringify(progress))); }
        catch { db = null; setSync("Progress is saved in this browser only. Your account couldn't save it."); }
      }
    };
    if (now) run(); else saveTimer = setTimeout(run, 1200);
  }
  function setSync(t) { const n = document.getElementById("sync-note"); if (n) n.textContent = t; }

  // ------------------------------------------------------------------ helpers
  function el(tag, attrs = {}, ...kids) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) node.append(kid);
    return node;
  }
  const NS = "http://www.w3.org/2000/svg";
  function svg(tag, attrs = {}, ...kids) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    for (const kid of kids.flat()) if (kid != null) n.append(kid);
    return n;
  }
  function rich(text) {
    const frag = document.createDocumentFragment();
    let u = null;
    for (const part of String(text).split(/(\{blank\}|\{u\}|\{\/u\})/)) {
      if (part === "{blank}") (u || frag).append(el("span", { class: "blank", "aria-label": "blank" }));
      else if (part === "{u}") { u = el("u"); frag.append(u); }
      else if (part === "{/u}") u = null;
      else if (part) (u || frag).append(part);
    }
    return frag;
  }
  const plain = (t) => String(t || "").replace(/\{blank\}/g, "____").replace(/\{\/?u\}/g, "");
  const pad = (n) => String(n).padStart(2, "0");
  const clock = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`; };
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtMin = (sec) => { const m = Math.floor(sec / 60), h = Math.floor(m / 60); return h ? (m % 60 ? `${h}h ${m % 60}m` : `${h}h`) : `${m}m`; };
  const round10 = (n) => Math.round(n / 10) * 10;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const niceDate = (v) => { if (!v) return ""; const d = typeof v === "number" ? new Date(v) : new Date(v.length === 10 ? v + "T12:00:00" : v); return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); };
  function toast(t) { const n = document.getElementById("toast"); n.textContent = t; n.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { n.hidden = true; }, 2800); }
  function spark(target) {
    return; // The sleek theme marks correct answers with the green banner instead of a sparkle burst.
    if (!target || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (let i = 0; i < 7; i++) {
      const s = el("span", { class: "spark", "aria-hidden": "true", text: "✦" });
      const ang = (Math.PI * 2 * i) / 7;
      s.style.left = "60px"; s.style.top = "0px";
      s.style.setProperty("--dx", Math.round(Math.cos(ang) * 50) + "px");
      s.style.setProperty("--dy", Math.round(Math.sin(ang) * 32) + "px");
      target.append(s);
      setTimeout(() => s.remove(), 800);
    }
  }
  const levelOf = (rate) => (rate == null ? "n" : rate >= 0.8 ? "g" : rate >= 0.5 ? "y" : "r");
  function gem(level, label) {
    const fill = { g: "var(--green-fill)", y: "var(--amber-fill)", r: "var(--red-fill)", n: "var(--grey-fill)" }[level];
    const s = svg("svg", { class: "gem", viewBox: "0 0 12 12", role: label ? "img" : "presentation", "aria-hidden": label ? "false" : "true" }, svg("circle", { cx: "6", cy: "6", r: "5", fill }));
    if (label) s.setAttribute("aria-label", label);
    return s;
  }
  function confirmBtn(key, label, armedLabel, onConfirm, cls = "btn small ghost") {
    return el("button", { class: cls, type: "button", onclick: () => {
      if (ui.armed[key]) { ui.armed = {}; onConfirm(); } else { ui.armed = { [key]: true }; render(); }
    } }, ui.armed[key] ? armedLabel : label);
  }
  const sheet = (cls, ...kids) => el("section", { class: "sheet " + (cls || "") }, kids);
  const title = (t, sm) => el("h2", { class: "title" + (sm ? " sm" : ""), text: t });

  // ------------------------------------------------------------------ answers & stats
  function parseNum(s) {
    s = String(s || "").trim().replace(/[−–]/g, "-").replace(/\s+/g, "");
    if (/^-?\d+\/\d+$/.test(s)) { const [n, d] = s.split("/").map(Number); return d ? { val: n / d, dec: 0 } : null; }
    if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return { val: Number(s), dec: s.includes(".") ? s.split(".")[1].length : 0 };
    return null;
  }
  function isCorrect(q, resp) {
    if (q.type === "spr") {
      const p = parseNum(resp);
      if (!p) return false;
      return q.accept.some((a) => Math.abs(p.val - a) < 1e-9 || (p.dec >= 3 && Math.abs(p.val - a) < 10 ** -p.dec));
    }
    return resp === q.answer;
  }
  const answerLabel = (q) => (q.type === "spr" ? q.answerText : LETTERS[q.answer]);
  const respLabel = (q, r) => (r == null || r === "" ? "—" : q.type === "spr" ? String(r) : LETTERS[r]);
  function record(q, correct, resp, src, t) {
    const list = progress.attempts[q.id] || [];
    list.push({ c: correct ? 1 : 0, r: resp, at: Date.now(), d: q.domain, f: q.diff, s: skillOf(q), t: t == null ? null : Math.min(900, Math.round(t)), src });
    progress.attempts[q.id] = list.slice(-6);
    const keys = Object.keys(progress.attempts);
    if (keys.length > 1600) {
      const gen = keys.filter((k) => k.startsWith("g-") && !progress.saved[k]).sort((a, b) => lastAt(a) - lastAt(b));
      for (const k of gen.slice(0, keys.length - 1500)) delete progress.attempts[k];
    }
  }
  const lastAt = (id) => { const l = progress.attempts[id]; return l && l.length ? l[l.length - 1].at : 0; };
  const latest = (id) => { const l = progress.attempts[id]; return l && l.length ? l[l.length - 1] : null; };
  function flatAttempts() { const out = []; for (const [id, list] of Object.entries(progress.attempts)) for (const a of list) out.push({ id, ...a }); return out; }
  function statsWhere(pred, recent = 0) {
    let list = flatAttempts().filter(pred);
    if (recent) list = list.sort((a, b) => b.at - a.at).slice(0, recent);
    const right = list.reduce((s, a) => s + a.c, 0);
    const timed = list.filter((a) => a.t);
    return { right, total: list.length, rate: list.length ? right / list.length : null, avgT: timed.length ? timed.reduce((s, a) => s + a.t, 0) / timed.length : null };
  }
  const domainStats = (dom, recent = 0, practiceOnly = false) => statsWhere((a) => a.d === dom && (!practiceOnly || a.src !== "mock"), recent);
  const skillStats = (skill, recent = 0) => statsWhere((a) => a.s === skill, recent);
  const missedIds = () => Object.keys(progress.attempts).filter((id) => { const l = latest(id); return l && !l.c && getQ(id); }).sort((a, b) => lastAt(b) - lastAt(a));
  const savedIds = () => Object.keys(progress.saved).filter((id) => getQ(id)).sort((a, b) => progress.saved[b] - progress.saved[a]);
  const attemptsOn = (key) => flatAttempts().filter((a) => dayKey(new Date(a.at)) === key && a.src !== "mock").length;
  function streak() {
    const active = new Set(flatAttempts().map((a) => dayKey(new Date(a.at))));
    for (const [k, v] of Object.entries(progress.study)) if (v >= 120) active.add(k);
    const d = new Date(); let n = 0;
    if (!active.has(dayKey(d))) d.setDate(d.getDate() - 1);
    while (active.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // ------------------------------------------------------------------ picking questions
  function freshness(q, diff) {
    const l = latest(q.id);
    const f = !l ? 0 : !l.c ? 1 : 2 + (Date.now() - l.at < 864e5 * 3 ? 2 : 0);
    return f * 10 + (diff ? Math.abs(q.diff - diff) * 4 : 0) + Math.random() * 3;
  }
  function pickRW(domain, diff, exclude) {
    let pool = BANK.filter((q) => q.section === "rw" && q.domain === domain && !exclude.has(q.id));
    if (!pool.length) pool = BANK.filter((q) => q.section === "rw" && q.domain === domain);
    return pool.sort((a, b) => freshness(a, diff) - freshness(b, diff))[0];
  }
  function pickMath(domain, diff, exclude) {
    const legacy = BANK.filter((q) => q.section === "math" && q.domain === domain && !exclude.has(q.id) && !latest(q.id) && (!diff || q.diff === diff));
    if (legacy.length && Math.random() < 0.25) return legacy[Math.floor(Math.random() * legacy.length)];
    return MATH.forDomain(domain, diff || 1 + Math.floor(Math.random() * 3));
  }
  function pickBySkill(skill, diff, exclude = new Set()) {
    const gens = MATH.GENS.filter((g) => GEN_SKILL[g.id] === skill);
    const items = BANK.filter((q) => skillOf(q) === skill && !exclude.has(q.id));
    if (gens.length && (!items.length || Math.random() < 0.75)) {
      const d = diff || 1 + Math.floor(Math.random() * 3);
      const best = Math.min(...gens.map((g) => Math.abs(g.diff - d)));
      const opts = gens.filter((g) => Math.abs(g.diff - d) === best);
      return MATH.make(opts[Math.floor(Math.random() * opts.length)].id, Math.floor(Math.random() * 1e9));
    }
    if (items.length) return items.sort((a, b) => freshness(a, diff) - freshness(b, diff))[0];
    const dom = ALL_SKILLS.find((s) => s.skill === skill).domain;
    return DOMAINS[dom].section === "rw" ? pickRW(dom, diff, exclude) : pickMath(dom, diff, exclude);
  }
  function pickQuestion({ section, domain, diff, exclude = new Set() }) {
    let dom = domain;
    if (!dom) {
      const secs = section ? [section] : [Math.random() < 0.5 ? "rw" : "math"];
      const options = DOM_KEYS.filter((k) => secs.includes(DOMAINS[k].section));
      let r = Math.random() * options.reduce((s, k) => s + DOMAINS[k].share, 0);
      dom = options.find((k) => (r -= DOMAINS[k].share) <= 0) || options[0];
    }
    return DOMAINS[dom].section === "rw" ? pickRW(dom, diff, exclude) : pickMath(dom, diff, exclude);
  }
  function remixOf(q) {
    if (!q) return null;
    if (q.gen) return MATH.variant(q);
    return pickBySkill(skillOf(q), q.diff, new Set([q.id]));
  }
  function weakestSkills(n = 2) {
    return ALL_SKILLS.map((s) => { const st = skillStats(s.skill); return { ...s, v: (st.right + 1) / (st.total + 2) - (st.total ? 0 : 0.05) }; }).sort((a, b) => a.v - b.v).slice(0, n);
  }

  // ------------------------------------------------------------------ plan
  const latestImport = () => progress.scores.slice().sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  const latestMock = () => progress.mocks.slice().sort((a, b) => b.at - a.at)[0] || null;
  function band(level) {
    if (level <= 480) return { 1: 0.5, 2: 0.4, 3: 0.1, label: "mostly easy and medium" };
    if (level <= 600) return { 1: 0.25, 2: 0.5, 3: 0.25, label: "mostly medium" };
    if (level <= 700) return { 1: 0.1, 2: 0.45, 3: 0.45, label: "medium and hard" };
    return { 1: 0, 2: 0.3, 3: 0.7, label: "mostly hard" };
  }
  const sampleDiff = (b) => { let r = Math.random(); for (const d of [1, 2, 3]) { if ((r -= b[d]) <= 0) return d; } return 2; };
  function computePlan() {
    const imp = latestImport(), mk = latestMock();
    if (!mk) return null;
    // No imported score: the practice test alone sets the working level.
    const wMock = !imp ? 1 : mk.at >= Date.parse(imp.date + "T12:00:00") ? 0.6 : 0.5;
    const sec = {};
    for (const s of ["rw", "math"]) sec[s] = { imported: imp ? imp[s] : "—", mock: mk[s], level: round10((imp ? imp[s] : 0) * (1 - wMock) + mk[s] * wMock) };
    const levelTotal = sec.rw.level + sec.math.level;
    const tgt = Number(progress.target.total) || null;
    for (const s of ["rw", "math"]) {
      if (tgt) {
        const totalGap = tgt - levelTotal;
        const head = (800 - sec.rw.level) + (800 - sec.math.level) || 1;
        sec[s].gap = totalGap > 0 ? round10((totalGap * (800 - sec[s].level)) / head) : 0;
        sec[s].target = clamp(sec[s].level + sec[s].gap, 200, 800);
      } else { sec[s].gap = null; sec[s].target = null; }
      sec[s].band = band(sec[s].level);
    }
    const prios = DOM_KEYS.map((k) => {
      const D = DOMAINS[k];
      const items = (mk.items || []).filter((i) => i.d === k);
      const mRight = items.filter((i) => i.c).length;
      const prac = domainStats(k, 25, true);
      const mockAcc = items.length ? mRight / items.length : null;
      const pracAcc = prac.total >= 5 ? prac.rate : null;
      const acc = mockAcc != null && pracAcc != null ? 0.6 * mockAcc + 0.4 * pracAcc : mockAcc ?? pracAcc ?? 0.5;
      const gap = sec[D.section].gap ?? (800 - sec[D.section].level) * 0.3;
      const score = D.share * (1 - acc) * (1 + gap / 250) + 0.0001 * D.share;
      const reasons = [];
      if (items.length) reasons.push(`mock: ${mRight}/${items.length} right`);
      if (pracAcc != null) reasons.push(`practice: ${Math.round(pracAcc * 100)}% of last ${prac.total}`);
      reasons.push(`${Math.round(D.share * 100)}% of ${D.section === "rw" ? "R&W" : "Math"}`);
      return { k, acc, score, reasons };
    }).sort((a, b) => b.score - a.score);
    const days = progress.target.date ? Math.ceil((Date.parse(progress.target.date + "T12:00:00") - Date.now()) / 864e5) : null;
    const gapTotal = (sec.rw.gap ?? 60) + (sec.math.gap ?? 60);
    let goal = gapTotal > 150 ? 25 : gapTotal > 60 ? 20 : 15;
    if (days != null && days > 0 && days < 14) goal = Math.min(30, goal + 5);
    let top = prios.slice(0, 4).map((p) => p.k);
    for (const s of ["rw", "math"]) if ((sec[s].gap ?? 1) > 0 && !top.some((k) => DOMAINS[k].section === s)) top[3] = prios.find((p) => DOMAINS[p.k].section === s).k;
    top = [...new Set(top)];
    const weights = top.map((k) => prios.find((p) => p.k === k).score);
    const wsum = weights.reduce((a, b) => a + b, 0) || 1;
    const counts = {};
    top.forEach((k, i) => { counts[k] = Math.max(2, Math.round((goal * weights[i]) / wsum)); });
    counts[top[0]] = Math.max(2, counts[top[0]] + goal - Object.values(counts).reduce((a, b) => a + b, 0));
    const daysSinceMock = (Date.now() - mk.at) / 864e5;
    const rot = [prios[0].k, prios[1].k, prios[0].k, prios[2].k, prios[1].k, prios[3].k];
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      let task;
      if (days != null && i === days) task = { text: "test day: light review, then rest", kind: "test" };
      else if (i === 6) task = daysSinceMock + 6 >= 13 ? { text: "quick mock to refresh your plan", kind: "mock" } : { text: "review missed + mixed set", kind: "review" };
      else task = { text: `${DOMAINS[rot[i]].short} focus · ${goal} q`, kind: "practice", dom: rot[i] };
      week.push({ key: dayKey(d), d, task, done: attemptsOn(dayKey(d)), goal });
    }
    return { imp, mk, sec, prios, goal, counts, days, week, tgt };
  }
  function startTodaySet(plan) {
    const ids = [], ex = new Set();
    for (const [dom, n] of Object.entries(plan.counts)) {
      const b = plan.sec[DOMAINS[dom].section].band;
      for (let i = 0; i < n; i++) { const q = pickQuestion({ domain: dom, diff: sampleDiff(b), exclude: ex }); ids.push(q.id); ex.add(q.id); }
    }
    ids.sort((a, b) => (getQ(a).section === "rw" ? 0 : 1) - (getQ(b).section === "rw" ? 0 : 1));
    beginSet({ kind: "plan", label: "Today's set", ids });
  }
  function beginSet({ kind, label, ids, timed }) {
    progress.set = { kind, label, date: dayKey(), ids, i: 0, results: [], timeLeft: timed && progress.timeMult ? Math.round(timed * progress.timeMult) : null };
    ui.pr.source = "set";
    save();
    loadPracticeQuestion();
    go("practice");
  }
  function drillIds(d) {
    const ids = [], ex = new Set();
    const skills = d.skills.length ? d.skills : weakestSkills(3).map((s) => s.skill);
    for (let i = 0; i < d.count; i++) {
      const sk = skills[i % skills.length];
      const q = pickBySkill(sk, d.diff === "any" ? null : Number(d.diff), ex);
      if (q && !ex.has(q.id)) { ids.push(q.id); ex.add(q.id); }
    }
    return ids;
  }
  function runDrill(d) {
    const ids = drillIds(d);
    if (!ids.length) { toast("No questions match that drill."); return; }
    const secs = d.timed ? ids.reduce((s, id) => s + PACE[getQ(id).section], 0) : null;
    beginSet({ kind: "drill", label: d.name || "custom drill", ids, timed: secs });
  }

  // ------------------------------------------------------------------ mock engine
  function distribute(n, mix) {
    const raw = [1, 2, 3].map((d) => ({ d, x: n * mix[d] }));
    const out = { 1: 0, 2: 0, 3: 0 };
    let used = 0;
    for (const r of raw) { out[r.d] = Math.floor(r.x); used += out[r.d]; }
    raw.sort((a, b) => (b.x % 1) - (a.x % 1)).slice(0, n - used).forEach((r) => { out[r.d]++; });
    return out;
  }
  function buildModule(am, section, n, route) {
    const spec = MOCK_SPEC[am.kind][section];
    const mix = n === 1 ? DIFF_MIX.m1 : DIFF_MIX[route];
    const used = new Set(am.modules.flatMap((m) => m.ids));
    const qs = [], genUse = {};
    for (const [dom, count] of Object.entries(spec.counts)) {
      const dist = distribute(count, mix);
      const wanted = [...Array(dist[1]).fill(1), ...Array(dist[2]).fill(2), ...Array(dist[3]).fill(3)];
      for (const d of wanted) {
        if (section === "rw") {
          const pool = BANK.filter((q) => q.section === "rw" && q.domain === dom && !used.has(q.id));
          if (!pool.length) continue;
          const key = (q) => Math.abs(q.diff - d) * 10 + (latest(q.id) ? 3 : 0) + Math.random() * 2;
          const q = pool.sort((a, b) => key(a) - key(b))[0];
          used.add(q.id); qs.push(q);
        } else {
          const gens = MATH.GENS.filter((g) => g.domain === dom && (genUse[g.id] || 0) < 2);
          const key = (g) => Math.abs(g.diff - d) * 10 + Math.random();
          const g = (gens.length ? gens : MATH.GENS.filter((x) => x.domain === dom)).sort((a, b) => key(a) - key(b))[0];
          genUse[g.id] = (genUse[g.id] || 0) + 1;
          qs.push(MATH.make(g.id, Math.floor(Math.random() * 1e9)));
        }
      }
    }
    const order = ["CS", "II", "SEC", "EOI"];
    const rnd = new Map(qs.map((q) => [q.id, Math.random()]));
    if (section === "rw") qs.sort((a, b) => order.indexOf(a.domain) - order.indexOf(b.domain) || a.diff - b.diff);
    else qs.sort((a, b) => a.diff - b.diff || rnd.get(a.id) - rnd.get(b.id));
    return { section, n, route: route || null, ids: qs.map((q) => q.id), ans: {}, marked: {}, elim: {}, time: {}, timeLeft: (am.mult ?? 1) ? Math.round(spec.secs * (am.mult ?? 1)) : null, cur: 0, reviewing: false };
  }
  function moduleAcc(m) {
    let got = 0, tot = 0;
    for (const id of m.ids) { const q = getQ(id); tot += W[q.diff]; if (isCorrect(q, m.ans[id])) got += W[q.diff]; }
    return tot ? got / tot : 0;
  }
  function sectionScore(m1, m2) {
    const p1 = moduleAcc(m1), a2 = moduleAcc(m2);
    const p2 = m2.route === "hard" ? 0.35 + 0.65 * a2 : 0.7 * a2;
    return clamp(round10(200 + 600 * (0.45 * p1 + 0.55 * p2)), 200, 800);
  }
  function startMock(kind) {
    const am = { id: "mk" + Date.now(), kind, mult: progress.timeMult, startedAt: Date.now(), stage: 0, onBreak: false, breakLeft: 0, modules: [] };
    am.modules.push(buildModule(am, "rw", 1));
    progress.activeMock = am;
    Object.assign(ui, { mockResult: null, pendingSubmit: false, navOpen: false, elimMode: false });
    save(true);
    go("mock");
  }
  const curModule = () => progress.activeMock && progress.activeMock.modules[progress.activeMock.stage];
  function submitModule() {
    const am = progress.activeMock, m = curModule();
    if (!am || !m) return;
    Object.assign(ui, { pendingSubmit: false, navOpen: false, elimMode: false });
    if (m.n === 1) {
      am.modules.push(buildModule(am, m.section, 2, moduleAcc(m) >= 0.6 ? "hard" : "easy"));
      am.stage++;
      toast(`Stop ${am.stage} of 4 done. Keep going!`);
    } else if (m.section === "rw") {
      am.modules.push(buildModule(am, "math", 1));
      am.stage++;
      am.onBreak = true; am.breakLeft = MOCK_SPEC[am.kind].breakSecs;
    } else { finishMock(); return; }
    save(true);
    render();
    scrollTo({ top: 0 });
  }
  function finishMock() {
    const am = progress.activeMock;
    const [r1, r2, m1, m2] = am.modules;
    const rw = sectionScore(r1, r2), math = sectionScore(m1, m2);
    const items = [];
    for (const m of am.modules) for (const id of m.ids) {
      const q = getQ(id), resp = m.ans[id], c = isCorrect(q, resp);
      items.push({ id, r: resp ?? null, c: c ? 1 : 0, s: m.section, m: m.n, d: q.domain, f: q.diff, k: skillOf(q), t: m.time[id] || 0 });
      if (resp != null && resp !== "") record(q, c, resp, "mock", m.time[id] || null);
    }
    const modules = am.modules.map((m) => ({ s: m.section, n: m.n, route: m.route, right: m.ids.filter((id) => isCorrect(getQ(id), m.ans[id])).length, total: m.ids.length }));
    const rec = { id: am.id, kind: am.kind, mult: am.mult ?? 1, at: Date.now(), rw, math, total: rw + math, route: { rw: r2.route, math: m2.route }, modules, items };
    progress.mocks.push(rec);
    progress.mocks = progress.mocks.slice(-20);
    progress.activeMock = null;
    ui.mockResult = rec.id;
    save(true);
    render();
    scrollTo({ top: 0 });
    toast(`Mock complete: ${rec.total}`);
  }
  function mockMissSet(mock) {
    const ids = [], ex = new Set();
    for (const it of mock.items.filter((i) => !i.c)) {
      if (ids.length >= 36) break;
      const q = getQ(it.id);
      if (!q) continue;
      ids.push(q.id); ex.add(q.id);
      const twin = remixOf(q);
      if (twin && !ex.has(twin.id) && !mock.items.some((i) => i.id === twin.id)) { ids.push(twin.id); ex.add(twin.id); }
    }
    return ids;
  }

  // ------------------------------------------------------------------ shell
  function go(view) {
    ui.view = view; ui.armed = {};
    if (view === "practice" && !ui.pr.q) loadPracticeQuestion();
    if (view === "vocab") ui.vocab.word = null;
    render();
  }
  function render() {
    const am = progress.activeMock;
    document.body.classList.toggle("testing", Boolean(am && ui.view === "mock" && !am.onBreak));
    document.body.classList.toggle("plain-notes", Boolean(progress.plainNotes));
    renderMenu();
    renderTools();
    const banner = document.getElementById("banner");
    banner.replaceChildren(am && ui.view !== "mock"
      ? el("div", { class: "banner" }, el("span", {}, el("b", { text: "Mock SAT paused. " }), am.onBreak ? "You're on the break." : `${SECTION[curModule().section]}, module ${curModule().n}: ${curModule().timeLeft == null ? "untimed, so take your time." : clock(curModule().timeLeft) + " left. The timer only runs while the test is open."}`), el("button", { class: "btn", type: "button", onclick: () => go("mock") }, "resume test"))
      : "");
    document.querySelector(".foot").style.display = ui.view === "home" ? "" : "none";
    document.getElementById("page-title").textContent = VIEWS.find(([k]) => k === ui.view)[1];
    const views = { home: renderHome, practice: renderPractice, bank: renderBank, mock: renderMock, stats: renderStats, review: renderReview, vocab: renderVocab, guides: renderGuides };
    document.getElementById("view").replaceChildren(views[ui.view]());
    document.getElementById("modal-root").replaceChildren(ui.refOpen ? renderReference() : "");
    renderDock();
  }
  function renderMenu() {
    const missed = missedIds().length;
    document.getElementById("menu").replaceChildren(...VIEWS.map(([k, label]) => el("button", { type: "button", "aria-current": ui.view === k ? "page" : false, onclick: () => { if (k === "mock" && !progress.activeMock) ui.mockResult = null; go(k); } },
      svg("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, svg("path", { d: ICONS[k] })),
      el("span", { class: "menu-label", text: label }), k === "review" && missed ? el("span", { class: "count", text: missed }) : null)));
  }
  function renderTools() {
    const ico = (d) => svg("svg", { width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" }, svg("path", { d }));
    document.getElementById("tools").replaceChildren(
      el("span", { class: "tag", title: "Study streak" }, ico("M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5"), el("b", { text: streak() }), "day streak"),
      el("span", { class: "tag", title: "Time studied today" }, ico("M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"), el("b", { id: "tool-today", text: fmtMin(progress.study[dayKey()] || 0) }), "today"),
      el("button", { class: "tag", type: "button", id: "focus-btn", "aria-label": "Focus timer, start or pause", onclick: () => { focus.running = !focus.running; renderFocus(); } }, el("span", { id: "focus-label", text: focus.phase === "focus" ? "Focus" : "Break" }), el("b", { id: "focus-clock", text: clock(focus.left) }), el("span", { id: "focus-state", text: focus.running ? "❚❚" : "▶" })),
      el("button", { class: "tag", type: "button", "aria-pressed": String(ui.dock === "calc"), onclick: () => { ui.dock = ui.dock === "calc" ? null : "calc"; renderDock(); } }, ico("M6 3h12v18H6zM9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01"), "Calculator"),
      el("button", { class: "tag", type: "button", onclick: () => { ui.refOpen = true; render(); } }, ico("M4 5h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z"), "Reference"),
      el("button", { class: "tag sun", type: "button", "aria-pressed": String(ui.dock === "gem"), onclick: () => { ui.dock = ui.dock === "gem" ? null : "gem"; renderDock(); } }, ico("M12 3l2.4 5.6L20 11l-5.6 2.4L12 19l-2.4-5.6L4 11l5.6-2.4z"), "Ask Gem"));
  }

  // ------------------------------------------------------------------ home dashboard
  function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }
  const stat = (label, value, note) => el("div", { class: "stat" }, el("span", { class: "label", text: label }), el("b", { text: value }), note ? el("span", { class: "tiny", text: note }) : null);
  function renderHome() {
    const imp = latestImport(), mk = latestMock(), plan = computePlan();
    const prac = flatAttempts().filter((a) => a.src !== "mock");
    const acc = prac.length ? Math.round((prac.filter((a) => a.c).length / prac.length) * 100) + "%" : "—";
    const est = plan ? String(plan.sec.rw.level + plan.sec.math.level) : mk ? String(mk.total) : imp ? String(imp.rw + imp.math) : "—";
    const days = progress.target.date ? Math.ceil((Date.parse(progress.target.date + "T12:00:00") - Date.now()) / 864e5) : null;
    const hero = el("div", { class: "hero" },
      el("div", {}, el("h2", { class: "h1", text: greeting() }),
        el("p", { class: "sub", style: "margin:6px 0 0", text: days != null && days >= 0 ? `${days} day${days === 1 ? "" : "s"} until your SAT${progress.target.total ? ` · target ${progress.target.total}` : ""}.` : "Pick up the trail where you left it." })),
      el("div", { class: "row" },
        el("button", { class: "btn", type: "button", onclick: () => { ui.pr.source = "mixed"; ui.pr.skill = "all"; loadPracticeQuestion(); go("practice"); } }, "Practice questions"),
        el("button", { class: "btn ghost", type: "button", onclick: () => go("mock") }, progress.activeMock ? "Resume practice test" : "Take a practice test")));
    const stats = el("div", { class: "stats" },
      stat("Score estimate", est, plan ? (imp ? "imported score + practice test" : "latest practice test") : mk ? "latest practice test" : imp ? "imported score" : "take a practice test"),
      stat("Questions answered", String(prac.length), `${flatAttempts().filter((a) => dayKey(new Date(a.at)) === dayKey()).length} today`),
      stat("Accuracy", acc, "practice questions"),
      stat("Study streak", `${streak()} day${streak() === 1 ? "" : "s"}`, `${fmtMin(progress.study[dayKey()] || 0)} studied today`));

    const toScores = (id) => () => { go("stats"); setTimeout(() => document.getElementById(id)?.focus(), 30); };
    const task = (done, name, note, mins, label, onclick) => el("div", { class: "task" + (done ? " done" : "") },
      el("span", { class: "tick", "aria-hidden": "true", text: done ? "✓" : "" }),
      el("div", {}, el("b", { text: name }), el("span", { class: "tiny", text: note })),
      el("span", { class: "tiny", text: mins }),
      el("button", { class: "btn small" + (done ? " ghost" : ""), type: "button", onclick }, label));
    const doneCount = (imp ? 1 : 0) + (mk ? 1 : 0);
    const setup = sheet("", el("h2", { class: "title", text: plan ? "Your plan inputs" : "Get your tailored plan" }),
      el("p", { class: "sub", text: plan ? "Update these anytime and the plan adjusts." : "Your plan unlocks after two steps: import a real score, then take a diagnostic practice test here." }),
      el("div", { class: "tasks" },
        task(Boolean(imp), "Import your SAT score", imp ? `${SCORE_KINDS[imp.kind]?.label || "Score"} · ${imp.rw + imp.math} (${niceDate(imp.date)})` : "Optional · official SAT, PSAT or Bluebook practice test", "1 min", imp ? "Add another" : "Import", toScores("imp-rw")),
        task(Boolean(mk), "Take a diagnostic test", mk ? `${MOCK_SPEC[mk.kind].label} · ${mk.total} (${niceDate(mk.at)})` : progress.activeMock ? "In progress" : "Quick adaptive test, Reading and Writing + Math", (mockMins("quick") ? mockMins("quick") + " min" : "untimed"), progress.activeMock ? "Resume" : mk ? "Retake" : "Start", () => go("mock")),
        task(Boolean(progress.target.total), "Set your target score", progress.target.total ? `${progress.target.total}${progress.target.date ? " by " + niceDate(progress.target.date) : ""}` : "Optional, but it sharpens your daily plan", "1 min", progress.target.total ? "Edit" : "Set", toScores("tgt-total"))),
      el("div", { class: "row", style: "margin-top:14px" }, el("div", { class: "meter", style: "flex:1;min-width:140px" }, el("i", { style: `width:${plan ? 100 : doneCount * 33}%` })),
        el("span", { class: "tiny", text: plan ? "Plan unlocked" : "Take the diagnostic to unlock your plan" })));

    if (!plan) {
      const practiceOne = () => { ui.pr.source = "mixed"; ui.pr.skill = "all"; loadPracticeQuestion(); go("practice"); };
      const arrow = () => el("span", { class: "go-chip", "aria-hidden": "true" }, svg("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "2.2", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg("path", { d: "M3 8h9M8.5 4.5 12 8l-3.5 3.5" })));
      const nss = { "vector-effect": "non-scaling-stroke" };
      const lobe = svg("svg", { class: "lobe", viewBox: "0 0 1000 600", preserveAspectRatio: "none", "aria-hidden": "true" },
        svg("path", { class: "landmass wide", ...nss, d: "M70 590 C20 520 10 400 40 300 C70 200 60 130 130 80 C210 25 300 60 380 50 C470 38 520 0 620 20 C720 40 760 90 840 70 C930 48 990 110 980 200 C972 270 900 290 905 340 C910 390 990 400 990 470 C990 560 920 600 820 592 C700 584 640 560 560 580 C460 605 360 570 260 590 C180 606 110 615 70 590 Z" }),
        svg("path", { class: "landmass tall", ...nss, d: "M60 40 C250 0 420 50 560 20 C720 -10 900 10 960 70 C1000 140 930 200 960 290 C990 380 1000 470 960 540 C900 600 760 570 620 590 C440 612 300 570 160 592 C70 605 20 560 30 480 C40 400 0 330 20 240 C35 160 -10 80 60 40 Z" }));
      const trail = (cls, d) => [svg("path", { class: "edge " + cls, ...nss, d }), svg("path", { class: "dash " + cls, ...nss, d })];
      const route = el("div", { class: "route", "aria-hidden": "true" },
        el("span", { class: "here" }, svg("svg", { width: "26", height: "32", viewBox: "0 0 26 32" }, svg("path", { d: "M13 30C6 21 2 16 2 11a11 11 0 0 1 22 0c0 5-4 10-11 19z" }), svg("circle", { cx: "13", cy: "11", r: "4" })), el("span", { text: "You are here: the start" })),
        svg("svg", { class: "trail", viewBox: "0 0 100 100", preserveAspectRatio: "none" }, trail("wide", "M50 0C28 22 72 42 46 62C32 74 36 88 100 88"), trail("tall", "M50 0C28 30 72 55 46 78C38 88 46 95 50 100")));
      const first = el("div", { class: "first" }, lobe, route,
        el("h2", { class: "h1" }, "Let's find your ", el("mark", { class: "hl", text: "score" }), "."),
        el("p", { class: "sub", text: "One adaptive practice test, Reading and Writing plus Math, shows where you stand and builds your daily plan. The timer pauses whenever you leave." }),
        el("div", { class: "row go" },
          el("button", { class: "btn big sun", type: "button", onclick: () => go("mock") }, progress.activeMock ? "Resume your diagnostic" : "Start your diagnostic", el("span", { class: "btn-note", text: progress.activeMock ? "in progress" : (mockMins("quick") ? mockMins("quick") + " min" : "untimed") }), arrow()),
          el("span", { class: "row", style: "gap:14px" }, el("button", { class: "link scribble", type: "button", onclick: practiceOne }, "or just try one question"), el("span", { class: "note", "aria-hidden": "true", text: "← not ready? start small" }))),
        el("p", { class: "tiny", style: "color:inherit" }, "Got a real SAT or PSAT score? ", el("button", { class: "link", type: "button", onclick: toScores("imp-rw") }, "Add it"), " to sharpen the estimate. Optional."),
        el("div", { class: "map-key", "aria-hidden": "true" }, [["var(--sun)", "Next step"], ["var(--coral)", "Reading and Writing"], ["var(--sky)", "Math"], ["var(--lilac)", "Tools"]].map(([c, t]) => el("span", {}, el("i", { style: "background:" + c }), t))));
      const quick = el("section", { class: "jump" }, el("h2", { class: "title", text: "Or wander off the path" }),
        el("div", { class: "coast" },
          [["rw", "Reading and Writing", () => { ui.pr.source = "rw"; ui.pr.skill = "all"; loadPracticeQuestion(); go("practice"); }],
            ["math", "Math", () => { ui.pr.source = "math"; ui.pr.skill = "all"; loadPracticeQuestion(); go("practice"); }],
            ["tool", "Question bank", () => go("bank")],
            ["rw", "Flashcards", () => go("vocab")],
            ["tool", "Question Rush", () => { ui.pr.source = "rush"; ui.rush = null; go("practice"); }]].map(([c, a, f]) => el("button", { class: "cap " + c, type: "button", onclick: f }, a, arrow()))));
      return el("div", { class: "stack" }, first, prac.length || imp ? stats : null, quick);
    }

    const set = progress.set;
    const today = set && set.kind === "plan" && set.date === dayKey();
    const setActive = today && set.i < set.ids.length;
    const mins = (k, n) => Math.round((n * PACE[DOMAINS[k].section]) / 60);
    const todayCard = sheet("",
      el("div", { class: "row between", style: "margin-bottom:12px" },
        el("div", {}, el("h2", { class: "title", text: "Today's plan" }), el("span", { class: "tiny", text: `${plan.goal} questions · about ${Object.entries(plan.counts).reduce((s, [k, n]) => s + mins(k, n), 0)} min` })),
        setActive ? el("button", { class: "btn sun", type: "button", onclick: () => { ui.pr.source = "set"; loadPracticeQuestion(); go("practice"); } }, `Continue (${set.i}/${set.ids.length})`)
          : el("button", { class: "btn sun", type: "button", onclick: () => startTodaySet(plan) }, today ? "Start another set" : "Start")),
      el("div", { class: "tasks" }, Object.entries(plan.counts).map(([k, n]) => el("div", { class: "task" },
        el("span", { class: "tick", "aria-hidden": "true" }),
        el("div", {}, el("b", { text: DOMAINS[k].name }), el("span", { class: "tiny", text: `${DOMAINS[k].section === "rw" ? "R&W" : "Math"} · ${n} questions · ${plan.sec[DOMAINS[k].section].band.label}` })),
        el("span", { class: "tiny", text: `${mins(k, n)}m` }),
        el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.pr.source = "domain"; ui.pr.skill = "dom:" + k; loadPracticeQuestion(); go("practice"); } }, "Practice")))),
      today && !setActive ? el("p", { class: "tiny", style: "margin:10px 0 0", text: `Done today: ${set.results.filter((r) => r).length}/${set.ids.length} correct.` }) : null);
    const level = (s) => { const x = plan.sec[s]; return el("div", { class: "box" }, el("p", { class: "label", text: SECTION[s] }),
      el("div", { class: "numgrid" }, [["Imported", x.imported], ["Practice test", x.mock], ["Working level", x.level], ["Target", x.target ?? "—"]].map(([k, v]) => el("div", { class: "numbox" }, el("small", { text: k }), el("b", { text: v })))),
      el("p", { class: "tiny", style: "margin:8px 0 0", text: x.gap == null ? `Practicing ${x.band.label}. Set a target to size your gap.` : x.gap > 0 ? `${x.gap} points to go · practicing ${x.band.label}` : `At or above target · practicing ${x.band.label}` })); };
    const where = sheet("", el("h2", { class: "title", text: "Where you stand" }), el("p", { class: "sub", text: "Working level blends your imported score with your latest practice test. The newer one counts a little more." }), el("div", { class: "stack", style: "gap:12px" }, level("rw"), level("math")));
    const week = sheet("", el("h2", { class: "title", text: "This week" }), el("div", { class: "tour" }, plan.week.map((d, i) => el("div", {},
      el("span", { class: "k", text: d.d.toLocaleDateString(undefined, { weekday: "narrow" }) }),
      el("span", {}, el("b", { text: i === 0 ? "Today" : d.d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) }), el("br"), el("small", { text: d.task.text })),
      i === 0 && d.task.kind === "practice" ? el("span", { class: "r", text: d.done >= d.goal ? "✓ Done" : `${d.done}/${d.goal}` })
        : d.task.kind === "mock" ? el("button", { type: "button", onclick: () => go("mock") }, "Test") : d.task.dom ? el("button", { type: "button", onclick: () => { ui.pr.source = "domain"; ui.pr.skill = "dom:" + d.task.dom; loadPracticeQuestion(); go("practice"); } }, "Practice") : el("span")))));
    const focusCard = sheet("", el("h2", { class: "title", text: "Focus areas" }), el("p", { class: "sub", text: "Ranked by how many points each area is likely costing you." }),
      el("div", { class: "tour" }, plan.prios.slice(0, 6).map((p, i) => el("div", {},
        el("span", { class: "k", text: i + 1 }),
        el("span", {}, el("span", { style: "display:inline-flex;gap:8px;align-items:center" }, gem(levelOf(p.acc)), el("b", { text: DOMAINS[p.k].name })), el("br"), el("small", { text: `${Math.round(p.acc * 100)}% accuracy · ${p.reasons.join(" · ")}` })),
        el("button", { type: "button", onclick: () => { ui.pr.source = "domain"; ui.pr.skill = "dom:" + p.k; loadPracticeQuestion(); go("practice"); } }, "Practice")))));
    return el("div", { class: "stack" }, hero, stats, el("div", { class: "cols" }, todayCard, week), el("div", { class: "cols" }, focusCard, where), setup);
  }

  // ------------------------------------------------------------------ guides: cheatsheets + score calculator
  const CHEATS = [
    ["Boundaries: punctuation between clauses", ["Two complete sentences need a period, a semicolon, or a comma plus and/but/or/so/for/nor/yet.", "A comma alone between two complete sentences is a comma splice. It's always wrong on the SAT.", "A colon must follow a complete sentence. What comes after it explains or lists.", "Extra information is set off by a matching pair: two commas, two dashes, or two parentheses. Never mix them.", "No comma between a subject and its verb, even when the subject is long."]],
    ["Form, structure and sense", ["Find the real subject: cross out phrases like “of the letters” or “along with…” before choosing a verb.", "Each, every, either, neither, everyone and the number are singular.", "With neither…nor or either…or, the verb agrees with the nearer subject.", "Its = belonging to it. It's = it is. Their = belonging to them. Collective nouns like team and company are singular.", "An opening modifier (“Found in 2019, …”) must be followed by the thing it describes.", "Keep tenses consistent unless the time actually changes. “By the time X happened, Y had…” uses the past perfect."]],
    ["Transitions", ["Addition: additionally, furthermore, moreover, similarly.", "Contrast: however, nevertheless, by contrast, instead, even so.", "Cause and effect: therefore, as a result, consequently, thus.", "Example: for example, for instance, specifically.", "Sequence and time: eventually, later, meanwhile, finally, previously.", "Summary or synthesis: in other words, taken together, in short.", "Read the sentence before and after the blank, name the relationship, then pick the word."]],
    ["Rhetorical synthesis (student notes)", ["Read the goal in the question first. Underline every part of it.", "The right answer meets every part of the goal, often including the audience (familiar or unfamiliar).", "Ignore accuracy alone: wrong choices are usually true facts from the notes that miss the goal."]],
    ["Reading: words in context and evidence", ["Cover the choices, predict a word from the clues around the blank, then match.", "Watch contrast signals (but, although, far from) that flip the meaning.", "Evidence questions: the right choice supports the exact claim, not just the topic.", "Data questions: check every number against the table, and don't accept causal claims from correlations.", "Inference questions: pick the conclusion the text forces, not the one that's merely possible."]],
    ["Linear equations and systems", ["Slope = (y₂ − y₁) / (x₂ − x₁). In y = mx + b, m is the rate and b is the starting value.", "Parallel lines have equal slopes. Perpendicular slopes multiply to −1.", "No solution: same slope, different intercept (coefficients proportional, constants not).", "Infinitely many solutions: the equations are multiples of each other.", "Look for shortcuts: if 3x = 18, then 6x = 36 without finding x."]],
    ["Quadratics and nonlinear functions", ["Discriminant b² − 4ac: positive = 2 real solutions, zero = 1, negative = none.", "For ax² + bx + c = 0: sum of solutions = −b/a, product = c/a.", "Vertex form y = a(x − h)² + k has vertex (h, k). The minimum (a > 0) or maximum (a < 0) value is k.", "Vertex x-coordinate in standard form: x = −b / (2a).", "Exponential f(t) = a(b)ᵗ: b > 1 grows by (b − 1)×100% per step; b < 1 decays by (1 − b)×100%."]],
    ["Percents, ratios and data", ["Percent change = (new − old) / old × 100.", "Successive changes multiply: +25% then −20% is 1.25 × 0.80 = 1, no change.", "Mean uses every value; median only the middle. An outlier moves the mean much more than the median.", "Probability = favorable outcomes / total in the group the question names. Read “of the students who…” carefully.", "Unit rates: divide to get per-one, then multiply. Keep units in your work."]],
    ["Geometry and trigonometry", ["Special right triangles: 30-60-90 is x, x√3, 2x. 45-45-90 is s, s, s√2. Common triples: 3-4-5, 5-12-13, 8-15-17.", "SOH-CAH-TOA. In a right triangle, sin A = cos B for the two acute angles.", "Circle: (x − h)² + (y − k)² = r². Complete the square to find the center and radius.", "Arc length = (angle/360) × 2πr. Sector area = (angle/360) × πr².", "Similar figures: lengths scale by k, areas by k², volumes by k³.", "Triangle angles add to 180°. A full circle is 360° or 2π radians."]]
  ];
  function estimateSection(right, total, hard) {
    const a = total ? clamp(right / total, 0, 1) : 0;
    const p2 = hard ? 0.35 + 0.65 * a : 0.7 * a;
    return clamp(round10(200 + 600 * (0.45 * a + 0.55 * p2)), 200, 800);
  }
  function renderGuides() {
    const g = ui.guides;
    const out = (sec, total) => estimateSection(g[sec], total, g[sec] / total >= 0.6);
    const calc = sheet("", el("h2", { class: "title", text: "Score calculator" }),
      el("p", { class: "sub", text: "Enter how many questions you got right on a full practice test to estimate your section scores. It assumes you reached the harder Module 2 if you got at least 60% right." }),
      el("div", { class: "cols" },
        el("label", { class: "field" }, "Reading and Writing correct (out of 54)", el("input", { class: "input", id: "sc-rw", type: "number", min: "0", max: "54", value: g.rw, oninput: (e) => { g.rw = clamp(Number(e.target.value) || 0, 0, 54); document.getElementById("sc-out").textContent = scoreOut(); } })),
        el("label", { class: "field" }, "Math correct (out of 44)", el("input", { class: "input", id: "sc-math", type: "number", min: "0", max: "44", value: g.math, oninput: (e) => { g.math = clamp(Number(e.target.value) || 0, 0, 44); document.getElementById("sc-out").textContent = scoreOut(); } }))),
      el("p", { id: "sc-out", style: "font-size:22px;font-weight:800;margin:14px 0 4px", "aria-live": "polite", text: "" }),
      el("p", { class: "tiny", style: "margin:0", text: "An estimate from Clearline's model, not the College Board's official scale." }));
    const scoreOut = () => { const rw = out("rw", 54), m = out("math", 44); return `${rw + m} total · R&W ${rw} · Math ${m}`; };
    calc.querySelector("#sc-out").textContent = scoreOut();
    const sheets = sheet("", el("h2", { class: "title", text: "Cheatsheets" }), el("p", { class: "sub", text: "The rules and formulas that come up most, on one page each." }),
      el("div", { class: "stack", style: "gap:8px" }, CHEATS.map(([t, items], i) => el("details", { class: "cheat", open: i === 0 }, el("summary", {}, el("span", { text: t }), el("span", { class: "tiny", text: `${items.length} points` })), el("ul", {}, items.map((x) => el("li", { text: x })))))));
    return el("div", { class: "cols", style: "align-items:start" }, sheets, el("div", { class: "stack" }, calc,
      sheet("", el("h2", { class: "title", text: "Reference sheet" }), el("p", { class: "sub", text: "The same formulas you get on test day." }), el("button", { class: "btn ghost", type: "button", onclick: () => { ui.refOpen = true; render(); } }, "Open reference sheet"))));
  }

  // ------------------------------------------------------------------ practice
  function loadPracticeQuestion(q) {
    const pr = ui.pr;
    if (tutorCtl) tutorCtl.abort();
    if (!q) {
      const set = progress.set;
      const diff = pr.diff === "any" ? null : Number(pr.diff);
      const ex = new Set(pr.q ? [pr.q.id] : []);
      if (pr.source === "set") q = set && set.i < set.ids.length ? getQ(set.ids[set.i]) : null;
      else if (pr.source === "missed" || pr.source === "saved") { const ids = (pr.source === "missed" ? missedIds() : savedIds()).filter((id) => id !== pr.q?.id); q = ids.length ? getQ(ids[Math.floor(Math.random() * Math.min(ids.length, 8))]) : null; }
      else if (pr.source === "weak") q = pickBySkill(shuffle(weakestSkills(2))[0].skill, diff, ex);
      else if (pr.skill.startsWith("dom:")) q = pickQuestion({ domain: pr.skill.slice(4), diff, exclude: ex });
      else if (pr.skill !== "all") q = pickBySkill(pr.skill, diff, ex);
      else q = pickQuestion({ section: pr.source === "rw" || pr.source === "math" ? pr.source : null, diff, exclude: ex });
    }
    Object.assign(pr, { q, picked: null, spr: "", checked: false, shownAt: Date.now(), hint: false });
  }
  function checkPractice() {
    const pr = ui.pr, q = pr.q;
    if (!q || pr.checked) return;
    const resp = q.type === "spr" ? pr.spr : pr.picked;
    if (resp == null || resp === "") return;
    if (q.type === "spr" && !parseNum(resp)) { toast("Enter a number, a fraction like 3/4, or a decimal."); return; }
    pr.checked = true;
    const ok = isCorrect(q, resp);
    record(q, ok, resp, "practice", (Date.now() - pr.shownAt) / 1000);
    if (pr.source === "set" && progress.set) progress.set.results[progress.set.i] = ok ? 1 : 0;
    save();
    render();
    if (ok) spark(document.querySelector(".verdict-title"));
    (document.getElementById("twin-btn") || document.getElementById("next-btn"))?.focus();
  }
  function nextPractice() {
    if (ui.pr.source === "set" && progress.set) { progress.set.i++; save(); }
    ui.qCount++;
    loadPracticeQuestion();
    render();
  }
  function skillSelect(value, onchange, id) {
    return el("select", { class: "input", id, onchange },
      el("option", { value: "all", selected: value === "all" }, "All skills"),
      DOM_KEYS.map((d) => el("optgroup", { label: `${DOMAINS[d].section === "rw" ? "R&W" : "Math"} · ${DOMAINS[d].name}` },
        el("option", { value: "dom:" + d, selected: value === "dom:" + d }, `All of ${DOMAINS[d].name}`),
        DOMAINS[d].skills.map((s) => el("option", { value: s, selected: value === s }, s)))));
  }
  function renderPractice() {
    const pr = ui.pr;
    const sources = [["mixed", "Mixed"], ["rw", "Reading and Writing"], ["math", "Math"], ["weak", "Weak spots"], ["missed", "Missed"], ["saved", "Marked for review"], ["rush", "Question Rush"]];
    if (progress.set) sources.unshift(["set", progress.set.label]);
    const parts = [el("div", { class: "controls on-desk" },
      el("div", { class: "pills", role: "group", "aria-label": "Question source" }, sources.map(([k, label]) =>
        el("button", { class: "pill", type: "button", "aria-pressed": String(pr.source === k || (k === "mixed" && pr.source === "domain")), onclick: () => { pr.source = k; pr.skill = "all"; if (k !== "rush") ui.rush = null; loadPracticeQuestion(); render(); } }, label))),
      !["set", "missed", "saved", "weak", "rush"].includes(pr.source) ? [
        el("label", { class: "field" }, "Skill", skillSelect(pr.skill, (e) => { pr.skill = e.target.value; pr.source = pr.skill === "all" ? "mixed" : "domain"; loadPracticeQuestion(); render(); }, "pr-skill")),
        el("label", { class: "field" }, "Difficulty", el("select", { class: "input", id: "pr-diff", onchange: (e) => { pr.diff = e.target.value; loadPracticeQuestion(); render(); } },
          [["any", "Any"], ["1", "Easy"], ["2", "Medium"], ["3", "Hard"]].map(([v, l]) => el("option", { value: v, selected: pr.diff === v }, l))))
      ] : null)];
    if (pr.source === "rush") { parts.push(renderRush()); return el("div", {}, parts); }
    const set = progress.set;
    if (pr.source === "set" && set) {
      parts.push(el("div", { class: "setbar" }, el("span", { text: set.label }),
        el("div", { class: "ticks", "aria-label": `${set.i} of ${set.ids.length} done` }, set.ids.map((_, i) => el("i", { class: set.results[i] === 1 ? "ok" : set.results[i] === 0 ? "no" : i === set.i ? "on" : "" }))),
        el("span", { id: "set-clock", text: set.timeLeft != null ? clock(set.timeLeft) : `${Math.min(set.i + 1, set.ids.length)}/${set.ids.length}` })));
      if (set.i >= set.ids.length) {
        const right = set.results.filter((r) => r).length;
        parts.push(sheet("", title("set complete"), el("p", { style: "font-weight:900;font-size:56px;margin:0", text: `${right}/${set.ids.length}` }),
          el("p", { class: "sub", text: right / set.ids.length >= 0.8 ? "Strong set. Your plan will lean harder next time." : "Misses are saved in review. Retry them tomorrow while the explanations are fresh." }),
          el("div", { class: "row" }, el("button", { class: "btn", type: "button", onclick: () => go("home") }, "back home"), el("button", { class: "btn ghost", type: "button", onclick: () => { progress.set = null; pr.source = "mixed"; save(); loadPracticeQuestion(); render(); } }, "free practice"))));
        return el("div", {}, parts);
      }
    }
    if (!pr.q) { parts.push(sheet("", el("div", { class: "empty", text: pr.source === "missed" ? "No missed questions right now." : pr.source === "saved" ? "Nothing saved yet. Tap “save” on any question to keep it here." : "No question matches this filter." }))); return el("div", {}, parts); }
    parts.push(renderQuestion(pr.q));
    return el("div", {}, parts);
  }
  function chipsFor(q, full = true) {
    const st = skillStats(skillOf(q));
    return el("div", { class: "chips" },
      el("span", { class: "chip" }, gem(levelOf(st.total >= 3 ? st.rate : null)), SECTION[q.section]),
      el("span", { class: "chip", text: skillOf(q) }),
      el("span", { class: "chip", text: DIFF[q.diff] }),
      full ? el("span", { class: "chip", text: q.generated ? "computed answer" : "hand-checked" }) : null,
      q.type === "spr" ? el("span", { class: "chip", text: "type your answer" }) : null);
  }
  function stimulus(q) {
    const isEq = (p) => q.section === "math" && p.length < 40 && /=/.test(p) && !/[.?]$/.test(p);
    return el("div", { class: "passage" },
      (q.passage || []).map((p) => el("p", { class: isEq(p) ? "eq" : "" }, rich(p))),
      q.table ? el("div", { class: "tbl" }, el("table", {},
        el("thead", {}, el("tr", {}, q.table.head.map((h) => el("th", { text: h })))),
        el("tbody", {}, q.table.rows.map((r) => el("tr", {}, r.map((c, i) => el(i === 0 ? "th" : "td", { class: i ? "n" : "", text: c }))))))) : null,
      q.list ? el("ul", {}, q.list.map((li) => el("li", { text: li }))) : null,
      q.passage2 ? el("p", {}, rich(q.passage2)) : null);
  }
  function questionTop(q) {
    const saved = Boolean(progress.saved[q.id]);
    const set = progress.set;
    const num = ui.pr.source === "set" && set ? set.i + 1 : ui.qCount;
    return el("div", { class: "qtop" },
      el("div", { class: "left" }, el("span", { class: "qnum", text: num }),
        el("button", { class: "flag", type: "button", "aria-pressed": String(saved), onclick: () => { if (saved) delete progress.saved[q.id]; else progress.saved[q.id] = Date.now(); save(); render(); toast(saved ? "Removed from review list" : "Marked for review"); } },
          svg("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: saved ? "currentColor" : "none", stroke: "currentColor", "stroke-width": "2", "aria-hidden": "true" }, svg("path", { d: "M6 3h12v18l-6-4-6 4z" })), saved ? "Marked for review" : "Mark for review")),
      el("div", { class: "row", style: "gap:6px" },
        el("button", { class: "btn small ghost", type: "button", title: "Same skill, different question", onclick: () => { const r = remixOf(q); if (r) { if (ui.pr.source === "set") ui.pr.source = "mixed"; loadPracticeQuestion(r); render(); toast("Remixed: same skill, new question"); } } }, "↻ Remix"),
        q.section === "math" ? el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.dock = "calc"; renderDock(); } }, "Calculator") : null,
        q.section === "math" ? el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.refOpen = true; render(); } }, "Reference") : null));
  }
  function renderQuestion(q) {
    const pr = ui.pr;
    const hasStim = (q.passage && q.passage.length) || q.table || q.list;
    const two = q.section === "rw" && hasStim;
    let answerArea;
    if (q.type === "spr") {
      const ok = pr.checked && isCorrect(q, pr.spr);
      answerArea = el("div", { class: "spr" + (pr.checked ? (ok ? " is-right" : " is-wrong") : "") },
        el("label", { class: "field", for: "spr-input" }, "Your answer"),
        el("input", { id: "spr-input", inputmode: "decimal", autocomplete: "off", value: pr.spr, disabled: pr.checked, placeholder: "12, −3, 3/4, .75",
          oninput: (e) => { pr.spr = e.target.value; const b = document.getElementById("check-btn"); if (b) b.disabled = !pr.spr.trim(); },
          onkeydown: (e) => { if (e.key === "Enter") { e.preventDefault(); checkPractice(); } } }),
        el("span", { class: "tiny", text: "Fractions and decimals both count. For long decimals, enter at least 3 decimal places." }));
    } else {
      answerArea = el("div", { class: "choices", role: "radiogroup", "aria-label": "Answer choices" }, q.choices.map((c, i) => {
        let cls = "choice";
        const missed = pr.checked && i === pr.picked && i !== q.answer;
        if (pr.checked && i === q.answer) cls += " is-right";
        else if (missed) cls += " is-wrong";
        return [el("button", { class: cls, type: "button", role: "radio", id: "choice-" + i, "aria-checked": String(pr.picked === i), disabled: pr.checked,
          onclick: () => { if (!pr.checked) { pr.picked = i; render(); document.getElementById("check-btn")?.focus(); } } },
          el("span", { class: "bubble", text: LETTERS[i] }), el("span", { class: missed ? "pen-struck" : "" }, c, missed ? penMark("scratch") : null), pr.checked && i === q.answer ? penMark("ring") : null),
          missed && q.why[i] ? el("p", { class: "pen choice-note" }, "↑ You picked this. ", q.why[i]) : null];
      }));
    }
    const canCheck = q.type === "spr" ? Boolean(pr.spr.trim()) : pr.picked !== null;
    const twin = pr.checked && pr.source !== "set" && !isCorrect(q, q.type === "spr" ? pr.spr : pr.picked);
    const answerSec = [
      !two ? stimulus(q) : null,
      el("p", { class: "prompt" }, rich(q.prompt)),
      answerArea,
      el("div", { class: "actions" },
        twin ? el("button", { class: "btn sun", id: "twin-btn", type: "button", title: "A new question on the same skill", onclick: () => { const r = remixOf(q); if (!r) { toast("No twin left for this skill. Try the next question."); return; } ui.qCount++; loadPracticeQuestion(r); render(); } }, "Try a twin") : null,
        pr.checked ? el("button", { class: twin ? "btn ghost" : "btn", id: "next-btn", type: "button", onclick: nextPractice }, "next")
          : el("button", { class: "btn", id: "check-btn", type: "button", disabled: !canCheck, onclick: checkPractice }, "check answer"),
        !pr.checked ? el("button", { class: "btn small ghost", type: "button", onclick: nextPractice }, "skip") : null,
        !pr.checked ? el("button", { class: "link pen-link", type: "button", "aria-expanded": String(pr.hint), onclick: () => { pr.hint = !pr.hint; render(); } }, pr.hint ? "hide the hint" : "How should I think about this?") : null,
        q.type !== "spr" ? el("span", { class: "tiny" }, el("span", { class: "kbd", text: "A–D" }), " choose  ", el("span", { class: "kbd", text: "enter" }), pr.checked ? " next" : " check") : null),
      pr.hint && !pr.checked ? el("div", { class: "walk hint", "aria-live": "polite" }, el("p", { class: "pen" }, "Think first: ", q.steps[0]), CLUES[q.id] ? el("p", { class: "tiny", text: "The clue is underlined in the text." }) : null) : null,
      pr.checked ? renderVerdict(q, q.type === "spr" ? pr.spr : pr.picked) : null];
    const body = two
      ? el("div", { class: "qgrid" }, el("section", { "aria-label": "Passage" }, chipsFor(q), stimulus(q)), el("section", { "aria-label": "Question" }, answerSec))
      : el("div", { class: "qgrid single" }, el("section", { "aria-label": "Question" }, chipsFor(q), answerSec));
    if (pr.hint || pr.checked) markClue(body, q);
    return el("section", { class: "sheet qsheet" }, questionTop(q), body);
  }
  // ------------------------------------------------------------------ pen: handwritten hints, walkthroughs, miss reasons
  const PEN = {
    ring: ["0 0 100 100", "M64 9C34 2 7 20 8 50c1 30 30 45 57 40 27-6 34-36 24-58C80 12 58 3 38 11"],
    scratch: ["0 0 100 40", "M2 23C24 15 46 27 70 18c10-4 20-6 28-7M5 29c26-6 50 3 92-10"],
    under: ["0 0 100 20", "M2 13c22-6 48 5 70-2 9-3 18-4 26-3"]
  };
  const penMark = (kind) => svg("svg", { class: "mark pen-" + kind, viewBox: PEN[kind][0], preserveAspectRatio: "none", "aria-hidden": "true" }, svg("path", { d: PEN[kind][1], pathLength: "1", "vector-effect": "non-scaling-stroke" }));
  function markClue(root, q) {
    const clue = CLUES[q.id];
    if (!clue) return;
    for (const box of root.querySelectorAll(".passage, .prompt")) {
      const walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode()); ) {
        const at = n.data.indexOf(clue);
        if (at < 0) continue;
        const hit = n.splitText(at);
        hit.splitText(clue.length);
        const span = el("span", { class: "clue" }, el("span", { class: "sr", text: "Clue: " }));
        hit.replaceWith(span);
        span.append(hit);
        span.after(el("span", { class: "pen clue-note", "aria-hidden": "true", text: "clue" }));
        return;
      }
    }
  }
  const plainToggle = () => el("button", { class: "link", type: "button", onclick: () => { progress.plainNotes = !progress.plainNotes; save(); render(); } }, progress.plainNotes ? "Use handwriting" : "Switch to typed text");
  function walkthrough(q) {
    const pick = q.type === "spr" ? "" : q.choices[q.answer];
    const ans = q.type === "spr" ? q.answerText : pick.length <= 40 && !/[.!?]$/.test(pick) ? `${LETTERS[q.answer]}, “${pick}”` : LETTERS[q.answer];
    const gap = 0.5;
    return el("div", { class: "walk" },
      el("div", { class: "row between" }, el("h4", { text: "Walkthrough" }), plainToggle()),
      el("ol", { class: "pen" }, q.steps.map((t, i) => el("li", { style: `--d:${i * gap}s` }, el("i", { text: i + 1 }), el("span", { text: t }))),
        el("li", { class: "so", style: `--d:${q.steps.length * gap}s` }, el("i"), el("span", {}, "So the answer is ", el("b", {}, ans, penMark("under")), "."))));
  }
  const MISS = [["misread", "Misread the question"], ["concept", "Didn't know the rule"], ["trap", "Fell for a trap answer"], ["time", "Rushed or ran out of time"], ["slip", "Careless slip"]];
  const MISS_TIP = {
    misread: "Read the question line before the passage, and say in your own words what it asks for.",
    concept: "Open the Guides for that skill, then redo a few easy questions on it before going back to harder ones.",
    trap: "Before you look at the choices, predict the answer yourself. Then pick the choice that matches your prediction.",
    time: "Do a Question Rush on that skill. Short timed rounds build speed without the pressure of a full test.",
    slip: "Before you check, reread the sentence with your choice in it, or plug your number back into the problem."
  };
  function missTagger(q) {
    const a = latest(q.id);
    if (!a || a.c) return null;
    const box = el("div", { class: "miss" },
      el("p", { class: "pen", id: "miss-label", text: "Why do you think you missed it?" }),
      el("div", { class: "row", style: "gap:8px", role: "group", "aria-labelledby": "miss-label" }, MISS.map(([k, label]) => el("button", { class: "tag", type: "button", "data-k": k, "aria-pressed": String(a.why === k),
        onclick: () => { a.why = a.why === k ? undefined : k; save(); box.replaceWith(missTagger(q)); document.querySelector(`.miss [data-k="${k}"]`)?.focus(); } }, label))),
      a.why ? el("p", { class: "tiny", style: "margin:8px 0 0", text: "Tip: " + MISS_TIP[a.why] }) : null);
    return box;
  }
  function missPatterns() {
    const tagged = flatAttempts().filter((a) => !a.c && a.why && a.at >= Date.now() - 30 * 864e5);
    if (!tagged.length) return sheet("", title("Your miss patterns", true), el("p", { class: "sub", style: "margin:0", text: "After a miss, tap why it happened. Your most common reason and a fix for it will show up here." }));
    const counts = MISS.map(([k, l]) => ({ k, l, n: tagged.filter((a) => a.why === k).length })).filter((x) => x.n).sort((a, b) => b.n - a.n);
    const top = counts[0];
    return sheet("", title("Your miss patterns", true), el("p", { class: "sub", text: `Last 30 days · ${tagged.length} tagged miss${tagged.length === 1 ? "" : "es"}` }),
      el("div", { class: "bars" }, counts.map((x) => el("div", {}, el("span", { text: x.l }), el("span", { class: "bar" }, el("i", { style: `width:${Math.round((x.n / top.n) * 100)}%` })), el("b", { text: x.n })))),
      el("p", { class: "pen tip" }, `Most often: ${top.l.toLowerCase()}. `, MISS_TIP[top.k]),
      top.k === "time" ? el("button", { class: "btn small", type: "button", onclick: () => { ui.pr.source = "rush"; ui.rush = null; go("practice"); } }, "Start a Question Rush")
        : top.k === "concept" ? el("button", { class: "btn small", type: "button", onclick: () => go("guides") }, "Open the Guides") : null);
  }
  function renderVerdict(q, resp) {
    const ok = isCorrect(q, resp);
    const box = el("div", { class: "verdict", "aria-live": "polite" },
      el("p", { class: "verdict-title " + (ok ? "ok" : "no") }, ok ? "✓ Correct" : `✕ Incorrect. The correct answer is ${answerLabel(q)}.`),
      ok ? null : missTagger(q),
      walkthrough(q),
      q.type !== "spr" ? [el("h4", { text: "Why the other choices are wrong" }),
        el("div", { class: "why" }, Object.entries(q.why).sort((a, b) => a[0] - b[0]).map(([i, t]) => el("div", {}, el("b", { text: LETTERS[i] }), el("span", { text: t }))))] : null);
    box.append(renderTutor(q, resp), renderReport(q));
    return box;
  }
  function questionContext(q) {
    return [`Section: ${SECTION[q.section]} / ${skillOf(q)}`,
      "Passage: " + [...(q.passage || []), ...(q.list || []), q.passage2 || ""].map(plain).join(" "),
      q.table ? "Table: " + [q.table.head, ...q.table.rows].map((r) => r.join(" | ")).join("; ") : "",
      "Question: " + plain(q.prompt),
      q.type === "spr" ? "Student-produced response (no choices)." : "Choices: " + q.choices.map((c, i) => `${LETTERS[i]}) ${c}`).join("  "),
      "Correct answer: " + answerLabel(q), "Verified explanation: " + q.steps.join(" ")].join("\n");
  }
  function sampleError(err, out) {
    if (err.code === "cancelled") { out.textContent = err.text || ""; return false; }
    if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(err.code)) { sample = null; return true; }
    out.textContent = (err.text || "") + (err.code === "rate_limited" ? "\n\nGem is busy right now. Try again in a minute." : "\n\nGem couldn't finish. Try asking again.");
    return false;
  }
  function renderTutor(q, resp) {
    const wrap = el("div", { class: "box", style: "margin-top:12px" });
    if (!sample) { wrap.append(el("span", { class: "tiny", text: "Still stuck? Gem, the coach, answers follow-up questions when this page is opened in Claude." })); return wrap; }
    const out = el("div", { class: "answer-text" });
    const input = el("textarea", { class: "input", id: "tutor-input", rows: "1", placeholder: "Ask Gem about this question, like “Why isn't B right?”", "aria-label": "Question for Gem" });
    const stop = el("button", { class: "btn small ghost", type: "button", hidden: true, onclick: () => tutorCtl?.abort() }, "stop");
    const send = el("button", { class: "btn small", type: "submit" }, "ask gem");
    wrap.append(el("div", { class: "row between" }, el("b", { style: "display:inline-flex;gap:6px;align-items:center" }, gem("g"), "ask gem"), el("span", { class: "tiny", text: "Uses your Claude account. Answers are AI-generated." })),
      el("form", { class: "row", style: "margin-top:8px", onsubmit: async (e) => {
        e.preventDefault();
        const ask = input.value.trim() || "Explain this question another way, step by step.";
        tutorCtl = new AbortController();
        send.disabled = true; stop.hidden = false; out.textContent = "Thinking…";
        const prompt = ["You are Gem, a patient SAT coach. A student just answered a practice question. Answer their follow-up in under 150 words, plain text, no markdown headings.",
          "Rely on the verified answer and explanation below. Never change the correct answer. If the student's reasoning has a specific mistake, name it kindly.", "",
          questionContext(q), "Student answered: " + respLabel(q, resp), "", "Student's question: " + ask].join("\n");
        try { await sample(prompt, { signal: tutorCtl.signal, cache: false, onText: ({ text }) => { out.textContent = text; } }); }
        catch (err) { if (sampleError(err, out)) { wrap.replaceWith(renderTutor(q, resp)); return; } }
        finally { send.disabled = false; stop.hidden = true; }
      } }, input, send, stop), out);
    return wrap;
  }
  function renderReport(q) {
    const area = el("div", { style: "margin-top:8px" });
    const open = el("button", { class: "link", type: "button", onclick: () => {
      open.remove();
      const note = el("textarea", { class: "input", id: "report-note", rows: "2", placeholder: "What's wrong? A typo, a wrong answer key, an unclear explanation…", "aria-label": "Describe the problem" });
      const status = el("span", { class: "tiny" });
      const submit = el("button", { class: "btn small", type: "button", onclick: async () => {
        const text = note.value.trim();
        if (!text) { status.textContent = "Describe the problem first."; return; }
        submit.disabled = true;
        try {
          if (!db) throw new Error("no db");
          await db.collection("reports").add({ question: q.id, note: text.slice(0, 1000), at: Date.now() });
          area.replaceChildren(el("span", { class: "tiny", text: "Thanks. Your report was sent and this question will be rechecked." }));
        } catch { submit.disabled = false; status.textContent = "Reports can only be sent when this page is opened in Claude."; }
      } }, "send report");
      area.append(el("div", { class: "row" }, note, submit, status));
      note.focus();
    } }, "flag a problem with this question");
    area.append(open);
    return area;
  }

  // ------------------------------------------------------------------ question rush: 3-minute speed rounds
  const RUSH_SECS = 180;
  function pickRushQ(scope, exclude) {
    let q = null;
    for (let i = 0; i < 6; i++) {
      q = scope === "all" ? pickQuestion({ exclude }) : scope.startsWith("dom:") ? pickQuestion({ domain: scope.slice(4), exclude }) : pickBySkill(scope, null, exclude);
      if (q && q.type !== "spr") return q;
    }
    return q && q.type !== "spr" ? q : pickQuestion({ section: "rw", exclude });
  }
  function startRush() {
    const scope = ui.rushScope;
    ui.rush = { scope, left: RUSH_SECS, score: 0, tries: 0, combo: 0, best: 0, misses: [], seen: new Set(), flash: null, done: false, q: null, shownAt: Date.now() };
    ui.rush.q = pickRushQ(scope, ui.rush.seen);
    render();
    document.getElementById("rush-0")?.focus();
  }
  function rushAnswer(i) {
    const r = ui.rush;
    if (!r || r.done || r.flash) return;
    const q = r.q, ok = isCorrect(q, i);
    record(q, ok, i, "rush", (Date.now() - r.shownAt) / 1000);
    r.tries++;
    r.seen.add(q.id);
    if (ok) { r.score++; r.combo++; r.best = Math.max(r.best, r.combo); } else { r.combo = 0; if (!r.misses.includes(q.id)) r.misses.push(q.id); }
    r.flash = { i, ok };
    render();
    setTimeout(() => {
      if (ui.rush !== r || r.done) return;
      r.flash = null; r.q = pickRushQ(r.scope, r.seen); r.shownAt = Date.now();
      render();
      if (ui.view === "practice") document.getElementById("rush-0")?.focus();
    }, ok ? 380 : 900);
  }
  function endRush() {
    const r = ui.rush;
    r.done = true; r.flash = null;
    const prev = progress.rush[r.scope] || 0;
    r.newBest = r.score > prev;
    if (r.newBest) progress.rush[r.scope] = r.score;
    save();
    render();
  }
  function rushScopeLabel(scope) { return scope === "all" ? "all skills" : scope.startsWith("dom:") ? DOMAINS[scope.slice(4)].name : scope; }
  function renderRush() {
    const r = ui.rush;
    if (!r) {
      const best = progress.rush[ui.rushScope];
      return sheet("", el("div", { class: "rush-start" },
        el("h2", { class: "h1" }, "Question ", el("mark", { class: "hl", text: "Rush" })),
        el("p", { class: "sub", text: "Three minutes. Answer as many as you can. Every right answer in a row builds your combo, and explanations wait until the end." }),
        el("label", { class: "field" }, "Skill", skillSelect(ui.rushScope, (e) => { ui.rushScope = e.target.value; render(); }, "rush-skill")),
        el("p", { class: "pen", text: best ? `Your best on ${rushScopeLabel(ui.rushScope)}: ${best}. Beat it?` : `No score yet on ${rushScopeLabel(ui.rushScope)}. Set one!` }),
        el("button", { class: "btn big sun", type: "button", onclick: startRush }, "Start the clock")));
    }
    if (r.done) {
      return sheet("", el("div", { class: "rush-start" },
        el("h2", { class: "h1" }, r.left > 0 ? "Round over: " : "Time's up: ", el("mark", { class: "hl", text: `${r.score} right` }), "!"),
        el("p", { class: "sub", text: `${r.score} out of ${r.tries} on ${rushScopeLabel(r.scope)}${r.best >= 2 ? ` · best combo ×${r.best}` : ""}` }),
        el("p", { class: "pen", text: r.newBest ? "New personal best!" : progress.rush[r.scope] ? `Your best is still ${progress.rush[r.scope]}. Go get it.` : "Warm-up done. The next round counts!" }),
        el("div", { class: "row" },
          r.misses.length ? el("button", { class: "btn sun", type: "button", onclick: () => { ui.rush = null; beginSet({ kind: "rush", label: "Rush misses", ids: r.misses.slice() }); } }, `Go over my ${r.misses.length} miss${r.misses.length === 1 ? "" : "es"}`) : null,
          el("button", { class: r.misses.length ? "btn ghost" : "btn sun", type: "button", onclick: startRush }, "Go again"),
          el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.rush = null; render(); } }, "change skill"))));
    }
    const q = r.q;
    const hasStim = (q.passage && q.passage.length) || q.table || q.list;
    const two = q.section === "rw" && hasStim;
    const choices = el("div", { class: "choices", role: "group", "aria-label": "Answer choices" }, q.choices.map((c, i) => {
      const f = r.flash;
      const cls = "choice" + (f && i === q.answer ? " is-right" : f && i === f.i && !f.ok ? " is-wrong" : "");
      return el("button", { class: cls, type: "button", id: "rush-" + i, disabled: Boolean(f), onclick: () => rushAnswer(i) }, el("span", { class: "bubble", text: LETTERS[i] }), el("span", { text: c }));
    }));
    const ask = el("section", { "aria-label": "Question" }, !two ? stimulus(q) : null, el("p", { class: "prompt" }, rich(q.prompt)), choices,
      el("p", { class: "tiny", style: "margin-top:12px" }, el("span", { class: "kbd", text: "A–D" }), " answer"));
    return el("section", { class: "sheet qsheet" },
      el("div", { class: "rushbar" },
        el("span", { class: "rush-clock", id: "rush-clock", "aria-label": "Time left", text: clock(r.left) }),
        el("span", {}, el("b", { text: r.score }), " right"),
        el("span", { class: "pen combo", "aria-live": "polite", text: r.combo >= 2 ? `×${r.combo} combo!` : r.flash && !r.flash.ok ? "shake it off" : "" }),
        el("button", { class: "btn small ghost", type: "button", onclick: endRush }, "end round")),
      el("div", { class: "qgrid" + (two ? "" : " single") }, two ? el("section", { "aria-label": "Passage" }, stimulus(q)) : null, ask));
  }

  // ------------------------------------------------------------------ question bank + drill builder
  function bankEntries() {
    const f = ui.bank;
    const rows = [];
    for (const q of BANK) rows.push({ q, gen: null });
    for (const g of MATH.GENS) rows.push({ q: null, gen: g });
    return rows.filter(({ q, gen }) => {
      const domain = q ? q.domain : gen.domain, section = DOMAINS[domain].section, skill = q ? skillOf(q) : GEN_SKILL[gen.id], diff = q ? q.diff : gen.diff;
      if (f.section !== "all" && section !== f.section) return false;
      if (f.skill !== "all" && (f.skill.startsWith("dom:") ? domain !== f.skill.slice(4) : skill !== f.skill)) return false;
      if (f.diff !== "any" && diff !== Number(f.diff)) return false;
      if (f.status !== "all") {
        if (!q) return f.status === "unseen" ? !statsWhere((a) => a.id.startsWith("g-" + gen.id + "-")).total : f.status === "variations";
        const l = latest(q.id);
        if (f.status === "unseen" && l) return false;
        if (f.status === "missed" && !(l && !l.c)) return false;
        if (f.status === "correct" && !(l && l.c)) return false;
        if (f.status === "saved" && !progress.saved[q.id]) return false;
        if (f.status === "variations") return false;
      }
      return true;
    });
  }
  function renderBank() {
    const f = ui.bank;
    const rows = bankEntries();
    const gensCount = rows.filter((r) => r.gen).length;
    const filters = el("div", { class: "controls" },
      el("label", { class: "field" }, "Section", el("select", { class: "input", id: "bk-sec", onchange: (e) => { f.section = e.target.value; f.limit = 40; render(); } }, [["all", "Both"], ["rw", "Reading and Writing"], ["math", "Math"]].map(([v, l]) => el("option", { value: v, selected: f.section === v }, l)))),
      el("label", { class: "field" }, "Skill", skillSelect(f.skill, (e) => { f.skill = e.target.value; f.limit = 40; render(); }, "bk-skill")),
      el("label", { class: "field" }, "Difficulty", el("select", { class: "input", id: "bk-diff", onchange: (e) => { f.diff = e.target.value; render(); } }, [["any", "Any"], ["1", "Easy"], ["2", "Medium"], ["3", "Hard"]].map(([v, l]) => el("option", { value: v, selected: f.diff === v }, l)))),
      el("label", { class: "field" }, "Status", el("select", { class: "input", id: "bk-status", onchange: (e) => { f.status = e.target.value; render(); } }, [["all", "All"], ["unseen", "Not tried"], ["missed", "Missed"], ["correct", "Correct"], ["saved", "Marked for review"], ["variations", "Unlimited math"]].map(([v, l]) => el("option", { value: v, selected: f.status === v }, l)))));
    const list = el("div", { class: "tour" }, rows.slice(0, f.limit).map(({ q, gen }, i) => {
      if (gen) return el("div", {}, el("span", { class: "k", text: "∞" }),
        el("span", {}, el("span", { style: "display:inline-flex;gap:6px;align-items:center" }, gem(levelOf(skillStats(GEN_SKILL[gen.id]).total >= 3 ? skillStats(GEN_SKILL[gen.id]).rate : null)), el("b", { text: GEN_SKILL[gen.id] })), el("br"), el("small", { text: `unlimited variations · ${DIFF[gen.diff]} · new numbers every time` })),
        el("button", { type: "button", onclick: () => { ui.pr.source = "mixed"; loadPracticeQuestion(MATH.make(gen.id, Math.floor(Math.random() * 1e9))); go("practice"); } }, "do one"));
      const l = latest(q.id);
      const status = progress.saved[q.id] ? "★ saved" : !l ? "not tried" : l.c ? "✓ right" : "✗ missed";
      return el("div", {}, el("span", { class: "k", text: i + 1 }),
        el("span", {}, el("b", { text: `${skillOf(q)} · ${DIFF[q.diff]}` }), el("span", { text: "  " + status }), el("br"), el("small", { class: "snip", style: "display:block;color:inherit;opacity:.8", text: plain(q.passage?.[0] || q.prompt) })),
        el("button", { type: "button", onclick: () => { ui.pr.source = "mixed"; loadPracticeQuestion(q); go("practice"); } }, "do it"));
    }));
    const d = ui.drill;
    const skillPicker = el("div", { class: "stack", style: "gap:10px" }, DOM_KEYS.map((dom) => el("div", {},
      el("p", { class: "label", text: DOMAINS[dom].name }),
      el("div", { class: "row", style: "gap:6px" }, DOMAINS[dom].skills.map((s) => el("label", { class: "check" },
        el("input", { type: "checkbox", checked: d.skills.includes(s), onchange: (e) => { d.skills = e.target.checked ? [...d.skills, s] : d.skills.filter((x) => x !== s); } }), s))))));
    const builder = sheet("", title("drill builder", true),
      el("p", { class: "sub", text: "Pick skills, a difficulty and a length. Leave skills empty to drill your three weakest. Save a drill to rerun it anytime." }),
      skillPicker,
      el("div", { class: "controls", style: "margin-top:14px" },
        el("label", { class: "field" }, "Difficulty", el("select", { class: "input", id: "dr-diff", onchange: (e) => { d.diff = e.target.value; } }, [["any", "Any"], ["1", "Easy"], ["2", "Medium"], ["3", "Hard"]].map(([v, l]) => el("option", { value: v, selected: d.diff === v }, l)))),
        el("label", { class: "field" }, "Questions", el("input", { class: "input", id: "dr-count", type: "number", min: "3", max: "50", value: d.count, style: "width:90px", oninput: (e) => { d.count = clamp(Number(e.target.value) || 10, 3, 50); } })),
        el("label", { class: "check" }, el("input", { type: "checkbox", id: "dr-timed", checked: d.timed, onchange: (e) => { d.timed = e.target.checked; } }), "timed at SAT pace"),
        el("label", { class: "field" }, "Name (to save)", el("input", { class: "input", id: "dr-name", value: d.name, placeholder: "e.g. comma rules", oninput: (e) => { d.name = e.target.value; } }))),
      el("div", { class: "row", style: "margin-top:12px" },
        el("button", { class: "btn", type: "button", onclick: () => runDrill({ ...d }) }, "start drill"),
        el("button", { class: "btn ghost", type: "button", onclick: () => {
          const name = d.name.trim() || (d.skills.length ? d.skills.slice(0, 2).join(" + ") : "weakest skills");
          progress.drills.push({ id: "d" + Date.now(), name, skills: d.skills.slice(), diff: d.diff, count: d.count, timed: d.timed });
          save(); toast("Drill saved"); render();
        } }, "save drill")),
      progress.drills.length ? el("div", { style: "margin-top:16px" }, el("p", { class: "label", text: "Saved drills" }), el("div", { class: "tour" }, progress.drills.map((x, i) => el("div", {},
        el("span", { class: "k", text: "abcdefghijklmnopqrstuvwxyz"[i % 26] }),
        el("span", {}, el("b", { text: x.name }), el("br"), el("small", { text: `${x.count} q · ${x.diff === "any" ? "any difficulty" : DIFF[x.diff]}${x.timed ? " · timed" : ""} · ${x.skills.length ? x.skills.join(", ") : "weakest skills"}` })),
        el("span", { class: "row", style: "gap:6px" }, el("button", { type: "button", onclick: () => runDrill(x) }, "run"), el("button", { type: "button", onclick: () => { progress.drills = progress.drills.filter((y) => y.id !== x.id); save(); render(); } }, "delete")))))) : null);
    return el("div", { class: "cols", style: "align-items:start" },
      sheet("", title("question bank"),
        el("p", { class: "sub", text: `${BANK.length} hand-written questions plus ${MATH.GENS.length} math templates that make unlimited new problems. Showing ${Math.min(f.limit, rows.length)} of ${rows.length}${gensCount ? ` (${gensCount} unlimited)` : ""}.` }),
        filters, rows.length ? list : el("div", { class: "empty", text: "Nothing matches these filters." }),
        rows.length > f.limit ? el("div", { class: "row", style: "margin-top:12px" }, el("button", { class: "btn ghost", type: "button", onclick: () => { f.limit += 40; render(); } }, "show more")) : null),
      builder);
  }

  // ------------------------------------------------------------------ mock
  const TIME_OPTS = [[1, "Standard"], [1.5, "1.5× time"], [2, "2× time"], [0, "Untimed"]];
  const timeLabel = (mult) => (mult === 1 || mult == null ? "" : mult ? ` · ${mult}× time` : " · untimed");
  function mockMins(kind, mult = progress.timeMult) { const s = MOCK_SPEC[kind]; return mult ? Math.round(((s.rw.secs + s.math.secs) * 2 * mult) / 60) : null; }
  function trailbar(am, allDone) {
    const stops = ["Reading and Writing 1", "Reading and Writing 2", "Math 1", "Math 2"];
    const at = allDone ? 4 : am.stage;
    return el("ol", { class: "trailbar", "aria-label": allDone ? "All 4 stops done" : `Stop ${at + 1} of 4` }, stops.map((t, i) =>
      el("li", { class: i < at ? "done" : i === at ? "now" : "" }, el("span", { class: "stop", "aria-hidden": "true" }), el("span", { text: t }))));
  }
  function renderMock() {
    const am = progress.activeMock;
    if (am) return am.onBreak ? renderBreak(am) : renderTest(am);
    if (ui.mockResult) { const rec = progress.mocks.find((m) => m.id === ui.mockResult); if (rec) return renderMockResult(rec); }
    return renderMockHome();
  }
  function renderMockHome() {
    const card = (kind, cta, desc) => {
      const s = MOCK_SPEC[kind];
      const n = Object.values(s.rw.counts).reduce((a, b) => a + b, 0) * 2 + Object.values(s.math.counts).reduce((a, b) => a + b, 0) * 2;
      const mins = mockMins(kind);
      return el("div", { class: "step" }, el("strong", { text: s.label.toLowerCase() }),
        el("span", { style: "font-weight:900;font-size:44px;line-height:1", text: `${n} q` }), el("span", { class: "tiny", text: mins == null ? "Untimed + break" : `${Math.floor(mins / 60)} h ${mins % 60} min + break` }),
        el("p", { style: "margin:0", text: desc }), el("button", { class: "btn", type: "button", onclick: () => startMock(kind) }, cta));
    };
    const past = progress.mocks.slice().sort((a, b) => b.at - a.at);
    return el("div", { class: "stack" },
      sheet("", title("Practice tests"),
        el("p", { class: "sub", text: "Built like the digital SAT: Reading and Writing, then Math, each in two timed modules. How you do on module 1 decides whether module 2 is easier or harder, and that caps your score the way the real test does." }),
        el("div", { class: "cols" },
          card("full", "Start full-length test", "27 + 27 Reading and Writing questions, 22 + 22 Math, with a 10-minute break. Best for an accurate score."),
          card("quick", "Start quick test", "About half the length, with a 5-minute break. Good as a diagnostic or a weekly check-in.")),
        el("div", { class: "timing" },
          el("span", { class: "field", id: "time-label", text: "Timing" }),
          el("div", { class: "pills", role: "group", "aria-labelledby": "time-label" }, TIME_OPTS.map(([v, l]) => el("button", { class: "pill", type: "button", "aria-pressed": String(progress.timeMult === v), onclick: () => { progress.timeMult = v; save(); render(); } }, l))),
          el("p", { class: "tiny", style: "margin:0", text: "Approved for extra time on the real SAT? Practise with it here. It also applies to timed drills, and your score is labelled with the timing you used." })),
        el("p", { class: "tiny", style: "margin:12px 0 0", text: "Tools: mark for review, answer eliminator, question navigator, hideable timer, built-in calculator and grapher, reference sheet. Leave anytime; the timer runs only while the test is open." })),
      sheet("", title("Past practice tests", true), past.length ? el("div", { class: "tour wide" }, past.map((m, i) => el("div", {},
        el("span", { class: "k", text: "abcdefghijklmnopqrst"[i] }), el("span", { text: `${MOCK_SPEC[m.kind].label.toLowerCase()} · ${niceDate(m.at)}${timeLabel(m.mult)}` }),
        el("span", { class: "r", text: m.rw }), el("span", { class: "r", text: m.math }), el("span", { class: "r", style: "font-weight:900", text: m.total }),
        el("button", { type: "button", onclick: () => { ui.mockResult = m.id; render(); } }, "results")))) : el("div", { class: "empty", text: "No practice tests yet. Results and a question-by-question review will show up here." })));
  }
  function renderBreak(am) {
    return sheet("", el("div", { class: "stack", style: "justify-items:center;text-align:center" },
      trailbar(am),
      el("h2", { class: "h1" }, "Halfway ", el("mark", { class: "hl", text: "there" }), "!"),
      el("p", { class: "sub", style: "margin:0 auto", text: "Reading and Writing is done. Math starts when the break ends or when you choose." }),
      el("p", { class: "pen", text: "Stand up, grab some water, look at something far away." }),
      el("span", { id: "test-clock", style: "font-weight:800;font-size:72px;line-height:1;font-variant-numeric:tabular-nums", text: clock(am.breakLeft) }),
      el("button", { class: "btn big sun", type: "button", onclick: () => { am.onBreak = false; save(true); render(); } }, "Start Math now")));
  }
  function renderTest(am) {
    const m = curModule();
    const head = el("div", { class: "test-head" },
      el("span", { class: "ttl", text: `Section ${m.section === "rw" ? 1 : 2}, Module ${m.n}: ${SECTION[m.section]}` }),
      el("span", { class: "clock" + (m.timeLeft != null && m.timeLeft <= 300 ? " warn" : ""), id: "test-clock", "aria-label": "Time left", text: m.timeLeft == null ? "untimed" : ui.hideTimer ? "--:--" : clock(m.timeLeft) }),
      el("div", { class: "right" },
        m.timeLeft != null ? el("button", { class: "btn small", type: "button", onclick: () => { ui.hideTimer = !ui.hideTimer; render(); } }, ui.hideTimer ? "show timer" : "hide timer") : null,
        m.section === "math" ? [el("button", { class: "btn small", type: "button", onclick: () => { ui.dock = ui.dock === "calc" ? null : "calc"; renderDock(); } }, "calculator"), el("button", { class: "btn small", type: "button", onclick: () => { ui.refOpen = true; render(); } }, "reference")] : null,
        el("button", { class: "btn small", type: "button", onclick: () => { save(true); go("home"); } }, "pause & exit")));
    const sec = "sheet qsheet sec-" + m.section;
    if (m.reviewing) return el("section", { class: sec, "aria-label": "Module review" }, head, trailbar(am), renderModuleReview(m));
    const id = m.ids[m.cur], q = getQ(id), resp = m.ans[id];
    const struck = new Set(m.elim[id] || []);
    const qbar = el("div", { class: "qbar" },
      el("div", { class: "row" }, el("span", { class: "qnum", text: m.cur + 1 }),
        el("button", { class: "flag", type: "button", "aria-pressed": String(Boolean(m.marked[id])), onclick: () => { m.marked[id] = !m.marked[id]; save(); render(); } }, m.marked[id] ? "⚑ marked for review" : "⚐ mark for review")),
      q.type !== "spr" ? el("button", { class: "flag", type: "button", "aria-pressed": String(ui.elimMode), onclick: () => { ui.elimMode = !ui.elimMode; render(); } }, el("s", { text: "ABC" }), " eliminate") : null);
    let answerArea;
    if (q.type === "spr") {
      answerArea = el("div", { class: "spr" }, el("label", { class: "field", for: "mock-spr" }, "Your answer"),
        el("input", { id: "mock-spr", inputmode: "decimal", autocomplete: "off", value: resp ?? "", placeholder: "12, −3, 3/4", oninput: (e) => { m.ans[id] = e.target.value; save(); } }),
        el("span", { class: "tiny", text: "Fractions and decimals both count." }));
    } else {
      answerArea = el("div", { class: "choices", role: "radiogroup", "aria-label": "Answer choices" }, q.choices.map((c, i) => el("div", { class: "choice-row" },
        el("button", { class: "choice" + (struck.has(i) ? " struck" : ""), type: "button", role: "radio", "aria-checked": String(resp === i), id: "choice-" + i,
          onclick: () => { m.ans[id] = resp === i ? null : i; if (struck.has(i)) m.elim[id] = [...struck].filter((x) => x !== i); save(); render(); } },
          el("span", { class: "bubble", text: LETTERS[i] }), el("span", { text: c })),
        ui.elimMode ? el("button", { class: "strike", type: "button", "aria-pressed": String(struck.has(i)), "aria-label": (struck.has(i) ? "Restore choice " : "Eliminate choice ") + LETTERS[i],
          onclick: () => { struck.has(i) ? struck.delete(i) : struck.add(i); m.elim[id] = [...struck]; if (struck.has(i) && resp === i) m.ans[id] = null; save(); render(); } }, struck.has(i) ? "undo" : LETTERS[i] + "̶") : null)));
    }
    const hasStim = (q.passage && q.passage.length) || q.table || q.list;
    const two = q.section === "rw" && hasStim;
    const answerSec = el("section", { "aria-label": "Question" }, !two ? stimulus(q) : null, el("p", { class: "prompt" }, rich(q.prompt)), answerArea);
    const body = el("div", { class: "qgrid" + (two ? "" : " single") }, two ? el("section", { "aria-label": "Passage" }, stimulus(q)) : null, answerSec);
    const foot = el("div", { class: "test-foot" },
      el("button", { class: "btn small ghost", type: "button", "aria-expanded": String(ui.navOpen), onclick: () => { ui.navOpen = !ui.navOpen; render(); } }, `question ${m.cur + 1} of ${m.ids.length} ${ui.navOpen ? "▾" : "▴"}`),
      el("div", { class: "row" },
        el("button", { class: "btn ghost", type: "button", disabled: m.cur === 0, onclick: () => { m.cur--; render(); } }, "back"),
        el("button", { class: "btn", type: "button", onclick: () => { if (m.cur < m.ids.length - 1) m.cur++; else m.reviewing = true; ui.navOpen = false; save(); render(); } }, m.cur < m.ids.length - 1 ? "next" : "review module")));
    return el("section", { class: sec, "aria-label": "Mock test" }, head, trailbar(am), qbar, body, ui.navOpen ? el("div", { style: "padding:16px 18px;border-top:2px dashed var(--line-strong)" }, navGrid(m)) : null, foot);
  }
  function navGrid(m) {
    return el("div", { class: "stack", style: "gap:10px" },
      el("div", { class: "legend" }, el("span", { text: "▢ unanswered" }), el("span", { text: "■ answered" }), el("span", { text: "⚑ marked" })),
      el("div", { class: "navgrid" }, m.ids.map((id, i) => {
        const a = m.ans[id], has = a != null && a !== "";
        return el("button", { class: [has ? "answered" : "", m.marked[id] ? "marked" : "", i === m.cur && !m.reviewing ? "current" : ""].join(" "), type: "button", "aria-label": `Question ${i + 1}${has ? ", answered" : ", unanswered"}${m.marked[id] ? ", marked" : ""}`, onclick: () => { m.cur = i; m.reviewing = false; ui.navOpen = false; render(); } }, String(i + 1));
      })));
  }
  function renderModuleReview(m) {
    const unanswered = m.ids.filter((id) => m.ans[id] == null || m.ans[id] === "").length;
    const marked = m.ids.filter((id) => m.marked[id]).length;
    const last = progress.activeMock.stage === 3;
    return el("div", { class: "stack", style: "padding:20px 22px" },
      title("check your work", true),
      el("p", { class: "pen", text: unanswered ? "No penalty for guessing, so fill in every answer!" : last ? "Last stop. You've got this." : "Nice, every answer filled in." }),
      el("p", { class: "sub", text: `${unanswered ? unanswered + " unanswered" : "Every question answered"}${marked ? ` · ${marked} marked for review` : ""}. There's no penalty for guessing, so answer everything. Once you submit, you can't come back to this module.` }),
      navGrid(m),
      el("div", { class: "row" },
        el("button", { class: "btn ghost", type: "button", onclick: () => { m.reviewing = false; m.cur = m.ids.length - 1; render(); } }, "back to questions"),
        ui.pendingSubmit
          ? [el("b", { text: "submit this module?" }), el("button", { class: "btn", type: "button", onclick: submitModule }, last ? "yes, finish the test" : "yes, submit"), el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.pendingSubmit = false; render(); } }, "cancel")]
          : el("button", { class: "btn", type: "button", onclick: () => { ui.pendingSubmit = true; render(); } }, last ? "submit & see score" : "submit module")));
  }
  function renderReference() {
    const f = [["Circle", "A = πr²,  C = 2πr"], ["Rectangle", "A = ℓw"], ["Triangle", "A = ½bh"], ["Pythagorean theorem", "c² = a² + b²"], ["Special right triangles", "30-60-90: x, x√3, 2x · 45-45-90: s, s, s√2"],
      ["Rectangular prism", "V = ℓwh"], ["Cylinder", "V = πr²h"], ["Sphere", "V = (4/3)πr³"], ["Cone", "V = (1/3)πr²h"], ["Pyramid", "V = (1/3)ℓwh"], ["Circle facts", "360° = 2π radians"], ["Triangle facts", "Angles add to 180°"]];
    return el("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "Reference sheet", onclick: (e) => { if (e.target.classList.contains("modal")) { ui.refOpen = false; render(); } } },
      sheet("", title("reference sheet", true), el("div", { class: "ref-grid" }, f.map(([a, b]) => el("div", {}, el("b", { text: a }), b))),
        el("div", { class: "row", style: "margin-top:14px" }, el("button", { class: "btn", type: "button", id: "ref-close", onclick: () => { ui.refOpen = false; render(); } }, "close"))));
  }
  function renderMockResult(rec) {
    const imp = latestImport();
    const misses = rec.items.filter((i) => !i.c).length;
    const routeText = (r) => (r === "hard" ? "harder module 2" : "easier module 2");
    const skills = [...new Set(rec.items.map((i) => i.k || skillOf(getQ(i.id))))].map((k) => { const it = rec.items.filter((i) => (i.k || skillOf(getQ(i.id))) === k); return { k, right: it.filter((i) => i.c).length, total: it.length }; }).sort((a, b) => a.right / a.total - b.right / b.total);
    const fresh = Date.now() - rec.at < 10 * 60e3;
    return el("div", { class: "stack" },
      fresh ? el("div", { class: "made-it" }, trailbar(null, true),
        el("h2", { class: "h1" }, "You made it to the ", el("mark", { class: "hl", text: "end" }), "!"),
        el("p", { class: "pen", text: rec.kind === "full" ? "A whole practice SAT. That takes grit." : "Test done. Every one you take makes the real one feel more familiar." })) : null,
      sheet("", title(`${MOCK_SPEC[rec.kind].label.toLowerCase()} · ${niceDate(rec.at)}${timeLabel(rec.mult)}`, true),
        el("div", { class: "numgrid", style: "max-width:560px" }, el("div", { class: "numbox" }, el("small", { text: "total" }), el("b", { style: "font-size:56px", text: rec.total })), el("div", { class: "numbox" }, el("small", { text: "R&W" }), el("b", { text: rec.rw })), el("div", { class: "numbox" }, el("small", { text: "math" }), el("b", { text: rec.math }))),
        rec.modules ? el("div", { class: "tour", style: "margin-top:14px" }, rec.modules.map((m, i) => el("div", {}, el("span", { class: "k", text: "abcd"[i] }), el("span", { text: `${SECTION[m.s]} · module ${m.n}${m.route ? ` (${m.route})` : ""}` }), el("span", { class: "r", text: `${m.right}/${m.total}` })))) : null,
        el("p", { class: "sub", style: "margin-top:12px", text: `You were routed to the ${routeText(rec.route.rw)} in Reading and Writing and the ${routeText(rec.route.math)} in Math. ${imp ? `Your latest imported score is ${imp.rw + imp.math}.` : "Import a real score to compare it."} This is an estimate, not an official score.` }),
        el("div", { class: "row" },
          misses ? el("button", { class: "btn big", type: "button", onclick: () => beginSet({ kind: "mock-miss", label: "Practice test review", ids: mockMissSet(rec) }) }, `practice what I missed (${misses})`) : null,
          el("button", { class: "btn ghost", type: "button", onclick: () => go("home") }, "see my plan"),
          el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.mockResult = null; render(); } }, "all mocks"))),
      el("div", { class: "cols" },
        sheet("", title("by skill", true), el("div", { class: "tour" }, skills.map((s, i) => el("div", {}, el("span", { class: "k" }, gem(levelOf(s.right / s.total))), el("span", { text: s.k }), el("span", { class: "r", text: `${s.right}/${s.total}` }))))),
        sheet("", title("every question", true), el("div", { class: "qreview" }, rec.items.map((it) => {
          const q = getQ(it.id);
          if (!q) return null;
          return el("details", {},
            el("summary", {}, el("span", { class: "tiny", text: `${it.s === "rw" ? "RW" : "M"}${it.m}` }), el("span", { class: it.c ? "ok" : "no", text: it.c ? "✓" : "✗" }),
              el("span", { class: "snip", text: plain(q.passage?.[0] || q.prompt) }), el("span", { class: "tiny", text: `you: ${respLabel(q, it.r)} · key: ${answerLabel(q)}${it.t ? ` · ${it.t}s` : ""}` })),
            el("div", { class: "inner" }, chipsFor(q, false), stimulus(q), el("p", { class: "prompt" }, rich(q.prompt)),
              q.type !== "spr" ? el("ol", { type: "A", class: "solve", style: "margin-bottom:10px" }, q.choices.map((c, j) => el("li", { style: j === q.answer ? "font-weight:700" : "" }, c))) : null,
              el("ol", { class: "solve" }, q.steps.map((s) => el("li", { text: s }))),
              q.type !== "spr" ? el("div", { class: "why", style: "margin-top:8px" }, Object.entries(q.why).map(([j, t]) => el("div", {}, el("b", { text: LETTERS[j] }), el("span", { text: t })))) : null,
              el("div", { class: "row", style: "margin-top:10px" }, el("button", { class: "btn small ghost", type: "button", onclick: () => { ui.pr.source = "mixed"; loadPracticeQuestion(remixOf(q)); go("practice"); } }, "↻ try a twin"))));
        })))));
  }

  // ------------------------------------------------------------------ scores & stats
  function renderStats() {
    const today = dayKey();
    const kindSel = el("select", { class: "input", id: "imp-kind" }, Object.entries(SCORE_KINDS).map(([k, v]) => el("option", { value: k }, v.label)));
    const err = el("p", { class: "err", id: "imp-err", role: "alert" });
    const importForm = el("form", { class: "grid-form", novalidate: true, onsubmit: (e) => {
      e.preventDefault();
      const kind = kindSel.value, K = SCORE_KINDS[kind];
      const date = document.getElementById("imp-date").value;
      const rw = Number(document.getElementById("imp-rw").value), math = Number(document.getElementById("imp-math").value);
      const bad = (v) => !Number.isInteger(v) || v < K.min || v > K.max || v % 10 !== 0;
      if (!date) { err.textContent = "Add the test date."; return; }
      if (date > today) { err.textContent = "The test date can't be in the future."; return; }
      if (bad(rw) || bad(math)) { err.textContent = `${K.label} section scores are multiples of 10 from ${K.min} to ${K.max}.`; return; }
      progress.scores.push({ id: "s" + Date.now(), kind, date, rw, math });
      save(); toast(`Score saved: ${rw + math}`); render();
    } },
      el("label", { class: "field" }, "Test", kindSel),
      el("label", { class: "field" }, "Date taken", el("input", { class: "input", type: "date", id: "imp-date", max: today, value: today })),
      el("label", { class: "field" }, "Reading & writing", el("input", { class: "input", type: "number", id: "imp-rw", inputmode: "numeric", step: "10", placeholder: "620" })),
      el("label", { class: "field" }, "Math", el("input", { class: "input", type: "number", id: "imp-math", inputmode: "numeric", step: "10", placeholder: "580" })),
      el("button", { class: "btn", type: "submit" }, "save score"));
    const tErr = el("p", { class: "err", role: "alert" });
    const targetForm = el("form", { class: "grid-form", novalidate: true, onsubmit: (e) => {
      e.preventDefault();
      const total = Number(document.getElementById("tgt-total").value), date = document.getElementById("tgt-date").value;
      if (!Number.isInteger(total) || total < 400 || total > 1600 || total % 10) { tErr.textContent = "Target scores are multiples of 10 from 400 to 1600."; return; }
      progress.target = { total, date }; save(); toast("Target saved"); render();
    } },
      el("label", { class: "field" }, "Target total", el("input", { class: "input", type: "number", id: "tgt-total", step: "10", value: progress.target.total ?? "", placeholder: "1400" })),
      el("label", { class: "field" }, "Test date (optional)", el("input", { class: "input", type: "date", id: "tgt-date", min: today, value: progress.target.date || "" })),
      el("button", { class: "btn", type: "submit" }, "save target"));
    const entries = [
      ...progress.scores.map((s) => ({ type: "imp", t: Date.parse(s.date + "T12:00:00"), label: `${SCORE_KINDS[s.kind]?.label || "score"} · ${niceDate(s.date)}`, rw: s.rw, math: s.math, id: s.id })),
      ...progress.mocks.map((m) => ({ type: "mock", t: m.at, label: `clearline ${MOCK_SPEC[m.kind].label.toLowerCase()} · ${niceDate(m.at)}`, rw: m.rw, math: m.math, id: m.id }))
    ].sort((a, b) => a.t - b.t);
    const history = sheet("", title("score history", true), entries.length ? [
      el("div", { class: "chart-wrap" }, scoreChart(entries)),
      el("div", { class: "legend", style: "margin:8px 0 12px" }, el("span", {}, "◆ imported"), el("span", {}, "● clearline mock"), progress.target.total ? el("span", {}, "- - target") : null),
      el("div", { class: "tour wide" }, entries.slice().reverse().map((e) => el("div", {},
        el("span", { class: "k", text: e.type === "imp" ? "◆" : "●" }), el("span", { text: e.label }),
        el("span", { class: "r", text: e.rw }), el("span", { class: "r", text: e.math }), el("span", { class: "r", style: "font-weight:900", text: e.rw + e.math }),
        e.type === "imp" ? el("button", { type: "button", onclick: () => { if (ui.armed["del" + e.id]) { progress.scores = progress.scores.filter((s) => s.id !== e.id); ui.armed = {}; save(); render(); } else { ui.armed = { ["del" + e.id]: true }; render(); } } }, ui.armed["del" + e.id] ? "confirm" : "remove")
          : el("button", { type: "button", onclick: () => { ui.mockResult = e.id; go("mock"); } }, "results"))))
    ] : el("div", { class: "empty", text: "Imported scores (◆) and Clearline mocks (●) are charted here." }));

    const skillRows = ALL_SKILLS.map((s) => ({ ...s, st: skillStats(s.skill) }));
    const analytics = sheet("", title("skill analytics", true),
      el("p", { class: "sub", text: "Every skill on the SAT, with your accuracy and average time across practice and mocks." }),
      el("div", { class: "tour" }, skillRows.map((r) => el("div", {},
        el("span", { class: "k" }, gem(levelOf(r.st.total >= 3 ? r.st.rate : null))),
        el("span", {}, el("b", { text: r.skill }), el("br"), el("small", { text: r.st.total ? `${Math.round(r.st.rate * 100)}% of ${r.st.total}${r.st.avgT ? ` · ${Math.round(r.st.avgT)}s avg` : ""}` : `${DOMAINS[r.domain].name} · not tried yet` })),
        el("button", { type: "button", onclick: () => { ui.pr.source = "domain"; ui.pr.skill = r.skill; loadPracticeQuestion(); go("practice"); } }, "drill")))));
    const pace = (sec) => { const st = statsWhere((a) => DOMAINS[a.d]?.section === sec && a.t); return el("div", { class: "box" }, el("p", { class: "label", text: SECTION[sec] }),
      el("div", { class: "numgrid", style: "grid-template-columns:repeat(2,minmax(0,1fr))" }, el("div", { class: "numbox" }, el("small", { text: "your avg" }), el("b", { text: st.avgT ? Math.round(st.avgT) + "s" : "—" })), el("div", { class: "numbox" }, el("small", { text: "SAT pace" }), el("b", { text: PACE[sec] + "s" }))),
      el("p", { class: "tiny", style: "margin:6px 0 0", text: !st.avgT ? "Answer a few questions to see your pace." : st.avgT > PACE[sec] * 1.15 ? "Slower than test pace. Try timed drills." : st.avgT < PACE[sec] * 0.6 ? "Very fast. Make sure you're reading every choice." : "Right around test pace." })); };
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const time = sheet("", title("pace & study time", true), el("div", { class: "cols" }, pace("rw"), pace("math")), el("div", { class: "chart-wrap", style: "margin-top:14px" }, studyChart(days)),
      el("p", { class: "tiny", style: "margin:6px 0 0", text: `${fmtMin(days.reduce((s, d) => s + (progress.study[dayKey(d)] || 0), 0))} in the last 14 days. Counted while this page is open and you're active.` }));
    const backup = (() => { try { return btoa(unescape(encodeURIComponent(JSON.stringify(progress)))); } catch { return ""; } })();
    const backupBox = el("textarea", { class: "input", id: "backup-out", rows: "2", readonly: true, style: "width:100%;font-size:12px" }, backup);
    const restoreBox = el("textarea", { class: "input", id: "backup-in", rows: "2", placeholder: "paste a backup code here", style: "width:100%", oninput: (e) => { ui.restoreText = e.target.value; } }, ui.restoreText);
    const data = sheet("", title("your data", true),
      el("p", { class: "sub", text: db && uid ? "Saved to your account, so it follows you across devices. A backup code moves it anywhere." : "Saved in this browser. Copy a backup code to move your progress to another device or keep it safe." }),
      el("div", { class: "stack", style: "gap:12px" },
        el("div", {}, el("p", { class: "label", text: "Backup code" }), backupBox, el("div", { class: "row", style: "margin-top:6px" }, el("button", { class: "btn small", type: "button", onclick: () => {
          if (navigator.clipboard) navigator.clipboard.writeText(backup).then(() => toast("Backup code copied"), () => { backupBox.select(); toast("Selected. Copy it with your keyboard."); });
          else { backupBox.select(); toast("Selected. Copy it with your keyboard."); }
        } }, "copy backup code"))),
        el("div", {}, el("p", { class: "label", text: "Restore" }), restoreBox, el("div", { class: "row", style: "margin-top:6px" }, confirmBtn("restore", "restore from code", "replace all progress?", () => {
          try { progress = normalize(JSON.parse(decodeURIComponent(escape(atob(ui.restoreText.trim()))))); ui.restoreText = ""; save(true); toast("Progress restored"); render(); }
          catch { toast("That code isn't a valid backup."); render(); }
        }, "btn small"))),
        el("div", {}, confirmBtn("clear", "clear all progress", "click again to erase everything", () => { progress = blankProgress(); save(true); toast("Progress cleared"); render(); }))));
    const ring = (k) => {
      const st = domainStats(k);
      const pct = st.total ? Math.round(st.rate * 100) : null;
      const C = 2 * Math.PI * 30;
      const color = { g: "var(--green-fill)", y: "var(--amber-fill)", r: "var(--red-fill)", n: "var(--grey-fill)" }[levelOf(st.total >= 3 ? st.rate : null)];
      return el("button", { class: "ring", type: "button", style: "cursor:pointer", "aria-label": `${DOMAINS[k].name}: ${pct == null ? "not tried yet" : pct + "% accuracy"}. Practice it.`, onclick: () => { ui.pr.source = "domain"; ui.pr.skill = "dom:" + k; loadPracticeQuestion(); go("practice"); } },
        svg("svg", { viewBox: "0 0 72 72", "aria-hidden": "true" },
          svg("circle", { class: "ring-track", cx: "36", cy: "36", r: "30", fill: "none", "stroke-width": "7" }),
          svg("circle", { cx: "36", cy: "36", r: "30", fill: "none", stroke: color, "stroke-width": "7", "stroke-linecap": "round", "stroke-dasharray": `${C * (pct || 0) / 100} ${C}`, transform: "rotate(-90 36 36)" }),
          svg("text", { class: "ring-text", x: "36", y: "41", "text-anchor": "middle" }, pct == null ? "—" : pct + "%")),
        el("b", { text: DOMAINS[k].name }), el("span", { class: "tiny", text: st.total ? `${st.total} answered` : "Not tried yet" }));
    };
    const rings = sheet("", title("Where you stand"), el("p", { class: "sub", text: "Accuracy in each SAT content area, across practice and practice tests. Tap one to practice it." }), el("div", { class: "rings" }, DOM_KEYS.map(ring)));
    const heatDays = [];
    const start = new Date(); start.setDate(start.getDate() - 7 * 16 + 1 - start.getDay());
    for (let d = new Date(start); d <= new Date(); d.setDate(d.getDate() + 1)) heatDays.push(new Date(d));
    const perDay = {};
    for (const a of flatAttempts()) { const k = dayKey(new Date(a.at)); perDay[k] = (perDay[k] || 0) + 1; }
    const lvl = (n) => (n >= 30 ? 4 : n >= 15 ? 3 : n >= 5 ? 2 : n >= 1 ? 1 : 0);
    const activeDays = heatDays.filter((d) => perDay[dayKey(d)]).length;
    const heat = sheet("", title("Daily activity"), el("p", { class: "sub", text: `${activeDays} active day${activeDays === 1 ? "" : "s"} in the last 16 weeks. Each square is a day; darker means more questions.` }),
      el("div", { class: "heat", role: "img", "aria-label": `Questions answered per day over 16 weeks. ${activeDays} active days.` }, heatDays.map((d) => el("i", { class: "l" + lvl(perDay[dayKey(d)] || 0), title: `${d.toLocaleDateString()}: ${perDay[dayKey(d)] || 0} questions` }))),
      el("div", { class: "legend", style: "margin-top:8px" }, el("span", {}, "Less"), [0, 1, 2, 3, 4].map((n) => el("i", { style: `display:inline-block;width:12px;height:12px;border-radius:3px;border:1px solid var(--line);background:${n ? `color-mix(in srgb, var(--accent) ${n * 25}%, var(--card))` : "var(--card-2)"}` })), el("span", {}, "More")));
    return el("div", { class: "stack" },
      rings,
      el("div", { class: "cols" }, heat, time),
      history,
      el("div", { class: "cols" }, analytics,
        el("div", { class: "stack" },
          sheet("", title("Import a score", true), el("p", { class: "sub", text: "Use the section scores from your College Board report or a Bluebook practice test. This is step 1 of your plan." }), importForm, err),
          sheet("", title("Target", true), el("p", { class: "sub", text: "Your goal total and test date size your daily plan." }), targetForm, tErr),
          data)));
  }
  function scoreChart(entries) {
    const Wd = 640, H = 220, L = 44, R = 18, T = 18, B = 30;
    const t0 = entries[0].t, t1 = entries[entries.length - 1].t;
    const x = (t) => (t1 === t0 ? (L + Wd - R) / 2 : L + ((t - t0) / (t1 - t0)) * (Wd - L - R));
    const y = (v) => T + (1 - (v - 400) / 1200) * (H - T - B);
    const s = svg("svg", { viewBox: `0 0 ${Wd} ${H}`, class: "chart", role: "img", "aria-label": "Total score over time", style: "width:100%;min-width:420px;height:auto" });
    const g = svg("g", { class: "grid" });
    for (const v of [400, 800, 1200, 1600]) { g.append(svg("line", { x1: L, x2: Wd - R, y1: y(v), y2: y(v) })); s.append(svg("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end" }, String(v))); }
    s.prepend(g);
    if (progress.target.total) s.append(svg("line", { class: "target", x1: L, x2: Wd - R, y1: y(progress.target.total), y2: y(progress.target.total) }), svg("text", { x: Wd - R, y: y(progress.target.total) - 6, "text-anchor": "end" }, `target ${progress.target.total}`));
    if (entries.length > 1) s.append(svg("polyline", { class: "line", points: entries.map((e) => `${x(e.t)},${y(e.rw + e.math)}`).join(" ") }));
    for (const e of entries) {
      const cx = x(e.t), cy = y(e.rw + e.math);
      s.append(e.type === "imp" ? svg("rect", { class: "pt-imp", x: cx - 6, y: cy - 6, width: 12, height: 12, transform: `rotate(45 ${cx} ${cy})` }) : svg("circle", { class: "pt-mock", cx, cy, r: 6 }));
      if (entries.length <= 12) s.append(svg("text", { class: "lbl", x: cx, y: cy - 12, "text-anchor": "middle" }, String(e.rw + e.math)));
    }
    const lab = (t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    s.append(svg("text", { x: x(t0), y: H - 8, "text-anchor": t1 === t0 ? "middle" : "start" }, lab(t0)));
    if (t1 !== t0) s.append(svg("text", { x: x(t1), y: H - 8, "text-anchor": "end" }, lab(t1)));
    return s;
  }
  function studyChart(days) {
    const Wd = 640, H = 150, L = 36, B = 22, T = 10;
    const vals = days.map((d) => (progress.study[dayKey(d)] || 0) / 60);
    const max = Math.max(30, ...vals);
    const bw = (Wd - L - 10) / days.length;
    const s = svg("svg", { viewBox: `0 0 ${Wd} ${H}`, class: "chart", role: "img", "aria-label": "Study minutes over the last 14 days", style: "width:100%;min-width:420px;height:auto" });
    const g = svg("g", { class: "grid" });
    for (const v of [0, Math.round(max / 2), Math.round(max)]) { const yy = T + (1 - v / max) * (H - T - B); g.append(svg("line", { x1: L, x2: Wd - 10, y1: yy, y2: yy })); s.append(svg("text", { x: L - 6, y: yy + 4, "text-anchor": "end" }, v + "m")); }
    s.append(g);
    days.forEach((d, i) => {
      const h = (vals[i] / max) * (H - T - B);
      s.append(svg("rect", { class: "bar" + (i === days.length - 1 ? " today" : ""), x: L + i * bw + 3, y: H - B - h, width: bw - 6, height: Math.max(0, h) }));
      if (i % 2 === 1 || i === days.length - 1) s.append(svg("text", { x: L + i * bw + bw / 2, y: H - 6, "text-anchor": "middle" }, d.toLocaleDateString(undefined, { day: "numeric" })));
    });
    return s;
  }

  // ------------------------------------------------------------------ review
  function renderReview() {
    const tab = ui.reviewTab;
    const ids = tab === "missed" ? missedIds() : savedIds();
    const tabs = el("div", { class: "pills on-desk", style: "margin-bottom:14px" }, [["missed", `missed (${missedIds().length})`], ["saved", `Marked for review (${savedIds().length})`]].map(([k, l]) =>
      el("button", { class: "pill", type: "button", "aria-pressed": String(tab === k), onclick: () => { ui.reviewTab = k; render(); } }, l)));
    const patterns = tab === "missed" ? missPatterns() : null;
    if (!ids.length) return el("div", { class: "stack" }, tabs, patterns, sheet("", el("div", { class: "empty", text: tab === "missed" ? "No missed questions right now. Anything you miss lands here until you get it right." : "Nothing saved yet. Tap “save” on any question to keep it here." })));
    return el("div", { class: "stack" }, tabs, patterns, sheet("",
      el("div", { class: "row between", style: "margin-bottom:12px" }, title(tab === "missed" ? "retry your misses" : "saved questions", true),
        el("button", { class: "btn", type: "button", onclick: () => beginSet({ kind: tab, label: tab === "missed" ? "Missed questions" : "Marked for review", ids: ids.slice(0, 30) }) }, `retry ${Math.min(30, ids.length)} now`)),
      el("div", { class: "tour" }, ids.map((id, i) => {
        const q = getQ(id);
        return el("div", {}, el("span", { class: "k", text: i + 1 }),
          el("span", {}, el("b", { text: `${skillOf(q)} · ${DIFF[q.diff]}` }), el("br"), el("small", { class: "snip", style: "display:block;color:inherit;opacity:.8", text: plain(q.passage?.[0] || q.prompt) })),
          el("button", { type: "button", onclick: () => { ui.pr.source = tab; loadPracticeQuestion(q); go("practice"); } }, "retry"));
      }))));
  }

  // ------------------------------------------------------------------ vocab
  const BOX_DAYS = [0, 1, 3, 7, 14, 30];
  function vocabDue() {
    const now = Date.now();
    return VOCAB.filter((v) => { const s = progress.vocab[v.w]; return !s || s.due <= now; });
  }
  function renderVocab() {
    const due = vocabDue();
    const learned = VOCAB.filter((v) => (progress.vocab[v.w]?.box || 0) >= 4).length;
    const vs = ui.vocab;
    if (!vs.word || !VOCAB.some((v) => v.w === vs.word)) { const pool = vs.mode === "all" ? VOCAB : due; vs.word = pool.length ? shuffle(pool)[0].w : null; vs.flipped = false; }
    const v = VOCAB.find((x) => x.w === vs.word);
    const grade = (ok) => {
      const s = progress.vocab[v.w] || { box: 0, due: 0 };
      s.box = ok ? Math.min(5, s.box + 1) : 0;
      s.due = Date.now() + BOX_DAYS[s.box] * 864e5 - 3600e3;
      progress.vocab[v.w] = s;
      save();
      const pool = (vs.mode === "all" ? VOCAB : vocabDue()).filter((x) => x.w !== v.w);
      vs.word = pool.length ? shuffle(pool)[0].w : null; vs.flipped = false;
      render();
    };
    return el("div", { class: "cols", style: "align-items:start" },
      sheet("", title("vocab"), el("p", { class: "sub", text: "Words that show up in Words in Context questions. Flip the card, then be honest: cards you know come back later, cards you miss come back tomorrow." }),
        el("div", { class: "pills", style: "margin-bottom:12px" }, [["due", `due today (${due.length})`], ["all", `all ${VOCAB.length}`]].map(([k, l]) => el("button", { class: "pill", type: "button", "aria-pressed": String(vs.mode === k), onclick: () => { vs.mode = k; vs.word = null; render(); } }, l))),
        v ? [
          el("button", { class: "card", type: "button", "aria-label": vs.flipped ? "Hide the definition" : "Show the definition", onclick: () => { vs.flipped = !vs.flipped; render(); } },
            el("div", {}, el("div", { class: "word", text: v.w }), el("div", { class: "tiny", text: v.pos }),
              vs.flipped ? [el("p", { class: "def", text: v.def }), el("p", { class: "ex", text: v.ex })] : el("p", { class: "tiny", style: "margin-top:16px", text: "tap to flip" }))),
          el("div", { class: "row", style: "margin-top:12px" }, el("button", { class: "btn ghost", type: "button", onclick: () => grade(false) }, "again"), el("button", { class: "btn", type: "button", onclick: () => grade(true) }, "got it"))
        ] : el("div", { class: "empty", text: "No cards due. Come back tomorrow, or switch to all cards." })),
      sheet("", title("progress", true), el("div", { class: "numgrid", style: "grid-template-columns:repeat(3,minmax(0,1fr))" },
        el("div", { class: "numbox" }, el("small", { text: "learned" }), el("b", { text: learned })), el("div", { class: "numbox" }, el("small", { text: "due" }), el("b", { text: due.length })), el("div", { class: "numbox" }, el("small", { text: "total" }), el("b", { text: VOCAB.length }))),
        el("p", { class: "tiny", style: "margin:10px 0 0", text: "A word counts as learned after you get it right four times in a row, spaced out over days." }),
        el("button", { class: "btn small ghost", style: "margin-top:12px", type: "button", onclick: () => { ui.pr.source = "domain"; ui.pr.skill = "Words in Context"; loadPracticeQuestion(); go("practice"); } }, "practice words in context")));
  }

  // ------------------------------------------------------------------ dock: calculator + gem
  function renderDock() {
    const root = document.getElementById("dock");
    if (!ui.dock) { root.replaceChildren(); return; }
    const useDesmos = ui.dock === "calc" && window.Desmos;
    if (ui.dock === "calc") loadDesmos();
    root.replaceChildren(el("div", { class: "dock" + (useDesmos ? " wide" : ""), role: "dialog", "aria-label": ui.dock === "calc" ? "Calculator" : "Ask Gem" }, el("div", { class: "sheet" },
      el("div", { class: "dock-head" }, el("span", { text: ui.dock === "calc" ? (useDesmos ? "Desmos graphing calculator" : "Calculator") : "Ask Gem" }), el("button", { type: "button", onclick: () => { ui.dock = null; renderDock(); } }, "Close")),
      ui.dock === "calc" ? (useDesmos ? renderDesmos() : renderCalc()) : renderGem())));
    if (useDesmos) desmosCalc.resize();
    else if (ui.dock === "calc" && ui.calc.tab === "graph") drawGraph();
  }
  // Desmos: the same graphing calculator the real SAT and OnePrep use. It loads when Clearline runs on its own
  // website. The Claude artifact viewer only allows scripts from a few code CDNs, so inside Claude the built-in
  // calculator and grapher stand in, with a link to open Desmos in a new tab.
  let desmosState = "idle", desmosEl = null, desmosCalc = null;
  function loadDesmos() {
    if (window.Desmos || desmosState !== "idle" || window.claude) return;
    desmosState = "loading";
    const s = document.createElement("script");
    s.src = `https://www.desmos.com/api/v1.11/calculator.js?apiKey=${DESMOS_API_KEY}`;
    s.onload = () => { desmosState = window.Desmos ? "ready" : "failed"; if (ui.dock === "calc") renderDock(); };
    s.onerror = () => { desmosState = "failed"; if (ui.dock === "calc") renderDock(); };
    document.head.append(s);
  }
  function renderDesmos() {
    if (!desmosEl) {
      desmosEl = el("div", { class: "desmos" });
      desmosCalc = window.Desmos.GraphingCalculator(desmosEl, { keypad: true, expressions: true, settingsMenu: true, zoomButtons: true, expressionsCollapsed: false, border: false });
    }
    return el("div", { style: "padding:0" }, desmosEl);
  }
  function runCalc() {
    const c = ui.calc;
    if (!c.expr.trim()) return;
    try {
      const { f, usesX } = CALC.compile(c.expr, c.deg);
      if (usesX) { c.err = "That has an x in it. Use the graph tab to plot it."; c.out = ""; }
      else { c.out = CALC.format(f(0)); c.err = ""; c.hist.unshift({ e: c.expr, r: c.out }); c.hist = c.hist.slice(0, 12); }
    } catch (e) { c.err = e.message; c.out = ""; }
    renderDock();
    document.getElementById("calc-in")?.focus();
  }
  function renderCalc() {
    const c = ui.calc;
    const tabs = el("div", { class: "row between" }, el("div", { class: "pills" }, [["calc", "Calculate"], ["graph", "Graph"]].map(([k, l]) => el("button", { class: "pill", type: "button", "aria-pressed": String(c.tab === k), onclick: () => { c.tab = k; renderDock(); } }, l))),
      el("label", { class: "check" }, el("input", { type: "checkbox", checked: c.deg, onchange: (e) => { c.deg = e.target.checked; if (c.tab === "graph") drawGraph(); } }), "Degrees"));
    const notice = el("p", { class: "notice", style: "margin:0" }, desmosState === "loading" ? "Loading Desmos… " : window.claude ? "Desmos loads when Clearline runs on its own website. Inside Claude, outside scripts are blocked, so this built-in calculator stands in. " : "Desmos couldn't load, so the built-in calculator is standing in. ",
      el("a", { href: "https://www.desmos.com/calculator", target: "_blank", rel: "noopener", style: "color:var(--accent-text);font-weight:600" }, "Open Desmos in a new tab ↗"));
    if (c.tab === "graph") {
      const colors = ["#e3342b", "#2f5fd0", "#1b7a33"];
      return el("div", { class: "dock-body graph" }, notice, tabs,
        c.fns.map((fx, i) => el("label", { class: "fn-row" }, el("i", { style: `background:${colors[i]}` }), el("input", { class: "input", id: "fn-" + i, value: fx, placeholder: "y = …", "aria-label": `Function ${i + 1}`, oninput: (e) => { c.fns[i] = e.target.value; drawGraph(); } }))),
        el("canvas", { id: "graph", width: "720", height: "480", role: "img", "aria-label": "Graph of the functions" }),
        el("div", { class: "row between" }, el("span", { class: "tiny", id: "graph-note", text: `window: −${c.range} to ${c.range}` }),
          el("span", { class: "row", style: "gap:6px" }, el("button", { class: "btn small ghost", type: "button", onclick: () => { c.range = Math.max(1, c.range / 2); renderDock(); } }, "zoom in"), el("button", { class: "btn small ghost", type: "button", onclick: () => { c.range = Math.min(1000, c.range * 2); renderDock(); } }, "zoom out"))));
    }
    const ins = (t) => () => { c.expr += t; renderDock(); document.getElementById("calc-in")?.focus(); };
    const keys = ["7", "8", "9", "/", "(", ")", "4", "5", "6", "*", "^", "√(", "1", "2", "3", "-", "π", "sin(", "0", ".", "=", "+", "cos(", "tan("];
    return el("div", { class: "dock-body" }, notice, tabs,
      el("form", { class: "row", onsubmit: (e) => { e.preventDefault(); runCalc(); } },
        el("input", { class: "input", id: "calc-in", style: "flex:1", value: c.expr, autocomplete: "off", placeholder: "e.g. (3/4)^2 + sqrt(20)", "aria-label": "Expression", oninput: (e) => { c.expr = e.target.value; } }),
        el("button", { class: "btn small", type: "submit" }, "=")),
      el("div", { class: "calc-out", "aria-live": "polite", text: c.err ? "" : c.out }),
      c.err ? el("p", { class: "err", style: "margin:0", text: c.err }) : null,
      el("div", { class: "keys" }, keys.map((k) => el("button", { type: "button", onclick: k === "=" ? runCalc : ins(k) }, k === "√(" ? "√" : k.replace("(", ""))),
        el("button", { type: "button", style: "grid-column:span 3", onclick: () => { c.expr = c.expr.slice(0, -1); renderDock(); } }, "⌫ back"),
        el("button", { type: "button", style: "grid-column:span 3", onclick: () => { c.expr = ""; c.out = ""; c.err = ""; renderDock(); } }, "clear")),
      c.hist.length ? el("div", { class: "calc-hist" }, c.hist.map((h) => el("button", { type: "button", onclick: () => { c.expr = h.e; renderDock(); } }, `${h.e} = ${h.r}`))) : null);
  }
  function drawGraph() {
    const cv = document.getElementById("graph");
    if (!cv) return;
    const c = ui.calc, ctx = cv.getContext("2d");
    const Wd = cv.width, H = cv.height, R = c.range, yR = (R * H) / Wd;
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#141414", rule = css.getPropertyValue("--rule").trim() || "#cfcdc0", paper = css.getPropertyValue("--paper").trim() || "#f2f1ea";
    const X = (x) => ((x + R) / (2 * R)) * Wd, Y = (y) => H - ((y + yR) / (2 * yR)) * H;
    ctx.fillStyle = paper; ctx.fillRect(0, 0, Wd, H);
    const step = Math.pow(10, Math.floor(Math.log10(R))) / (R / Math.pow(10, Math.floor(Math.log10(R))) > 5 ? 0.5 : 1);
    ctx.strokeStyle = rule; ctx.lineWidth = 1;
    for (let x = Math.ceil(-R / step) * step; x <= R; x += step) { ctx.beginPath(); ctx.moveTo(X(x), 0); ctx.lineTo(X(x), H); ctx.stroke(); }
    for (let y = Math.ceil(-yR / step) * step; y <= yR; y += step) { ctx.beginPath(); ctx.moveTo(0, Y(y)); ctx.lineTo(Wd, Y(y)); ctx.stroke(); }
    ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), H); ctx.moveTo(0, Y(0)); ctx.lineTo(Wd, Y(0)); ctx.stroke();
    ctx.fillStyle = ink; ctx.font = "16px Archivo, sans-serif";
    ctx.fillText(String(R), Wd - 30, Y(0) - 6); ctx.fillText(String(Math.round(yR * 10) / 10), X(0) + 6, 18);
    const colors = ["#e3342b", "#2f5fd0", "#1b7a33"];
    const notes = [];
    c.fns.forEach((src, i) => {
      if (!src.trim()) return;
      let f;
      try { f = CALC.compile(src, c.deg).f; } catch (e) { notes.push(`y${i + 1}: ${e.message}`); return; }
      ctx.strokeStyle = colors[i]; ctx.lineWidth = 3; ctx.beginPath();
      let pen = false, prev = null;
      for (let px = 0; px <= Wd; px += 2) {
        const x = -R + (px / Wd) * 2 * R, y = f(x);
        if (!Number.isFinite(y) || Math.abs(y) > yR * 50 || (prev != null && Math.abs(y - prev) > yR * 4)) { pen = false; prev = Number.isFinite(y) ? y : null; continue; }
        if (pen) ctx.lineTo(px, Y(y)); else ctx.moveTo(px, Y(y));
        pen = true; prev = y;
      }
      ctx.stroke();
    });
    const note = document.getElementById("graph-note");
    if (note) note.textContent = notes.length ? notes.join(" · ") : `window: −${R} to ${R}`;
  }
  function renderGem() {
    if (!sample) return el("div", { class: "dock-body" }, el("p", { style: "margin:0", text: "Gem is the Clearline coach: ask about a concept, a strategy, or your plan. Gem appears when this page is opened in Claude, using your own Claude account." }));
    const chat = el("div", { class: "chat", id: "gem-chat" }, ui.gemTurns.length ? ui.gemTurns.map((t) => el("div", { class: "msg " + (t.role === "user" ? "me" : "gem"), text: t.content }))
      : el("div", { class: "msg gem", text: "Hi, I'm Gem. Ask me about any SAT skill, a strategy, or what to study next. I can see your skill accuracy and scores." }));
    const input = el("textarea", { class: "input", id: "gem-input", rows: "2", placeholder: "how do I stop missing comma questions?", "aria-label": "Message Gem" });
    const send = el("button", { class: "btn small", type: "submit" }, "send");
    const stop = el("button", { class: "btn small ghost", type: "button", hidden: true, onclick: () => gemCtl?.abort() }, "stop");
    const form = el("form", { class: "row", onsubmit: async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      ui.gemTurns.push({ role: "user", content: text });
      const bubble = el("div", { class: "msg gem", text: "Thinking…" });
      chat.append(el("div", { class: "msg me", text }), bubble);
      input.value = ""; send.disabled = true; stop.hidden = false;
      chat.scrollTop = chat.scrollHeight;
      gemCtl = new AbortController();
      const weak = weakestSkills(3).map((s) => `${s.skill} (${skillStats(s.skill).total ? Math.round((skillStats(s.skill).rate || 0) * 100) + "% of " + skillStats(s.skill).total : "untried"})`).join(", ");
      const imp = latestImport(), mk = latestMock();
      const rules = ["You are Gem, the friendly SAT coach inside the Clearline SAT app. Keep answers under 180 words, plain text, concrete and encouraging. Use real digital SAT facts only; if unsure, say so.",
        `Student context: imported score ${imp ? imp.rw + imp.math + ` (R&W ${imp.rw}, Math ${imp.math})` : "none yet"}; latest mock ${mk ? mk.total : "none yet"}; target ${progress.target.total || "not set"}; weakest skills: ${weak}.`,
        "App features you can point to: practice (filters by skill/difficulty), question bank and drill builder, remix button, mock SAT (full or quick, adaptive), scores & stats, review (missed/saved), vocab flashcards, calculator and grapher, formula sheet."].join("\n");
      try {
        const turns = [{ role: "user", content: rules }, ...ui.gemTurns.slice(-10)];
        const { text: reply } = await sample(turns, { signal: gemCtl.signal, cache: false, onText: ({ text: t }) => { bubble.textContent = t; chat.scrollTop = chat.scrollHeight; } });
        ui.gemTurns.push({ role: "assistant", content: reply });
      } catch (err) { if (sampleError(err, bubble)) { renderDock(); return; } }
      finally { send.disabled = false; stop.hidden = true; }
    } }, input, send, stop);
    return el("div", { class: "dock-body" }, chat, form, el("span", { class: "tiny", text: "Uses your Claude account. Answers are AI-generated." }));
  }

  // ------------------------------------------------------------------ timers
  const focus = { phase: "focus", left: 25 * 60, running: false };
  function renderFocus() {
    const c = document.getElementById("focus-clock"), l = document.getElementById("focus-label"), s = document.getElementById("focus-state");
    if (c) c.textContent = clock(focus.left);
    if (l) l.textContent = focus.phase === "focus" ? "Focus" : "Break";
    if (s) s.textContent = focus.running ? "❚❚" : "▶";
  }
  function resetFocus(phase = "focus") { focus.phase = phase; focus.left = (phase === "focus" ? progress.timer.focus : progress.timer.rest) * 60; renderFocus(); }
  let ticks = 0;
  setInterval(() => {
    ticks++;
    if (focus.running) {
      focus.left--;
      if (focus.left <= 0) { const done = focus.phase; resetFocus(done === "focus" ? "rest" : "focus"); toast(done === "focus" ? `Focus session done. Take a ${progress.timer.rest}-minute break.` : "Break's over. Ready for another round?"); }
      renderFocus();
    }
    const visible = document.visibilityState === "visible";
    if (visible && Date.now() - ui.lastActive < 120000) {
      const k = dayKey();
      progress.study[k] = (progress.study[k] || 0) + 1;
      if (progress.study[k] % 60 === 0) { const t = document.getElementById("tool-today"); if (t) t.textContent = fmtMin(progress.study[k]); save(); }
    }
    const set = progress.set;
    if (set && set.timeLeft != null && ui.view === "practice" && ui.pr.source === "set" && visible && set.i < set.ids.length) {
      set.timeLeft = Math.max(0, set.timeLeft - 1);
      const sc = document.getElementById("set-clock");
      if (sc) sc.textContent = clock(set.timeLeft);
      if (set.timeLeft === 0) { toast("Time's up for this drill. Finish at your own pace."); set.timeLeft = null; save(); }
    }
    const r = ui.rush;
    if (r && !r.done && ui.view === "practice" && ui.pr.source === "rush" && visible) {
      r.left--;
      const rc = document.getElementById("rush-clock");
      if (rc) rc.textContent = clock(r.left);
      if (r.left <= 0) endRush();
    }
    const am = progress.activeMock;
    if (am && ui.view === "mock" && visible) {
      const clockEl = document.getElementById("test-clock");
      if (am.onBreak) {
        am.breakLeft--;
        if (clockEl) clockEl.textContent = clock(am.breakLeft);
        if (am.breakLeft <= 0) { am.onBreak = false; save(true); render(); }
      } else {
        const m = curModule();
        if (!m.reviewing) { const id = m.ids[m.cur]; m.time[id] = (m.time[id] || 0) + 1; }
        if (m.timeLeft != null) {
          m.timeLeft--;
          if (clockEl && !ui.hideTimer) { clockEl.textContent = clock(m.timeLeft); clockEl.classList.toggle("warn", m.timeLeft <= 300); }
          if (m.timeLeft === 300) toast("5 minutes left in this module");
          if (m.timeLeft <= 0) { m.timeLeft = 0; toast("Time's up. Module submitted."); submitModule(); }
        }
      }
      if (ticks % 10 === 0) save();
    }
  }, 1000);

  // ------------------------------------------------------------------ events
  for (const ev of ["pointerdown", "keydown", "scroll"]) addEventListener(ev, () => { ui.lastActive = Date.now(); }, { passive: true });
  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "Escape") { if (ui.refOpen) { ui.refOpen = false; render(); } else if (ui.dock) { ui.dock = null; renderDock(); } return; }
    const tag = document.activeElement?.tagName;
    if (["TEXTAREA", "INPUT", "SELECT"].includes(tag)) return;
    if (document.activeElement?.closest?.(".dock")) return;
    const idx = "abcd".indexOf(e.key.toLowerCase());
    if (ui.view === "practice" && ui.pr.source === "rush") { if (idx >= 0 && ui.rush && !ui.rush.done && ui.rush.q?.choices[idx] != null) { rushAnswer(idx); e.preventDefault(); } }
    else if (ui.view === "practice" && ui.pr.q && ui.pr.q.type !== "spr") {
      if (idx >= 0 && !ui.pr.checked) { ui.pr.picked = idx; render(); e.preventDefault(); }
      else if (e.key === "Enter" && tag !== "BUTTON" && tag !== "SUMMARY") { e.preventDefault(); ui.pr.checked ? nextPractice() : checkPractice(); }
    } else if (ui.view === "mock" && progress.activeMock && !progress.activeMock.onBreak) {
      const m = curModule(), q = m && !m.reviewing && getQ(m.ids[m.cur]);
      if (q && q.type !== "spr" && idx >= 0) { m.ans[q.id] = idx; save(); render(); e.preventDefault(); }
    }
  });
  addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") save(true); });
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VIEWS.some(([k]) => k === h)) go(h); });

  // ------------------------------------------------------------------ boot
  progress = loadLocal();
  resetFocus("focus");
  { const h = location.hash.slice(1); if (VIEWS.some(([k]) => k === h)) ui.view = h; }
  loadPracticeQuestion();
  render();

  function merge(a, b) {
    const out = normalize(JSON.parse(JSON.stringify(a)));
    const B = normalize(JSON.parse(JSON.stringify(b)));
    for (const [id, list] of Object.entries(B.attempts)) {
      const mine = out.attempts[id] || [];
      const seen = new Set(mine.map((x) => x.at));
      out.attempts[id] = [...mine, ...list.filter((x) => !seen.has(x.at))].sort((x, y) => x.at - y.at).slice(-6);
    }
    for (const [k, v] of Object.entries(B.study)) out.study[k] = Math.max(out.study[k] || 0, v);
    for (const key of ["scores", "mocks", "drills"]) { const ids = new Set(out[key].map((x) => x.id)); out[key].push(...B[key].filter((x) => !ids.has(x.id))); }
    for (const [k, v] of Object.entries(B.saved)) if (!out.saved[k]) out.saved[k] = v;
    for (const [k, v] of Object.entries(B.rush)) out.rush[k] = Math.max(out.rush[k] || 0, v);
    for (const [k, v] of Object.entries(B.vocab)) if (!out.vocab[k] || (v.due || 0) > (out.vocab[k].due || 0)) out.vocab[k] = v;
    if (!out.target.total && B.target.total) out.target = B.target;
    if (!out.activeMock || (B.activeMock && B.activeMock.startedAt > out.activeMock.startedAt)) out.activeMock = B.activeMock || out.activeMock;
    if (!out.set && B.set) out.set = B.set;
    return out;
  }
  (async () => {
    if (!window.claude?.use) return;
    claude.use("sample").then((s) => { if (s) { sample = s; if (ui.pr.checked || ui.dock === "gem") render(); } });
    const [dbNs, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!dbNs || !user) return;
    uid = await user.id().catch(() => null);
    if (!uid) return;
    db = dbNs;
    try {
      const snap = await db.doc("data/users/" + uid + "/progress").get();
      if (snap.exists) progress = merge(snap.data(), progress);
      setSync("Progress is saved to your account.");
      save(true);
      render();
    } catch { db = null; setSync("Progress is saved in this browser only."); }
  })();
})();
