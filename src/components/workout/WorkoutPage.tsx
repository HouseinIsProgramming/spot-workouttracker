import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, MoreVertical, Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useActiveWorkout } from '@/lib/data/hooks'
import { ExerciseCard } from './ExerciseCard'
import { ExercisePickerDrawer } from './ExercisePickerDrawer'
import { StartWorkoutDrawer } from './StartWorkoutDrawer'
import { toast } from 'sonner'

export function WorkoutPage() {
  const navigate = useNavigate()
  const { workout, isActive, completeWorkout, discardWorkout } = useActiveWorkout()
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [showStartDrawer, setShowStartDrawer] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // No active workout
  if (!isActive || !workout) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-xl font-semibold mb-2">No Active Workout</h1>
        <p className="text-muted-foreground mb-6">
          Start a new workout to begin logging exercises.
        </p>
        <Button size="lg" onClick={() => setShowStartDrawer(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Start Workout
        </Button>
        <StartWorkoutDrawer
          open={showStartDrawer}
          onOpenChange={setShowStartDrawer}
        />
      </div>
    )
  }

  const duration = Math.floor((Date.now() - workout.startedAt) / 60000)
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  const handleComplete = () => {
    completeWorkout()
    toast.success('Workout completed!')
    navigate({ to: '/history' })
  }

  const handleDiscard = () => {
    if (confirmDiscard) {
      discardWorkout()
      toast('Workout discarded')
      navigate({ to: '/' })
    } else {
      setConfirmDiscard(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setConfirmDiscard(false), 2000)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {workout.focus.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="capitalize">
                {muscle}
              </Badge>
            ))}
            {workout.focus.length === 0 && (
              <Badge variant="secondary">Freestyle</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`} elapsed
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleComplete}
              className="text-green-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Complete Workout
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDiscard}
              className={cn(
                confirmDiscard
                  ? 'bg-destructive text-destructive-foreground'
                  : 'text-destructive'
              )}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {confirmDiscard ? 'Tap again to discard' : 'Discard Workout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Exercise list */}
      <div className="space-y-4">
        {workout.exercises.map((workoutExercise) => (
          <ExerciseCard
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
          />
        ))}
      </div>

      {/* Add exercise button */}
      <Button
        variant="outline"
        className="w-full h-12"
        onClick={() => setShowExercisePicker(true)}
      >
        <Plus className="mr-2 h-5 w-5" />
        Add Exercise
      </Button>

      {/* Complete button (sticky at bottom) */}
      {workout.exercises.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <Button
            size="lg"
            className="w-full h-12"
            onClick={handleComplete}
          >
            <Check className="mr-2 h-5 w-5" />
            Complete Workout
          </Button>
        </div>
      )}

      {/* Exercise Picker */}
      <ExercisePickerDrawer
        open={showExercisePicker}
        onOpenChange={setShowExercisePicker}
        workoutFocus={workout.focus}
        exercisesInWorkout={workout.exercises.map((e) => e.exerciseId)}
      />
    </div>
  )
}
