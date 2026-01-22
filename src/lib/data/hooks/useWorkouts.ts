import { useMemo, useSyncExternalStore } from 'react'
import { mockWorkouts } from '../workouts'
import { getExerciseById } from '../exercises'
import type { MuscleGroup, MuscleStatus, Workout, WorkoutExercise, Set as WorkoutSet } from '../types'

const STORAGE_KEY = 'workout-tracker-completed-workouts'

// Simple store for completed workouts
let completedWorkouts: Workout[] = []
let listeners = new Set<() => void>()

function loadFromStorage(): Workout[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToStorage(workouts: Workout[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

// Initialize from localStorage
completedWorkouts = loadFromStorage()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return completedWorkouts
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function addCompletedWorkout(workout: Workout) {
  completedWorkouts = [workout, ...completedWorkouts]
  saveToStorage(completedWorkouts)
  emitChange()
}

// TODO: Replace with useQuery(api.workouts.list)
export function useWorkouts(): Workout[] {
  const completed = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return useMemo(() => {
    // Combine completed workouts with mock data, sort by date
    const all = [...completed, ...mockWorkouts]
    return all.sort((a, b) => b.startedAt - a.startedAt)
  }, [completed])
}

// TODO: Replace with useQuery(api.workouts.get, { id })
export function useWorkout(id: string): Workout | undefined {
  const workouts = useWorkouts()
  return workouts.find((w) => w.id === id)
}

// Get workout history for a specific exercise
export function useExerciseHistory(exerciseId: string) {
  const workouts = useWorkouts()

  return useMemo(() => {
    const history: { workout: Workout; workoutExercise: WorkoutExercise }[] = []

    for (const workout of workouts) {
      const workoutExercise = workout.exercises.find(
        (we) => we.exerciseId === exerciseId
      )
      if (workoutExercise) {
        history.push({ workout, workoutExercise })
      }
    }

    return history.sort((a, b) => b.workout.startedAt - a.workout.startedAt)
  }, [workouts, exerciseId])
}

// Get the most recent sets for an exercise (for smart defaults)
export function useLastExerciseSets(exerciseId: string): WorkoutSet[] | undefined {
  const history = useExerciseHistory(exerciseId)
  if (history.length === 0) return undefined
  return history[0].workoutExercise.sets.filter((s) => s.type !== 'warmup')
}

// Calculate total volume for a workout
export function calculateWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce((total, we) => {
    return (
      total +
      we.sets
        .filter((s) => s.type !== 'warmup')
        .reduce((setTotal, set) => setTotal + set.weight * set.reps, 0)
    )
  }, 0)
}

// Get recently used exercise IDs (for search ranking)
export function useRecentExerciseIds(limit = 20): string[] {
  const workouts = useWorkouts()

  return useMemo(() => {
    const ids = new Set<string>()
    for (const workout of workouts) {
      for (const we of workout.exercises) {
        ids.add(we.exerciseId)
        if (ids.size >= limit) return Array.from(ids)
      }
    }
    return Array.from(ids)
  }, [workouts, limit])
}

// Muscle freshness calculations
const HOURS_TOO_RECENT = 36
const HOURS_RECOVERING = 48
const HOURS_COLD = 120

export function getMuscleStatus(hoursSinceWorked: number | null): MuscleStatus {
  if (hoursSinceWorked === null) return 'cold'
  if (hoursSinceWorked < HOURS_TOO_RECENT) return 'too-recent'
  if (hoursSinceWorked < HOURS_RECOVERING) return 'recovering'
  if (hoursSinceWorked < HOURS_COLD) return 'ready'
  return 'cold'
}

export function useMuscleStatus(): Record<MuscleGroup, { status: MuscleStatus; hoursSince: number | null }> {
  const workouts = useWorkouts()

  return useMemo(() => {
    const lastWorked: Record<MuscleGroup, number | null> = {
      chest: null,
      back: null,
      shoulders: null,
      biceps: null,
      triceps: null,
      legs: null,
      core: null,
      glutes: null,
    }

    const now = Date.now()

    // Find most recent workout for each muscle group
    for (const workout of workouts) {
      if (!workout.completedAt) continue

      for (const we of workout.exercises) {
        const exercise = getExerciseById(we.exerciseId)
        if (!exercise) continue

        for (const muscleGroup of exercise.muscleGroups) {
          const hoursSince = (now - workout.completedAt) / (1000 * 60 * 60)
          if (lastWorked[muscleGroup] === null || hoursSince < lastWorked[muscleGroup]!) {
            lastWorked[muscleGroup] = hoursSince
          }
        }
      }
    }

    const result: Record<MuscleGroup, { status: MuscleStatus; hoursSince: number | null }> = {} as never

    for (const [muscle, hours] of Object.entries(lastWorked)) {
      result[muscle as MuscleGroup] = {
        status: getMuscleStatus(hours),
        hoursSince: hours !== null ? Math.round(hours) : null,
      }
    }

    return result
  }, [workouts])
}
