import { readFileSync } from "node:fs"
import { join } from "node:path"

import postgres from "postgres"

export const runtime = "nodejs"

const OWNER_EMAIL = "valentinalunaolave@gmail.com"
const FILES = [
  "0001_identity_and_billing.sql",
  "0002_admin_functions.sql",
  "0003_finance.sql",
  "0004_rls.sql",
] as const

function authorized(request: Request) {
  const token = process.env.MIGRATE_RUN_TOKEN
  if (!token) return false
  const header = request.headers.get("authorization") ?? ""
  const url = new URL(request.url)
  return header === `Bearer ${token}` || url.searchParams.get("token") === token
}

function loadSql(file: string) {
  return readFileSync(join(process.cwd(), "supabase", "migrations", file), "utf8")
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "not found" }, { status: 404 })
  }

  const connectionString =
    process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL
  if (!connectionString) {
    return Response.json({ error: "missing POSTGRES_URL" }, { status: 500 })
  }

  const sql = postgres(connectionString, {
    ssl: "require",
    max: 1,
    idle_timeout: 5,
    connect_timeout: 20,
  })

  try {
    const applied: string[] = []
    for (const file of FILES) {
      await sql.unsafe(loadSql(file))
      applied.push(file)
    }

    await sql.unsafe(`
      insert into public.profiles (id, full_name, email, role, account_status)
      select
        id,
        coalesce(raw_user_meta_data ->> 'full_name', ''),
        email,
        'user',
        'enabled'
      from auth.users
      on conflict (id) do update
        set email = excluded.email
    `)

    const tables = await sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by 1
    `
    const users = await sql`
      select id, email, email_confirmed_at is not null as confirmed
      from auth.users
      order by created_at
    `
    const profiles = await sql`
      select id, email, role, account_status
      from public.profiles
      order by created_at
    `
    const plans = await sql`
      select code, name, is_active from public.plans order by sort_order
    `

    let provisioned: string | null = null
    let provisionError: string | null = null
    const owner = users.find((row) => (row.email || "").toLowerCase() === OWNER_EMAIL)
    const adminCount = profiles.filter((row) => row.role === "super_admin").length
    if (owner && adminCount === 0) {
      try {
        await sql`select public.provision_first_super_admin(${owner.id}::uuid, ${"aprovisionamiento inicial"})`
        provisioned = String(owner.id)
      } catch (error) {
        provisionError = error instanceof Error ? error.message : "provision failed"
      }
    }

    const profilesAfter = provisioned
      ? await sql`select id, email, role, account_status from public.profiles order by created_at`
      : profiles

    return Response.json({
      ok: true,
      applied,
      tables: tables.map((row) => row.table_name),
      userCount: users.length,
      users: users.map((row) => ({
        id: row.id,
        email: row.email,
        confirmed: row.confirmed,
      })),
      profiles: profilesAfter,
      plans,
      provisioned,
      provisionError,
      ownerPresent: Boolean(owner),
      adminCount,
    })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "migrate failed",
      },
      { status: 500 },
    )
  } finally {
    await sql.end({ timeout: 5 })
  }
}
