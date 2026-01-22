import type { Exercise } from './types'

export const exercises: Exercise[] = [
  // Chest
  { id: 'bench-press', name: 'Bench Press', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'barbell' },
  { id: 'incline-bench', name: 'Incline Bench Press', muscleGroups: ['chest', 'shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'db-bench', name: 'Dumbbell Bench Press', muscleGroups: ['chest', 'triceps'], equipment: 'dumbbell' },
  { id: 'db-incline', name: 'Incline Dumbbell Press', muscleGroups: ['chest', 'shoulders'], equipment: 'dumbbell' },
  { id: 'cable-fly', name: 'Cable Fly', muscleGroups: ['chest'], equipment: 'cable' },
  { id: 'pec-deck', name: 'Pec Deck', muscleGroups: ['chest'], equipment: 'machine' },
  { id: 'dips', name: 'Dips', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight' },
  { id: 'push-ups', name: 'Push Ups', muscleGroups: ['chest', 'triceps', 'shoulders'], equipment: 'bodyweight' },

  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroups: ['back', 'legs', 'glutes'], equipment: 'barbell' },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroups: ['back', 'biceps'], equipment: 'barbell' },
  { id: 'db-row', name: 'Dumbbell Row', muscleGroups: ['back', 'biceps'], equipment: 'dumbbell' },
  { id: 'pull-ups', name: 'Pull Ups', muscleGroups: ['back', 'biceps'], equipment: 'bodyweight' },
  { id: 'chin-ups', name: 'Chin Ups', muscleGroups: ['back', 'biceps'], equipment: 'bodyweight' },
  { id: 'lat-pulldown', name: 'Lat Pulldown', muscleGroups: ['back', 'biceps'], equipment: 'cable' },
  { id: 'seated-row', name: 'Seated Cable Row', muscleGroups: ['back', 'biceps'], equipment: 'cable' },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroups: ['back'], equipment: 'barbell' },
  { id: 'face-pull', name: 'Face Pull', muscleGroups: ['back', 'shoulders'], equipment: 'cable' },

  // Shoulders
  { id: 'ohp', name: 'Overhead Press', muscleGroups: ['shoulders', 'triceps'], equipment: 'barbell' },
  { id: 'db-shoulder-press', name: 'Dumbbell Shoulder Press', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'lateral-raise', name: 'Lateral Raise', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'cable-lateral', name: 'Cable Lateral Raise', muscleGroups: ['shoulders'], equipment: 'cable' },
  { id: 'front-raise', name: 'Front Raise', muscleGroups: ['shoulders'], equipment: 'dumbbell' },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', muscleGroups: ['shoulders', 'back'], equipment: 'dumbbell' },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroups: ['shoulders', 'triceps'], equipment: 'dumbbell' },
  { id: 'upright-row', name: 'Upright Row', muscleGroups: ['shoulders', 'biceps'], equipment: 'barbell' },

  // Biceps
  { id: 'barbell-curl', name: 'Barbell Curl', muscleGroups: ['biceps'], equipment: 'barbell' },
  { id: 'db-curl', name: 'Dumbbell Curl', muscleGroups: ['biceps'], equipment: 'dumbbell' },
  { id: 'hammer-curl', name: 'Hammer Curl', muscleGroups: ['biceps'], equipment: 'dumbbell' },
  { id: 'preacher-curl', name: 'Preacher Curl', muscleGroups: ['biceps'], equipment: 'dumbbell' },
  { id: 'cable-curl', name: 'Cable Curl', muscleGroups: ['biceps'], equipment: 'cable' },
  { id: 'incline-curl', name: 'Incline Dumbbell Curl', muscleGroups: ['biceps'], equipment: 'dumbbell' },

  // Triceps
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroups: ['triceps'], equipment: 'cable' },
  { id: 'skull-crushers', name: 'Skull Crushers', muscleGroups: ['triceps'], equipment: 'barbell' },
  { id: 'overhead-extension', name: 'Overhead Tricep Extension', muscleGroups: ['triceps'], equipment: 'dumbbell' },
  { id: 'tricep-dips', name: 'Tricep Dips', muscleGroups: ['triceps'], equipment: 'bodyweight' },
  { id: 'close-grip-bench', name: 'Close Grip Bench Press', muscleGroups: ['triceps', 'chest'], equipment: 'barbell' },
  { id: 'tricep-kickback', name: 'Tricep Kickback', muscleGroups: ['triceps'], equipment: 'dumbbell' },

  // Legs
  { id: 'squat', name: 'Squat', muscleGroups: ['legs', 'glutes', 'core'], equipment: 'barbell' },
  { id: 'front-squat', name: 'Front Squat', muscleGroups: ['legs', 'core'], equipment: 'barbell' },
  { id: 'leg-press', name: 'Leg Press', muscleGroups: ['legs', 'glutes'], equipment: 'machine' },
  { id: 'lunges', name: 'Lunges', muscleGroups: ['legs', 'glutes'], equipment: 'dumbbell' },
  { id: 'leg-extension', name: 'Leg Extension', muscleGroups: ['legs'], equipment: 'machine' },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroups: ['legs'], equipment: 'machine' },
  { id: 'rdl', name: 'Romanian Deadlift', muscleGroups: ['legs', 'glutes', 'back'], equipment: 'barbell' },
  { id: 'calf-raise', name: 'Calf Raise', muscleGroups: ['legs'], equipment: 'machine' },
  { id: 'hack-squat', name: 'Hack Squat', muscleGroups: ['legs', 'glutes'], equipment: 'machine' },
  { id: 'goblet-squat', name: 'Goblet Squat', muscleGroups: ['legs', 'glutes', 'core'], equipment: 'kettlebell' },
  { id: 'bulgarian-split', name: 'Bulgarian Split Squat', muscleGroups: ['legs', 'glutes'], equipment: 'dumbbell' },

  // Glutes
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroups: ['glutes'], equipment: 'barbell' },
  { id: 'glute-bridge', name: 'Glute Bridge', muscleGroups: ['glutes'], equipment: 'bodyweight' },
  { id: 'cable-kickback', name: 'Cable Kickback', muscleGroups: ['glutes'], equipment: 'cable' },

  // Core
  { id: 'plank', name: 'Plank', muscleGroups: ['core'], equipment: 'bodyweight' },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', muscleGroups: ['core'], equipment: 'bodyweight' },
  { id: 'cable-crunch', name: 'Cable Crunch', muscleGroups: ['core'], equipment: 'cable' },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscleGroups: ['core'], equipment: 'bodyweight' },
  { id: 'russian-twist', name: 'Russian Twist', muscleGroups: ['core'], equipment: 'bodyweight' },
  { id: 'dead-bug', name: 'Dead Bug', muscleGroups: ['core'], equipment: 'bodyweight' },
]

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}
