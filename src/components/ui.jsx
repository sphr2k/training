import { cn } from '../lib/utils.js'

export function Card({ className, children }) {
  return <section className={cn('card', className)}>{children}</section>
}

export function CardHeader({ className, children }) {
  return <div className={cn('card-header', className)}>{children}</div>
}

export function CardContent({ className, children }) {
  return <div className={cn('card-content', className)}>{children}</div>
}

export function Badge({ className, children }) {
  return <span className={cn('badge', className)}>{children}</span>
}

export function Separator({ className }) {
  return <div className={cn('separator', className)} />
}
