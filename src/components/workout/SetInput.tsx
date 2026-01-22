import { useState } from 'react'
import { Minus, Plus, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useActiveWorkout, checkForPRs } from '@/lib/data/hooks'
import type { SetType, PRType } from '@/lib/data/types'

const WEIGHT_INCREMENT = 2.5
const REP_INCREMENT = 1

type SetInputProps = {
  workoutExerciseId: string
  exerciseId: string
  defaultWeight: number
  defaultReps: number
}

const setTypes: { value: SetType; label: string }[] = [
  { value: 'normal', label: 'Working' },
  { value: 'warmup', label: 'Warmup' },
  { value: 'dropset', label: 'Drop' },
  { value: 'myorep', label: 'Myo' },
  { value: 'failure', label: 'Failure' },
]

const prLabels: Record<PRType, string> = {
  weight: 'Weight PR!',
  volume: 'Volume PR!',
  reps: 'Rep PR!',
}

export function SetInput({ workoutExerciseId, exerciseId, defaultWeight, defaultReps }: SetInputProps) {
  const { addSet } = useActiveWorkout()
  const [weight, setWeight] = useState<number>(defaultWeight || 0)
  const [reps, setReps] = useState<number>(defaultReps || 10)
  const [setType, setSetType] = useState<SetType>('normal')

  const handleComplete = () => {
    if (reps <= 0) return

    // Check for PRs before adding the set
    const prs = checkForPRs(exerciseId, weight, reps, setType)

    addSet(workoutExerciseId, weight, reps, setType, undefined, prs)

    // Show PR toast if any PRs achieved
    if (prs.length > 0) {
      const prText = prs.map((pr) => prLabels[pr]).join(' · ')
      toast(prText, {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        duration: 3000,
      })
    }
  }

  const incrementWeight = (delta: number) => {
    setWeight((prev) => Math.max(0, prev + delta))
  }

  const incrementReps = (delta: number) => {
    setReps((prev) => Math.max(1, prev + delta))
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {/* Main input row - big touch targets */}
      <div className="flex items-stretch gap-2">
        {/* Weight control */}
        <div className="flex-1 flex items-stretch bg-muted/50 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => incrementWeight(-WEIGHT_INCREMENT)}
            className="w-12 flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => incrementWeight(WEIGHT_INCREMENT)}
            className="flex-1 flex flex-col items-center justify-center py-3 hover:bg-muted/30 active:bg-muted/50 transition-colors"
          >
            <span className="text-3xl font-bold tabular-nums tracking-tight">{weight}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">kg</span>
          </button>
          <button
            type="button"
            onClick={() => incrementWeight(WEIGHT_INCREMENT)}
            className="w-12 flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Reps control */}
        <div className="flex-1 flex items-stretch bg-muted/50 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => incrementReps(-REP_INCREMENT)}
            className="w-12 flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => incrementReps(REP_INCREMENT)}
            className="flex-1 flex flex-col items-center justify-center py-3 hover:bg-muted/30 active:bg-muted/50 transition-colors"
          >
            <span className="text-3xl font-bold tabular-nums tracking-tight">{reps}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">reps</span>
          </button>
          <button
            type="button"
            onClick={() => incrementReps(REP_INCREMENT)}
            className="w-12 flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Set type pills + Log button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1 overflow-x-auto pb-1 -mb-1">
          {setTypes.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSetType(value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                setType === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Log button - the main CTA */}
        <button
          type="button"
          onClick={handleComplete}
          className="h-10 px-6 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 active:scale-95 transition-all"
        >
          Log
        </button>
      </div>
    </div>
  )
}
