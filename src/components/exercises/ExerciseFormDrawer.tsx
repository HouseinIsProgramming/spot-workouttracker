import { useState, useEffect } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  addCustomExercise,
  updateCustomExercise,
  editBuiltInExercise,
  isBuiltInExercise,
} from '@/lib/data/exercises'
import { ALL_MUSCLE_GROUPS, type MuscleGroup, type Equipment, type Exercise } from '@/lib/data/types'
import { toast } from 'sonner'

type ExerciseFormDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise?: Exercise // If provided, we're editing
  onSave?: (exercise: Exercise) => void
  defaultName?: string // Pre-fill name for new exercises
}

const equipmentOptions: { value: Equipment | undefined; label: string }[] = [
  { value: undefined, label: 'None' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'dumbbell', label: 'Dumbbell' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Machine' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'kettlebell', label: 'Kettlebell' },
]

export function ExerciseFormDrawer({
  open,
  onOpenChange,
  exercise,
  onSave,
  defaultName,
}: ExerciseFormDrawerProps) {
  const [name, setName] = useState('')
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [equipment, setEquipment] = useState<Equipment | undefined>(undefined)

  const isEditing = !!exercise
  const isEditingBuiltIn = exercise ? isBuiltInExercise(exercise.id) : false

  // Reset form when opening/closing or exercise changes
  useEffect(() => {
    if (open) {
      if (exercise) {
        setName(exercise.name)
        setMuscleGroups(exercise.muscleGroups)
        setEquipment(exercise.equipment)
      } else {
        setName(defaultName ?? '')
        setMuscleGroups([])
        setEquipment(undefined)
      }
    }
  }, [open, exercise])

  const toggleMuscle = (muscle: MuscleGroup) => {
    setMuscleGroups((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    )
  }

  const handleSave = () => {
    if (!name.trim() || muscleGroups.length === 0) return

    if (isEditing && exercise) {
      if (isEditingBuiltIn) {
        // Editing a built-in: create copy and archive original
        const newExercise = editBuiltInExercise(exercise.id, {
          name: name.trim(),
          muscleGroups,
          equipment,
        })
        toast.success('Created modified version (original archived)')
        onSave?.(newExercise)
      } else {
        // Editing a custom exercise: update in place
        updateCustomExercise(exercise.id, {
          name: name.trim(),
          muscleGroups,
          equipment,
        })
        onSave?.({ ...exercise, name: name.trim(), muscleGroups, equipment })
      }
    } else {
      // Creating new exercise
      const newExercise = addCustomExercise({
        name: name.trim(),
        muscleGroups,
        equipment,
      })
      onSave?.(newExercise)
    }

    onOpenChange(false)
  }

  const isValid = name.trim().length > 0 && muscleGroups.length > 0

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85dvh]">
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">
            {isEditing
              ? isEditingBuiltIn
                ? 'Modify Default Exercise'
                : 'Edit Exercise'
              : 'Create Exercise'}
          </DrawerTitle>
          {isEditingBuiltIn && (
            <p className="text-xs text-muted-foreground mt-1">
              This will create a modified copy. The original will be archived.
            </p>
          )}
        </DrawerHeader>

        <div className="p-4 space-y-5">
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Exercise Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Incline Hammer Curl"
              className="w-full h-11 px-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          {/* Muscle groups */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Muscle Groups
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm capitalize transition-all',
                    muscleGroups.includes(muscle)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {muscle}
                </button>
              ))}
            </div>
            {muscleGroups.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Selected: {muscleGroups.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
              </p>
            )}
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Equipment
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(({ value, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setEquipment(value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all',
                    equipment === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <Button
            size="lg"
            className="w-full h-12 rounded-xl"
            onClick={handleSave}
            disabled={!isValid}
          >
            {isEditing
              ? isEditingBuiltIn
                ? 'Save as Modified Copy'
                : 'Save Changes'
              : 'Create Exercise'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
