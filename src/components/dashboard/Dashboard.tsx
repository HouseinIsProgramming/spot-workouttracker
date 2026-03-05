import { Link } from '@tanstack/react-router'
import { Play, ArrowRight, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MuscleStatusGrid } from './MuscleStatusGrid'
import { RecentWorkouts } from './RecentWorkouts'
import { useActiveWorkout } from '@/lib/data/hooks'
import { StartWorkoutDrawer } from '@/components/workout/StartWorkoutDrawer'
import { useState } from 'react'

export function Dashboard() {
  const { isActive, workout } = useActiveWorkout()
  const [showStartDrawer, setShowStartDrawer] = useState(false)

  // Calculate active workout duration if exists
  const activeDuration = workout
    ? Math.floor((Date.now() - workout.startedAt) / 60000)
    : 0

  return (
    <div className="p-4 pb-nav-safe-xl space-y-6">
      {/* Active workout banner */}
      {isActive && (
        <section className="pt-2">
          <Link to="/workout" className="block">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-primary font-medium uppercase tracking-wider">
                    Workout in progress
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {workout?.exercises.length || 0} exercises · {activeDuration}m elapsed
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <Button size="lg" className="w-full h-12">
                Continue Workout
              </Button>
            </div>
          </Link>
        </section>
      )}

      {/* Muscle Recovery Status */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recovery Status
        </h2>
        <MuscleStatusGrid />
      </section>

      {/* Recent Workouts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Activity
          </h2>
          <Link
            to="/history"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <RecentWorkouts limit={3} />
      </section>

      <StartWorkoutDrawer
        open={showStartDrawer}
        onOpenChange={setShowStartDrawer}
      />

      {/* Fixed bottom Start Workout button - above nav bar */}
      {!isActive && (
        <div
          className="fixed bottom-nav-safe left-0 right-0 p-4 bg-gradient-to-t from-background/90 via-background/60 to-transparent"
        >
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-xl shadow-lg"
            onClick={() => setShowStartDrawer(true)}
          >
            <Play className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        </div>
      )}
    </div>
  )
}
