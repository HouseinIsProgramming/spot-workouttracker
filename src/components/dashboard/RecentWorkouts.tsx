import { Link } from '@tanstack/react-router'
import { useWorkouts, calculateWorkoutVolume } from '@/lib/data/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronRight } from 'lucide-react'

export function RecentWorkouts({ limit = 3 }: { limit?: number }) {
  const workouts = useWorkouts()
  const recentWorkouts = workouts
    .filter((w) => w.completedAt)
    .slice(0, limit)

  if (recentWorkouts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No workouts yet. Start your first one!
        </CardContent>
      </Card>
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

        return (
          <Link key={workout.id} to="/history/$id" params={{ id: workout.id }}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {workout.focus.map((muscle) => (
                      <Badge key={muscle} variant="secondary" className="text-xs capitalize">
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{dateLabel}</span>
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
  )
}
