// Request rules for the sync API, kept free of libraries so tests/sync.test.js can check them directly.
// Files in api/ that start with "_" are helpers, not web addresses.

export const MAX_BYTES = 1_000_000;

// Changes (save, delete) must come from this site itself. Browsers always send Origin on these requests,
// so a missing or different Origin means another website or a script is trying it.
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  return Boolean(origin) && origin === new URL(request.url).origin;
}

// Returns { progress } for a valid save body, or { status, error } explaining why it was refused.
export function readProgress(text) {
  if (typeof text !== "string" || !text) return { status: 400, error: "Empty save." };
  if (new TextEncoder().encode(text).length > MAX_BYTES) return { status: 413, error: "Progress is too big to sync." };
  let data;
  try { data = JSON.parse(text); } catch { return { status: 400, error: "Not valid JSON." }; }
  const isObj = (x) => Boolean(x) && typeof x === "object" && !Array.isArray(x);
  if (!isObj(data) || !isObj(data.attempts)) return { status: 400, error: "Not Clearline progress." };
  return { progress: data };
}

// Crawlers, link previews and automated browsers (Playwright, Puppeteer, Lighthouse) aren't students, so they aren't counted.
// index.html checks the same words before counting starts; this is the server's own copy of that rule.
export const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|playwright|puppeteer|phantom|selenium/i;
export const isBot = (ua) => !ua || BOT_UA.test(ua);

// Returns { device, answered } for a valid usage count, or { status, error }. The device is the random id the browser
// made for itself; answered is how many questions it answered since its last report (capped, so one report can't skew totals).
export function readCount(text) {
  if (typeof text !== "string" || !text || text.length > 200) return { status: 400, error: "Bad count." };
  let data;
  try { data = JSON.parse(text); } catch { return { status: 400, error: "Bad count." }; }
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(data?.device) && Number.isInteger(data.answered) && data.answered >= 0 && data.answered <= 200;
  return ok ? { device: data.device, answered: data.answered } : { status: 400, error: "Bad count." };
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// Vercel sends every /api/auth/... address to api/authjs.mjs (see vercel.json) with the original path in ?authpath=,
// because file names can't catch multi-part paths like /api/auth/callback/google in a plain project.
// This puts the original address back before Auth.js reads it.
export async function restoreAuthRequest(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("authpath");
  if (path == null) return request;
  url.searchParams.delete("authpath");
  url.pathname = "/api/auth/" + path.replace(/^\/+/, "");
  const hasBody = !["GET", "HEAD"].includes(request.method);
  return new Request(url, { method: request.method, headers: request.headers, body: hasBody ? await request.text() : undefined });
}

