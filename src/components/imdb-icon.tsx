import imdb from '#/icons/imdb.svg'
import type { ComponentProps } from 'react'

export const ImdbIcon = (props: ComponentProps<'img'>) => (
  <img src={imdb} alt={imdb} {...props} />
)
