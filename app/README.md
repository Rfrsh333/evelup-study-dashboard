# LevelUp - Study Performance Dashboard

[![CI](https://github.com/Rfrsh333/evelup-study-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Rfrsh333/evelup-study-dashboard/actions/workflows/ci.yml)

> Zie je studie-momentum. Bouw discipline. Haal je deadlines.

A retention-focused SaaS for HBO students in the Netherlands. Track daily objectives, build study momentum, and level up your academic performance.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **Backend:** Supabase (Auth + Postgres + RLS)
- **Hosting:** Ready for Vercel/Railway
- **Analytics:** Event tracking built-in

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Create project at [supabase.com](https://supabase.com) (EU region)
2. Run `supabase-schema.sql` in the Supabase **SQL Editor**
3. Copy `.env.example` to `.env.local`
4. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run `supabase-schema.sql` in the Supabase SQL Editor to create `public.user_state` and related tables.

### Push Notifications (PWA)
1. Generate VAPID keys (server-side only).
2. Add the public key to `.env.local`:
```env
VITE_VAPID_PUBLIC_KEY=your_public_vapid_key
```
3. Deploy the Edge Function in `supabase/functions/send-daily-reminders`.
4. Add secrets to the function:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
5. Schedule the function (Supabase cron or external cron).

### Integrations
- Canvas OAuth: use a server-side callback (Edge Function) to keep the client secret off the frontend.
- Calendar: import `.ics` files to sync deadlines.
- LTI 1.3: see `LTI_SETUP.md` (requires school admin install).

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Features

### Daily Objectives (Retention Engine)
- Auto-generated daily goals (2 focus sessions, 45 min study, 1 deadline review)
- Auto-tracking for focus & study progress
- Bonus +25 XP when all objectives completed
- Momentum mode system (Recovery/Stable/Performance)

### Momentum Tracking
- Multi-factor scoring (0-100)
  - 40% Consistency (study days)
  - 30% Deadline Control (on-track %)
  - 20% Focus Score (weekly sessions)
  - 10% Streak Bonus
- Weekly trend comparison
- Visual breakdown of components

### XP & Leveling
- Progressive XP scaling (15% increase per level)
- Dynamic level titles (Beginner → Legend)
- Level-up animations
- XP multipliers based on momentum mode

### Study Features
- Deadline tracking with status badges
- Study log history (7-day chart)
- Focus session counter
- Streak tracking

### Analytics
- Event tracking for all user actions
- Cohort analysis ready
- Privacy-first (user-scoped, GDPR-compliant)

## Architecture

### Domain Logic (Pure Functions)
- `src/domain/xp.ts` - Level calculations
- `src/domain/momentum.ts` - Momentum scoring
- `src/domain/streak.ts` - Streak tracking
- `src/domain/daily-objectives.ts` - Daily goals engine

### State Management
- React Context with optimistic updates
- Supabase sync (500ms debounce)
- localStorage fallback for offline mode

### Database Schema
- `users` - User profiles with language preferences
- `user_state` - JSONB state storage
- `events` - Analytics event log

All tables have Row Level Security enabled.

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo
2. Add environment variables
3. Deploy
4. Done

### Railway
1. Create new project
2. Add Postgres (or use Supabase)
3. Set environment variables
4. Deploy from GitHub

## Development

### Running Tests Locally

```bash
# Run unit tests (Vitest)
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run Cypress E2E tests (interactive)
npm run cypress:open

# Run Cypress E2E tests (headless)
npm run cypress:run
```

**CI Pipeline:**
- Quality checks (lint + unit tests) run on every PR and push to main
- Build verification runs in parallel
- E2E tests (4 parallel shards) run only on PR and main branch pushes
- See [Branch Protection Guide](../docs/BRANCH_PROTECTION.md) for setting up required checks

### Seed Demo Data
Click "Demo Data" button in header to load sample data for testing.

### Reset Data
Click "Reset" button to clear all user data (includes confirmation dialog).

### Event Tracking
All major user actions are tracked automatically:
- Daily objective completions
- Deadline completions
- Focus session completions
- Level ups
- Logins

## Roadmap

### Phase 1: MVP (Complete)
- ✅ Daily Objectives system
- ✅ Momentum tracking
- ✅ XP & leveling
- ✅ Supabase auth & backend
- ✅ Event tracking

### Phase 2: Monetization (Q2 2026)
- [ ] Pro tier (€4.99/month)
- [ ] School licenses
- [ ] Payment integration (Stripe)
- [ ] Admin dashboard

### Phase 3: Growth (Q3 2026)
- [ ] Mobile app (React Native)
- [ ] Dutch/English i18n
- [ ] Referral system
- [ ] Study group challenges

### Phase 4: Platform (Q4 2026)
- [ ] Calendar integrations
- [ ] AI study suggestions
- [ ] Marketplace for study resources
- [ ] API for third-party integrations

## Launch Strategy

See [LAUNCH_STRATEGY.md](./LAUNCH_STRATEGY.md) for complete go-to-market plan including:
- 30-day pilot roadmap
- Strategy for first 100 users
- Retention targets
- Monetization plan
- School license GTM
- Investor metrics

## License

Proprietary - All rights reserved

---

**Built for HBO students. Designed for traction. Ready for investment.**
