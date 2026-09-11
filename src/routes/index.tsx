import { SearchMovieTvSeries } from '#/components/search-movie-tvseries.tsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-4">
      <div className="mx-auto my-16 max-w-md">
        <SearchMovieTvSeries />
      </div>
    </div>
  )
}
