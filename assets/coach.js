// Coach: the "Walk me through it" tutor. Builds a step-by-step plan from a question's own answer key, so Coach can
// never contradict it. No screen code here; app.js draws it and tests/coach.test.js checks every question.
// Math uses the Desmos walkthrough steps (tests/walk.test.js already proves none before the last gives the answer
// away); Reading and Writing uses the solution steps minus the last one, which usually states the answer.
window.CL_COACH = (() => {
  function plan(q) {
    const walk = q.section === "math" && Array.isArray(q.walk) && q.walk.length > 1;
    const hints = walk
      ? q.walk.slice(0, -1).map((s) => [s.say, s.keys?.length ? `Type ${s.keys.map((k) => k.replace(/ - /g, " − ").replace(/(^|[=(,] ?)-/g, "$1−")).join(" and ")}.` : "", s.why].filter(Boolean).join(" "))
      : (q.steps || []).slice(0, -1);
    const choices = q.type !== "spr" && Array.isArray(q.choices);
    return {
      hints,
      // Wrong choices, each with the reason from the answer key, in the order Coach will accept them.
      wrong: choices ? q.choices.map((_, i) => i).filter((i) => i !== q.answer).map((i) => ({ i, why: (q.why && q.why[i]) || "" })) : [],
      answer: choices ? q.answer : null,
      // The full solution, shown only when the student asks or finishes.
      solution: q.steps || [],
      desmos: walk
    };
  }
  return { plan };
})();
