# Lucky Penny Kitties — Website Migration Brief

## Goal
Migrate luckypennykitties.org off Shopify onto a lightweight, free/low-cost static site host. The current Shopify plan is unnecessary — the site has no real product catalog or cart usage; it's a content site with donation links that already point to external processors (Zeffy, PayPal, Venmo, Giving Grid, Amazon Wishlist), plus an unused default Shopify "Products" collection.

## Organization context
- Lucky Penny Kitties, Inc. — 501(c)(3) foster-based cat rescue, Waverly, Iowa
- EIN: 99-0545247
- Founded by Tasha (site also credits Krista & Tasha on the products page)
- Contact: meow@luckypennykitties.org, (319) 559-4889
- Address: 421 4th Ave SW, Waverly, IA 50677
- No-kill, foster-home-based (not a shelter), started Dec 2023, 400+ cats placed by Dec 2025

## Current site structure (Shopify) to rebuild

1. **Home**
   - Rescue stats banner
   - Mission statement
   - Foster/Adopt CTAs → link out to Google Forms
   - Donate section → Zeffy, PayPal, Giving Grid, Venmo, Amazon Wishlist (all external, keep as links/embeds)
   - Merch link → external Printify store (keep as external link)
   - Surrender info: $25 mandatory surrender fee, foster-space-dependent, waitlist language, links to Surrender Form (Google Form) or email
   - Email signup (need replacement — see Open Decisions)

2. **Sponsors page** (`/pages/our-incredible-sponsors`)
   - ~10 sponsor logos/blurbs, including Amosson Chiropractic, Paws on Your Heart, Dr. Elsey's, others
   - SMS opt-in text block

3. **Community Involvement page** (`/pages/our-community-involvement`)
   - ~30 photo/story blocks: Girl Scouts, HyVee, Ivy Ink, Hydrite, Summer Bash event, volunteer spotlights, merch plug
   - Static content, low update frequency

4. **Adoptable Kitties page** (`/pages/adoptable-lpk-kitties`)
   - ~30 individual cat listings, photo + bio each
   - **Updates frequently** (cats added/removed as adopted) — do NOT hardcode; pull from Airtable (see below)

5. **Rehabilitation in Progress page** (`/pages/kitties-in-rehabilitation`)
   - Currently ~3 active cases, photo + progress update each
   - **Updates frequently** — pull from Airtable
   - Note: current live page has a leftover unfilled "Image banner" placeholder from the Shopify theme — don't carry that over

## Data layer: Airtable
Tasha is finishing an Airtable base to replace manual editing of the Adoptable Kitties and Rehabilitation pages. The new site should pull from this Airtable via API at build time or via client-side fetch, rather than hardcoding cat data into the site code.

- Confirm table names/fields once Airtable is finalized (likely: Name, Photo, Bio, Status [Adoptable/Rehab/Adopted], Intake Date, Rehab Notes)
- This is a separate base from the existing LPK Cat/Kitten and Fosters tracking base (`appt8rc652nDrekrL`) — confirm with Tasha whether it's the same base with a new table, or a new base entirely, before wiring up the API

## Tech stack decision
- **Hosting**: Vercel or Cloudflare Pages (free tier sufficient for this traffic level)
- **Site type**: Static site (Next.js or Astro) with Airtable API calls for the two dynamic pages
- **Domain**: luckypennykitties.org — stays on current registrar, just repoint DNS at cutover
- **No commerce backend needed** — no cart, no Shopify checkout to replace, since all donations/merch already route externally

## Migration steps
1. Build the site in Claude Code against this brief
2. Wire up Airtable API for Adoptable Kitties + Rehabilitation pages
3. Re-embed/re-link all existing external tools: Zeffy, PayPal, Venmo, Giving Grid, Amazon Wishlist, Printify store, Google Forms (foster/adopt/surrender)
4. Replace Shopify's built-in email signup with a free alternative (Zeffy has one built in, or Mailchimp free tier)
5. Deploy to a preview URL on Vercel/Cloudflare Pages
6. Get Tasha's sign-off on the preview
7. Point luckypennykitties.org DNS at the new host
8. Confirm everything resolves correctly, then cancel Shopify subscription

## Open decisions (resolve before or during build)
- Final Airtable base/table structure and field names
- Email signup replacement tool
- Whether Rehabilitation page's "progress update" format needs more fields than a standard adoptable-cat listing (it reads more like a story/update log than a static bio)
- Confirm sponsor logos/images will need to be re-uploaded (screenshot or re-request from sponsors if originals aren't available)

## Tooling note
This brief was prepared in Claude Chat. Site build should happen in Claude Code (Desktop app, Code tab) pointed at the local project folder, since it needs real file/git/deploy access that chat doesn't have.
