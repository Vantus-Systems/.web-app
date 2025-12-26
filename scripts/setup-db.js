import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import net from 'net'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env')
const DEFAULT_CONTAINER = 'med-postgres'
const DEFAULT_USER = 'postgres'
const DEFAULT_PASSWORD = 'postgres'
const DEFAULT_DB = 'med'
const DEFAULT_IMAGE = 'postgres:15-alpine'

function log(...args) {
  console.log('[setup-db]', ...args)
}

function parseEnv(content) {
  const out = {}
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const k = trimmed.slice(0, eq).trim()
    let v = trimmed.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

async function readEnv() {
  try {
    const raw = await fs.readFile(ENV_PATH, 'utf8')
    return parseEnv(raw)
  } catch (e) {
    return {}
  }
}

async function writeEnv(updates) {
  const current = await readEnv()
  const merged = { ...current, ...updates }
  const lines = []
  for (const [k, v] of Object.entries(merged)) {
    lines.push(`${k}="${v.replace(/\"/g, '\\"')}"`)
  }
  await fs.writeFile(ENV_PATH, lines.join('\n') + '\n')
}

function isLikelyPlaceholder(url) {
  if (!url) return true
  const low = url.toLowerCase()
  return low.includes('user') || low.includes('password') || low.includes('host') || low.includes('database')
}

function dockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' })
    return true
  } catch (e) {
    return false
  }
}

function containerExists(name) {
  try {
    const out = execSync(`docker ps -a --filter name=${name} --format "{{.Names}}"`, { encoding: 'utf8' })
    return out.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).includes(name)
  } catch (e) {
    return false
  }
}

function containerRunning(name) {
  try {
    const out = execSync(`docker ps --filter name=${name} --format "{{.Names}}"`, { encoding: 'utf8' })
    return out.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).includes(name)
  } catch (e) {
    return false
  }
}

async function isPortFree(port) {
  return new Promise((resolve) => {
    const s = net.createServer()
    s.once('error', () => resolve(false))
    s.once('listening', () => {
      s.close()
      resolve(true)
    })
    s.listen(port, '127.0.0.1')
  })
}

async function findFreePort(start = 5432, end = 5500) {
  for (let p = start; p <= end; p++) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(p)
    if (free) return p
  }
  throw new Error('No free ports between ' + start + ' and ' + end)
}

function runCmd(cmd, envExtra = {}) {
  log('RUN:', cmd)
  return execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...envExtra } })
}

async function pushSchemaAndSeed(databaseUrl) {
  log('Pushing Prisma schema to', databaseUrl)
  try {
    runCmd('npx prisma db push --accept-data-loss', { DATABASE_URL: databaseUrl })
  } catch (e) {
    throw new Error('prisma db push failed: ' + (e && e.message ? e.message : e))
  }

  log('Running seed...')
  try {
    // Use npm script so prisma uses the configured seed command
    runCmd('npx prisma db seed', { DATABASE_URL: databaseUrl })
  } catch (e) {
    log('prisma db seed failed (non-fatal):', e && e.message ? e.message : e)
  }
}

async function main() {
  // Respect CI and explicit opt-outs
  if (process.env.CI) {
    log('CI detected - skipping automatic DB setup')
    return
  }

  if (process.env.SKIP_DB_SETUP === 'true' || process.env.NO_DB_SETUP === 'true') {
    log('SKIP_DB_SETUP set - skipping automatic DB setup')
    return
  }

  // Prefer runtime env var
  const runtimeDb = process.env.DATABASE_URL
  if (runtimeDb && !isLikelyPlaceholder(runtimeDb)) {
    log('Found existing DATABASE_URL in environment - trying to use it')
    try {
      await pushSchemaAndSeed(runtimeDb)
      log('Database is ready (via existing DATABASE_URL)')
      return
    } catch (e) {
      log('Existing DATABASE_URL could not be used:', e.message || e)
      // continue to attempt local docker provisioning
    }
  }

  const envVars = await readEnv()
  let fileDb = envVars.DATABASE_URL
  if (fileDb && !isLikelyPlaceholder(fileDb)) {
    log('Found existing DATABASE_URL in .env - trying to use it')
    try {
      await pushSchemaAndSeed(fileDb)
      log('Database is ready (via .env DATABASE_URL)')
      return
    } catch (e) {
      log('.env DATABASE_URL could not be used:', e.message || e)
    }
  }

  // No usable DATABASE_URL found - attempt to provision a local Postgres via Docker
  if (!dockerAvailable()) {
    log('Docker is not available and no valid DATABASE_URL was found.')
    log('To finish setup, either install Docker or set a valid DATABASE_URL in .env')
    log('Example (Linux/Mac):')
    log('  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/med?schema=public"')
    return
  }

  try {
    log('Docker available — provisioning local PostgreSQL container...')
    const port = await findFreePort(5432, 5540)
    log('Using host port', port)

    if (!containerExists(DEFAULT_CONTAINER)) {
      // Start a new container
      runCmd(
        `docker run -d --name ${DEFAULT_CONTAINER} -e POSTGRES_PASSWORD=${DEFAULT_PASSWORD} -e POSTGRES_USER=${DEFAULT_USER} -e POSTGRES_DB=${DEFAULT_DB} -p ${port}:5432 ${DEFAULT_IMAGE}`,
      )
    } else if (!containerRunning(DEFAULT_CONTAINER)) {
      log(`Starting existing container ${DEFAULT_CONTAINER}`)
      runCmd(`docker start ${DEFAULT_CONTAINER}`)
    } else {
      log(`Using already running container ${DEFAULT_CONTAINER}`)
    }

    const databaseUrl = `postgresql://${DEFAULT_USER}:${DEFAULT_PASSWORD}@localhost:${port}/${DEFAULT_DB}?schema=public`

    // wait for DB to accept connections and push schema
    const timeoutMs = 60 * 1000
    const intervalMs = 2000
    const start = Date.now()
    let ok = false
    while (Date.now() - start < timeoutMs) {
      try {
        await pushSchemaAndSeed(databaseUrl)
        ok = true
        break
      } catch (e) {
        log('Waiting for Postgres to be ready...')
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, intervalMs))
      }
    }

    if (!ok) {
      log('Timed out waiting for Postgres to become ready')
      return
    }

    // Persist to .env for convenience if not already set
    if (!envVars.DATABASE_URL || isLikelyPlaceholder(envVars.DATABASE_URL)) {
      log('Saving DATABASE_URL to .env')
      await writeEnv({ DATABASE_URL: databaseUrl })
    }

    log('Database provisioning completed.')
  } catch (e) {
    log('Failed to provision database:', e && e.message ? e.message : e)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
