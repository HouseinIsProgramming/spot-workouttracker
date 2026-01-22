import { Link, useNavigate } from '@tanstack/react-router'
import { Calendar, Dumbbell, RotateCcw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWorkouts, calculateWorkoutVolume, useActiveWorkout } from '@/lib/data/hooks'
import type { Workout } from '@/lib/data/types'

export function HistoryPage() {
  const navigate = useNavigate()
  const workouts = useWorkouts().filter((w) => w.completedAt)
  const { isActive, workout: activeWorkout, startWorkout, addExercise } = useActiveWorkout()

  // Group workouts by week
  const groupedWorkouts = workouts.reduce(
    (groups, workout) => {
      const date = new Date(workout.startedAt)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!groups[weekKey]) {
        groups[weekKey] = []
      }
      groups[weekKey].push(workout)
      return groups
    },
    {} as Record<string, typeof workouts>
  )

  const sortedWeeks = Object.keys(groupedWorkouts).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  // Repeat workout - start new workout with same exercises
  const handleRepeatWorkout = (workout: Workout) => {
    if (isActive) {
      // Add exercises to current workout
      workout.exercises.forEach((we) => addExercise(we.exerciseId))
    } else {
      // Start new workout with same focus
      startWorkout(workout.focus)
      workout.exercises.forEach((we) => addExercise(we.exerciseId))
    }
    navigate({ to: '/workout' })
  }

  // Count total PRs in a workout
  const countPRs = (workout: Workout) => {
    return workout.exercises.reduce((total, we) => {
      return total + we.sets.filter((s) => s.prs && s.prs.length > 0).length
    }, 0)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-lg font-semibold">History</h1>
        <p className="text-sm text-muted-foreground">
          {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
        </p>
      </header>

      {/* Active workout banner */}
      {isActive && activeWorkout && (
        <Link to="/workout">
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-primary font-medium uppercase tracking-wider">
                Active Workout
              </p>
              <p className="text-sm">
                {activeWorkout.focus.length > 0
                  ? activeWorkout.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
                  : 'Freestyle'}
              </p>
            </div>
            <span className="text-xs text-primary font-medium">Continue →</span>
          </div>
        </Link>
      )}

      {/* Empty state */}
      {workouts.length === 0 ? (
        <div className="bg-muted/30 rounded-xl p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No completed workouts yet</p>
        </div>
      ) : (
        sortedWeeks.map((weekKey) => {
          const weekWorkouts = groupedWorkouts[weekKey]
          const weekStart = new Date(weekKey)
          const weekLabel = weekStart.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })

          return (
            <section key={weekKey}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Week of {weekLabel}
              </h2>
              <div className="space-y-2">
                {weekWorkouts.map((workout, idx) => {
                  const volume = calculateWorkoutVolume(workout)
                  const date = new Date(workout.startedAt)
                  const duration = workout.completedAt
                    ? Math.round((workout.completedAt - workout.startedAt) / 60000)
                    : 0
                  const prCount = countPRs(workout)
                  const isFirstInList = weekKey === sortedWeeks[0] && idx === 0

                  const focusLabel =
                    workout.focus.length > 0
                      ? workout.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
                      : 'Freestyle'

                  return (
                    <div
                      key={workout.id}
                      className={cn(
                        'bg-card rounded-xl border border-border/50 overflow-hidden',
                        isFirstInList && 'ring-1 ring-primary/20'
                      )}
                    >
                      <Link to="/history/$id" params={{ id: workout.id }}>
                        <div className="p-4 flex items-center gap-3">
                          {/* Date column */}
                          <div className="w-12 text-center flex-shrink-0">
                            <span className="text-lg font-bold">{date.getDate()}</span>
                            <span className="text-[10px] text-muted-foreground block uppercase">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>

                          {/* Main info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{focusLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {workout.exercises.length} exercises · {duration}m · {(volume / 1000).toFixed(1)}k kg
                            </p>
                          </div>

                          {/* PR badge */}
                          {prCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs">
                              <Trophy className="h-3 w-3" />
                              {prCount}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Repeat button for most recent workout */}
                      {isFirstInList && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleRepeatWorkout(workout)
                          }}
                          className="w-full py-2.5 border-t border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Repeat this workout
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
