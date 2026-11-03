// Every Auth.js address (/api/auth/signin/google, /api/auth/callback/google, /api/auth/session, ...) arrives here
// through the rewrite in vercel.json; restoreAuthRequest puts the original address back first.
import { auth } from "./_lib.mjs";
import { restoreAuthRequest } from "./_checks.mjs";

const handle = async (request) => auth(await restoreAuthRequest(request));
export const GET = handle;
export const POST = handle;
