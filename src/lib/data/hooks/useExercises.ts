import { useMemo } from 'react'
import { exercises, getExerciseById } from '../exercises'
import type { Exercise, MuscleGroup } from '../types'

// TODO: Replace with useQuery(api.exercises.list)
export function useExercises() {
  return exercises
}

export function useExercise(id: string): Exercise | undefined {
  // TODO: Replace with useQuery(api.exercises.get, { id })
  return getExerciseById(id)
}

type SearchContext = {
  query: string
  workoutFocus?: MuscleGroup[]
  exercisesInWorkout?: string[]
  recentExerciseIds?: string[]
}

function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase()
  const t = target.toLowerCase()

  // Exact match
  if (t === q) return 100

  // Starts with
  if (t.startsWith(q)) return 80

  // Contains
  if (t.includes(q)) return 60

  // Fuzzy character match
  let qIdx = 0
  let score = 0
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 10
      qIdx++
    }
  }
  return qIdx === q.length ? score : 0
}

function rankExercise(exercise: Exercise, context: SearchContext): number {
  let score = 0

  // 1. Text match (fuzzy)
  if (context.query) {
    score += fuzzyMatch(context.query, exercise.name)
  } else {
    score += 10 // Base score when no query
  }

  // 2. Muscle group relevance (big boost for workout focus)
  if (context.workoutFocus?.length) {
    const overlap = exercise.muscleGroups.filter((mg) =>
      context.workoutFocus!.includes(mg)
    ).length
    score += overlap * 25
  }

  // 3. Recency (exercises you do often ranked higher)
  if (context.recentExerciseIds?.includes(exercise.id)) {
    score += 15
  }

  // 4. Already in workout? (deprioritize to avoid duplicates)
  if (context.exercisesInWorkout?.includes(exercise.id)) {
    score -= 50
  }

  return score
}

export function useExerciseSearch(context: SearchContext) {
  const allExercises = useExercises()

  return useMemo(() => {
    const scored = allExercises
      .map((exercise) => ({
        exercise,
        score: rankExercise(exercise, context),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)

    return scored.map(({ exercise }) => exercise)
  }, [allExercises, context.query, context.workoutFocus, context.exercisesInWorkout, context.recentExerciseIds])
}

export function useExercisesByMuscle(muscleGroup: MuscleGroup) {
  const allExercises = useExercises()

  return useMemo(
    () => allExercises.filter((e) => e.muscleGroups.includes(muscleGroup)),
    [allExercises, muscleGroup]
  )
}
