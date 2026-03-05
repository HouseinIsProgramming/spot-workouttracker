import { useState, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Plus, MoreVertical, Check, Trash2, Play, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [confirmComplete, setConfirmComplete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // No active workout
  if (!isActive || !workout) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Play className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold mb-1">No Active Workout</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Start a workout to begin logging
        </p>
        <Button size="lg" className="rounded-xl" onClick={() => setShowStartDrawer(true)}>
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

  const focusLabel =
    workout.focus.length > 0
      ? workout.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' + ')
      : 'Freestyle'

  const handleComplete = async () => {
    if (confirmComplete) {
      await completeWorkout()
      toast.success('Workout completed!')
      navigate({ to: '/history' })
    } else {
      setConfirmComplete(true)
      clearTimeout(completeTimeoutRef.current)
      completeTimeoutRef.current = setTimeout(() => setConfirmComplete(false), 2000)
    }
  }

  const handleDiscard = async () => {
    if (confirmDiscard) {
      await discardWorkout()
      toast('Workout discarded')
      navigate({ to: '/' })
    } else {
      setConfirmDiscard(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setConfirmDiscard(false), 2000)
    }
  }

  const hasExercises = workout.exercises.length > 0

  return (
    <div className={cn('p-4 space-y-4', hasExercises && 'pb-nav-safe-xl')}>
      {/* Header - clean and minimal */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{focusLabel}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            <span>{hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}</span>
            <span className="mx-1">·</span>
            <span>{workout.exercises.length} exercises</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
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
              onSelect={(e) => {
                e.preventDefault()
                handleDiscard()
              }}
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
      <div className="space-y-3">
        {workout.exercises.map((workoutExercise, idx) => (
          <ExerciseCard
            key={workoutExercise.id}
            workoutExercise={workoutExercise}
            index={idx}
          />
        ))}
      </div>

      {/* Add exercise button */}
      <button
        type="button"
        onClick={() => setShowExercisePicker(true)}
        className="w-full h-12 border-2 border-dashed border-border/50 rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Add Exercise</span>
      </button>

      {/* Complete button (sticky at bottom) */}
      {hasExercises && (
        <div className="fixed bottom-nav-safe left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
          <Button
            size="lg"
            className={cn(
              'w-full h-12 rounded-xl transition-all',
              confirmComplete && 'bg-green-600 hover:bg-green-700'
            )}
            onClick={handleComplete}
          >
            <Check className="mr-2 h-5 w-5" />
            {confirmComplete ? 'Tap again to complete' : 'Complete Workout'}
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
