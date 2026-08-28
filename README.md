# PetPassGo — how to get this live

This is your real, working project — the landing page and the assessment
quiz, wired together as an actual website instead of just a preview.

## Step 1 — Create the GitHub repository
1. Go to github.com, click the **+** in the top right → **New repository**
2. Name it `petpassgo`
3. Leave it **Public** or **Private** (either is fine) and don't check any of
   the "initialize with README" boxes
4. Click **Create repository** — GitHub will show you a page with some
   commands. Ignore those for now; we'll upload the files a simpler way below.

## Step 2 — Upload this project to GitHub
The easiest way with no command line:
1. On your new repo's page, click **"uploading an existing file"**
2. Drag in every file and folder from this project (keep the folder
   structure — `app/` needs to stay a folder, not get flattened)
3. Scroll down, click **Commit changes**

## Step 3 — Connect it to Vercel
1. Go to vercel.com, click **Add New → Project**
2. Find and import the `petpassgo` repository you just created
3. Leave all settings on default — Vercel automatically detects this is a
   Next.js project
4. Click **Deploy**

In about a minute, Vercel gives you a live URL (something like
`petpassgo.vercel.app`) where the real site is running.

## Step 4 — Point petpassgo.com at it
Once you confirm the Vercel URL looks right:
1. In your Vercel project, go to **Settings → Domains**
2. Add `petpassgo.com`
3. Vercel shows you 1-2 DNS records to add
4. Go to wherever you bought the domain, find DNS settings, add those
   records exactly as shown

This can take a few minutes up to a few hours to fully switch over — that's
normal DNS propagation, not an error.

## What's in this project right now
- `/` — the landing page
- `/assessment` — the trip quiz, ending in the (still placeholder/demo)
  personalized result screen

Nothing is connected to Supabase or Stripe yet — that's the next phase,
once this is live and you've seen it work as a real website.
