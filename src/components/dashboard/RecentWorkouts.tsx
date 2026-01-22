import { Link } from '@tanstack/react-router'
import { useWorkouts, calculateWorkoutVolume } from '@/lib/data/hooks'
import { Dumbbell } from 'lucide-react'

export function RecentWorkouts({ limit = 3 }: { limit?: number }) {
  const workouts = useWorkouts()
  const recentWorkouts = workouts
    .filter((w) => w.completedAt)
    .slice(0, limit)

  if (recentWorkouts.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl p-6 text-center">
        <Dumbbell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No workouts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recentWorkouts.map((workout) => {
        const volume = calculateWorkoutVolume(workout)
        const date = new Date(workout.startedAt)
        const isToday = new Date().toDateString() === date.toDateString()
        const isYesterday =
          new Date(Date.now() - 86400000).toDateString() === date.toDateString()

        const dateLabel = isToday
          ? 'Today'
          : isYesterday
            ? 'Yesterday'
            : date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })

        const focusLabel =
          workout.focus.length > 0
            ? workout.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
            : 'Freestyle'

        return (
          <Link key={workout.id} to="/history/$id" params={{ id: workout.id }}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              {/* Date column */}
              <div className="w-14 text-center flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">{dateLabel}</span>
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{focusLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {workout.exercises.length} exercises · {(volume / 1000).toFixed(1)}k kg
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
