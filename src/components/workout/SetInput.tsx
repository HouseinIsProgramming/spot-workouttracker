import { useState } from 'react'
import { Minus, Plus, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useActiveWorkout, checkForPRs, useExercisePRs } from '@/lib/data/hooks'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SetType, PRType } from '@/lib/data/types'

const WEIGHT_INCREMENT = 2.5
const REP_INCREMENT = 1

type SetInputProps = {
  workoutExerciseId: string
  exerciseId: string
  defaultWeight: number
  defaultReps: number
}

const setTypes: { value: SetType; label: string; short: string }[] = [
  { value: 'normal', label: 'Working Set', short: 'Working' },
  { value: 'warmup', label: 'Warmup', short: 'Warmup' },
  { value: 'dropset', label: 'Drop Set', short: 'Drop' },
  { value: 'myorep', label: 'Myo Rep', short: 'Myo' },
  { value: 'failure', label: 'To Failure', short: 'Failure' },
  { value: 'rest-pause', label: 'Rest-Pause', short: 'RP' },
]

const prLabels: Record<PRType, string> = {
  weight: 'Weight PR!',
  volume: 'Volume PR!',
  reps: 'Rep PR!',
}

// Scale font size based on character count
function getInputFontSize(value: number): string {
  const len = String(value).length
  if (len <= 2) return 'text-3xl'
  if (len <= 3) return 'text-2xl'
  if (len <= 4) return 'text-xl'
  return 'text-lg'
}

export function SetInput({ workoutExerciseId, exerciseId, defaultWeight, defaultReps }: SetInputProps) {
  const { addSet } = useActiveWorkout()
  const prs = useExercisePRs(exerciseId)

  // Use empty string to show placeholder, actual PR values as fallback
  const [weightInput, setWeightInput] = useState<string>('')
  const [repsInput, setRepsInput] = useState<string>('')
  const [setType, setSetType] = useState<SetType>('normal')

  // Placeholder values from PRs or defaults
  const placeholderWeight = prs.maxWeight > 0 ? prs.maxWeight : (defaultWeight || 0)
  const placeholderReps = defaultReps || 10

  // Actual values for submission (use input or placeholder)
  const weight = weightInput !== '' ? parseFloat(weightInput) || 0 : placeholderWeight
  const reps = repsInput !== '' ? parseInt(repsInput) || 1 : placeholderReps

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
    const current = weightInput !== '' ? parseFloat(weightInput) || 0 : placeholderWeight
    setWeightInput(String(Math.max(0, current + delta)))
  }

  const incrementReps = (delta: number) => {
    const current = repsInput !== '' ? parseInt(repsInput) || 1 : placeholderReps
    setRepsInput(String(Math.max(1, current + delta)))
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
          <div className="flex-1 flex flex-col items-center justify-center py-3">
            <input
              type="number"
              inputMode="decimal"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder={String(placeholderWeight)}
              className={cn(
                'w-full text-center font-bold tabular-nums tracking-tight bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                getInputFontSize(weightInput !== '' ? parseFloat(weightInput) || 0 : placeholderWeight)
              )}
            />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">kg</span>
          </div>
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
          <div className="flex-1 flex flex-col items-center justify-center py-3">
            <input
              type="number"
              inputMode="numeric"
              value={repsInput}
              onChange={(e) => setRepsInput(e.target.value)}
              placeholder={String(placeholderReps)}
              className={cn(
                'w-full text-center font-bold tabular-nums tracking-tight bg-transparent border-0 outline-none focus:ring-0 placeholder:text-muted-foreground/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                getInputFontSize(repsInput !== '' ? parseInt(repsInput) || 1 : placeholderReps)
              )}
            />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">reps</span>
          </div>
          <button
            type="button"
            onClick={() => incrementReps(REP_INCREMENT)}
            className="w-12 flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Set type dropdown + Log button */}
      <div className="flex items-center gap-2">
        {/* Set type dropdown */}
        <Select value={setType} onValueChange={(v) => setSetType(v as SetType)}>
          <SelectTrigger
            className={cn(
              'flex-1 h-10 rounded-xl bg-muted/50 border-0 text-sm font-medium',
              setType === 'warmup' && 'text-muted-foreground',
              setType === 'dropset' && 'text-orange-400',
              setType === 'myorep' && 'text-purple-400',
              setType === 'failure' && 'text-red-400',
              setType === 'rest-pause' && 'text-blue-400'
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {setTypes.map(({ value, label }) => (
              <SelectItem
                key={value}
                value={value}
                className={cn(
                  value === 'warmup' && 'text-muted-foreground',
                  value === 'dropset' && 'text-orange-400',
                  value === 'myorep' && 'text-purple-400',
                  value === 'failure' && 'text-red-400',
                  value === 'rest-pause' && 'text-blue-400'
                )}
              >
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Log button - the main CTA */}
        <button
          type="button"
          onClick={handleComplete}
          className="h-10 px-6 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
        >
          Log
        </button>
      </div>
    </div>
  )
}
