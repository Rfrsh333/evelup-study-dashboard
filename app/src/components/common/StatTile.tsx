import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatTileProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
}

export function StatTile({ label, value, icon: Icon, trend, className }: StatTileProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-sm font-medium',
              trend.positive ? 'text-green-500' : 'text-red-500'
            )}
          >
            {trend.positive ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
    </div>
  )
}
