import { useState, useEffect, useCallback } from 'react'
import type { MuscleGroup, Workout, WorkoutExercise, Set, SetType } from '../types'

const STORAGE_KEY = 'workout-tracker-active-workout'

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function loadActiveWorkout(): Workout | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveActiveWorkout(workout: Workout | null) {
  if (workout) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workout))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// TODO: Replace with Convex mutations and live queries
export function useActiveWorkout() {
  const [workout, setWorkout] = useState<Workout | null>(() => loadActiveWorkout())

  // Persist to localStorage on change
  useEffect(() => {
    saveActiveWorkout(workout)
  }, [workout])

  const startWorkout = useCallback((focus: MuscleGroup[]) => {
    const newWorkout: Workout = {
      id: generateId(),
      focus,
      startedAt: Date.now(),
      exercises: [],
    }
    setWorkout(newWorkout)
    return newWorkout
  }, [])

  const addExercise = useCallback((exerciseId: string) => {
    setWorkout((prev) => {
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
    setWorkout((prev) => {
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
      setWorkout((prev) => {
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
      setWorkout((prev) => {
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
    setWorkout((prev) => {
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
    setWorkout((prev) => {
      if (!prev) return prev
      return { ...prev, notes }
    })
  }, [])

  const completeWorkout = useCallback(() => {
    setWorkout((prev) => {
      if (!prev) return prev
      const completed = { ...prev, completedAt: Date.now() }
      // TODO: Replace with mutation api.workouts.create(completed)
      console.log('Workout completed:', completed)
      return null // Clear active workout
    })
  }, [])

  const discardWorkout = useCallback(() => {
    setWorkout(null)
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
