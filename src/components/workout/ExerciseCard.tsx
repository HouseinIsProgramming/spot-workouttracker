import { useState, useRef } from 'react'
import { X, ChevronDown, History, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useExercise, useLastExerciseSets, useActiveWorkout, useExercisePRs, useExerciseHistory } from '@/lib/data/hooks'
import { SetInput } from './SetInput'
import { SetRow } from './SetRow'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { WorkoutExercise } from '@/lib/data/types'

type ExerciseCardProps = {
  workoutExercise: WorkoutExercise
  index: number
}

export function ExerciseCard({ workoutExercise, index }: ExerciseCardProps) {
  const exercise = useExercise(workoutExercise.exerciseId)
  const lastSets = useLastExerciseSets(workoutExercise.exerciseId)
  const prs = useExercisePRs(workoutExercise.exerciseId)
  const history = useExerciseHistory(workoutExercise.exerciseId)
  const { removeExercise, restoreExercise, removeSet, addSet, updateSet, toggleSetCompletion } = useActiveWorkout()
  const [expanded, setExpanded] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
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

        {/* History button */}
        <button
          type="button"
          onClick={() => setShowHistory(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex-shrink-0"
        >
          <History className="h-4 w-4" />
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
                  onToggleComplete={() => toggleSetCompletion(workoutExercise.id, set.id)}
                />
              ))}
              {workingSets.map((set, idx) => (
                <SetRow
                  key={set.id}
                  set={set}
                  index={warmupSets.length + idx + 1}
                  onDelete={() => handleDeleteSet(set.id)}
                  onUpdate={(updates) => updateSet(workoutExercise.id, set.id, updates)}
                  onToggleComplete={() => toggleSetCompletion(workoutExercise.id, set.id)}
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

      {/* History Drawer */}
      <Drawer open={showHistory} onOpenChange={setShowHistory}>
        <DrawerContent className="max-h-[85dvh] flex flex-col">
          <DrawerHeader className="pb-2 flex-shrink-0">
            <DrawerTitle className="text-base">{exercise.name} History</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-6 safe-area-pb space-y-4">
            {/* PRs Section */}
            {prs.maxWeight > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Personal Records
                </p>
                <div className="space-y-1.5">
                  {/* Max Weight */}
                  <div className="flex items-center gap-2 bg-yellow-500/10 rounded-lg px-3 py-2 border border-yellow-500/20">
                    <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium w-20">Max</span>
                    <span className="font-bold tabular-nums">{prs.maxWeight}kg × {prs.maxWeightReps}</span>
                  </div>
                  {/* Strength (1-5 reps) */}
                  {prs.strength.weight > 0 && (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground font-medium w-20">1-5 reps</span>
                      <span className="font-semibold tabular-nums">{prs.strength.weight}kg × {prs.strength.reps}</span>
                    </div>
                  )}
                  {/* Hypertrophy (6-12 reps) */}
                  {prs.hypertrophy.weight > 0 && (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground font-medium w-20">6-12 reps</span>
                      <span className="font-semibold tabular-nums">{prs.hypertrophy.weight}kg × {prs.hypertrophy.reps}</span>
                    </div>
                  )}
                  {/* Endurance (12+ reps) */}
                  {prs.endurance.weight > 0 && (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <Trophy className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground font-medium w-20">12+ reps</span>
                      <span className="font-semibold tabular-nums">{prs.endurance.weight}kg × {prs.endurance.reps}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent History */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Workouts
              </p>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.slice(0, 5).map((entry) => (
                    <div key={entry.workout.id} className="bg-muted/30 rounded-xl p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.workout.completedAt ?? entry.workout.startedAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {entry.workoutExercise.sets.map((set, i) => (
                          <span
                            key={i}
                            className={cn(
                              'px-2 py-1 rounded-lg text-sm tabular-nums',
                              set.type === 'warmup'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-card border border-border/50'
                            )}
                          >
                            {set.weight}kg × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No previous history for this exercise
                </p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
