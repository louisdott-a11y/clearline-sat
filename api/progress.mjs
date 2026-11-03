// GET: your saved progress. PUT: save it. Only ever for the signed-in user (see userId in _lib.mjs).
import { db, userId } from "./_lib.mjs";
import { json, readProgress, sameOrigin } from "./_checks.mjs";

export async function GET(request) {
  const uid = await userId(request);
  if (!uid) return json({ error: "Not signed in." }, 401);
  const sql = await db();
  const [row] = await sql`select data from progress where user_id = ${uid}`;
  return json({ progress: row?.data ?? null });
}

export async function PUT(request) {
  if (!sameOrigin(request)) return json({ error: "Wrong website." }, 403);
  const uid = await userId(request);
  if (!uid) return json({ error: "Not signed in." }, 401);
  const body = readProgress(await request.text());
  if (body.error) return json({ error: body.error }, body.status);
  const sql = await db();
  await sql`insert into progress (user_id, data, updated_at) values (${uid}, ${JSON.stringify(body.progress)}::jsonb, now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now()`;
  return json({ ok: true });
}
