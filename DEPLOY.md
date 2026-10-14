# Deploying Clearline to Cloudflare Pages

Clearline is a static site: `index.html` plus `assets/`. No server, no database, no build tools.
`build.sh` copies just those files (and `_headers`) into `dist/`, so `research/`, `tests/` and screenshots never go online.

## Before the first deploy (10 minutes)

1. **Get your own Desmos key.** The key in the code is Desmos's public demo key.
   - Go to https://www.desmos.com/api and fill in the API key request form (it's free for education sites). Desmos emails you a key.
   - Open `assets/config.js` and paste your key between the quotes on the `DESMOS_API_KEY` line.
   - Commit: `git commit -am "Use my Desmos API key"`
2. **Check the site address in the share tags.** `index.html` assumes the site will live at `https://clearline-sat.pages.dev/`.
   If you pick a different Pages project name or use your own domain, change the three URLs under the
   "Social share tags" comment near the top of `index.html` (`og:url`, `og:image`, `twitter:image`).

## Option A: deploy from GitHub (updates itself on every push)

1. Put the repo on GitHub (this repo has no remote yet):
   - Create an empty **private or public** repo on github.com named `clearline-sat` (no README).
   - In this folder run:
     ```
     git remote add origin https://github.com/YOUR-USERNAME/clearline-sat.git
     git push -u origin main
     ```
2. Sign in at https://dash.cloudflare.com (a free account is enough).
3. Go to **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**.
4. Authorize GitHub, pick the `clearline-sat` repo, then **Begin setup**.
5. Fill in:
   - Project name: `clearline-sat` (this gives you `clearline-sat.pages.dev`)
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `sh build.sh`
   - Build output directory: `dist`
6. Click **Save and Deploy**. After about a minute the site is live at `https://clearline-sat.pages.dev`.

Every later `git push` to `main` redeploys automatically.

## Option B: upload from your computer (no GitHub)

Needs Node.js installed.
```
npx wrangler login                     # opens a browser to sign in to Cloudflare
sh build.sh
npx wrangler pages deploy dist --project-name clearline-sat
```
The first run asks to create the project; say yes and pick `main` as the production branch.
Run the last two lines again whenever you want to publish changes.

## After it's live: a 2-minute check

- Open the site on your laptop and your phone.
- Open the Calculator: it should be the Desmos graphing calculator. If you see "Desmos couldn't load", the key in `assets/config.js` is wrong or not yet approved.
- There should be no "Ask Gem" button and no "flag a problem" link. Those only work inside Claude; on the website they're hidden on purpose.
- Paste the site link into a chat app: the preview should show the green map card (`assets/og.png`).
  If it doesn't, re-check step 2 above.

## Optional: your own domain

In the Pages project: **Custom domains** → **Set up a custom domain** → follow the DNS steps.
Then update the three share-tag URLs in `index.html` to the new domain and deploy again.

## Good to know

- Student progress is saved in each student's own browser (localStorage). Clearing browser data erases it;
  the backup code on **Analytics & scores** moves it between devices.
- The teacher report is a file the student downloads and sends. Nothing is uploaded anywhere.
- `_headers` sets basic security headers and keeps script caching to 5 minutes, so fixes show up quickly.
