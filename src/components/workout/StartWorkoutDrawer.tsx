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
import { useActiveWorkout, useMuscleStatus, useTemplates, usePresets } from '@/lib/data/hooks'
import { ALL_MUSCLE_GROUPS, type MuscleGroup, type MuscleStatus } from '@/lib/data/types'
import { FileText } from 'lucide-react'
import type { Id } from '../../../convex/_generated/dataModel'

type StartWorkoutDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors: Record<MuscleStatus, string> = {
  'too-recent': 'bg-red-500/80 text-white',
  'recovering': 'bg-amber-500/80 text-white',
  'ready': 'bg-green-500/80 text-white',
  'cold': 'bg-muted/50 text-muted-foreground',
}

export function StartWorkoutDrawer({ open, onOpenChange }: StartWorkoutDrawerProps) {
  const navigate = useNavigate()
  const { startWorkout } = useActiveWorkout()
  const muscleStatus = useMuscleStatus()
  const { templates } = useTemplates()
  const { quickStartPresets } = usePresets()
  const [search, setSearch] = useState('')
  const [selectedFocus, setSelectedFocus] = useState<MuscleGroup[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<Id<"workoutTemplates"> | null>(null)

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  const suggestions = useMemo(() => {
    const query = search.toLowerCase().trim()
    if (!query) return []

    const results: { label: string; muscles: MuscleGroup[] }[] = []

    // Check all presets (built-in + custom)
    for (const [name, muscles] of Object.entries(quickStartPresets)) {
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
  }, [search, selectedFocus, quickStartPresets])

  const toggleMuscle = (muscle: MuscleGroup) => {
    setSelectedTemplateId(null) // Clear template when manually selecting muscles
    setSelectedFocus((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    )
  }

  const addMuscles = (muscles: MuscleGroup[]) => {
    setSelectedTemplateId(null) // Clear template when manually selecting muscles
    setSelectedFocus((prev) => {
      const newSet = new Set([...prev, ...muscles])
      return Array.from(newSet)
    })
    setSearch('')
  }

  const selectTemplate = (templateId: Id<"workoutTemplates">) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplateId(templateId)
      setSelectedFocus(template.focus as MuscleGroup[])
      setSearch('')
    }
  }

  const handleStart = () => {
    startWorkout(selectedFocus, selectedTemplateId ?? undefined)
    onOpenChange(false)
    setSelectedFocus([])
    setSelectedTemplateId(null)
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

          {/* Templates section */}
          {!search && templates.length > 0 && !selectedTemplateId && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Your Templates
              </p>
              <div className="space-y-1.5">
                {templates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                        {template.focus.length > 0 && (
                          <> · {template.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected template indicator */}
          {selectedTemplate && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{selectedTemplate.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate.exercises.length} exercises pre-loaded
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTemplateId(null)
                    setSelectedFocus([])
                  }}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Selected focus */}
          {selectedFocus.length > 0 && !selectedTemplateId && (
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

          {/* Muscle Recovery Heatmap */}
          {!search && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Muscle Recovery
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ALL_MUSCLE_GROUPS.map((muscle) => {
                  const { status, hoursSince } = muscleStatus[muscle]
                  const isSelected = selectedFocus.includes(muscle)
                  return (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscle(muscle)}
                      className={cn(
                        'px-2 py-2 rounded-lg text-xs capitalize transition-all relative',
                        isSelected
                          ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                          : '',
                        statusColors[status]
                      )}
                    >
                      <span className="font-medium">{muscle}</span>
                      {hoursSince !== null && (
                        <span className="block text-[10px] opacity-80">
                          {hoursSince < 24 ? `${hoursSince}h` : `${Math.round(hoursSince / 24)}d`}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500/80" /> Sore
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" /> Recovering
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500/80" /> Ready
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted" /> Cold
                </span>
              </div>
            </div>
          )}

          {/* Start button */}
          <Button
            size="lg"
            className={cn(
              'w-full h-12 rounded-xl',
              !selectedTemplateId && selectedFocus.length === 0 && 'bg-muted text-muted-foreground hover:bg-muted'
            )}
            onClick={handleStart}
          >
            <Play className="mr-2 h-4 w-4" />
            {selectedTemplate
              ? `Start ${selectedTemplate.name}`
              : selectedFocus.length > 0
                ? `Start ${selectedFocus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')}`
                : 'Start Freestyle'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
