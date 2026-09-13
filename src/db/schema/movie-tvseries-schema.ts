import { date, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

export const movieTvSeriesTable = pgTable('movie_tvseries', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['movie', 'tvseries'] }).notNull(),
  title: text('title').notNull(),
  releaseDate: date('release_date').notNull(),
  voteAverage: real('vote_average').notNull(),
  popularity: real('popularity').notNull(),
  posterPath: text('poster_path'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
})
