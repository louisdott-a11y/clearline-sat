// DELETE: removes the signed-in user's account. Their synced progress goes with it (on delete cascade).
// The browser then signs out; progress saved in that browser stays until the student clears it.
import { db, userId } from "./_lib.mjs";
import { json, sameOrigin } from "./_checks.mjs";

export async function DELETE(request) {
  if (!sameOrigin(request)) return json({ error: "Wrong website." }, 403);
  const uid = await userId(request);
  if (!uid) return json({ error: "Not signed in." }, 401);
  const sql = await db();
  const gone = await sql`delete from users where id = ${uid} returning id`;
  return json({ deleted: gone.length === 1 });
}
