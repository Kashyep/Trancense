import { existsSync, readFileSync } from 'node:fs'
import { request } from 'node:http'

const required = [
  'supabase/migrations/202608020001_initial_schema.sql',
  'src/app/api/reports/[auditId]/route.ts',
  'src/components/pilot-workspace.tsx',
]
const missing = required.filter((file) => !existsSync(file))
if (missing.length) {
  console.error(`Missing pilot artifacts: ${missing.join(', ')}`)
  process.exit(1)
}

const baseUrl = process.env.E2E_BASE_URL
if (!baseUrl) {
  const migration = readFileSync(required[0], 'utf8')
  if (!migration.includes('enable row level security') || !migration.includes("create table public.energy_records")) process.exit(1)
  console.log('E2E smoke artifacts verified. Set E2E_BASE_URL to run HTTP checks against a deployed app.')
  process.exit(0)
}

const url = new URL('/api/health', baseUrl)
await new Promise((resolve, reject) => {
  const req = request(url, { method: 'GET' }, (res) => {
    let body = ''
    res.on('data', (chunk) => { body += chunk })
    res.on('end', () => {
      if (res.statusCode !== 200 || !body.includes('status')) reject(new Error(`Health check failed: ${res.statusCode} ${body}`))
      else { console.log(`E2E health check passed at ${baseUrl}`); resolve() }
    })
  })
  req.on('error', reject)
  req.end()
})
