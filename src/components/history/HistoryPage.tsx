import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWorkouts, calculateWorkoutVolume } from '@/lib/data/hooks'

export function HistoryPage() {
  const workouts = useWorkouts().filter((w) => w.completedAt)

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

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Workout History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {workouts.length} total workouts
        </p>
      </header>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No completed workouts yet. Start your first one!
          </CardContent>
        </Card>
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
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                Week of {weekLabel}
              </h2>
              <div className="space-y-2">
                {weekWorkouts.map((workout) => {
                  const volume = calculateWorkoutVolume(workout)
                  const date = new Date(workout.startedAt)
                  const duration = workout.completedAt
                    ? Math.round((workout.completedAt - workout.startedAt) / 60000)
                    : 0

                  return (
                    <Link
                      key={workout.id}
                      to="/history/$id"
                      params={{ id: workout.id }}
                    >
                      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                        <CardContent className="py-3 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {workout.focus.map((muscle) => (
                                <Badge
                                  key={muscle}
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {muscle}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span>
                                {date.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span>•</span>
                              <span>{duration}min</span>
                              <span>•</span>
                              <span>{workout.exercises.length} exercises</span>
                              <span>•</span>
                              <span>{(volume / 1000).toFixed(1)}k kg</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        </CardContent>
                      </Card>
                    </Link>
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
