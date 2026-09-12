import type { Database } from '#/db/types.ts'
import { serverEnv } from '#/lib/env.server.ts'
import { drizzle } from 'drizzle-orm/node-postgres'
import { relations } from './relations'

let db: Database | null = null

export const getDb = (): Database => {
  if (!db) {
    db = drizzle(serverEnv.DATABASE_URL, { relations })
  }

  return db
}
