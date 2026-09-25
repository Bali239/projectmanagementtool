import { neon } from "@neondatabase/serverless"

let sql: ReturnType<typeof neon> | undefined
let schemaPromise: Promise<void> | undefined

function getDatabase() {
  if (!sql) {
    const connectionString = process.env.POSTGRE_SQL_DATABASE_URL || process.env.DATABASE_URL
    if (!connectionString) throw new Error("POSTGRE_SQL_DATABASE_URL or DATABASE_URL is required")
    sql = neon(connectionString)
  }

  return sql
}

export async function ensureTaskSchema() {
  if (!schemaPromise) {
    const database = getDatabase()
    schemaPromise = (async () => {
      await database`CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'in-review', 'completed', 'due-date')),
        due_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`
      await database`CREATE INDEX IF NOT EXISTS tasks_user_created_idx ON tasks (user_id, created_at DESC)`
    })().catch((error) => {
      schemaPromise = undefined
      throw error
    })
  }

  return schemaPromise
}

export function database() {
  return getDatabase()
}