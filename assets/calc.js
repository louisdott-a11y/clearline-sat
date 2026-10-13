// Clearline SAT: safe expression parser for the built-in calculator and grapher (no eval).
// This file handles three main tasks:
// 1. Tokenizing: Breaking a math string into recognizable pieces (numbers, operators, functions).
// 2. Parsing: Building a mathematical tree to respect the order of operations.
// 3. Evaluating: Calculating the result of the expression, supporting variables (x) and trig modes.
window.CL_CALC = (() => {
  const FUNCS = { sqrt: Math.sqrt, abs: Math.abs, sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan, ln: Math.log, log: Math.log10, exp: Math.exp };
  const TRIG = new Set(["sin", "cos", "tan"]);
  const ITRIG = new Set(["asin", "acos", "atan"]);
  const CONSTS = { pi: Math.PI, "π": Math.PI, e: Math.E };

  function tokenize(src) {
    const s = String(src).replace(/[−–]/g, "-").replace(/[×·]/g, "*").replace(/÷/g, "/").replace(/√/g, "sqrt").replace(/²/g, "^2").replace(/³/g, "^3");
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(s.slice(i));
        if (!m) throw new Error("Check the number near “" + s.slice(i, i + 4) + "”.");
        out.push({ t: "num", v: Number(m[0]) }); i += m[0].length; continue;
      }
      if (/[a-zπ]/i.test(c)) {
        const m = /^(π|[a-z]+)/i.exec(s.slice(i));
        let word = m[0].toLowerCase();
        i += m[0].length;
        // Split runs like "xpi" or "2pix" into known pieces.
        while (word) {
          const known = Object.keys(FUNCS).concat(Object.keys(CONSTS), ["x"]).sort((a, b) => b.length - a.length).find((k) => word.startsWith(k));
          if (!known) throw new Error("Unknown name “" + word + "”. Try sqrt, abs, sin, cos, tan, ln, log, pi or x.");
          out.push(FUNCS[known] ? { t: "fn", v: known } : known === "x" ? { t: "x" } : { t: "num", v: CONSTS[known] });
          word = word.slice(known.length);
        }
        continue;
      }
      if ("+-*/^(),".includes(c)) { out.push({ t: c }); i++; continue; }
      throw new Error("“" + c + "” isn't something the calculator understands.");
    }
    // Implicit multiplication: 2x, 3(x+1), (x+1)(x-1), x pi, 2sqrt(3)
    const res = [];
    const endsValue = (t) => t && (t.t === "num" || t.t === "x" || t.t === ")");
    const startsValue = (t) => t && (t.t === "num" || t.t === "x" || t.t === "(" || t.t === "fn");
    for (const t of out) { if (endsValue(res[res.length - 1]) && startsValue(t)) res.push({ t: "*" }); res.push(t); }
    return res;
  }

  function parse(src) {
    const toks = tokenize(src);
    let p = 0;
    const peek = () => toks[p];
    const take = (t) => { if (toks[p] && toks[p].t === t) return toks[p++]; return null; };
    function expr() { let n = term(); for (;;) { if (take("+")) n = ["+", n, term()]; else if (take("-")) n = ["-", n, term()]; else return n; } }
    function term() { let n = unary(); for (;;) { if (take("*")) n = ["*", n, unary()]; else if (take("/")) n = ["/", n, unary()]; else return n; } }
    function unary() { if (take("-")) return ["neg", unary()]; if (take("+")) return unary(); return power(); }
    function power() { const b = primary(); if (take("^")) return ["^", b, unary()]; return b; }
    function primary() {
      const t = peek();
      if (!t) throw new Error("The expression ends too early.");
      if (t.t === "num") { p++; return ["num", t.v]; }
      if (t.t === "x") { p++; return ["x"]; }
      if (t.t === "fn") {
        p++;
        if (!take("(")) { const arg = power(); return ["fn", t.v, arg]; }
        const arg = expr();
        if (!take(")")) throw new Error("Close the parenthesis after " + t.v + "(.");
        return ["fn", t.v, arg];
      }
      if (take("(")) { const n = expr(); if (!take(")")) throw new Error("A parenthesis is missing its partner."); return n; }
      throw new Error("Something is missing before “" + (t.t === "num" ? t.v : t.t) + "”.");
    }
    const tree = expr();
    if (p < toks.length) throw new Error("Unexpected “" + (toks[p].v ?? toks[p].t) + "”.");
    return tree;
  }

  function evaluate(n, x, deg) {
    switch (n[0]) {
      case "num": return n[1];
      case "x": return x;
      case "neg": return -evaluate(n[1], x, deg);
      case "+": return evaluate(n[1], x, deg) + evaluate(n[2], x, deg);
      case "-": return evaluate(n[1], x, deg) - evaluate(n[2], x, deg);
      case "*": return evaluate(n[1], x, deg) * evaluate(n[2], x, deg);
      case "/": return evaluate(n[1], x, deg) / evaluate(n[2], x, deg);
      case "^": return Math.pow(evaluate(n[1], x, deg), evaluate(n[2], x, deg));
      case "fn": {
        let a = evaluate(n[2], x, deg);
        if (deg && TRIG.has(n[1])) a = (a * Math.PI) / 180;
        let r = FUNCS[n[1]](a);
        if (deg && ITRIG.has(n[1])) r = (r * 180) / Math.PI;
        return r;
      }
    }
    return NaN;
  }
  const usesX = (n) => Array.isArray(n) && (n[0] === "x" || n.slice(1).some(usesX));
  function compile(src, deg = false) {
    const body = String(src).replace(/^\s*(y|f\(x\))\s*=\s*/i, "");
    const tree = parse(body);
    return { f: (x) => evaluate(tree, x, deg), usesX: usesX(tree) };
  }
  function format(v) {
    if (!Number.isFinite(v)) return Number.isNaN(v) ? "undefined" : v > 0 ? "∞" : "−∞";
    if (Math.abs(v) < 1e-12) return "0";
    const r = Number(v.toPrecision(12));
    let s = Math.abs(r) >= 1e12 || Math.abs(r) < 1e-6 ? r.toExponential(6) : String(r);
    // Show a fraction too when the value is a simple rational.
    for (let d = 2; d <= 64; d++) {
      const n = r * d;
      if (Math.abs(n - Math.round(n)) < 1e-9 && Math.abs(n) < 1e6 && !Number.isInteger(r)) { s += "  (" + (Math.round(n) < 0 ? "−" : "") + Math.abs(Math.round(n)) + "/" + d + ")"; break; }
    }
    return s.replace(/^-/, "−");
  }
  return { compile, format };
})();
