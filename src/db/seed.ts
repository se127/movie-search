import { getDb } from '#/db/index.ts'
import { movieTvSeriesTable } from '#/db/schema/movie-tvseries-schema.ts'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const MOVIES_DIR = resolve(process.cwd(), 'dataset/tmdb-data/movies/movies')
const SERIES_DIR = resolve(process.cwd(), 'dataset/tmdb-data/series/series')
const POSTER_PREFIX = 'https://image.tmdb.org/t/p/w300'
const READ_CONCURRENCY = 200
const INSERT_BATCH_SIZE = 5000

const db = getDb()

type Row = typeof movieTvSeriesTable.$inferInsert

function toPosterUrl(path: string | null | undefined): string | null {
  return path ? `${POSTER_PREFIX}${path}` : null
}

function parseMovieFile(raw: string): Row | null {
  const m = JSON.parse(raw)
  if (!m.release_date) return null
  const date = new Date(m.release_date)
  if (isNaN(date.getTime())) return null
  const title = m.original_title ?? m.title
  if (!title) return null

  return {
    type: 'movie',
    title,
    releaseDate: m.release_date,
    voteAverage: m.vote_average ?? 0,
    popularity: m.popularity ?? 0,
    posterPath: toPosterUrl(m.poster_path),
  }
}

function parseSeriesFile(raw: string): Row | null {
  const s = JSON.parse(raw)
  if (!s.first_air_date) return null
  const date = new Date(s.first_air_date)
  if (isNaN(date.getTime())) return null
  const title = s.original_name ?? s.name
  if (!title) return null

  return {
    type: 'tvseries',
    title,
    releaseDate: s.first_air_date,
    voteAverage: s.vote_average ?? 0,
    popularity: s.popularity ?? 0,
    posterPath: toPosterUrl(s.poster_path),
  }
}

async function readAndParseAll(
  dir: string,
  parser: (raw: string) => Row | null,
  label: string,
): Promise<Row[]> {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  console.log(`${label}: found ${files.length} files.`)

  const rows: Row[] = []
  let skipped = 0

  for (let i = 0; i < files.length; i += READ_CONCURRENCY) {
    const chunk = files.slice(i, i + READ_CONCURRENCY)
    const parsed = await Promise.all(
      chunk.map(async (file) => {
        try {
          const raw = await Bun.file(join(dir, file)).text()
          return parser(raw)
        } catch {
          return null
        }
      }),
    )
    for (const row of parsed) {
      if (row) rows.push(row)
      else skipped++
    }
    if ((i + READ_CONCURRENCY) % 5000 < READ_CONCURRENCY) {
      console.log(
        `${label}: parsed ${Math.min(i + READ_CONCURRENCY, files.length)}/${files.length}`,
      )
    }
  }

  console.log(`${label}: parsed ${rows.length}, skipped ${skipped}.`)
  return rows
}

async function batchInsert(rows: Row[], label: string) {
  if (rows.length === 0) return

  let inserted = 0
  const chunks: Row[][] = []
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    chunks.push(rows.slice(i, i + INSERT_BATCH_SIZE))
  }

  const CONCURRENT_BATCHES = 5
  for (let i = 0; i < chunks.length; i += CONCURRENT_BATCHES) {
    const group = chunks.slice(i, i + CONCURRENT_BATCHES)
    await Promise.all(
      group.map((chunk) => db.insert(movieTvSeriesTable).values(chunk)),
    )
    inserted += group.reduce((sum, c) => sum + c.length, 0)
    console.log(`${label}: inserted ${inserted}/${rows.length}`)
  }
}

async function main() {
  const start = Date.now()

  const onlySeries = process.argv.includes('--series-only')
  const onlyMovies = process.argv.includes('--movies-only')

  console.log('Wiping movie_tvseries table...')
  await db.delete(movieTvSeriesTable)
  console.log('Table wiped.')

  if (!onlySeries) {
    const movieRows = await readAndParseAll(
      MOVIES_DIR,
      parseMovieFile,
      'Movies',
    )
    await batchInsert(movieRows, 'Movies')
  }

  if (!onlyMovies) {
    const seriesRows = await readAndParseAll(
      SERIES_DIR,
      parseSeriesFile,
      'Series',
    )
    await batchInsert(seriesRows, 'Series')
  }

  console.log(`\nAll done in ${((Date.now() - start) / 1000).toFixed(1)}s`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
