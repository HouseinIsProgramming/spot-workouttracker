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

const statusColors: Record<MuscleStatus, string> = {
  'cold': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  'ready': 'bg-green-500/20 text-green-500 border-green-500/30',
  'recovering': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
  'too-recent': 'bg-red-500/20 text-red-500 border-red-500/30',
}

const statusLabels: Record<MuscleStatus, string> = {
  'cold': '5+ days',
  'ready': 'Ready',
  'recovering': 'Rest',
  'too-recent': 'Recent',
}

export function MuscleStatusGrid() {
  const muscleStatus = useMuscleStatus()

  return (
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(muscleStatus).map(([muscle, { status, hoursSince }]) => (
        <MuscleStatusCard
          key={muscle}
          muscle={muscle as MuscleGroup}
          status={status}
          hoursSince={hoursSince}
        />
      ))}
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
    if (hours === null) return 'Never'
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-2 rounded-lg border transition-colors',
        statusColors[status]
      )}
    >
      <span className="text-xs font-medium truncate w-full text-center">
        {muscleLabels[muscle]}
      </span>
      <span className="text-[10px] opacity-80">
        {hoursSince !== null ? formatTime(hoursSince) : statusLabels[status]}
      </span>
    </div>
  )
}
