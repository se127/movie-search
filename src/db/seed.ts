import { getDb } from '#/db/index.ts'
import { movieTvSeriesTable } from '#/db/schema/movie-tvseries-schema.ts'
import { getTypesenseClient } from '#/typesense/client.server'
import { movieTvSeriesSchema } from '#/typesense/schema'
import type { MovieTvSeriesDocument } from '#/typesense/types.ts'
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const MOVIES_DIR = resolve(process.cwd(), 'dataset/tmdb-data/movies/movies')
const SERIES_DIR = resolve(process.cwd(), 'dataset/tmdb-data/series/series')
const POSTER_PREFIX = 'https://image.tmdb.org/t/p/w300'
const READ_CONCURRENCY = 200
const DB_INSERT_BATCH_SIZE = 5000
const TS_IMPORT_BATCH_SIZE = 5000

const db = getDb()
const client = getTypesenseClient()

type Row = typeof movieTvSeriesTable.$inferInsert

function toPosterUrl(path: string | null | undefined): string | null {
  return path ? `${POSTER_PREFIX}${path}` : null
}

function toUnixTs(dateStr: string): number | null {
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000)
}

function parseMovieFile(raw: string, idx: number): Row | null {
  const m = JSON.parse(raw)
  if (!m.release_date) return null
  const date = new Date(m.release_date)
  if (isNaN(date.getTime())) return null
  const title = m.original_title ?? m.title
  if (!title) return null

  return {
    id: `movie-${m.id ?? idx}`,
    type: 'movie',
    title,
    releaseDate: m.release_date,
    voteAverage: m.vote_average ?? 0,
    popularity: m.popularity ?? 0,
    posterPath: toPosterUrl(m.poster_path),
  }
}

function parseSeriesFile(raw: string, idx: number): Row | null {
  const s = JSON.parse(raw)
  if (!s.first_air_date) return null
  const date = new Date(s.first_air_date)
  if (isNaN(date.getTime())) return null
  const title = s.original_name ?? s.name
  if (!title) return null

  return {
    id: `series-${s.id ?? idx}`,
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
  parser: (raw: string, idx: number) => Row | null,
  label: string,
): Promise<Row[]> {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  console.log(`${label}: found ${files.length} files.`)

  const rows: Row[] = []
  let skipped = 0

  for (let i = 0; i < files.length; i += READ_CONCURRENCY) {
    const chunk = files.slice(i, i + READ_CONCURRENCY)
    const parsed = await Promise.all(
      chunk.map(async (file, j) => {
        try {
          const raw = await Bun.file(join(dir, file)).text()
          return parser(raw, i + j)
        } catch {
          return null
        }
      }),
    )
    for (const row of parsed) {
      if (row) rows.push(row)
      else skipped++
    }
  }

  console.log(`${label}: parsed ${rows.length}, skipped ${skipped}.`)
  return rows
}

async function dbInsert(rows: Row[], label: string) {
  if (rows.length === 0) return

  let inserted = 0
  for (let i = 0; i < rows.length; i += DB_INSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + DB_INSERT_BATCH_SIZE)
    await db.insert(movieTvSeriesTable).values(batch)
    inserted += batch.length
    console.log(`${label} (db): inserted ${inserted}/${rows.length}`)
  }
}

function rowToTsDoc(row: Row): MovieTvSeriesDocument | null {
  const ts = toUnixTs(row.releaseDate)
  if (ts === null) return null

  return {
    id: row.id,
    type: row.type,
    title: row.title,
    release_date_ts: ts,
    vote_average: row.voteAverage,
    popularity: row.popularity,
    poster_path: row.posterPath ?? undefined,
  }
}

async function typesenseImport(rows: Row[], label: string) {
  if (rows.length === 0) return

  const docs = rows
    .map(rowToTsDoc)
    .filter((d): d is MovieTvSeriesDocument => d !== null)
  let imported = 0

  for (let i = 0; i < docs.length; i += TS_IMPORT_BATCH_SIZE) {
    const batch = docs.slice(i, i + TS_IMPORT_BATCH_SIZE)
    const results = await client
      .collections('movie_tvseries')
      .documents()
      .import(batch, { action: 'upsert' })

    const failed = results.filter((r) => !r.success)
    if (failed.length > 0) {
      console.error(
        `${label} (typesense): ${failed.length} failures`,
        failed.slice(0, 3),
      )
    }
    imported += batch.length
    console.log(`${label} (typesense): imported ${imported}/${docs.length}`)
  }
}

async function ensureTypesenseCollection() {
  try {
    await client.collections('movie_tvseries').delete()
    console.log('Existing Typesense collection dropped.')
  } catch {
    // doesn't exist yet, ignore
  }

  await client.collections().create(movieTvSeriesSchema)
  console.log('Typesense collection created.')
}

async function main() {
  const start = Date.now()
  const onlySeries = process.argv.includes('--series-only')
  const onlyMovies = process.argv.includes('--movies-only')

  console.log('Wiping movie_tvseries table...')
  await db.delete(movieTvSeriesTable)
  console.log('Table wiped.')

  await ensureTypesenseCollection()

  if (!onlySeries) {
    const movieRows = await readAndParseAll(
      MOVIES_DIR,
      parseMovieFile,
      'Movies',
    )
    await dbInsert(movieRows, 'Movies')
    await typesenseImport(movieRows, 'Movies')
  }

  if (!onlyMovies) {
    const seriesRows = await readAndParseAll(
      SERIES_DIR,
      parseSeriesFile,
      'Series',
    )
    await dbInsert(seriesRows, 'Series')
    await typesenseImport(seriesRows, 'Series')
  }

  console.log(`\nAll done in ${((Date.now() - start) / 1000).toFixed(1)}s`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
