import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useExerciseSearch, useRecentExerciseIds } from '@/lib/data/hooks'
import { isCustomExercise } from '@/lib/data/exercises'
import { ALL_MUSCLE_GROUPS, type MuscleGroup } from '@/lib/data/types'
import { ExerciseFormDrawer } from './ExerciseFormDrawer'

export function ExercisesPage() {
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const recentExerciseIds = useRecentExerciseIds()

  const searchResults = useExerciseSearch({
    query,
    workoutFocus: selectedMuscle ? [selectedMuscle] : undefined,
    recentExerciseIds,
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      <div className="p-4 space-y-3 border-b">
        <header className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Exercise Library</h1>
          <button
            type="button"
            onClick={() => setShowCreateDrawer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Muscle filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          <Badge
            variant={selectedMuscle === null ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setSelectedMuscle(null)}
          >
            All
          </Badge>
          {ALL_MUSCLE_GROUPS.map((muscle) => (
            <Badge
              key={muscle}
              variant={selectedMuscle === muscle ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap capitalize"
              onClick={() =>
                setSelectedMuscle(selectedMuscle === muscle ? null : muscle)
              }
            >
              {muscle}
            </Badge>
          ))}
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {searchResults.length === 0 ? (
            <div className="bg-muted/30 rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-3">No exercises found</p>
              <button
                type="button"
                onClick={() => setShowCreateDrawer(true)}
                className="text-sm text-primary hover:underline"
              >
                Create "{query}"
              </button>
            </div>
          ) : (
            searchResults.map((exercise) => {
              const isCustom = isCustomExercise(exercise.id)
              return (
                <Link
                  key={exercise.id}
                  to="/exercises/$id"
                  params={{ id: exercise.id }}
                >
                  <div className="bg-card rounded-xl border border-border/50 p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{exercise.name}</p>
                        {isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {exercise.muscleGroups
                          .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
                          .join(', ')}
                        {exercise.equipment && ` · ${exercise.equipment}`}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Create Exercise Drawer */}
      <ExerciseFormDrawer
        open={showCreateDrawer}
        onOpenChange={setShowCreateDrawer}
      />
    </div>
  )
}
