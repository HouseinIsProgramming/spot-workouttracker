import { useState } from 'react'
import { Minus, Plus, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useActiveWorkout, checkForPRs } from '@/lib/data/hooks'
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
          <div className="flex-1 flex flex-col items-center justify-center py-3">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              className={cn(
                'w-full text-center font-bold tabular-nums tracking-tight bg-transparent border-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                getInputFontSize(weight)
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
              value={reps}
              onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
              className={cn(
                'w-full text-center font-bold tabular-nums tracking-tight bg-transparent border-0 outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                getInputFontSize(reps)
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
