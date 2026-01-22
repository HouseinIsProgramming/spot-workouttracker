import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X, Play } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">Start Workout</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search muscles or presets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map(({ label, muscles }) => (
                <button
                  key={label}
                  onClick={() => addMuscles(muscles)}
                  className="px-3 py-1.5 rounded-lg bg-muted/50 text-sm capitalize hover:bg-muted transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Selected focus */}
          {selectedFocus.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Training today
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedFocus.map((muscle) => (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(muscle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm capitalize"
                  >
                    {muscle}
                    <X className="h-3.5 w-3.5 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick presets (shown when no search and no selection) */}
          {!search && selectedFocus.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick start
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(FOCUS_PRESETS).slice(0, 6).map(([name, muscles]) => (
                  <button
                    key={name}
                    onClick={() => addMuscles(muscles)}
                    className="px-3 py-2.5 rounded-xl bg-muted/50 text-sm capitalize hover:bg-muted transition-colors text-center"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            size="lg"
            className={cn(
              'w-full h-12 rounded-xl',
              selectedFocus.length === 0 && 'bg-muted text-muted-foreground hover:bg-muted'
            )}
            onClick={handleStart}
          >
            <Play className="mr-2 h-4 w-4" />
            {selectedFocus.length > 0
              ? `Start ${selectedFocus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')}`
              : 'Start Freestyle'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
