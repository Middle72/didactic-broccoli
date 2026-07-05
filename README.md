# Lucky Penny Kitties — Website

Astro + Tailwind site for [luckypennykitties.org](https://luckypennykitties.org), replacing the Shopify site. See [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) for full background.

## Project structure

- `src/pages/index.astro` — Home (mission, stats, donate/foster/adopt/surrender CTAs)
- `src/pages/sponsors.astro` — Sponsors (static content in `src/data/sponsors.ts`)
- `src/pages/community.astro` — Community Involvement (static content in `src/data/community.ts`)
- `src/pages/adoptable.astro` — Adoptable Kitties (live Airtable data, server-rendered per request)
- `src/pages/rehabilitation.astro` — Rehabilitation in Progress (live Airtable data, server-rendered per request)
- `src/lib/airtable.ts` — Airtable REST API client
- `src/data/links.ts` — external link URLs (Zeffy, PayPal, Venmo, Giving Grid, Amazon Wishlist, Printify, Google Forms)

Home/Sponsors/Community are static-prerendered for speed. Adoptable/Rehabilitation opt out of prerendering (`export const prerender = false`) so cat data is always fresh without needing a rebuild — the Airtable token stays server-side.

## Setup

```sh
npm install
cp .env.example .env   # then fill in AIRTABLE_TOKEN
npm run dev
```

### Airtable

Data comes from the **Lucky Penny Kitties** base (`apprSgTHj4HbR7IFB`), **Cats** table (`tbl7FbKhHAu7SgIyj`) — these IDs are hardcoded in `src/lib/airtable.ts` since they aren't sensitive. You need a Personal Access Token from [airtable.com/create/tokens](https://airtable.com/create/tokens) with `data.records:read` scope on that base, set as `AIRTABLE_TOKEN` in `.env` locally.

`AIRTABLE_TOKEN` is declared as a `secret` in `astro.config.mjs`'s `env.schema` and read via `getSecret()` from `astro:env/server` (not `import.meta.env`) — this is required for the value to come from Cloudflare's runtime bindings rather than being baked in at build time.

Status field mapping (current best-effort, since the table wasn't built with public bio/rehab fields — see "Known gaps" below):

- **Adoptable Kitties page**: Status = `Available`, `Pending`, or `In Foster`
- **Rehabilitation page**: Status = `Medical Hold`
- Bio/progress text is pulled from the `Medical Notes` field as a placeholder.

## Known gaps / follow-ups from PROJECT_BRIEF.md

- **Airtable fields**: the Cats table has no public-facing "Bio" or rehab progress-log field. Once Tasha adds one, update `src/lib/airtable.ts` to read it instead of `Medical Notes`.
- **Sponsors**: only 3 of ~10 sponsors have confirmed names/blurbs/logos (`src/data/sponsors.ts`). The rest need names and re-uploaded logo images from Tasha.
- **Community stories**: 10 of ~30 stories captured (`src/data/community.ts`) — the live Shopify page likely has more further down that weren't scraped.
- **Email signup**: currently links out to the Zeffy donation form as a stand-in "subscribe" action — confirm whether Zeffy has a dedicated signup form to link instead.
- Once the preview looks good, get Tasha's sign-off before the custom domain goes live to visitors.

## Deployment

Hosted on **Cloudflare Workers** (Workers Builds), connected to this GitHub repo — see `wrangler.jsonc` for the Worker name and custom domain routes. Build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` triggers a new build + deploy automatically.

Set the `AIRTABLE_TOKEN` secret under the Worker's **Settings → Variables and secrets** in the Cloudflare dashboard (type: Secret) — without it, the Adoptable/Rehabilitation pages just show an empty state.

### bobbykelly.us forwarding

This Worker also answers on `bobbykelly.us`/`www.bobbykelly.us` (added as a second pair of custom domains), but only to redirect: `src/middleware.ts` checks the request's `Host` header and, for `luckypennykitties.com`/`www.luckypennykitties.com` only, serves a self-contained "we've moved" page with a 7-second countdown (meta-refresh + JS fallback) to the matching path on `luckypennykitties.org`. Requests to `bobbykelly.us` pass through untouched and get the normal site.

All pages are rendered on-demand (`export const prerender = false`) rather than prerendered to static HTML — this is required so the middleware's Host check runs for every route, including the home page and other previously-static pages, instead of being bypassed by Cloudflare's static asset serving. `wrangler.jsonc` also sets `assets.run_worker_first: true` so every request hits the Worker (and therefore the middleware) before any static-asset shortcut.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |
| `npx astro check`   | Type-check the project                        |
