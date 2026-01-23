import type { Exercise, MuscleGroup, Equipment } from './types'

const CUSTOM_EXERCISES_KEY = 'workout-tracker-custom-exercises'
const ARCHIVED_BUILTIN_KEY = 'workout-tracker-archived-builtin'

// Built-in exercises (immutable defaults)
export const builtInExercises: Exercise[] = [
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

// Stores
let customExercises: Exercise[] = []
let archivedBuiltinIds: string[] = []
let allExercisesCache: Exercise[] = []
let listeners = new Set<() => void>()

function loadCustomExercises(): Exercise[] {
  try {
    const stored = localStorage.getItem(CUSTOM_EXERCISES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function loadArchivedBuiltinIds(): string[] {
  try {
    const stored = localStorage.getItem(ARCHIVED_BUILTIN_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCustomExercises(exercises: Exercise[]) {
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises))
}

function saveArchivedBuiltinIds(ids: string[]) {
  localStorage.setItem(ARCHIVED_BUILTIN_KEY, JSON.stringify(ids))
}

// Rebuild the cached array when exercises change
function rebuildCache() {
  // Active built-in exercises (not archived)
  const activeBuiltins = builtInExercises.filter(
    (e) => !archivedBuiltinIds.includes(e.id)
  )
  // Active custom exercises (not archived)
  const activeCustom = customExercises.filter((e) => !e.archivedAt)

  allExercisesCache = [...activeBuiltins, ...activeCustom]
}

// Initialize from localStorage
customExercises = loadCustomExercises()
archivedBuiltinIds = loadArchivedBuiltinIds()
rebuildCache()

export function subscribeToExercises(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function emitChange() {
  rebuildCache()
  listeners.forEach((listener) => listener())
}

export function getCustomExercises(): Exercise[] {
  return customExercises
}

// Get all active exercises (built-in + custom, excluding archived)
export function getAllExercises(): Exercise[] {
  return allExercisesCache
}

// Get all exercises including archived (for archive view)
export function getAllExercisesIncludingArchived(): Exercise[] {
  const archivedBuiltins = builtInExercises
    .filter((e) => archivedBuiltinIds.includes(e.id))
    .map((e) => ({ ...e, archivedAt: Date.now() })) // Mark as archived
  return [...builtInExercises, ...customExercises, ...archivedBuiltins.filter(
    (ab) => !builtInExercises.some((b) => b.id === ab.id && !archivedBuiltinIds.includes(b.id))
  )]
}

// Get only archived exercises
export function getArchivedExercises(): Exercise[] {
  const archivedBuiltins = builtInExercises
    .filter((e) => archivedBuiltinIds.includes(e.id))
    .map((e) => ({ ...e, archivedAt: Date.now() }))
  const archivedCustom = customExercises.filter((e) => e.archivedAt)
  return [...archivedBuiltins, ...archivedCustom]
}

export function getExerciseById(id: string): Exercise | undefined {
  // First check active exercises
  const active = getAllExercises().find((e) => e.id === id)
  if (active) return active

  // Then check archived
  const archivedCustom = customExercises.find((e) => e.id === id && e.archivedAt)
  if (archivedCustom) return archivedCustom

  // Check archived builtins
  if (archivedBuiltinIds.includes(id)) {
    const builtin = builtInExercises.find((e) => e.id === id)
    if (builtin) return { ...builtin, archivedAt: Date.now() }
  }

  return undefined
}

export function isCustomExercise(id: string): boolean {
  return customExercises.some((e) => e.id === id)
}

export function isBuiltInExercise(id: string): boolean {
  return builtInExercises.some((e) => e.id === id)
}

export function isArchivedExercise(id: string): boolean {
  if (archivedBuiltinIds.includes(id)) return true
  const custom = customExercises.find((e) => e.id === id)
  return custom?.archivedAt !== undefined
}

function generateId(): string {
  return 'custom-' + Math.random().toString(36).substring(2, 9)
}

export function addCustomExercise(exercise: Omit<Exercise, 'id'>): Exercise {
  const newExercise: Exercise = {
    ...exercise,
    id: generateId(),
  }
  customExercises = [...customExercises, newExercise]
  saveCustomExercises(customExercises)
  emitChange()
  return newExercise
}

export function updateCustomExercise(id: string, updates: Partial<Omit<Exercise, 'id'>>): void {
  customExercises = customExercises.map((e) =>
    e.id === id ? { ...e, ...updates } : e
  )
  saveCustomExercises(customExercises)
  emitChange()
}

// Edit a built-in exercise: archives the original and creates a modified copy
export function editBuiltInExercise(
  builtInId: string,
  updates: { name: string; muscleGroups: MuscleGroup[]; equipment?: Equipment }
): Exercise {
  // Archive the built-in
  if (!archivedBuiltinIds.includes(builtInId)) {
    archivedBuiltinIds = [...archivedBuiltinIds, builtInId]
    saveArchivedBuiltinIds(archivedBuiltinIds)
  }

  // Create a new custom exercise based on it
  const newExercise: Exercise = {
    id: generateId(),
    name: updates.name,
    muscleGroups: updates.muscleGroups,
    equipment: updates.equipment,
    basedOnId: builtInId,
  }
  customExercises = [...customExercises, newExercise]
  saveCustomExercises(customExercises)
  emitChange()
  return newExercise
}

export function deleteCustomExercise(id: string): void {
  customExercises = customExercises.filter((e) => e.id !== id)
  saveCustomExercises(customExercises)
  emitChange()
}

// Archive an exercise (soft delete)
export function archiveExercise(id: string): void {
  if (isBuiltInExercise(id)) {
    // Archive built-in
    if (!archivedBuiltinIds.includes(id)) {
      archivedBuiltinIds = [...archivedBuiltinIds, id]
      saveArchivedBuiltinIds(archivedBuiltinIds)
    }
  } else {
    // Archive custom
    customExercises = customExercises.map((e) =>
      e.id === id ? { ...e, archivedAt: Date.now() } : e
    )
    saveCustomExercises(customExercises)
  }
  emitChange()
}

// Restore an archived exercise
export function restoreExercise(id: string): void {
  if (archivedBuiltinIds.includes(id)) {
    // Restore built-in
    archivedBuiltinIds = archivedBuiltinIds.filter((bid) => bid !== id)
    saveArchivedBuiltinIds(archivedBuiltinIds)

    // If there's a custom exercise based on this, archive it (user chose to restore original)
    const customReplacement = customExercises.find((e) => e.basedOnId === id && !e.archivedAt)
    if (customReplacement) {
      customExercises = customExercises.map((e) =>
        e.id === customReplacement.id ? { ...e, archivedAt: Date.now() } : e
      )
      saveCustomExercises(customExercises)
    }
  } else {
    // Restore custom
    customExercises = customExercises.map((e) =>
      e.id === id ? { ...e, archivedAt: undefined } : e
    )
    saveCustomExercises(customExercises)
  }
  emitChange()
}

// Permanently delete a custom exercise (only for archived ones)
export function permanentlyDeleteExercise(id: string): void {
  if (isCustomExercise(id)) {
    customExercises = customExercises.filter((e) => e.id !== id)
    saveCustomExercises(customExercises)
    emitChange()
  }
}
