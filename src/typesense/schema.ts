import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

export const movieTvSeriesSchema: CollectionCreateSchema = {
  name: 'movie_tvseries',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'type', type: 'string', facet: true },
    { name: 'title', type: 'string', infix: false },
    { name: 'release_date_ts', type: 'int64', sort: true },
    { name: 'vote_average', type: 'float', sort: true },
    { name: 'popularity', type: 'float', sort: true },
    { name: 'poster_path', type: 'string', optional: true, index: false },
  ],
  default_sorting_field: 'popularity',
}
