import { cn } from '@/lib/utils'
import { useMuscleStatus } from '@/lib/data/hooks'
import type { MuscleGroup, MuscleStatus } from '@/lib/data/types'

const muscleLabels: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs',
  core: 'Core',
  glutes: 'Glutes',
}

const statusConfig: Record<MuscleStatus, { bg: string; bar: string; label: string; sortOrder: number }> = {
  'cold': { bg: 'bg-muted/30', bar: 'bg-blue-400', label: 'Train now', sortOrder: 0 },
  'ready': { bg: 'bg-green-500/10', bar: 'bg-green-500', label: 'Ready', sortOrder: 1 },
  'recovering': { bg: 'bg-orange-500/10', bar: 'bg-orange-400', label: 'Recovering', sortOrder: 2 },
  'too-recent': { bg: 'bg-red-500/10', bar: 'bg-red-400', label: 'Rest', sortOrder: 3 },
}

// Calculate soreness percentage (0-100) based on hours since last workout
function getSorenessPercent(hoursSince: number | null, status: MuscleStatus): number {
  if (hoursSince === null) return 0 // Never trained = no soreness
  if (status === 'cold') return 5 // 5+ days = minimal
  if (status === 'ready') return 25 // Ready = low
  if (status === 'recovering') return 60 // Recovering = medium
  // too-recent: scale from 60-100 based on how recent (0-24h)
  const recentPercent = Math.max(0, 100 - (hoursSince / 24) * 40)
  return Math.min(100, recentPercent)
}

export function MuscleStatusGrid() {
  const muscleStatus = useMuscleStatus()

  // Sort by soreness (least sore first)
  const sortedMuscles = Object.entries(muscleStatus).sort(([, a], [, b]) => {
    const orderDiff = statusConfig[a.status].sortOrder - statusConfig[b.status].sortOrder
    if (orderDiff !== 0) return orderDiff
    // Within same status, sort by hours (more hours = less sore = first)
    return (b.hoursSince ?? Infinity) - (a.hoursSince ?? Infinity)
  })

  return (
    <div className="space-y-3">
      {/* Muscle cards in a cleaner 2-column layout for readability */}
      <div className="grid grid-cols-2 gap-2">
        {sortedMuscles.map(([muscle, { status, hoursSince }]) => (
          <MuscleStatusCard
            key={muscle}
            muscle={muscle as MuscleGroup}
            status={status}
            hoursSince={hoursSince}
          />
        ))}
      </div>

      {/* Legend - always visible for clarity */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground pt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Ready
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Recovering
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Rest
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          5+ days
        </span>
      </div>
    </div>
  )
}

function MuscleStatusCard({
  muscle,
  status,
  hoursSince,
}: {
  muscle: MuscleGroup
  status: MuscleStatus
  hoursSince: number | null
}) {
  const formatTime = (hours: number | null) => {
    if (hours === null) return '—'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const config = statusConfig[status]
  const sorenessPercent = getSorenessPercent(hoursSince, status)

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors',
        config.bg
      )}
    >
      {/* Muscle name and time */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{muscleLabels[muscle]}</span>
        <span className="text-[11px] text-muted-foreground">
          {hoursSince !== null ? formatTime(hoursSince) : 'Never trained'}
        </span>
      </div>

      {/* Soreness bar */}
      <div className="w-1.5 h-8 bg-muted/50 rounded-full overflow-hidden flex flex-col-reverse flex-shrink-0">
        <div
          className={cn('w-full rounded-full transition-all', config.bar)}
          style={{ height: `${sorenessPercent}%` }}
        />
      </div>
    </div>
  )
}
