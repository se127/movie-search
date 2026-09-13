# AGENTS.md

Movie/TV series search app built with **TanStack Start + React 19**, run with **Bun**. PostgreSQL + Drizzle is the **datastore**; Typesense is the **search engine**. The UI talks to a server fn (`src/serverfn/search-movie-tvseries.ts`) which queries Typesense — PostgreSQL is not queried for search.

## Agent rules (hard constraints)

- **Never install with npm or npx — always `bun` / `bunx`** (Bun is the only package manager here; `bun.lock`).
- **Don't change or remove anything without asking permission first.**
- **Don't commit without checking — confirm with the user what to commit and the commit message first.**
- **Don't run eslint, prettier, or tsx manually.** The project uses husky + lint-staged, which runs `eslint --fix` and `prettier --write` automatically via the pre-commit hook. Let the hook handle formatting/linting.

## Commands

- `bun run dev` — dev server on port 5000 (`bun --bun run vite dev --port 5000`).
- `bun run generate-routes` — regenerate the route tree. `src/routeTree.gen.ts` and `.tanstack/` are gitignored generated files; rerun after adding/renaming routes.
- `bun run lint` (eslint), `bun run check` (prettier `--check` only — **not a typecheck**). No test suite and no typecheck script exist; use `bunx tsc --noEmit` if you need a typecheck.
- `bun run format` — prettier `--write` + `eslint --fix`.
- `bun run db:push` — apply Drizzle schema directly. There is **no migration workflow** in use (the `drizzle/` folder is empty/unused).
- `bun run db:seed` — **destructive**: wipes the `movie_tvseries` table, drops and recreates the Typesense `movie_tvseries` collection, then re-imports. Needs a running Typesense server + valid `.env`. Flags: `bun run db:seed -- --movies-only` / `-- --series-only`.
- `bun run db:studio` — Drizzle Studio.

## Environment

- `.env` is gitignored. `cp .env.example .env` and fill in real values. Bun auto-loads `.env`.
- `src/lib/env.server.ts` zod-parses `process.env` at import time and **throws if incomplete** — every consumer (dev server, drizzle-kit, seed) fails fast without a valid `.env`. Required: `DATABASE_URL`, `TYPESENSE_API_KEY`, `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`.

## Commit gotcha (husky + lint-staged)

The pre-commit hook runs `bun x lint-staged`: `eslint --fix` + `prettier --write` on staged files automatically — do **not** run them manually (see Agent rules). **Any ESLint error aborts the commit and resets the staged index** — fix errors before committing (the hook reports them). Known trap: `@typescript-eslint/no-unnecessary-condition` rejects `?? 0`/`?? []` on non-nullable Typesense response fields (e.g. `result.found`) — drop the fallback.

## Code style / conventions

- Prettier: no semicolons, single quotes (see `prettier.config.js`).
- Path aliases `#/*` and `@/*` → `src/*`. Imports use explicit extensions (`#/typesense/client.server.ts`) — `allowImportingTsExtensions` is on; match this style.
- `noUncheckedIndexedAccess` is on — indexed access yields `T | undefined`; narrow before use.
- ESLint (TanStack config) ignores `src/components/ui/**`; these are generated shadcn/ui components — don't hand-edit them, regenerate via shadcn.

## Typesense

- Collection schema: `src/typesense/schema.ts`; document type: `src/typesense/types.ts`; client singleton: `src/typesense/client.server.ts`.
- Search params live in `src/serverfn/search-movie-tvseries.ts`: `query_by: 'title'`, `num_typos: 2`, `prefix: true`, page size 20, sort `_text_match:desc,popularity:desc,release_date_ts:desc`.
- Changing indexed fields/sorts means updating **three places together**: `schema.ts` (collection), `types.ts` (document type), and `rowToTsDoc` in `src/db/seed.ts` (mapping DB row → doc).

## Datasets & docs

- `dataset/` is gitignored and excluded from Vite watch. Seed expects `dataset/tmdb-data/movies/movies/*.json` and `dataset/tmdb-data/series/series/*.json` (extract the Kaggle ZIP into the repo root). CI/deploy: none in-repo; app deploys to Vercel.
- `README.md` is written in **Persian, RTL** — keep that convention when editing it.
