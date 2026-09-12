import { defineRelations } from 'drizzle-orm'
import * as schema from './schema/schema'

export const relations = defineRelations(schema)
