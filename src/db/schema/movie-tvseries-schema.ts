import { sql } from 'drizzle-orm'
import { pgTable, real, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const movieTvSeriesTable = pgTable('movie_tvseries', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  type: text('type', { enum: ['movie', 'tvseries'] }).notNull(),
  title: text('title').notNull(),
  releaseDate: timestamp('release_date').notNull(),
  voteAverage: real('vote_average').notNull(),
  posterPath: text('poster_path'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})
