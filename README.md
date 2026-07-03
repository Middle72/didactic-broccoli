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

Data comes from the **Lucky Penny Kitties** base (`apprSgTHj4HbR7IFB`), **Cats** table (`tbl7FbKhHAu7SgIyj`). You need a Personal Access Token from [airtable.com/create/tokens](https://airtable.com/create/tokens) with `data.records:read` scope on that base, set as `AIRTABLE_TOKEN` in `.env`.

Status field mapping (current best-effort, since the table wasn't built with public bio/rehab fields — see "Known gaps" below):

- **Adoptable Kitties page**: Status = `Available`, `Pending`, or `In Foster`
- **Rehabilitation page**: Status = `Medical Hold`
- Bio/progress text is pulled from the `Medical Notes` field as a placeholder.

## Known gaps / follow-ups from PROJECT_BRIEF.md

- **Airtable fields**: the Cats table has no public-facing "Bio" or rehab progress-log field. Once Tasha adds one, update `src/lib/airtable.ts` to read it instead of `Medical Notes`.
- **Sponsors**: only 3 of ~10 sponsors have confirmed names/blurbs/logos (`src/data/sponsors.ts`). The rest need names and re-uploaded logo images from Tasha.
- **Community stories**: 10 of ~30 stories captured (`src/data/community.ts`) — the live Shopify page likely has more further down that weren't scraped.
- **Email signup**: currently links out to the Zeffy donation form as a stand-in "subscribe" action — confirm whether Zeffy has a dedicated signup form to link instead.
- **Deploy**: not yet deployed. Push to GitHub, connect the repo on Vercel, set the `AIRTABLE_*` env vars in the Vercel project settings, get Tasha's sign-off on the preview URL, then repoint DNS.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the production build locally          |
| `npx astro check`   | Type-check the project                        |
