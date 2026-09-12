import { getDb } from '#/db/index.ts'
import { movieTvSeriesTable } from '#/db/schema/movie-tvseries-schema.ts'
import { createServerFn } from '@tanstack/react-start'
import { count, sql } from 'drizzle-orm'
import z from 'zod'

const PAGE_SIZE = 20

export const searchMovieTvSeries = createServerFn({ method: 'GET' })
  .validator(z.object({ search: z.string().trim().min(1) }))
  .handler(async ({ data: { search } }) => {
    const db = getDb()

    const query = sql`websearch_to_tsquery('english', ${search})`

    const score = sql<number>`
      (ts_rank(${movieTvSeriesTable.titleSearch}, ${query}) * 10)
      + (${movieTvSeriesTable.popularity} * 1)
      + (
        EXTRACT(YEAR FROM ${movieTvSeriesTable.releaseDate}) - 1900
      ) * 0.1
    `

    const [results, countResult] = await Promise.all([
      db
        .select({
          id: movieTvSeriesTable.id,
          type: movieTvSeriesTable.type,
          title: movieTvSeriesTable.title,
          releaseDate: movieTvSeriesTable.releaseDate,
          voteAverage: movieTvSeriesTable.voteAverage,
          popularity: movieTvSeriesTable.popularity,
          posterPath: movieTvSeriesTable.posterPath,
          score,
        })
        .from(movieTvSeriesTable)
        .where(sql`${movieTvSeriesTable.titleSearch} @@ ${query}`)
        .orderBy(sql`${score} DESC`)
        .limit(PAGE_SIZE),

      db
        .select({ count: count() })
        .from(movieTvSeriesTable)
        .where(sql`${movieTvSeriesTable.titleSearch} @@ ${query}`),
    ])

    const totalCount = Number(countResult[0]?.count ?? 0)
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)

    return {
      results,
      totalPages,
    }
  })
