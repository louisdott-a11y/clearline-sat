// GET: usage totals for the private /stats page. Only the owner's Google account gets numbers; everyone else is refused.
import { db, sessionUser } from "./_lib.mjs";
import { json } from "./_checks.mjs";

const OWNER = "astrrro999@gmail.com";

export async function GET(request) {
  const user = await sessionUser(request);
  if (!user) return json({ error: "Not signed in." }, 401);
  if (String(user.email).toLowerCase() !== OWNER) return json({ error: "Not allowed." }, 403);
  const sql = await db();
  const [totals] = await sql`with t as (select (now() at time zone 'America/Chicago')::date as today)
    select (select count(*) from users)::int as accounts,
      (select count(*) from users where created_at > now() - interval '7 days')::int as new_accounts,
      (select count(distinct device) from device_days, t where day > today - 7)::int as weekly_devices,
      (select coalesce(sum(answered), 0) from device_days, t where day > today - 7)::int as weekly_answered,
      (select coalesce(sum(answered), 0) from device_days)::int as all_answered`;
  const days = await sql`select day::text, count(*)::int as devices, sum(answered)::int as answered from device_days
    where day > (now() at time zone 'America/Chicago')::date - 14 group by day order by day desc`;
  return json({ ...totals, days });
}
