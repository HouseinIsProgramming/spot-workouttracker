import { useState } from 'react'
import { Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useActiveWorkout } from '@/lib/data/hooks'
import type { SetType } from '@/lib/data/types'

const WEIGHT_INCREMENT = 2.5
const REP_INCREMENT = 1

type SetInputProps = {
  workoutExerciseId: string
  defaultWeight: number
  defaultReps: number
}

export function SetInput({ workoutExerciseId, defaultWeight, defaultReps }: SetInputProps) {
  const { addSet } = useActiveWorkout()
  const [weight, setWeight] = useState<number | ''>(defaultWeight || '')
  const [reps, setReps] = useState<number | ''>(defaultReps || '')
  const [setType, setSetType] = useState<SetType>('normal')

  const displayWeight = weight === '' ? defaultWeight : weight
  const displayReps = reps === '' ? defaultReps : reps

  const handleComplete = () => {
    const finalWeight = weight === '' ? defaultWeight : weight
    const finalReps = reps === '' ? defaultReps : reps

    if (finalReps <= 0) return

    addSet(workoutExerciseId, finalWeight, finalReps, setType)

    // Reset to empty (will show placeholders from defaults)
    setWeight('')
    setReps('')
    setSetType('normal')
  }

  const incrementWeight = (delta: number) => {
    const current = weight === '' ? defaultWeight : weight
    setWeight(Math.max(0, current + delta))
  }

  const incrementReps = (delta: number) => {
    const current = reps === '' ? defaultReps : reps
    setReps(Math.max(1, current + delta))
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      <div className="flex items-center gap-2">
        {/* Weight input */}
        <div className="flex items-center gap-1 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => incrementWeight(-WEIGHT_INCREMENT)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="relative flex-1 min-w-[80px]">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
              placeholder={String(defaultWeight)}
              className="text-center pr-8 h-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              kg
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => incrementWeight(WEIGHT_INCREMENT)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Reps input */}
        <div className="flex items-center gap-1 flex-1">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => incrementReps(-REP_INCREMENT)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="relative flex-1 min-w-[60px]">
            <Input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value ? Number(e.target.value) : '')}
              placeholder={String(defaultReps)}
              className="text-center pr-10 h-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              reps
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => incrementReps(REP_INCREMENT)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Set type selector */}
        <Select value={setType} onValueChange={(v) => setSetType(v as SetType)}>
          <SelectTrigger className="flex-1 h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="warmup">Warmup</SelectItem>
            <SelectItem value="dropset">Dropset</SelectItem>
            <SelectItem value="myorep">Myo-rep</SelectItem>
            <SelectItem value="failure">To Failure</SelectItem>
            <SelectItem value="rest-pause">Rest-Pause</SelectItem>
          </SelectContent>
        </Select>

        {/* Complete button */}
        <Button onClick={handleComplete} className="h-10 px-6">
          <Check className="mr-1 h-4 w-4" />
          Log Set
        </Button>
      </div>

      {/* Preview */}
      <p className="text-xs text-muted-foreground text-center">
        {displayWeight}kg × {displayReps} reps
        {setType !== 'normal' && ` (${setType})`}
      </p>
    </div>
  )
}
