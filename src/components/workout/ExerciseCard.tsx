import { useState, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useExercise, useLastExerciseSets, useActiveWorkout } from '@/lib/data/hooks'
import { SetInput } from './SetInput'
import { SetRow } from './SetRow'
import type { WorkoutExercise } from '@/lib/data/types'

type ExerciseCardProps = {
  workoutExercise: WorkoutExercise
  index: number
}

export function ExerciseCard({ workoutExercise, index }: ExerciseCardProps) {
  const exercise = useExercise(workoutExercise.exerciseId)
  const lastSets = useLastExerciseSets(workoutExercise.exerciseId)
  const { removeExercise, restoreExercise, removeSet, addSet, updateSet } = useActiveWorkout()
  const [expanded, setExpanded] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  if (!exercise) return null

  const defaultWeight = lastSets?.[0]?.weight ?? 0
  const defaultReps = lastSets?.[0]?.reps ?? 10

  const workingSets = workoutExercise.sets.filter((s) => s.type !== 'warmup')
  const warmupSets = workoutExercise.sets.filter((s) => s.type === 'warmup')
  const totalSets = workoutExercise.sets.length

  const handleDeleteExercise = () => {
    if (confirmDelete) {
      // Save for undo before removing
      const savedExercise = { ...workoutExercise }
      const savedIndex = index

      removeExercise(workoutExercise.id)
      setConfirmDelete(false)

      toast('Exercise removed', {
        action: {
          label: 'Undo',
          onClick: () => {
            restoreExercise(savedExercise, savedIndex)
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
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header - always visible */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 transition-colors',
          expanded ? 'border-b border-border/50' : ''
        )}
      >
        {/* Exercise info - tap to collapse */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 text-left"
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {totalSets > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {workingSets.length} working{warmupSets.length > 0 ? ` + ${warmupSets.length}W` : ''}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">No sets yet</span>
              )}
              {lastSets && lastSets[0] && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground">
                    Last: {lastSets[0].weight}kg × {lastSets[0].reps}
                  </span>
                </>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              expanded ? 'rotate-180' : ''
            )}
          />
        </button>

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDeleteExercise}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all flex-shrink-0',
            confirmDelete
              ? 'bg-destructive text-destructive-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div className="p-4 pt-3 space-y-3">
          {/* Logged sets */}
          {totalSets > 0 && (
            <div className="space-y-1">
              {warmupSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={idx + 1}
                  onDelete={() => handleDeleteSet(set.id)}
                  onUpdate={(updates) => updateSet(workoutExercise.id, set.id, updates)}
                />
              ))}
              {workingSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={warmupSets.length + idx + 1}
                  onDelete={() => handleDeleteSet(set.id)}
                  onUpdate={(updates) => updateSet(workoutExercise.id, set.id, updates)}
                />
              ))}
            </div>
          )}

          {/* Input for new set */}
          <SetInput
            workoutExerciseId={workoutExercise.id}
            exerciseId={workoutExercise.exerciseId}
            defaultWeight={defaultWeight}
            defaultReps={defaultReps}
          />
        </div>
      )}
    </div>
  )
}
