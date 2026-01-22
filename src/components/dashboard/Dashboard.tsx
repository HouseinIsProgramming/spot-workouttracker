import { Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MuscleStatusGrid } from './MuscleStatusGrid'
import { RecentWorkouts } from './RecentWorkouts'
import { useActiveWorkout } from '@/lib/data/hooks'
import { StartWorkoutDrawer } from '@/components/workout/StartWorkoutDrawer'
import { useState } from 'react'

export function Dashboard() {
  const { isActive } = useActiveWorkout()
  const [showStartDrawer, setShowStartDrawer] = useState(false)

  return (
    <div className="p-4 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Tracker</h1>
      </header>

      {/* Muscle Freshness Grid */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          Muscle Recovery Status
        </h2>
        <MuscleStatusGrid />
      </section>

      {/* Start Workout CTA */}
      <section>
        {isActive ? (
          <Link to="/workout" className="block">
            <Button size="lg" className="w-full h-14 text-lg">
              <Plus className="mr-2 h-5 w-5" />
              Continue Workout
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            className="w-full h-14 text-lg"
            onClick={() => setShowStartDrawer(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
        )}
      </section>

      {/* Recent Workouts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Recent Workouts
          </h2>
          <Link
            to="/history"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentWorkouts limit={3} />
      </section>

      <StartWorkoutDrawer
        open={showStartDrawer}
        onOpenChange={setShowStartDrawer}
      />
    </div>
  )
}
