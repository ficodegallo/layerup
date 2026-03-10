/**
 * One-time script to seed the zip_codes table from simplemaps Basic dataset.
 *
 * Setup:
 *   1. Download the free simplemaps US Basic dataset: https://simplemaps.com/data/us-zips
 *   2. Place the CSV at: scripts/uszips.csv
 *   3. Run: npm run seed:zips
 *
 * The CSV has columns: zip,lat,lng,city,state_id,state_name,zcta,parent_zcta,...
 */

import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { config } from 'dotenv'

// Load .env so DATABASE_URL is available for CLI scripts
config({ path: '.env' })
config({ path: '.env.local', override: true })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

// Accept path as CLI arg, or default to the file dropped in the project root
const CSV_PATH = process.argv[2] ?? join(__dirname, '../../../uszips.csv')
const BATCH_SIZE = 1000

async function main() {
  console.log('Starting ZIP code seed...')

  const rl = createInterface({
    input: createReadStream(CSV_PATH),
    crlfDelay: Infinity,
  })

  let header: string[] | null = null
  const batch: Array<{
    zip: string
    city: string
    state: string
    lat: number
    lng: number
    timezone: string
  }> = []

  let total = 0

  for await (const line of rl) {
    if (!header) {
      header = line.split(',').map((h) => h.replace(/"/g, '').trim())
      continue
    }

    const cols = parseCsvLine(line)
    if (!header || cols.length < 5) continue

    const idx = (col: string) => header!.indexOf(col)

    const zip = cols[idx('zip')]?.replace(/"/g, '').trim()
    const lat = parseFloat(cols[idx('lat')] ?? '0')
    const lng = parseFloat(cols[idx('lng')] ?? '0')
    const city = cols[idx('city')]?.replace(/"/g, '').trim()
    const state = cols[idx('state_id')]?.replace(/"/g, '').trim()

    // Use timezone directly from CSV column (simplemaps includes it)
    const timezone = cols[idx('timezone')]?.replace(/"/g, '').trim() || 'America/New_York'

    if (!zip || !city || !state || isNaN(lat) || isNaN(lng) || !timezone) continue

    batch.push({ zip, city, state, lat, lng, timezone })

    if (batch.length >= BATCH_SIZE) {
      await flush(batch)
      total += batch.length
      batch.length = 0
      console.log(`Seeded ${total} ZIPs...`)
    }
  }

  if (batch.length > 0) {
    await flush(batch)
    total += batch.length
  }

  console.log(`Done. Seeded ${total} ZIP codes.`)
  await db.$disconnect()
}

interface ZipRow {
  zip: string
  city: string
  state: string
  lat: number
  lng: number
  timezone: string
}

async function flush(rows: ZipRow[]) {
  await db.$executeRawUnsafe(
    `INSERT INTO zip_codes (zip, city, state, lat, lng, timezone)
     VALUES ${rows.map((_r: ZipRow, i: number) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(',')}
     ON CONFLICT (zip) DO UPDATE SET
       city = EXCLUDED.city,
       state = EXCLUDED.state,
       lat = EXCLUDED.lat,
       lng = EXCLUDED.lng,
       timezone = EXCLUDED.timezone`,
    ...rows.flatMap((r: ZipRow) => [r.zip, r.city, r.state, r.lat, r.lng, r.timezone])
  )
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
