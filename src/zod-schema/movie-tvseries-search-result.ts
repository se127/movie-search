import z from 'zod'

export const movieTvSeriesSearchResultZodSchema = z.object({
  results: z.array(
    z
      .object({
        media_type: z.enum(['movie', 'tv']),
        id: z.number().int().positive(),
        original_title: z.string().trim().min(1).optional(),
        original_name: z.string().trim().min(1).optional(),
        release_date: z.iso.date().or(z.literal('')).optional(),
        first_air_date: z.iso.date().or(z.literal('')).optional(),
        vote_average: z.number(),
        poster_path: z
          .string()
          .trim()
          .min(1)
          .nullable()
          .transform((path) =>
            path ? `https://image.tmdb.org/t/p/w300${path}` : null,
          ),
      })
      .transform((result) => ({
        mediaType: result.media_type,
        id: result.id,
        originalTitle:
          result.media_type === 'movie'
            ? result.original_title!
            : result.original_name!,
        releaseDate:
          result.media_type === 'movie'
            ? result.release_date || null
            : result.first_air_date || null,
        voteAverage: result.vote_average,
        posterPath: result.poster_path,
      })),
  ),
})
