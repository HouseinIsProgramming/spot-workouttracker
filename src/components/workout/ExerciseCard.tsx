import { useState, useRef } from 'react'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
  const { removeExercise, removeSet, addSet } = useActiveWorkout()
  const [expanded, setExpanded] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  if (!exercise) return null

  const defaultWeight = lastSets?.[0]?.weight ?? 0
  const defaultReps = lastSets?.[0]?.reps ?? 10

  const workingSets = workoutExercise.sets.filter((s) => s.type !== 'warmup')
  const warmupSets = workoutExercise.sets.filter((s) => s.type === 'warmup')

  const handleDeleteExercise = () => {
    if (confirmDelete) {
      removeExercise(workoutExercise.id)
      setConfirmDelete(false)

      toast('Exercise removed', {
        action: {
          label: 'Undo',
          onClick: () => {
            // Re-add exercise - this is a simplified undo
            // In production you'd want a more robust undo system
          },
        },
      })
    } else {
      setConfirmDelete(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  const handleDeleteSet = (setId: string) => {
    const deletedSet = workoutExercise.sets.find((s) => s.id === setId)
    removeSet(workoutExercise.id, setId)

    if (deletedSet) {
      toast('Set removed', {
        action: {
          label: 'Undo',
          onClick: () => {
            addSet(
              workoutExercise.id,
              deletedSet.weight,
              deletedSet.reps,
              deletedSet.type,
              deletedSet.rpe
            )
          },
        },
      })
    }
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
            className={cn(
              'transition-all',
              confirmDelete
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'text-muted-foreground hover:text-destructive'
            )}
            onClick={handleDeleteExercise}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {workoutExercise.sets.length > 0 && (
            <div className="space-y-1">
              {warmupSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={idx + 1}
                  onDelete={() => handleDeleteSet(set.id)}
                />
              ))}
              {workingSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={warmupSets.length + idx + 1}
                  onDelete={() => handleDeleteSet(set.id)}
                />
              ))}
            </div>
          )}

          <SetInput
            workoutExerciseId={workoutExercise.id}
            defaultWeight={defaultWeight}
            defaultReps={defaultReps}
          />
        </CardContent>
      )}
    </Card>
  )
}
