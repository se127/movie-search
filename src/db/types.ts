import type { relations } from '#/db/relations.ts'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

export type Database = NodePgDatabase<typeof relations>
