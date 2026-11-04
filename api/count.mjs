// POST: an anonymous browser reports "I visited today and answered this many questions since last time".
// Adds to that browser's row for today (Texas time). Stores no account, IP address or browser details.
import { db } from "./_lib.mjs";
import { isBot, json, readCount, sameOrigin } from "./_checks.mjs";

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: "Wrong website." }, 403);
  if (isBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });
  const body = readCount(await request.text());
  if (body.error) return json({ error: body.error }, body.status);
  const sql = await db();
  // shortcut: anyone can post made-up device ids and inflate the counts; add a rate limit if the numbers ever look off.
  await sql`insert into device_days (device, day, answered) values (${body.device}, (now() at time zone 'America/Chicago')::date, ${body.answered})
    on conflict (device, day) do update set answered = device_days.answered + excluded.answered`;
  return new Response(null, { status: 204 });
}
