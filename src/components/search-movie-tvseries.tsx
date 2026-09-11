import { CustomCard } from '#/components/custom-card.tsx'
import { ImdbIcon } from '#/components/imdb-icon.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group.tsx'
import { searchMovieTvSeries } from '#/serverfn/movie-tvseries.ts'
import { useDebouncedValue } from '@tanstack/react-pacer'
import {
  keepPreviousData,
  useQuery,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { cn } from 'cn'
import {
  CalendarIcon,
  FilmIcon,
  Loader2Icon,
  RotateCcwIcon,
  SearchIcon,
  TvIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const SearchMovieTvSeries = () => {
  const [value, setValue] = useState('')
  const [debouncedValue] = useDebouncedValue(value, {
    wait: 500,
  })
  const [showSearchResultCard, setShowSearchResultCard] = useState(false)

  useEffect(() => {
    if (debouncedValue) {
      setShowSearchResultCard(true)
    } else {
      setShowSearchResultCard(false)
    }
  }, [debouncedValue])

  return (
    <CustomCard
      className="overflow-visible"
      title={<h1>جستجوی فیلم یا سریال</h1>}
      description="نام فیلم یا سریال مورد نظر را وارد کنید."
    >
      <div className="relative">
        <InputGroup>
          <InputGroupInput
            type="search"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
            }}
            placeholder="نام فیلم یا سریال..."
            autoFocus
          />
          <InputGroupAddon align={'inline-end'}>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <CustomCard
          className={cn(
            'absolute inset-x-0 top-10 z-50 transition-all duration-300',
            {
              'invisible opacity-0': !showSearchResultCard,
              'visible opacity-100': showSearchResultCard,
            },
          )}
        >
          {debouncedValue.trim().length > 0 && (
            <SearchResultBoundary search={debouncedValue} />
          )}
        </CustomCard>
      </div>
    </CustomCard>
  )
}

const ErrorComponent = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="space-y-2">
      <p className="text-destructive">خطایی در دریافت اطلاعات رخ داد.</p>
      <Button type="button" variant={'outline'} onClick={onRetry}>
        <RotateCcwIcon />
        تلاش مجدد
      </Button>
    </div>
  )
}

const SearchResultBoundary = ({ search }: { search: string }) => {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      onReset={reset}
      resetKeys={[search]}
      fallbackRender={({ resetErrorBoundary }) => (
        <ErrorComponent onRetry={resetErrorBoundary} />
      )}
    >
      <ShowSearchResult search={search} />
    </ErrorBoundary>
  )
}

const ShowSearchResult = ({ search }: { search: string }) => {
  const searchMovieTvSeriesFn = useServerFn(searchMovieTvSeries)

  const { isPending, isError, data, isPlaceholderData } = useQuery({
    queryKey: ['movies-tvseries', { search }],
    queryFn({ signal }) {
      return searchMovieTvSeriesFn({ data: { search }, signal })
    },
    staleTime: Infinity,
    throwOnError: true,
    placeholderData: keepPreviousData,
  })

  if (isPending)
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    )

  if (isError) return null

  return (
    <div
      className={cn('max-h-64 scrollbar-thin space-y-2 overflow-auto', {
        'opacity-50': isPlaceholderData,
      })}
    >
      {data.length > 0 ? (
        data.map((searchItem) => {
          return (
            <div key={searchItem.id} className="rounded-md border p-2">
              <div className="flex items-start gap-2">
                <Avatar className="h-24 w-16 rounded-md!">
                  <AvatarImage
                    className="rounded-md!"
                    src={searchItem.posterPath ?? undefined}
                    alt={`${searchItem.originalTitle} poster`}
                  />
                  <AvatarFallback className="bg-primary rounded-md! text-xl font-medium text-white capitalize">
                    {searchItem.originalTitle[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p
                    className="truncate text-right font-medium"
                    dir="ltr"
                    title={searchItem.originalTitle}
                  >
                    {searchItem.originalTitle}
                  </p>
                  <div className="text-muted-foreground mt-2 flex items-center gap-1.5">
                    {searchItem.mediaType === 'movie' ? (
                      <FilmIcon className="size-5" />
                    ) : (
                      <TvIcon className="size-5" />
                    )}
                    {searchItem.mediaType === 'movie' ? 'فیلم' : 'سریال'}
                    <div>-</div>
                    <CalendarIcon className="size-5" />
                    {searchItem.releaseDate
                      ? new Date(searchItem.releaseDate).getFullYear()
                      : 'سال ساخت نامعلوم'}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5">
                    <ImdbIcon width={24} height={24} />
                    <div className="text-right" dir="ltr">
                      {Intl.NumberFormat().format(
                        parseFloat(searchItem.voteAverage.toFixed(1)),
                      )}{' '}
                      / 10
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      ) : (
        <p className="text-destructive">فیلم یا سریالی با این نام یافت نشد.</p>
      )}
    </div>
  )
}
