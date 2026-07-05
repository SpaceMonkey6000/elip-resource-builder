# elip resources — lead-gated resource site

A minimal, static site of **free career resources** (Software Engineer · Product Manager · Consultant · Analyst) with an **info-gate** that captures every visitor into **Supabase** before unlocking the content. Built to be dropped as links into role-specific WhatsApp communities.

## What's here

```
site/
├── index.html          # home / landing (data-source="general")
├── resume.html         # universal ATS + XYZ resume playbook
├── swe.html            # Software Engineer track (data-source="swe")
├── pm.html             # Product Manager track (data-source="pm")
├── consulting.html     # Consultant track (data-source="consulting")
├── analyst.html        # Analyst track (data-source="analyst")
├── schema.sql          # Supabase table + row-level-security policy
└── assets/
    ├── styles.css      # design system + gate styles
    ├── config.js       # ← YOUR keys + WhatsApp links go here
    ├── gate.js         # the access gate (Supabase insert + unlock)
    └── app.js          # nav, scroll reveals, link resolution
```

## Setup (≈5 minutes)

### 1. Create the Supabase backend
1. Make a free project at <https://supabase.com>.
2. Open **SQL Editor → New query**, paste the contents of `schema.sql`, and **Run**. This creates the `leads` table and a row-level-security policy that lets anonymous visitors *insert* (but never *read*) leads.

### 2. Add your keys
In Supabase go to **Settings → API** and copy your **Project URL** and **anon public key**. Paste them into `assets/config.js`:

```js
SUPABASE_URL:      'https://xxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGci...'
```
> The anon key is meant to be public — RLS only permits inserts, so your lead list stays private.

### 3. Add your WhatsApp community link(s)
Still in `assets/config.js`:
```js
WHATSAPP_COMMUNITY_URL: 'https://chat.whatsapp.com/YOUR_INVITE_CODE',
// optional: a different group per track
WHATSAPP_LINKS: { swe: '', pm: '', consulting: '', analyst: '' }
```
Leave a per-track value blank to fall back to the default. Every "Join community" button and the gate link resolve from here automatically.

## How the gate works
- All content is freely browsable. The gate only fires when a visitor tries to open a curated **outbound resource link** (`<a class="res">`).
- First such click → a full-screen form (name, WhatsApp number, email, target role) over blurred content.
- The **target role is pre-selected** from the page's `data-source`, and the lead is tagged with `source_page` so you can see which community each person came from.
- On submit → row inserted into Supabase → `localStorage['elip_access']` set → **every** resource link unlocks on that device (once per visitor).
- **Bypass-proof:** while a visitor is un-gated, each resource's real URL is held in `data-gate-href` and the visible `href` is neutralised, so middle-click, ⌘/Ctrl-click and "Open in new tab" can't skip the form either. Real hrefs are restored the moment they convert.
- **Before you add keys**, the gate still works: leads are queued into `localStorage['elip_leads_queue']` so nothing is lost during setup. A console warning reminds you to configure Supabase.

## Resource logos
Each resource card shows the destination's real brand logo. These are pre-fetched into `assets/logos/<host>.png` (keyed by domain) and injected by `app.js`; any card whose logo is missing falls back to its original emoji/SVG icon. To add a logo for a new link, drop a `<host>.png` in that folder.

## Sharing into communities
Drop the relevant page link into each group:
- SWE group → `.../swe.html`
- PM group → `.../pm.html`
- Consulting group → `.../consulting.html`
- Analyst group → `.../analyst.html`
- General / cross-post → `.../index.html`

Each captures its own `source_page`, so your Supabase `leads` table shows exactly which community drives sign-ups.

## Run locally
Any static server works, e.g.:
```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## View your leads
Supabase → **Table Editor → leads**. Filter by `source_page` or `role` to segment by community.

## Deploy
It's fully static — host on Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any bucket. No build step. Just make sure `assets/config.js` has your real keys.
