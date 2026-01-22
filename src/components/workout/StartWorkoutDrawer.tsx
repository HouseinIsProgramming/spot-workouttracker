import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useActiveWorkout } from '@/lib/data/hooks'
import { ALL_MUSCLE_GROUPS, FOCUS_PRESETS, type MuscleGroup } from '@/lib/data/types'

type StartWorkoutDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StartWorkoutDrawer({ open, onOpenChange }: StartWorkoutDrawerProps) {
  const navigate = useNavigate()
  const { startWorkout } = useActiveWorkout()
  const [search, setSearch] = useState('')
  const [selectedFocus, setSelectedFocus] = useState<MuscleGroup[]>([])

  const suggestions = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return []

    const results: { label: string; muscles: MuscleGroup[] }[] = []

    // Check presets
    for (const [name, muscles] of Object.entries(FOCUS_PRESETS)) {
      if (name.includes(query)) {
        results.push({ label: name, muscles })
      }
    }

    // Check individual muscles
    for (const muscle of ALL_MUSCLE_GROUPS) {
      if (muscle.includes(query) && !selectedFocus.includes(muscle)) {
        results.push({ label: muscle, muscles: [muscle] })
      }
    }

    return results.slice(0, 5)
  }, [search, selectedFocus])

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedFocus((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    )
  }

  const addMuscles = (muscles: MuscleGroup[]) => {
    setSelectedFocus((prev) => {
      const newSet = new Set([...prev, ...muscles])
      return Array.from(newSet)
    })
    setSearch('')
  }

  const handleStart = () => {
    startWorkout(selectedFocus)
    onOpenChange(false)
    setSelectedFocus([])
    setSearch('')
    navigate({ to: '/workout' })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader>
          <DrawerTitle>What are you training today?</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Type to search (e.g., push, shoulders)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map(({ label, muscles }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => addMuscles(muscles)}
                  className="capitalize"
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          {/* Selected focus */}
          {selectedFocus.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Training:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFocus.map((muscle) => (
                  <Badge
                    key={muscle}
                    variant="default"
                    className="capitalize cursor-pointer"
                    onClick={() => toggleMuscle(muscle)}
                  >
                    {muscle}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick presets (shown when no search) */}
          {!search && selectedFocus.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Quick start:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(FOCUS_PRESETS).slice(0, 6).map(([name, muscles]) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => addMuscles(muscles)}
                    className="capitalize"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            size="lg"
            className="w-full h-12"
            onClick={handleStart}
          >
            Start Workout
            {selectedFocus.length > 0 && ` (${selectedFocus.length} groups)`}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
