# Layer Up

Layer Up is a weather-to-wardrobe product that turns forecast data into a short daily briefing with outfit guidance, footwear calls, accessory reminders, and personality. The current build also supports family households, with optional child recommendations generated from broad age cohorts instead of one-off rules for every age.

## What this repo includes

- A branded marketing homepage and beta signup flow
- Subscriber persistence with Prisma and PostgreSQL
- ZIP-code-based location resolution
- Weather normalization using Open-Meteo and NWS
- Daily brief generation for adults plus optional child recommendations
- MJML-powered email rendering
- Local development routes for previewing, generating, and preparing email sends

## Family recommendations

Parents can optionally add children during signup by entering each child’s age. Layer Up stores the reported age together with the timestamp when that age was captured, then computes the effective age at send time so recommendations age forward cleanly over time.

Current broad cohorts:

- Newborn / infant
- Toddler / preschool
- Elementary school
- Middle school
- High school

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma 7
- PostgreSQL
- MJML
- Zod

## Getting started

1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
cp .env.example .env
```

3. Generate the Prisma client.

```bash
npm run db:generate
```

4. Apply the schema to your local database.

```bash
npm run db:push
```

5. Start the app.

```bash
npm run dev
```

6. Open the app in your browser.

```text
http://localhost:3000
```

## Environment variables

Core:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: local or deployed app URL
- `LAYER_UP_PREVIEW_ZIP`: ZIP used for the homepage preview
- `NWS_API_USER_AGENT`: user agent sent to NWS requests

Email sending:

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME` optional
- `SENDGRID_REPLY_TO_EMAIL` optional
- `CRON_SECRET` shared secret used to protect the scheduled delivery endpoint

## Useful scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

## Development routes

These routes are intended for local use and return `404` in production where noted:

- `POST /api/subscribe`: create or refresh a secure pending signup
- `POST /api/dev/run-daily-brief`: generate and persist a brief for a subscriber
- `POST /api/dev/prepare-daily-brief-send`: prepare a saved send payload
- `POST /api/dev/send-daily-brief`: send a saved briefing through SendGrid
- `/dev/email-preview`: render a saved briefing in-browser
- `/dev/email-designs`: compare email design variants

## Scheduled delivery

Daily emails are sent by triggering a protected internal route that:

1. Finds `ACTIVE` subscribers
2. Checks each subscriber's local time zone and preferred delivery hour
3. Generates a fresh weather-based briefing for anyone due right now
4. Sends the rendered email through SendGrid

Internal scheduler route:

- `GET /api/internal/cron/daily-briefs`
- `POST /api/internal/cron/daily-briefs`

Required header:

- `Authorization: Bearer <CRON_SECRET>`

Useful trigger patterns:

- `GET /api/internal/cron/daily-briefs`: process everyone due this hour
- `GET /api/internal/cron/daily-briefs?dryRun=true`: inspect who would send without emailing anyone
- `GET /api/internal/cron/daily-briefs?email=test@example.com&force=true`: force a single subscriber through the pipeline for testing
- The GitHub Actions workflow also supports manual runs with optional `email`, `force`, and `dry_run` inputs for testing

Recommended production setup:

- Run the scheduler at least once per hour so 6 AM, 7 AM, and 8 AM local deliveries can all be honored
- If your Vercel project is on a plan that supports hourly or per-minute cron, point that cron at `/api/internal/cron/daily-briefs`
- If your Vercel project is on Hobby, use an external scheduler such as Railway cron, GitHub Actions, or another trusted cron service to call the same route with the bearer token
- This repo includes `.github/workflows/daily-brief-delivery.yml`, which runs hourly at minute `17` and calls the route as long as the `LAYER_UP_APP_URL` and `LAYER_UP_CRON_SECRET` GitHub secrets are configured

## Data model highlights

The current schema tracks:

- `Subscriber`
- `ChildProfile`
- `ForecastSnapshot`
- `DailyBriefing`
- `JobRun`

Child profiles are stored separately from subscribers so a household can have multiple children and each profile can retain its own age-capture timestamp.

## Project structure

```text
src/app
src/components
src/lib/briefing
src/lib/email
src/lib/family
src/lib/location
src/lib/weather
prisma/
designs/
requirements/
```

## Current product direction

Layer Up is aimed at turning weather data into something more useful than a forecast screen:

- “What should I wear?”
- “Do I need different gear for a walk versus a quick errand?”
- “What should the kids wear today?”
- “Can I get this as a daily email without checking the weather myself?”

## Validation

The latest local verification for this build used:

- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
