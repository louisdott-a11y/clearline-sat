// Gem the cairn: flat stacked stones with a face on the bottom stone and two pebble hands.
// Builds an SVG and returns small controls to animate it. No DOM access at load time (tests load data files in Node).
// Styles live in index.html under "Gem the cairn".
(function () {
  // Stone sizes from the bottom up, as flat slabs; each sits 3 units into the one below so they overlap.
  const SIZES = [[52, 25], [40, 11], [31, 9], [27, 8], [22, 7], [18, 6]];
  // small (32px and under): base plus one stone, a taller base, a bigger face and no hands (they read as ears there).
  const SMALL = [[52, 30], [36, 11]];
  // Offset, tip and a sloped top per stone, so the stack looks hand-placed rock, not a smooth swirl.
  const NUDGE = [0, 4, -3, 3, -2, 2], TILT = [-0.03, -0.04, 0.06, -0.05, 0.05, -0.03], LUMP = [0.14, -0.12, 0.14, -0.1, 0.12, -0.08];
  const FILLS = ["lilac", "moss", "pebble"];
  const BASE = 57;
  const n1 = (v) => Math.round(v * 10) / 10;
  function stack(count, small) {
    let by = BASE;
    return (small ? SMALL : SIZES).slice(0, count).map(([w, h], i) => { const s = { cx: 32 + NUDGE[i], by, w, h }; by = by - h + 3; return s; });
  }
  // Flat shading: a lighter band on top, a darker band underneath, both sharing the stone's own edge.
  function stone({ cx, by, w, h }, i) {
    const l = LUMP[i], p = (x, y) => `${n1(cx + x * w)} ${n1(by - y * h + TILT[i] * x * w)}`;
    const top = `M${p(-0.5, 0.45)}C${p(-0.5, 0.85 + l)} ${p(-0.42, 1 + l)} ${p(-0.24, 1 + l)}Q${p(0, 0.93)} ${p(0.22, 1 - l)}C${p(0.42, 1 - l)} ${p(0.5, 0.85)} ${p(0.5, 0.5)}`;
    const bottom = `C${p(0.5, 0.12)} ${p(0.42, 0)} ${p(0.22, 0)}L${p(-0.25, 0)}C${p(i ? -0.44 : -0.49, 0)} ${p(-0.5, i ? 0.1 : 0.03)} ${p(-0.5, 0.45)}`;
    const lit = `${top}C${p(0.25, 0.72)} ${p(-0.25, 0.7)} ${p(-0.5, 0.45)}z`;
    const shade = `M${p(0.5, 0.5)}${bottom}C${p(-0.25, 0.18)} ${p(0.25, 0.2)} ${p(0.5, 0.5)}z`;
    return `<g class="cn-stone" data-i="${i}"><g class="cn-rock"><path class="cn-fill ${FILLS[i % 3]}" d="${top}${bottom}z"/><path class="cn-lit" d="${lit}"/><path class="cn-shade" d="${shade}"/><path class="cn-line" d="${top}${bottom}z"/></g></g>`;
  }
  const hand = (side, cx) => `<g class="cn-hand ${side}"><ellipse class="cn-fill lilac" cx="${cx}" cy="52" rx="3.8" ry="3.2"/><path class="cn-shade" d="M${cx - 3.6} 53q3.6 3.6 7.2 0q-3.6 1.4-7.2 0z"/><ellipse class="cn-line" cx="${cx}" cy="52" rx="3.8" ry="3.2"/></g>`;

  // Faces sit on the bottom stone: brows, eyes with a small glint, mouth. Each mood gets its own still pose.
  const eye = (cx, cy = 43.5, r = 3.5) => `<g class="cn-eye"><circle class="cn-ink" cx="${cx}" cy="${cy}" r="${r}"/><circle class="cn-glint" cx="${n1(cx - r * 0.35)}" cy="${n1(cy - r * 0.38)}" r="${n1(r * 0.32)}"/></g>`;
  const brows = (d) => `<path class="cn-brow" d="${d}"/>`, mouth = (d) => `<path class="cn-mouth" d="${d}"/>`;
  const FACES = {
    smile: brows("M20.5 37.6q3.5-1.6 7 0M36.5 37.6q3.5-1.6 7 0") + eye(24) + eye(40) + mouth("M28 49q4 3.8 8 0"),
    happy: brows("M20.5 36.2q3.5-1.8 7 0M36.5 36.2q3.5-1.8 7 0") + mouth("M20.5 45q3.5-4.6 7 0M36.5 45q3.5-4.6 7 0") + '<path class="cn-ink" d="M25.5 48q6.5 1.6 13 0q-.8 7-6.5 7t-6.5-7z"/>',
    oops: brows("M20.5 38.6l7-3.2M43.5 38.6l-7-3.2") + eye(24, 43.8, 3.7) + eye(40, 43.8, 3.7) + '<ellipse class="cn-ink" cx="32" cy="50.5" rx="3" ry="3.4"/>',
    think: brows("M20.5 38.2h7M36.5 35.6q3.5-2.6 7 0") + eye(25.6, 42) + eye(41.6, 42) + mouth("M29.5 50h5"),
    shrug: brows("M20.5 36q3.5-2 7 0M36.5 36q3.5-2 7 0") + eye(24) + eye(40) + mouth("M28 50.2q2-1.6 4 0t4 0")
  };
  // What the hands do in each mood (see data-hands in the CSS).
  const HANDS = { smile: "rest", happy: "cheer", oops: "rest", think: "chin", shrug: "shrug" };

  // An underdamped spring sampled into a CSS linear() easing; bounce 0 = no overshoot, 0.5 = lively.
  function spring(bounce) {
    const z = 1 - bounce, w = 4.6 / Math.max(z, 0.3), wd = w * Math.sqrt(1 - Math.min(z, 0.99) ** 2), pts = [];
    for (let k = 0; k <= 32; k++) { const t = k / 32; pts.push(Math.round((1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t))) * 1000) / 1000); }
    pts[32] = 1;
    return `linear(${pts.join(", ")})`;
  }
  const BOUNCY = spring(0.45), SNAPPY = spring(0.2);

  function make({ stones = 3, mood = "smile", fit = true, still = false, small = false, label = "" } = {}) {
    if (small) { stones = 2; fit = true; }
    const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // fit: a square box hugging this stack. Otherwise room for the tallest stack, so Coach's Gem never resizes as it grows.
    const peak = stack(fit ? stones : SIZES.length, small).at(-1), ys = Math.min(peak.by - peak.h - 4, 10), size = 62 - ys;
    el.setAttribute("viewBox", `${n1(32 - size / 2)} ${n1(ys)} ${n1(size)} ${n1(size)}`);
    el.setAttribute("class", "cairn" + (still ? " cn-still" : "") + (small ? " cn-small" : ""));
    if (label) { el.setAttribute("role", "img"); el.setAttribute("aria-label", label); } else el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<ellipse class="cn-ground" cx="32" cy="58.4" rx="22" ry="2.6"/><g class="cn-lean"><g class="cn-bounce"><g class="cn-breathe">${stack(stones, small).map(stone).join("")}<g class="cn-look"><g class="cn-face"${small ? ' transform="translate(32 40) scale(1.35) translate(-32 -45)"' : ""}></g></g></g>${small ? "" : hand("l", 6.5) + hand("r", 57.5)}</g></g>`;
    const q = (s) => el.querySelector(s);
    const calm = () => still || matchMedia("(prefers-reduced-motion: reduce)").matches;
    const play = (node, frames, ms, easing = "ease-out") => calm() || !node?.animate ? null : node.animate(frames, { duration: ms, easing });
    const topStone = () => [...el.querySelectorAll(".cn-stone")].at(-1);
    const face = q(".cn-face"), breathe = q(".cn-breathe");
    let count = stones;
    const markTop = () => { el.querySelector(".cn-top")?.classList.remove("cn-top"); topStone().classList.add("cn-top"); };
    markTop();

    const api = {
      el,
      mood(m) {
        el.dataset.mood = m;
        el.dataset.hands = HANDS[m] || "rest";
        if (m !== "oops") el.classList.remove("cn-slipped");
        face.innerHTML = FACES[m] || FACES.smile;
        api.look(0, 0);
        return api;
      },
      look(x, y) { q(".cn-look").style.transform = x || y ? `translate(${x}px, ${y}px)` : ""; return api; },
      // Point at something: -1 left, 1 right. Gem leans that way, reaches with that hand and looks there.
      point(dir) {
        api.mood("smile");
        el.dataset.mood = "point"; el.dataset.hands = dir < 0 ? "point-l" : "point-r"; el.style.setProperty("--cn-dir", dir);
        q(".cn-lean").style.transform = `rotate(${dir * 6}deg)`;
        return api.look(dir * 2.4, 0.6);
      },
      upright() { q(".cn-lean").style.transform = ""; return api; },
      shrug() { api.upright().mood("shrug"); play(q(".cn-bounce"), [{ transform: "none" }, { transform: "translateY(-3px)", offset: 0.4 }, { transform: "none" }], 420, SNAPPY); return api; },
      wave() {
        api.mood("smile");
        el.dataset.hands = "wave";
        const h = q(".cn-hand.r"), up = "translate(3px, -19px)";
        play(h, [{ transform: up }, { transform: "translate(6px, -20px)" }, { transform: "translate(0px, -19px)" }, { transform: "translate(6px, -20px)" }, { transform: up }], 600, "ease-in-out");
        if (!calm()) setTimeout(() => { if (el.dataset.hands === "wave") el.dataset.hands = "rest"; }, 900);
        return api;
      },
      // Slide in from the edge, then wave hello.
      enter(from = -1) {
        api.upright().mood("smile");
        if (calm()) return api.wave();
        play(el, [{ transform: `translateX(${from * 48}px)`, opacity: 0 }, { transform: "none", opacity: 1 }], 520, BOUNCY);
        setTimeout(() => api.wave(), 380);
        return api;
      },
      // Coach: one more stone drops on the stack, squashing as it lands.
      add() {
        if (small || count >= SIZES.length) return api;
        breathe.insertAdjacentHTML("beforeend", stone(stack(count + 1)[count], count));
        breathe.append(q(".cn-look"));
        count++;
        markTop();
        play(topStone(), [
          { transform: "translateY(-22px) scale(0.9, 1.14)", opacity: 0, offset: 0 },
          { transform: "translateY(0) scale(0.95, 1.08)", opacity: 1, offset: 0.45 },
          { transform: "scale(1.2, 0.78)", offset: 0.6 },
          { transform: "scale(0.95, 1.05)", offset: 0.8 },
          { transform: "none", offset: 1 }], 460, "ease-in");
        play(q(".cn-bounce"), [{ transform: "none" }, { transform: "scale(1.03, 0.96)", offset: 0.55 }, { transform: "none" }], 380);
        return api;
      },
      // Coach solved: the last stone lands, then Gem hops and cheers.
      solve() { api.upright().add(); setTimeout(() => api.right(), calm() ? 0 : 380); return api; },
      right() {
        api.upright().mood("happy");
        play(q(".cn-bounce"), [
          { transform: "none" }, { transform: "scale(1.08, 0.9)", offset: 0.18 },
          { transform: "translateY(-9px) scale(0.96, 1.06)", offset: 0.5 }, { transform: "scale(1.06, 0.94)", offset: 0.82 }, { transform: "none" }], 560, "ease-in-out");
        play(q(".cn-ground"), [{ transform: "none" }, { transform: "scale(0.7)", opacity: 0.5, offset: 0.5 }, { transform: "none" }], 560, "ease-in-out");
        return api;
      },
      // Wrong: worried face, the stack wobbles and the top stone slips, then settles back.
      wrong() {
        api.upright().mood("oops");
        el.classList.add("cn-slipped");
        if (calm()) return api;
        el.classList.remove("cn-slipped");
        play(q(".cn-bounce"), [{ transform: "none" }, { transform: "rotate(-5deg)" }, { transform: "rotate(4deg)" }, { transform: "rotate(-2deg)" }, { transform: "none" }], 520, "ease-in-out");
        play(topStone(), [{ transform: "none" }, { transform: "translate(5px, 1px) rotate(14deg)", offset: 0.35 }, { transform: "translate(5px, 1px) rotate(14deg)", offset: 0.5 }, { transform: "none" }], 600, SNAPPY);
        return api;
      }
    };
    return api.mood(mood);
  }
  window.CL_GEM = { make, spring };
})();
