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

const statusConfig: Record<MuscleStatus, { bg: string; dot: string; label: string }> = {
  'cold': { bg: 'bg-muted/50', dot: 'bg-blue-400', label: 'Train now' },
  'ready': { bg: 'bg-green-500/10', dot: 'bg-green-500', label: 'Ready' },
  'recovering': { bg: 'bg-orange-500/10', dot: 'bg-orange-400', label: 'Recovering' },
  'too-recent': { bg: 'bg-red-500/10', dot: 'bg-red-400', label: 'Rest' },
}

export function MuscleStatusGrid() {
  const muscleStatus = useMuscleStatus()

  return (
    <div className="space-y-3">
      {/* Muscle cards in a cleaner 2-column layout for readability */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(muscleStatus).map(([muscle, { status, hoursSince }]) => (
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

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors',
        config.bg
      )}
    >
      {/* Status dot */}
      <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', config.dot)} />

      {/* Muscle name and time */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium block">{muscleLabels[muscle]}</span>
        <span className="text-[11px] text-muted-foreground">
          {hoursSince !== null ? formatTime(hoursSince) : 'Never trained'}
        </span>
      </div>
    </div>
  )
}
