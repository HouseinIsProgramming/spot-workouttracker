// Convex-ready types: IDs as strings, timestamps as numbers

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'core'
  | 'glutes'

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'

export type SetType =
  | 'normal'
  | 'warmup'
  | 'dropset'
  | 'myorep'
  | 'failure'
  | 'rest-pause'

export type Exercise = {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  equipment?: Equipment
}

export type PRType = 'weight' | 'volume' | 'reps'

export type Set = {
  id: string
  weight: number
  reps: number
  rpe?: number
  type: SetType
  completedAt: number
  prs?: PRType[] // PRs achieved with this set
}

export type WorkoutExercise = {
  id: string
  exerciseId: string
  sets: Set[]
}

export type Workout = {
  id: string
  focus: MuscleGroup[]
  startedAt: number
  completedAt?: number
  exercises: WorkoutExercise[]
  notes?: string
  editedAt?: number
  archivedAt?: number // Soft delete timestamp
}

// Muscle freshness status for dashboard
export type MuscleStatus = 'cold' | 'ready' | 'recovering' | 'too-recent'

// Preset workout focus combinations
export const FOCUS_PRESETS: Record<string, MuscleGroup[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps'],
  legs: ['legs', 'glutes'],
  upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
  lower: ['legs', 'glutes', 'core'],
  'full body': ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'glutes'],
}

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'core',
  'glutes',
]
