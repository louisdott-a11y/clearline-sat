// Self-check for the sync API: the request rules (same website only, size cap, real progress shape) and that the
// signed-in user's id can only come from a correctly signed session cookie. Uses throwaway test values, never real
// keys, and never reaches a database: every case here is refused before the first query.
const assert = require("assert");
// Fresh random values on every run, so no secret-looking text lives in the repo.
const rand = () => require("crypto").randomBytes(24).toString("base64url");
Object.assign(process.env, { AUTH_SECRET: rand(), AUTH_GOOGLE_ID: rand(), AUTH_GOOGLE_SECRET: rand(), DATABASE_URL: `postgresql://nobody:${rand()}@localhost/none` });

(async () => {
  const { readProgress, sameOrigin, MAX_BYTES, restoreAuthRequest, readCount, isBot } = await import("../api/_checks.mjs");
  const { userId } = await import("../api/_lib.mjs");
  const progress = await import("../api/progress.mjs");
  const account = await import("../api/account.mjs");
  const count = await import("../api/count.mjs");
  const stats = await import("../api/stats.mjs");
  const { encode } = await import("@auth/core/jwt");

  // Request rules.
  const req = (origin, extra = {}) => new Request("https://clearlinesat.com/api/progress", { method: "PUT", headers: origin ? { origin, ...extra } : extra });
  assert(sameOrigin(req("https://clearlinesat.com")), "own website is allowed");
  assert(!sameOrigin(req("https://evil.example")), "another website is refused");
  assert(!sameOrigin(req(null)), "a request with no Origin is refused");
  assert(readProgress(JSON.stringify({ attempts: {} })).progress, "real progress is accepted");
  assert.strictEqual(readProgress("[]").status, 400, "an array is refused");
  assert.strictEqual(readProgress("{\"attempts\":[]}").status, 400, "attempts must be an object");
  assert.strictEqual(readProgress("not json").status, 400, "bad JSON is refused");
  assert.strictEqual(readProgress(JSON.stringify({ attempts: {}, pad: "x".repeat(MAX_BYTES) })).status, 413, "over 1 MB is refused");

  // The Vercel rewrite's ?authpath= is turned back into the original Auth.js address, keeping method, headers and body.
  const back = await restoreAuthRequest(new Request("https://clearlinesat.com/api/authjs?authpath=callback/google&code=abc", { method: "POST", headers: { cookie: "x=1" }, body: "a=1" }));
  assert.strictEqual(back.url, "https://clearlinesat.com/api/auth/callback/google?code=abc", "original address restored");
  assert.strictEqual(back.method, "POST"); assert.strictEqual(back.headers.get("cookie"), "x=1"); assert.strictEqual(await back.text(), "a=1");
  const plain = new Request("https://clearlinesat.com/api/auth/session");
  assert.strictEqual(await restoreAuthRequest(plain), plain, "a request without ?authpath= passes through untouched");

  // Sessions: only a cookie signed with the real secret identifies a user.
  const cookieName = "authjs.session-token"; // the http name; on https Auth.js adds the __Secure- prefix
  const signed = await encode({ token: { uid: "user-123", email: "a@b.c" }, secret: process.env.AUTH_SECRET, salt: cookieName });
  const forged = await encode({ token: { uid: "user-123" }, secret: rand(), salt: cookieName });
  const at = (cookie) => new Request("http://localhost/api/progress", { headers: cookie ? { cookie: `${cookieName}=${cookie}` } : {} });
  assert.strictEqual(await userId(at(signed)), "user-123", "a correctly signed session identifies its user");
  assert.strictEqual(await userId(at(null)), null, "no cookie means nobody");
  const log = console.error; console.error = () => {}; // Auth.js logs each rejected cookie; that is the expected outcome here
  assert.strictEqual(await userId(at(forged)), null, "a cookie signed with another secret means nobody");
  assert.strictEqual(await userId(at(signed.slice(0, -4) + "AAAA")), null, "a tampered cookie means nobody");
  console.error = log;

  // Routes refuse before touching the database.
  assert.strictEqual((await progress.GET(at(null))).status, 401, "reading progress needs sign-in");
  const foreign = new Request("http://localhost/api/progress", { method: "PUT", headers: { origin: "https://evil.example", cookie: `${cookieName}=${signed}` }, body: "{}" });
  assert.strictEqual((await progress.PUT(foreign)).status, 403, "a save from another website is refused even when signed in");
  const del = new Request("http://localhost/api/account", { method: "DELETE", headers: { origin: "https://evil.example", cookie: `${cookieName}=${signed}` } });
  assert.strictEqual((await account.DELETE(del)).status, 403, "deleting from another website is refused");
  const own = new Request("http://localhost/api/progress", { method: "PUT", headers: { origin: "http://localhost" }, body: "{\"attempts\":{}}" });
  assert.strictEqual((await progress.PUT(own)).status, 401, "saving needs sign-in");

  // Usage counter: only a random device id and a small whole number get in; bots and other websites are turned away.
  const dev = require("crypto").randomUUID();
  assert.deepStrictEqual(readCount(JSON.stringify({ device: dev, answered: 3 })), { device: dev, answered: 3 }, "a real count is accepted");
  for (const bad of [{ device: "me@x.com", answered: 1 }, { device: dev, answered: -1 }, { device: dev, answered: 201 }, { device: dev, answered: 1.5 }, { device: dev }, null])
    assert.strictEqual(readCount(JSON.stringify(bad)).status, 400, "refused: " + JSON.stringify(bad));
  assert.strictEqual(readCount("x".repeat(201)).status, 400, "an oversized count is refused");
  for (const ua of ["Googlebot/2.1", "Mozilla/5.0 HeadlessChrome/140", "Mozilla/5.0 Chrome-Lighthouse", "", null]) assert(isBot(ua), "bot: " + ua);
  assert(!isBot("Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0 Safari/537.36"), "a normal browser counts");
  const post = (origin, ua, body) => new Request("http://localhost/api/count", { method: "POST", headers: { origin, "user-agent": ua }, body });
  const browser = "Mozilla/5.0 Chrome/140.0";
  assert.strictEqual((await count.POST(post("https://evil.example", browser, "{}"))).status, 403, "a count from another website is refused");
  assert.strictEqual((await count.POST(post("http://localhost", "HeadlessChrome", "{}"))).status, 204, "a bot is quietly ignored");
  assert.strictEqual((await count.POST(post("http://localhost", browser, "{\"device\":\"x\"}"))).status, 400, "a bad count is refused");

  // Stats: nobody signed in, or a signed-in student, gets no numbers.
  assert.strictEqual((await stats.GET(at(null))).status, 401, "stats need sign-in");
  assert.strictEqual((await stats.GET(at(signed))).status, 403, "stats refuse any account but the owner's");

  console.log("sync ok: same-website rule, 1 MB cap, progress shape, signed sessions only, routes refuse before the database, usage counter and stats rules");
})().catch((e) => { console.error(e); process.exit(1); });
