import { serverEnv } from '#/lib/env.server.ts'
import { movieTvSeriesSearchResultZodSchema } from '#/zod-schema/movie-tvseries-search-result.ts'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

export const searchMovieTvSeries = createServerFn({ method: 'GET' })
  .validator(z.object({ search: z.string().trim().min(1) }))
  .handler(async ({ data: { search } }) => {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(search)}`,
      {
        headers: {
          authorization: `Bearer ${serverEnv.THEMOVIEDB_READ_ACCESS_TOKEN}`,
          accept: 'application/json',
        },
      },
    )

    const results = await response.json()

    const filteredResults = {
      ...results,
      results: results.results.filter(
        (result: { media_type: string }) =>
          result.media_type === 'movie' || result.media_type === 'tv',
      ),
    }

    const { results: resultsParsed } =
      movieTvSeriesSearchResultZodSchema.parse(filteredResults)

    return resultsParsed
  })
