import { useCallback, useSyncExternalStore } from 'react'
import type { MuscleGroup, Workout, WorkoutExercise, Set, SetType } from '../types'
import { addCompletedWorkout } from './useWorkouts'

const STORAGE_KEY = 'workout-tracker-active-workout'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

// Shared state - single source of truth
let activeWorkout: Workout | null = null
let listeners = new Set<() => void>()

function loadFromStorage(): Workout | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(workout: Workout | null) {
  if (workout) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workout))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Initialize from localStorage
activeWorkout = loadFromStorage()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return activeWorkout
}

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setActiveWorkout(workout: Workout | null) {
  activeWorkout = workout
  saveToStorage(workout)
  emitChange()
}

function updateActiveWorkout(updater: (prev: Workout | null) => Workout | null) {
  const newWorkout = updater(activeWorkout)
  if (newWorkout !== activeWorkout) {
    setActiveWorkout(newWorkout)
  }
}

// TODO: Replace with Convex mutations and live queries
export function useActiveWorkout() {
  const workout = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const startWorkout = useCallback((focus: MuscleGroup[]) => {
    const newWorkout: Workout = {
      id: generateId(),
      focus,
      startedAt: Date.now(),
      exercises: [],
    }
    setActiveWorkout(newWorkout)
    return newWorkout
  }, [])

  const addExercise = useCallback((exerciseId: string) => {
    updateActiveWorkout((prev) => {
      if (!prev) return prev
      const newExercise: WorkoutExercise = {
        id: generateId(),
        exerciseId,
        sets: [],
      }
      return {
        ...prev,
        exercises: [...prev.exercises, newExercise],
      }
    })
  }, [])

  const removeExercise = useCallback((workoutExerciseId: string) => {
    updateActiveWorkout((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.filter((e) => e.id !== workoutExerciseId),
      }
    })
  }, [])

  const addSet = useCallback(
    (
      workoutExerciseId: string,
      weight: number,
      reps: number,
      type: SetType = 'normal',
      rpe?: number
    ) => {
      updateActiveWorkout((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: prev.exercises.map((we) => {
            if (we.id !== workoutExerciseId) return we
            const newSet: Set = {
              id: generateId(),
              weight,
              reps,
              type,
              rpe,
              completedAt: Date.now(),
            }
            return {
              ...we,
              sets: [...we.sets, newSet],
            }
          }),
        }
      })
    },
    []
  )

  const updateSet = useCallback(
    (
      workoutExerciseId: string,
      setId: string,
      updates: Partial<Omit<Set, 'id' | 'completedAt'>>
    ) => {
      updateActiveWorkout((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          exercises: prev.exercises.map((we) => {
            if (we.id !== workoutExerciseId) return we
            return {
              ...we,
              sets: we.sets.map((s) =>
                s.id === setId ? { ...s, ...updates } : s
              ),
            }
          }),
        }
      })
    },
    []
  )

  const removeSet = useCallback((workoutExerciseId: string, setId: string) => {
    updateActiveWorkout((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map((we) => {
          if (we.id !== workoutExerciseId) return we
          return {
            ...we,
            sets: we.sets.filter((s) => s.id !== setId),
          }
        }),
      }
    })
  }, [])

  const setNotes = useCallback((notes: string) => {
    updateActiveWorkout((prev) => {
      if (!prev) return prev
      return { ...prev, notes }
    })
  }, [])

  const completeWorkout = useCallback(() => {
    if (!activeWorkout) return
    const completed = { ...activeWorkout, completedAt: Date.now() }
    addCompletedWorkout(completed)
    setActiveWorkout(null)
  }, [])

  const discardWorkout = useCallback(() => {
    setActiveWorkout(null)
  }, [])

  return {
    workout,
    isActive: workout !== null,
    startWorkout,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    setNotes,
    completeWorkout,
    discardWorkout,
  }
}
