import { getTypesenseClient } from '#/typesense/client.server.ts'
import type { MovieTvSeriesDocument } from '#/typesense/types.ts'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

const PAGE_SIZE = 20

export const searchMovieTvSeries = createServerFn({ method: 'GET' })
  .validator(
    z.object({ search: z.string().trim().min(1), page: z.number().optional() }),
  )
  .handler(async ({ data: { search, page = 1 } }) => {
    const client = getTypesenseClient()

    const result = await client
      .collections<MovieTvSeriesDocument>('movie_tvseries')
      .documents()
      .search({
        q: search,
        query_by: 'title',
        sort_by: '_text_match:desc,popularity:desc,release_date_ts:desc',
        per_page: PAGE_SIZE,
        page,
        num_typos: 2,
        prefix: true,
      })

    const results = (result.hits ?? []).map((hit) => {
      const doc = hit.document

      return {
        id: doc.id,
        type: doc.type,
        title: doc.title,
        releaseDate: new Date(doc.release_date_ts * 1000)
          .toISOString()
          .slice(0, 10),
        voteAverage: doc.vote_average,
        popularity: doc.popularity,
        posterPath: doc.poster_path ?? null,
      }
    })

    const totalPages = Math.ceil(result.found / PAGE_SIZE)

    return { results, totalPages }
  })
