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

