import { sql } from 'drizzle-orm'
import {
  customType,
  date,
  index,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

const tsvectorType = customType<{ data: string }>({
  dataType() {
    return 'tsvector'
  },
})

export const movieTvSeriesTable = pgTable(
  'movie_tvseries',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    type: text('type', { enum: ['movie', 'tvseries'] }).notNull(),
    title: text('title').notNull(),
    releaseDate: date('release_date').notNull(),
    voteAverage: real('vote_average').notNull(),
    popularity: real('popularity').notNull(),
    posterPath: text('poster_path'),
    titleSearch: tsvectorType('title_search').generatedAlwaysAs(
      sql`to_tsvector('english', title)`,
    ),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index('idx_movie_tvseries_title_search').using('gin', table.titleSearch),
    index('idx_movie_tvseries_title_trgm').using(
      'gin',
      sql`${table.title} gin_trgm_ops`,
    ),
  ],
)
