import { useState } from 'react'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useExercise, useExerciseHistory } from '@/lib/data/hooks'
import { isCustomExercise, deleteCustomExercise } from '@/lib/data/exercises'
import { ExerciseFormDrawer } from './ExerciseFormDrawer'
import { toast } from 'sonner'

export function ExerciseDetail() {
  const { id } = useParams({ from: '/exercises/$id' })
  const navigate = useNavigate()
  const exercise = useExercise(id)
  const history = useExerciseHistory(id)
  const [showEditDrawer, setShowEditDrawer] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isCustom = exercise ? isCustomExercise(exercise.id) : false

  const handleDelete = () => {
    if (confirmDelete) {
      deleteCustomExercise(id)
      toast.success('Exercise deleted')
      navigate({ to: '/exercises' })
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  if (!exercise) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Exercise not found</p>
        <Link to="/exercises">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate estimated 1RM from best set (Brzycki formula)
  const bestSet = history.flatMap((h) => h.workoutExercise.sets)
    .filter((s) => s.type !== 'warmup')
    .reduce(
      (best, set) => {
        const e1rm = set.weight * (36 / (37 - set.reps))
        return e1rm > best.e1rm ? { set, e1rm } : best
      },
      { set: null as (typeof history)[0]['workoutExercise']['sets'][0] | null, e1rm: 0 }
    )

  const totalSets = history.reduce(
    (sum, h) => sum + h.workoutExercise.sets.filter((s) => s.type !== 'warmup').length,
    0
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link to="/exercises">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{exercise.name}</h1>
            {isCustom && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Custom
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {exercise.muscleGroups.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="capitalize text-xs">
                {muscle}
              </Badge>
            ))}
            {exercise.equipment && (
              <Badge variant="outline" className="capitalize text-xs">
                {exercise.equipment}
              </Badge>
            )}
          </div>
        </div>
        {isCustom && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditDrawer(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className={confirmDelete ? 'text-destructive' : ''}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{history.length}</p>
            <p className="text-xs text-muted-foreground">workouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{totalSets}</p>
            <p className="text-xs text-muted-foreground">total sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">
              {bestSet.e1rm > 0 ? Math.round(bestSet.e1rm) : '-'}
            </p>
            <p className="text-xs text-muted-foreground">est. 1RM (kg)</p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          History
        </h2>
        {history.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No history yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.map(({ workout, workoutExercise }) => {
              const date = new Date(workout.startedAt)
              const workingSets = workoutExercise.sets.filter(
                (s) => s.type !== 'warmup'
              )
              const bestInWorkout = Math.max(...workingSets.map((s) => s.weight))

              return (
                <Link
                  key={workout.id}
                  to="/history/$id"
                  params={{ id: workout.id }}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {workingSets.length} sets • {bestInWorkout}kg max
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {workoutExercise.sets.map((set) => (
                          <Badge
                            key={set.id}
                            variant={set.type === 'warmup' ? 'outline' : 'secondary'}
                            className="text-xs"
                          >
                            {set.weight}×{set.reps}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Edit Drawer */}
      <ExerciseFormDrawer
        open={showEditDrawer}
        onOpenChange={setShowEditDrawer}
        exercise={exercise}
      />
    </div>
  )
}
