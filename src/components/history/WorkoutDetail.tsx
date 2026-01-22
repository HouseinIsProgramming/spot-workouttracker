import { useParams, Link } from '@tanstack/react-router'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWorkout, useExercise, calculateWorkoutVolume } from '@/lib/data/hooks'
import type { WorkoutExercise, Set, PRType } from '@/lib/data/types'

export function WorkoutDetail() {
  const { id } = useParams({ from: '/history/$id' })
  const workout = useWorkout(id)

  if (!workout) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Workout not found</p>
        <Link to="/history">
          <Button variant="ghost" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    )
  }

  const volume = calculateWorkoutVolume(workout)
  const date = new Date(workout.startedAt)
  const duration = workout.completedAt
    ? Math.round((workout.completedAt - workout.startedAt) / 60000)
    : 0
  const totalSets = workout.exercises.reduce(
    (sum, we) => sum + we.sets.filter((s) => s.type !== 'warmup').length,
    0
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link to="/history">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {workout.focus.map((muscle) => (
              <Badge key={muscle} variant="secondary" className="capitalize">
                {muscle}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{duration}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{totalSets}</p>
            <p className="text-xs text-muted-foreground">sets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold">{(volume / 1000).toFixed(1)}k</p>
            <p className="text-xs text-muted-foreground">kg volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {workout.exercises.map((we) => (
          <ExerciseDetailCard key={we.id} workoutExercise={we} />
        ))}
      </div>

      {/* Notes */}
      {workout.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{workout.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExerciseDetailCard({ workoutExercise }: { workoutExercise: WorkoutExercise }) {
  const exercise = useExercise(workoutExercise.exerciseId)
  if (!exercise) return null

  const workingSets = workoutExercise.sets.filter((s) => s.type !== 'warmup')
  const totalVolume = workingSets.reduce((sum, s) => sum + s.weight * s.reps, 0)

  return (
    <Link to="/exercises/$id" params={{ id: exercise.id }}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            <span className="text-sm text-muted-foreground">
              {(totalVolume / 1000).toFixed(1)}k kg
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {workoutExercise.sets.map((set, idx) => (
              <SetLine key={set.id} set={set} index={idx + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const prShortLabels: Record<PRType, string> = {
  weight: 'W',
  volume: 'V',
  reps: 'R',
}

function SetLine({ set, index }: { set: Set; index: number }) {
  const isWarmup = set.type === 'warmup'
  const hasPRs = set.prs && set.prs.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm py-0.5 px-1 rounded',
        isWarmup ? 'text-muted-foreground' : '',
        hasPRs && 'bg-yellow-500/10'
      )}
    >
      <span className="w-5 text-muted-foreground">{index}</span>
      <span className={isWarmup ? '' : 'font-medium'}>
        {set.weight}kg × {set.reps}
      </span>
      {hasPRs && (
        <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
          <Trophy className="h-2.5 w-2.5" />
          <span className="text-[9px] font-bold">
            {set.prs!.map((pr) => prShortLabels[pr]).join('')}
          </span>
        </span>
      )}
      {set.type !== 'normal' && (
        <Badge variant="outline" className="text-[10px] h-4">
          {set.type === 'warmup' ? 'W' : set.type}
        </Badge>
      )}
      {set.rpe && (
        <Badge variant="outline" className="text-[10px] h-4">
          RPE {set.rpe}
        </Badge>
      )}
    </div>
  )
}
