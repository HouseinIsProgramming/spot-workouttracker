import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useExercise, useLastExerciseSets, useActiveWorkout } from '@/lib/data/hooks'
import { SetInput } from './SetInput'
import { SetRow } from './SetRow'
import type { WorkoutExercise } from '@/lib/data/types'

type ExerciseCardProps = {
  workoutExercise: WorkoutExercise
}

export function ExerciseCard({ workoutExercise }: ExerciseCardProps) {
  const exercise = useExercise(workoutExercise.exerciseId)
  const lastSets = useLastExerciseSets(workoutExercise.exerciseId)
  const { removeExercise, removeSet } = useActiveWorkout()
  const [expanded, setExpanded] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [setToDelete, setSetToDelete] = useState<string | null>(null)

  if (!exercise) return null

  // Get default values from last workout
  const defaultWeight = lastSets?.[0]?.weight ?? 0
  const defaultReps = lastSets?.[0]?.reps ?? 10

  const workingSets = workoutExercise.sets.filter((s) => s.type !== 'warmup')
  const warmupSets = workoutExercise.sets.filter((s) => s.type === 'warmup')

  const handleDeleteExercise = () => {
    removeExercise(workoutExercise.id)
    setShowDeleteDialog(false)
  }

  const handleDeleteSet = (setId: string) => {
    removeSet(workoutExercise.id, setId)
    setSetToDelete(null)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-left w-full"
            >
              <h3 className="font-semibold truncate">{exercise.name}</h3>
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </button>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {workingSets.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {workingSets.length} set{workingSets.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {lastSets && (
                <span className="text-xs text-muted-foreground">
                  Last: {lastSets[0]?.weight}kg × {lastSets[0]?.reps}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {/* Logged sets */}
          {workoutExercise.sets.length > 0 && (
            <div className="space-y-1">
              {warmupSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={idx + 1}
                  onDelete={() => setSetToDelete(set.id)}
                />
              ))}
              {workingSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={warmupSets.length + idx + 1}
                  onDelete={() => setSetToDelete(set.id)}
                />
              ))}
            </div>
          )}

          {/* New set input */}
          <SetInput
            workoutExerciseId={workoutExercise.id}
            defaultWeight={defaultWeight}
            defaultReps={defaultReps}
          />
        </CardContent>
      )}

      {/* Delete exercise dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {exercise.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all logged sets for this exercise.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteExercise}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete set dialog */}
      <AlertDialog open={!!setToDelete} onOpenChange={() => setSetToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete set?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove this set from your workout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setToDelete && handleDeleteSet(setToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
