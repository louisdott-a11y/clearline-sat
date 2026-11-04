// Shared setup for the sync API: Auth.js (Google sign-in) and the Neon database.
// Every secret comes from Vercel environment variables; none live in the repo.
import { Auth } from "@auth/core";
import Google from "@auth/core/providers/google";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// The tables are created on first use, so setup needs no separate database step.
// users: who can sign in (the Google account id and email, nothing else). progress: one saved copy per user.
// Deleting a user deletes their progress too (on delete cascade).
// device_days: the anonymous usage count, one row per browser per day (a random id and questions answered, no account link).
let ready;
export function db() {
  ready ??= (async () => {
    await sql`create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      google_sub text unique not null,
      email text,
      created_at timestamptz not null default now())`;
    await sql`create table if not exists progress (
      user_id uuid primary key references users(id) on delete cascade,
      data jsonb not null,
      updated_at timestamptz not null default now())`;
    await sql`create table if not exists device_days (
      device uuid not null,
      day date not null,
      answered int not null default 0,
      primary key (device, day))`;
    return sql;
  })().catch((e) => { ready = null; throw e; });
  return ready;
}

export const authConfig = {
  // Only "openid email" is asked of Google, so names and photos are never received. prompt=select_account always
  // shows Google's account picker, so on a shared computer a student can choose their own account.
  providers: [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, authorization: { params: { scope: "openid email", prompt: "select_account" } } })],
  secret: process.env.AUTH_SECRET,
  basePath: "/api/auth",
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    // On sign-in, find or create the user row; the signed session cookie then holds only our id and the email.
    async jwt({ token, account, profile }) {
      if (account && profile?.sub) {
        const sql = await db();
        const [row] = await sql`insert into users (google_sub, email) values (${profile.sub}, ${profile.email ?? null})
          on conflict (google_sub) do update set email = excluded.email returning id`;
        return { uid: row.id, email: profile.email ?? null };
      }
      return token;
    },
    async session({ session, token }) {
      return { expires: session.expires, user: { id: token.uid, email: token.email } };
    }
  }
};

export const auth = (request) => Auth(request, authConfig);

// The signed-in user's id, read from their session cookie. Never taken from the request body or URL,
// so nobody can read or write someone else's progress.
export async function sessionUser(request) {
  const res = await auth(new Request(new URL("/api/auth/session", request.url), { headers: { cookie: request.headers.get("cookie") ?? "" } }));
  if (!res.ok) return null;
  const session = await res.json().catch(() => null);
  return session?.user?.id ? session.user : null;
}
export const userId = async (request) => (await sessionUser(request))?.id ?? null;

// A session cookie stays valid after its account is deleted on another device; treat that as signed out.
export async function accountExists(sql, uid) {
  const [row] = await sql`select 1 from users where id = ${uid}`;
  return Boolean(row);
}
