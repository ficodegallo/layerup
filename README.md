# LayerUp

A daily weather email newsletter that translates raw forecast data into plain-language, personality-driven outfit and planning guidance — delivered to your inbox every morning.

## What it does

Subscribers enter their email and ZIP code. Each morning at their chosen hour, LayerUp sends a personalized email covering:

- **The vibe** — a one-liner mood-setter for the day (15 weather archetypes, 5 variants each)
- **Temperature** — highs, lows, and feels-like with colloquial labels ("frigid", "mild", "scorching")
- **Layering advice** — what to wear, tuned to drive vs. walk lifestyle mode
- **Footwear pick** — rain boots, sneakers, sandals, etc. based on conditions
- **Accessories** — umbrella, sunscreen, sunglasses, heavy coat triggers
- **Safety alerts** — NWS severe/extreme alerts replace humor with plain-language warnings

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Railway) via Prisma 7 |
| Email templates | MJML |
| Email delivery | SendGrid |
| Weather data | Open-Meteo (free, no API key) |
| Alerts | NWS CAP Alerts API |
| Hosting | Vercel |
| Tests | Vitest |

## Project structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── api/
│   │   ├── subscribe/route.ts          # Double opt-in sign-up
│   │   ├── confirm/route.ts            # Email confirmation
│   │   ├── unsubscribe/route.ts        # One-click unsubscribe
│   │   ├── cron/
│   │   │   ├── fetch-weather/route.ts  # 4 AM UTC nightly batch
│   │   │   └── send-emails/route.ts    # Hourly send job
│   │   └── webhooks/sendgrid/route.ts  # Bounce/open/click events
├── lib/
│   ├── email/
│   │   ├── engine.ts                   # Central orchestrator
│   │   ├── rules/                      # Pure functions per section
│   │   ├── renderer.ts                 # MJML → HTML
│   │   └── sendgrid.ts                 # SendGrid wrapper
│   ├── weather/
│   │   ├── open-meteo.ts
│   │   ├── nws-alerts.ts
│   │   └── weather-cache.ts
│   ├── content/                        # TypeScript copy library
│   │   ├── vibes.ts                    # 15 archetypes × 5 variants
│   │   ├── colloquial-temps.ts
│   │   └── accessory-comments.ts
│   └── geo/
│       ├── zip-to-coords.ts
│       └── coords-to-timezone.ts
├── templates/
│   ├── daily-email.mjml
│   ├── confirm-email.mjml
│   └── partials/
└── scripts/
    ├── seed-zip-data.ts                # One-time ZIP seeding
    ├── test-email-render.ts            # Render HTML for any ZIP
    └── test-send.ts                    # Send a test email to yourself
tests/
├── unit/rules/                         # 46 tests, all pure functions
└── integration/
```

## How it works

### Sign-up flow
1. User submits email + ZIP on the landing page
2. API validates ZIP against the `zip_codes` table (33,782 US ZIPs seeded from simplemaps)
3. Subscriber is created with `PENDING` status and a secure confirm token
4. Confirmation email sent via SendGrid
5. User clicks the link → status set to `ACTIVE`

### Nightly weather fetch (4 AM UTC)
Vercel Cron hits `/api/cron/fetch-weather`, which fetches Open-Meteo forecasts and NWS alerts for every active ZIP and upserts results into `weather_cache`.

### Hourly send job
Vercel Cron hits `/api/cron/send-emails` every hour. It queries for subscribers whose local `delivery_hour` matches the current hour (all timezone math done in PostgreSQL), skipping any who already received today's email. For each subscriber:

1. Load weather from cache
2. Run all rule functions → `EmailPayload`
3. Inject vars into MJML template → compile to HTML
4. Send via SendGrid, write to `send_logs`

### Rules engine
Each rule (`vibe`, `temperature`, `footwear`, `accessories`, `layering`, `safety`) is a **pure function** — no DB or API calls, just typed input in and copy out. This makes every rule independently unit-testable.

If NWS reports a Severe or Extreme alert, `safety.ts` sets `safetyMode: true` and all other rules suppress humor, returning plain-language copy only.

## Local development

### Prerequisites
- Node.js 18+
- PostgreSQL database (Railway free tier works)
- SendGrid account (free tier: 100 emails/day)

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in values
cp .env.example .env.local

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# Seed ZIP codes (download uszips.csv from simplemaps.com/data/us-zips first)
npm run seed:zips

# Start dev server
npm run dev
```

### Environment variables

```
DATABASE_URL=           # PostgreSQL connection string
SENDGRID_API_KEY=       # SendGrid API key
SENDGRID_FROM_EMAIL=    # Verified sender address
SENDGRID_WEBHOOK_SECRET=# For webhook signature verification
CRON_SECRET=            # Shared secret to authenticate Vercel cron requests
NEXT_PUBLIC_BASE_URL=   # e.g. http://localhost:3000
```

See `.env.example` for the full list.

### Scripts

```bash
npm run dev               # Start dev server
npm test                  # Run all tests (Vitest)
npm run seed:zips         # Seed ZIP code table from simplemaps CSV
npm run test:render       # Render a daily email to HTML (pass ZIP as arg)
npm run test:send         # Send a test email to yourself
```

## Deployment

The app is designed for Vercel + Railway:

1. Push to GitHub, import project in Vercel
2. Add all environment variables in Vercel project settings
3. Vercel Cron is configured in `vercel.json`:
   - `0 4 * * *` — nightly weather fetch
   - `0 * * * *` — hourly send job
4. Configure SendGrid domain authentication (SPF, DKIM, DMARC) for deliverability
5. Point `NEXT_PUBLIC_BASE_URL` to your production domain

## Database schema

Six tables: `subscribers`, `preferences`, `zip_codes`, `weather_cache`, `send_logs`, `email_events`. See `prisma/schema.prisma` for the full schema.

## License

MIT
