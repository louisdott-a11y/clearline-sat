# Deploying Clearline to Vercel

Clearline is a static site: `index.html`, `404.html` and `assets/`. No server, no database, no build tools.
`build.sh` copies just those files into `dist/`, so `docs/`, `tests/` and the design notes never go online. It also adds the commit hash to each script tag (`?v=…`), so a new deploy isn't hidden behind a cached copy.
`vercel.json` tells Vercel to run `build.sh`, publish `dist/`, and add security headers plus a short cache on scripts.

## Before the first deploy

1. **Get your own Desmos key.** The key in the code is Desmos's public demo key.
   - Go to https://www.desmos.com/api and request an API key.
   - Paste it between the quotes on the `DESMOS_API_KEY` line in `assets/config.js` and commit.
2. **Check the site address in the share tags.** `index.html` assumes `https://clearline-sat.vercel.app/`.
   If Vercel gives the project a different address, change the three URLs under the "Social share tags" comment near the top of `index.html`, and the `NEW` address in `bridge/index.html`.

## Create the Vercel project (one time)

1. Sign in at https://vercel.com.
2. **Add New** → **Project**. Make sure this is a brand new project, not inside any existing one.
3. Import the GitHub repo `louisdott-a11y/clearline-sat`.
4. Project name: `clearline-sat` (this gives `clearline-sat.vercel.app`). Framework preset: **Other**. Leave build settings alone; `vercel.json` sets them.
5. **Deploy**. Every later `git push` to `main` redeploys automatically.

## The old address (clearline-sat.pages.dev)

`*.pages.dev` addresses belong to Cloudflare and can't be pointed at Vercel. Instead, the Cloudflare Pages project stays connected to the same repo and keeps building on every push, but `build.sh` notices it is running on Cloudflare (`CF_PAGES` is set) and builds only `bridge/index.html`.

That bridge page matters because browsers keep saved progress per address. It reads the student's progress, packs it into the link, and sends them to `clearline-sat.vercel.app/#import=…`, where `app.js` checks it and merges it in. If the progress is too big for a link, the bridge offers it as a backup file instead.

Keep the Cloudflare project running for several months so returning students get carried over. Don't delete it.

## Visit counter

The Cloudflare Web Analytics script in `index.html` works on any host. In the Cloudflare dashboard, open **Analytics & Logs** → **Web Analytics** and add `clearline-sat.vercel.app` as a site hostname so visits keep being counted.

## After it's live: a 2-minute check

- Open the site on your laptop and your phone.
- Open the Calculator: it should be Desmos. "Desmos couldn't load" means the key is wrong or not approved yet.
- No "Ask Gem" button and no "flag a problem" link (those only work inside Claude).
- Visit `clearline-sat.vercel.app/some-made-up-page`: the "This trail doesn't exist" page should show.
- Visit `clearline-sat.pages.dev` in a browser where you have used Clearline: you should land on the Vercel address with your progress and a "Your progress moved over" message.
- Paste the site link into a chat app: the preview should show the green map card (`assets/og.png`).
