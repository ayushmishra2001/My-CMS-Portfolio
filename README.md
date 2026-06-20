# DevFolio CMS

A fully dynamic, CMS-powered developer portfolio built with Next.js 15, Supabase, and Tailwind CSS.

---

## Prerequisites

Before starting, install these in order:

### 1. Node.js (already installed)
Verify: `node -v` — should show v18 or higher.

### 2. Git (already installed)
Verify: `git --version`

### 3. Docker Desktop (REQUIRED for local Supabase)
- Download from: https://www.docker.com/products/docker-desktop/
- Install and launch it
- Wait for Docker to fully start (whale icon in system tray stops animating)
- Verify: `docker --version`

### 4. Supabase CLI
After Docker is running, open a terminal and run:
```bash
npm install -g supabase
```
Verify: `supabase --version`

---

## Local Setup (Step by Step)

### Step 1 — Clone / open the project
Open the project folder in Antigravity (or any terminal).

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Start local Supabase
Make sure Docker Desktop is running first, then:
```bash
npx supabase start
```

This will take 2–5 minutes the first time (downloads Docker images).
When it finishes, you will see output like this:

```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
anon key: eyJhbGciOi...  <-- COPY THIS
service_role key: eyJhbGciOi...
```

### Step 4 — Copy the anon key into .env.local
Open `.env.local` and replace `your-local-anon-key-here` with the `anon key` from the output above.

Your `.env.local` should look like:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5 — Run the database migration
```bash
npx supabase db reset
```

This creates all tables, sets up RLS policies, and seeds the default sections.

### Step 6 — Start the development server
```bash
npm run dev
```

Open your browser:
- **Portfolio**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **Supabase Studio**: http://127.0.0.1:54323
- **Email inbox** (for magic links): http://127.0.0.1:54324

### Step 7 — Sign in to admin
1. Go to http://localhost:3000/admin/login
2. Enter any email address (e.g. admin@test.com)
3. Click "Send magic link"
4. Open http://127.0.0.1:54324 (Inbucket)
5. Find the email and click the magic link
6. You are now logged into the admin panel

---

## Daily Development Workflow

Every time you start working:

```bash
# 1. Make sure Docker Desktop is running
# 2. Start Supabase (if not already running)
npx supabase start

# 3. Start Next.js
npm run dev
```

To stop everything:
```bash
# Stop Next.js: Ctrl+C in the terminal
# Stop Supabase:
npx supabase stop
```

---

## Project Structure

```
devfolio-cms/
├── supabase/
│   ├── config.toml                    # Supabase local config
│   └── migrations/
│       └── 20240101000000_initial_schema.sql  # Full schema
│
├── src/
│   ├── app/
│   │   ├── (admin)/                   # Admin panel routes (protected)
│   │   │   ├── layout.tsx             # Admin layout with sidebar
│   │   │   ├── login/page.tsx         # Magic link login
│   │   │   ├── dashboard/page.tsx     # Stats overview
│   │   │   ├── sections/page.tsx      # Reorder & toggle sections
│   │   │   ├── projects/page.tsx      # Projects CRUD
│   │   │   ├── skills/page.tsx        # Skills CRUD
│   │   │   ├── experience/page.tsx    # Experience CRUD
│   │   │   ├── education/page.tsx     # Education CRUD
│   │   │   ├── certifications/page.tsx
│   │   │   ├── testimonials/page.tsx
│   │   │   ├── contact-settings/page.tsx  # View messages
│   │   │   └── settings/
│   │   │       ├── general/page.tsx   # Site-wide settings
│   │   │       └── customizer/page.tsx # Per-section style editor
│   │   │
│   │   ├── (portfolio)/               # Public portfolio routes
│   │   │   ├── layout.tsx             # Navbar + footer
│   │   │   └── page.tsx               # Main portfolio page
│   │   │
│   │   └── layout.tsx                 # Root layout
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── layout/               # Sidebar, header
│   │   │   └── ui/                   # DataTable, ConfirmDelete, TagInput
│   │   ├── portfolio/
│   │   │   ├── sections/             # One component per section type
│   │   │   ├── shared/               # Nav, footer, section wrapper
│   │   │   └── section-renderer.tsx  # Routes type → component
│   │   └── shared/                   # Button, inputs, cards, badges
│   │
│   ├── lib/
│   │   ├── supabase/                 # client.ts + server.ts
│   │   ├── types/index.ts            # All TypeScript types
│   │   └── utils/index.ts            # Helpers (cn, formatDate, etc.)
│   │
│   ├── middleware.ts                  # Auth protection for /admin/*
│   └── styles/globals.css            # Tailwind + CSS variables
```

---

## Deploying Online (Free)

### Step 1 — Create a Supabase cloud project
1. Go to https://supabase.com → New Project
2. Choose a region close to you
3. Save the database password somewhere safe

### Step 2 — Push your schema to the cloud
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```
Find `YOUR_PROJECT_REF` in: Supabase dashboard → Project Settings → General

### Step 3 — Get your cloud credentials
In Supabase dashboard → Project Settings → API:
- Copy `Project URL`
- Copy `anon public` key

### Step 4 — Push code to GitHub
```bash
git init
git add .
git commit -m "initial commit"
```
Create a repo at github.com and follow the push instructions.

### Step 5 — Deploy to Vercel
1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your cloud Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your cloud anon key
   - `NEXT_PUBLIC_APP_URL` = https://your-vercel-url.vercel.app
4. Click Deploy

Your portfolio is now live at `your-project.vercel.app`.

---

## Useful Commands

```bash
# Reset local database (re-runs all migrations + seeds)
npx supabase db reset

# Open Supabase Studio (visual DB browser)
# Just open http://127.0.0.1:54323 in your browser

# Regenerate TypeScript types from schema
npm run supabase:types

# Check Supabase status
npx supabase status
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `supabase start` fails | Make sure Docker Desktop is open and running |
| `anon key` not working | Re-run `npx supabase start` and copy the key again |
| Admin page shows blank | Check `.env.local` has the correct URL and key |
| Magic link not arriving | Open http://127.0.0.1:54324 — it goes to Inbucket locally |
| Port 54321 already in use | Run `npx supabase stop` then `npx supabase start` again |
| Changes not showing on portfolio | Wait 60 seconds (ISR interval) or restart `npm run dev` |
