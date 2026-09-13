export type MovieTvSeriesDocument = {
  id: string
  type: 'movie' | 'tvseries'
  title: string
  release_date_ts: number
  vote_average: number
  popularity: number
  poster_path?: string
}
