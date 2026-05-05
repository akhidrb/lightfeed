# ✦ LightFeed

> Short reminders. Lasting benefit.

LightFeed is a mindful short-form video app for Islamic reminders, nature/science documentaries, and uplifting content. Unlike endless scroll platforms, it nudges you to pause and reflect after a few videos — and lets you save and journal what moves you.

---

## Features

- **Curated feed** — vertical scroll of short videos from the Qur'an, Sunnah, trusted scholars, science, and positive news
- **Session limits** — after a set number of videos, the app gently asks you to step away and reflect
- **Save & reflect** — bookmark videos and write personal reflections on what you want to act on
- **AI curation pipeline** — a CLI script searches YouTube, then uses Claude to filter and approve only beneficial content before it hits the database
- **Auth** — optional Supabase-backed sign-in; the feed is readable without an account
- **Admin panel** — upload and manage videos directly from the app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| Database + Auth | Supabase (Postgres + Row Level Security) |
| AI curation | Anthropic Claude (`claude-sonnet-4-6`) |
| Curation script | TypeScript via `tsx` |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/akhidrb/lightfeed
cd lightfeed
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# App (exposed to browser via Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Curation script only (never sent to browser)
YOUTUBE_API_KEY=your_youtube_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Run the dev server

```bash
npm run dev
```

---

## Curating Content

The curation script searches YouTube, fetches exact durations, and filters results through Claude before inserting approved videos into Supabase.

```bash
# Curate Quran reminders (English + Arabic)
npm run curate -- --category quran

# Curate from a specific scholar
npm run curate -- --scholar "Nouman Ali Khan" --category spiritual

# Arabic only, hadith category, limit 15 videos
npm run curate -- --category hadith --lang ar --count 15

# Dry run — preview without inserting
npm run curate -- --category growth --dry-run

# Skip Claude approval and insert everything
npm run curate -- --category science --approve-all
```

**Available categories:** `quran` · `hadith` · `spiritual` · `discipline` · `family` · `income` · `growth` · `prophets` · `science` · `news` · `all`

**Flags:**

| Flag | Description |
|---|---|
| `--category` | Category to curate (default: `quran`) |
| `--scholar` | Specific scholar name or Arabic name |
| `--lang` | `en`, `ar`, or `both` (default: `both`) |
| `--count` | Max videos to insert (default: 20) |
| `--dry-run` | Print results without writing to database |
| `--approve-all` | Skip Claude review and insert all YouTube results |

---

## Project Structure

```
src/
  pages/          # Feed, Saved, Reflections, Auth, Admin, Profile, Welcome, SessionDone
  components/     # VideoCard, BottomNav, ReflectionModal, TopicFilter
  context/        # AuthContext, AppContext (session state)
  services/       # videoService (Supabase), storageService (localStorage)
  data/           # Static video/category types
  lib/            # Supabase client
scripts/
  curate.ts       # AI-powered curation CLI
supabase/
  schema.sql      # Database schema and RLS policies
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run curate` | Run the AI curation pipeline |
