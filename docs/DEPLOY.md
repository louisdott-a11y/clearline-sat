# Deploying Clearline to Vercel

Clearline is a static site: `index.html`, `404.html` and `assets/`. No server, no database, no build tools.
`build.sh` copies just those files into `dist/`, so `docs/`, `tests/` and the design notes never go online. It also adds the commit hash to each script tag (`?v=…`), so a new deploy isn't hidden behind a cached copy.
`vercel.json` tells Vercel to run `build.sh`, publish `dist/`, and add security headers plus a short cache on scripts.

## Before the first deploy

1. **Get your own Desmos key.** The key in the code is Desmos's public demo key.
   - Go to https://www.desmos.com/api and request an API key.
   - Paste it between the quotes on the `DESMOS_API_KEY` line in `assets/config.js` and commit.
2. **Check the site address in the share tags.** `index.html` assumes `https://clearlinesat.com/`.
   If the address changes, update the three URLs under the "Social share tags" comment near the top of `index.html`, and `HOME` in `bridge/index.html`.

## Create the Vercel project (one time)

1. Sign in at https://vercel.com.
2. **Add New** → **Project**. Make sure this is a brand new project, not inside any existing one.
3. Import the GitHub repo `louisdott-a11y/clearline-sat`.
4. Project name: `clearline-sat` (this gives `clearline-sat.vercel.app`). Framework preset: **Other**. Leave build settings alone; `vercel.json` sets them.
5. **Deploy**. Every later `git push` to `main` redeploys automatically.

## The domain (clearlinesat.com)

Bought on Cloudflare Registrar. In Vercel (project **Settings** → **Domains**), `clearlinesat.com` serves the site and `www.clearlinesat.com` permanently redirects (308) to it. In Cloudflare **DNS** for the domain, two CNAME records point `@` and `www` at the target Vercel shows, both set to **DNS only** (gray cloud) so Vercel can issue the HTTPS certificate.

## The old addresses (clearline-sat.pages.dev and clearline-sat.vercel.app)

`*.pages.dev` addresses belong to Cloudflare and can't be pointed at Vercel. Instead, the Cloudflare Pages project stays connected to the same repo and keeps building on every push, but `build.sh` notices it is running on Cloudflare (`CF_PAGES` is set) and builds only `bridge/index.html`.

That bridge page matters because browsers keep saved progress per address. It reads the student's progress, packs it into the link, and hands it on. pages.dev sends students to `clearline-sat.vercel.app/bridge.html`, which adds any progress saved at that address and sends everything to `clearlinesat.com/#import=…`, where `app.js` checks it and merges it in. Visitors who open `clearline-sat.vercel.app` directly are sent to the same bridge by a small script at the top of `index.html`. If the progress is too big for a link, the bridge offers it as a backup file instead.

Never remove `clearline-sat.vercel.app` from the project, and keep the Cloudflare project running for several months, so returning students get carried over. Don't delete it.

## Visit counter

The Cloudflare Web Analytics script in `index.html` works on any host. In the Cloudflare dashboard, open **Analytics & Logs** → **Web Analytics** and set the site's hostname to `clearlinesat.com` so visits keep being counted.

## After it's live: a 2-minute check

- Open the site on your laptop and your phone.
- Open the Calculator: it should be Desmos. "Desmos couldn't load" means the key is wrong or not approved yet.
- No "Ask Gem" button and no "flag a problem" link (those only work inside Claude).
- Visit `clearlinesat.com/some-made-up-page`: the "This trail doesn't exist" page should show.
- Visit `clearline-sat.pages.dev` and `clearline-sat.vercel.app` in a browser where you have used Clearline: you should land on clearlinesat.com with your progress and a "Your progress moved over" message.
- Visit `www.clearlinesat.com`: it should switch to `clearlinesat.com`.
- Paste the site link into a chat app: the preview should show the green map card (`assets/og.png`).

## Account sync (optional Google sign-in)

Four environment variables in Vercel (project **Settings** → **Environment Variables**, Production and Preview). They never go in the repo or in chat:
- `DATABASE_URL`: the connection string of the Neon project `clearline-sat` (its own project, never shared with another app).
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`: from a Google Cloud OAuth client (Web application) with redirect URI `https://clearlinesat.com/api/auth/callback/google`.
- `AUTH_SECRET`: a random value from `openssl rand -base64 32`.

The `users` and `progress` tables create themselves on first use. To check what's stored, open the Neon project's Tables view.

