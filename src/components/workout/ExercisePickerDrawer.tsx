import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useExerciseSearch, useRecentExerciseIds, useActiveWorkout } from '@/lib/data/hooks'
import type { MuscleGroup } from '@/lib/data/types'

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
  const recentExerciseIds = useRecentExerciseIds()
  const { addExercise } = useActiveWorkout()

  const searchResults = useExerciseSearch({
    query,
    workoutFocus,
    exercisesInWorkout,
    recentExerciseIds,
  })

  const handleSelect = (exerciseId: string) => {
    addExercise(exerciseId)
    onOpenChange(false)
    setQuery('')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader>
          <DrawerTitle>Add Exercise</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 pb-4">
          <div className="space-y-1">
            {searchResults.map((exercise) => {
              const isInWorkout = exercisesInWorkout.includes(exercise.id)

              return (
                <button
                  key={exercise.id}
                  onClick={() => !isInWorkout && handleSelect(exercise.id)}
                  disabled={isInWorkout}
                  className={`
                    w-full text-left p-3 rounded-lg transition-colors
                    ${isInWorkout
                      ? 'opacity-50 cursor-not-allowed bg-muted'
                      : 'hover:bg-accent active:bg-accent/80'
                    }
                  `}
                >
                  <div className="font-medium">{exercise.name}</div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {exercise.muscleGroups.map((muscle) => (
                      <Badge
                        key={muscle}
                        variant={workoutFocus.includes(muscle) ? 'default' : 'outline'}
                        className="text-[10px] capitalize h-5"
                      >
                        {muscle}
                      </Badge>
                    ))}
                    {exercise.equipment && (
                      <Badge variant="secondary" className="text-[10px] capitalize h-5">
                        {exercise.equipment}
                      </Badge>
                    )}
                    {isInWorkout && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Added
                      </Badge>
                    )}
                  </div>
                </button>
              )
            })}
            {searchResults.length === 0 && query && (
              <div className="text-center py-8 text-muted-foreground">
                No exercises found for "{query}"
              </div>
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
