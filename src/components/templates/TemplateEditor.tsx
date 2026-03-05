import { useState } from 'react'
import { ArrowLeft, Plus, X, GripVertical, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTemplates, useExerciseSearch, type WorkoutTemplate } from '@/lib/data/hooks'
import { ALL_MUSCLE_GROUPS, type MuscleGroup } from '@/lib/data/types'
import { getExerciseById } from '@/lib/data/exercises'
import { toast } from 'sonner'

type TemplateEditorProps = {
  template: WorkoutTemplate | null
  onClose: () => void
}

export function TemplateEditor({ template, onClose }: TemplateEditorProps) {
  const { createTemplate, updateTemplate } = useTemplates()
  const [name, setName] = useState(template?.name ?? '')
  const [focus, setFocus] = useState<MuscleGroup[]>(template?.focus ?? [])
  const [exerciseIds, setExerciseIds] = useState<string[]>(
    template?.exercises.map((e) => e.exerciseId) ?? []
  )
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!template
  const isValid = name.trim().length > 0 && exerciseIds.length > 0

  const toggleFocus = (muscle: MuscleGroup) => {
    setFocus((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    )
  }

  const addExercise = (exerciseId: string) => {
    if (!exerciseIds.includes(exerciseId)) {
      setExerciseIds((prev) => [...prev, exerciseId])
    }
  }

  const removeExercise = (exerciseId: string) => {
    setExerciseIds((prev) => prev.filter((id) => id !== exerciseId))
  }

  const moveExercise = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= exerciseIds.length) return

    const newIds = [...exerciseIds]
    const [removed] = newIds.splice(fromIndex, 1)
    newIds.splice(toIndex, 0, removed)
    setExerciseIds(newIds)
  }

  const handleSave = async () => {
    if (!isValid) return

    setIsSaving(true)
    try {
      if (isEditing && template) {
        await updateTemplate(template.id, {
          name: name.trim(),
          focus,
          exerciseIds,
        })
        toast.success('Template updated')
      } else {
        await createTemplate(name.trim(), focus, exerciseIds)
        toast.success('Template created')
      }
      onClose()
    } catch (err) {
      toast.error('Failed to save template')
    } finally {
      setIsSaving(false)
    }
  }

  // Custom handler for exercise picker that doesn't add to active workout
  const handleExerciseSelect = (exerciseId: string) => {
    addExercise(exerciseId)
    setShowExercisePicker(false)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {isEditing ? 'Edit Template' : 'New Template'}
          </h1>
        </div>
        <Button
          onClick={handleSave}
          disabled={!isValid || isSaving}
        >
          <Check className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </header>

      {/* Name input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Template Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Push Day, Leg Day"
          className="w-full h-12 px-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          autoFocus
        />
      </div>

      {/* Focus (muscle groups) */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Focus (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {ALL_MUSCLE_GROUPS.map((muscle) => (
            <button
              key={muscle}
              type="button"
              onClick={() => toggleFocus(muscle)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm capitalize transition-all',
                focus.includes(muscle)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Exercises ({exerciseIds.length})
        </label>

        {exerciseIds.length > 0 && (
          <div className="space-y-2">
            {exerciseIds.map((exerciseId, index) => {
              const exercise = getExerciseById(exerciseId)
              if (!exercise) return null

              return (
                <div
                  key={exerciseId}
                  className="bg-card rounded-lg border border-border/50 p-3 flex items-center gap-2"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveExercise(index, 'up')}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <GripVertical className="h-3 w-3 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExercise(index, 'down')}
                      disabled={index === exerciseIds.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <GripVertical className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {exercise.muscleGroups.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExercise(exerciseId)}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowExercisePicker(true)}
          className="w-full h-12 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Add Exercise</span>
        </button>
      </div>

      {/* Exercise Picker - we need a simpler version that doesn't auto-add to workout */}
      <TemplateExercisePicker
        open={showExercisePicker}
        onOpenChange={setShowExercisePicker}
        onSelect={handleExerciseSelect}
        focus={focus}
        excludeIds={exerciseIds}
      />
    </div>
  )
}

// Simplified exercise picker for templates
import { Search, Dumbbell } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ExerciseFormDrawer } from '@/components/exercises/ExerciseFormDrawer'
import type { Exercise } from '@/lib/data/types'

type TemplateExercisePickerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exerciseId: string) => void
  focus: MuscleGroup[]
  excludeIds: string[]
}

function TemplateExercisePicker({
  open,
  onOpenChange,
  onSelect,
  focus,
  excludeIds,
}: TemplateExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)

  const searchResults = useExerciseSearch({
    query,
    workoutFocus: focus,
    exercisesInWorkout: excludeIds,
    recentExerciseIds: [],
  })

  // Show create button prominently when no good matches
  const hasQuery = query.trim().length > 0
  const hasCloseMatch = hasQuery && searchResults.some((e) =>
    e.name.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes(e.name.toLowerCase())
  )
  const showCreateProminent = hasQuery && (!hasCloseMatch || searchResults.length === 0)

  const handleSelect = (exerciseId: string) => {
    onSelect(exerciseId)
    setQuery('')
  }

  const handleCreateExercise = (exercise: Exercise) => {
    onSelect(exercise.id)
    setShowCreateDrawer(false)
    setQuery('')
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh] flex flex-col">
        <DrawerHeader className="pb-2 flex-shrink-0">
          <DrawerTitle className="text-base">Add Exercise</DrawerTitle>
        </DrawerHeader>

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
                  <div className="text-xs text-muted-foreground">Add as new exercise</div>
                </div>
              </button>
            )}

            {searchResults.map((exercise) => {
              const isExcluded = excludeIds.includes(exercise.id)
              const matchesFocus = exercise.muscleGroups.some((m) =>
                focus.includes(m)
              )

              return (
                <button
                  key={exercise.id}
                  onClick={() => !isExcluded && handleSelect(exercise.id)}
                  disabled={isExcluded}
                  className={cn(
                    'w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3',
                    isExcluded
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-muted/50 active:bg-muted'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                      isExcluded
                        ? 'bg-green-500/10'
                        : matchesFocus
                          ? 'bg-primary/10'
                          : 'bg-muted'
                    )}
                  >
                    {isExcluded ? (
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
