import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card.tsx'
import type { ReactNode } from 'react'

export const CustomCard = ({
  title,
  description,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}) => {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
    </Card>
  )
}
