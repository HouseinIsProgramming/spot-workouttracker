import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useExerciseSearch, useRecentExerciseIds } from '@/lib/data/hooks'
import { ALL_MUSCLE_GROUPS, type MuscleGroup } from '@/lib/data/types'

export function ExercisesPage() {
  const [query, setQuery] = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | null>(null)
  const recentExerciseIds = useRecentExerciseIds()

  const searchResults = useExerciseSearch({
    query,
    workoutFocus: selectedMuscle ? [selectedMuscle] : undefined,
    recentExerciseIds,
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)]">
      <div className="p-4 space-y-3 border-b">
        <header>
          <h1 className="text-2xl font-bold">Exercise Library</h1>
        </header>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
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
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No exercises found
              </CardContent>
            </Card>
          ) : (
            searchResults.map((exercise) => (
              <Link
                key={exercise.id}
                to="/exercises/$id"
                params={{ id: exercise.id }}
              >
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {exercise.muscleGroups.map((muscle) => (
                          <Badge
                            key={muscle}
                            variant={
                              selectedMuscle === muscle ? 'default' : 'secondary'
                            }
                            className="text-[10px] capitalize h-5"
                          >
                            {muscle}
                          </Badge>
                        ))}
                        {exercise.equipment && (
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize h-5"
                          >
                            {exercise.equipment}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
