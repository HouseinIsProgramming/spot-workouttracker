import { useState } from 'react'
import { Search, Check, Dumbbell, Plus } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { useExerciseSearch, useRecentExerciseIds, useActiveWorkout } from '@/lib/data/hooks'
import { ExerciseFormDrawer } from '@/components/exercises/ExerciseFormDrawer'
import type { MuscleGroup, Exercise } from '@/lib/data/types'

type ExercisePickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workoutFocus: MuscleGroup[]
  exercisesInWorkout: string[]
}

export function ExercisePickerDrawer({
  open,
  onOpenChange,
  workoutFocus,
  exercisesInWorkout,
}: ExercisePickerDrawerProps) {
  const [query, setQuery] = useState('')
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const recentExerciseIds = useRecentExerciseIds()
  const { addExercise } = useActiveWorkout()

  const searchResults = useExerciseSearch({
    query,
    workoutFocus,
    exercisesInWorkout,
    recentExerciseIds,
  })

  // Check if we should show "Create" button prominently
  // Show it when: query exists AND (no results OR no close name match)
  const hasQuery = query.trim().length > 0
  const hasCloseMatch = hasQuery && searchResults.some((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(e.name.toLowerCase())
  )
  const showCreateProminent = hasQuery && (!hasCloseMatch || searchResults.length === 0)

  const handleSelect = (exerciseId: string) => {
    addExercise(exerciseId)
    onOpenChange(false)
    setQuery('')
  }

  const handleCreateExercise = (exercise: Exercise) => {
    addExercise(exercise.id)
    setShowCreateDrawer(false)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh] flex flex-col">
        <DrawerHeader className="pb-2 flex-shrink-0">
          <DrawerTitle className="text-base">Add Exercise</DrawerTitle>
        </DrawerHeader>

        {/* Search input */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 safe-area-pb">
          <div className="space-y-1">
            {/* Prominent "Create" button when no good matches */}
            {showCreateProminent && (
              <button
                type="button"
                onClick={() => setShowCreateDrawer(true)}
                className="w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 bg-primary/10 hover:bg-primary/20 active:bg-primary/25 border border-primary/20 mb-2"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/20">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-primary">Create "{query}"</div>
                  <div className="text-xs text-muted-foreground">
                    Add as new exercise
                  </div>
                </div>
              </button>
            )}

            {searchResults.map((exercise) => {
              const isInWorkout = exercisesInWorkout.includes(exercise.id)
              const matchesFocus = exercise.muscleGroups.some((m) =>
                workoutFocus.includes(m)
              )

              return (
                <button
                  key={exercise.id}
                  onClick={() => !isInWorkout && handleSelect(exercise.id)}
                  disabled={isInWorkout}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3',
                    isInWorkout
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted/50 active:bg-muted'
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      isInWorkout
                        ? 'bg-green-500/10'
                        : matchesFocus
                          ? 'bg-primary/10'
                          : 'bg-muted'
                    )}
                  >
                    {isInWorkout ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Dumbbell
                        className={cn(
                          'h-4 w-4',
                          matchesFocus ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    )}
                  </div>

                  {/* Exercise info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{exercise.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {exercise.muscleGroups.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                      {exercise.equipment && ` · ${exercise.equipment}`}
                    </div>
                  </div>
                </button>
              )
            })}
            {/* Create new option - shown at bottom when not prominent */}
            {!showCreateProminent && (
              <button
                type="button"
                onClick={() => setShowCreateDrawer(true)}
                className="w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 hover:bg-muted/50 active:bg-muted border-2 border-dashed border-border/50 mt-2"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">Create New Exercise</div>
                  <div className="text-xs text-muted-foreground">Add custom exercise</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </DrawerContent>

      {/* Create Exercise Drawer */}
      <ExerciseFormDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
        onSave={handleCreateExercise}
        defaultName={query}
      />
    </Drawer>
  )
}
