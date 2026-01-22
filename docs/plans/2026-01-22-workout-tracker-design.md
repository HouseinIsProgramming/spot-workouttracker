# Workout Tracker PWA Design

## Overview

Mobile-first PWA for logging workouts with smart defaults, minimal taps, and Convex-ready architecture.

## Tech Stack

- Vite + React + TypeScript
- shadcn/ui (already initialized)
- TanStack Router
- vite-plugin-pwa
- localStorage for active workout persistence

## Data Types

```typescript
type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'glutes'
type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'kettlebell'
type SetType = 'normal' | 'warmup' | 'dropset' | 'myorep' | 'failure' | 'rest-pause'

type Exercise = {
  id: string
  name: string
  muscleGroups: MuscleGroup[]
  equipment?: Equipment
}

type Set = {
  id: string
  weight: number
  reps: number
  rpe?: number          // 1-10, optional
  type: SetType         // defaults to 'normal'
  completedAt: number
}

type WorkoutExercise = {
  id: string
  exerciseId: string
  sets: Set[]
}

type Workout = {
  id: string
  focus: MuscleGroup[]  // selected at workout start
  startedAt: number
  completedAt?: number  // undefined = in progress
  exercises: WorkoutExercise[]
  notes?: string
  editedAt?: number     // for tracking edits
}
```

## Routes

```
/                   → Dashboard (muscle freshness, quick-start, recent workouts)
/workout            → Active workout screen
/workout/add        → Exercise picker sheet
/history            → Workout history list
/history/:id        → Workout detail (view/edit)
/exercises          → Exercise library
/exercises/:id      → Exercise detail + history
```

## Core UX Features

### Smart Set Logging

- Prefill weight/reps from previous workout as placeholders
- "Complete Set" saves displayed values (placeholder or edited)
- +/- buttons: 2.5kg increments, 1 rep increments
- Set type selector (defaults to normal, one tap to change)

### Muscle Freshness Dashboard

Recovery status based on hours since last worked:
- **Blue (cold)**: >120 hours (5+ days)
- **Green (ready)**: 48-120 hours
- **Orange (recovering)**: 36-48 hours
- **Red (too recent)**: <36 hours

### Search-First Workout Start

- Type to search/add focus muscle groups
- Supports presets: "push" → Chest + Shoulders + Triceps
- Can start empty for freestyle logging

### Smart Exercise Picker

Ranking algorithm:
1. Fuzzy text match (highest weight)
2. Muscle group relevance to workout focus (+50)
3. Frequency/recency of use (+20)
4. Already in workout (-30 to avoid duplicates)

### Edit Workouts

- Tap history item → view detail → Edit
- Add/remove exercises, modify sets
- `editedAt` timestamp for sync integrity

## Hooks Layer

```
/src/lib/data/hooks/
  useExercises()        → exercise library with search/filter
  useWorkouts()         → workout history
  useActiveWorkout()    → current in-progress workout (localStorage)
  useWorkoutMutations() → start, add set, complete workout
  useMuscleStatus()     → freshness calculations
```

Each hook has `// TODO: Replace with useQuery(api.workouts.list)` for Convex migration.

## PWA Config

- App name: "Workout Tracker"
- Theme color: matches shadcn primary
- Offline: cache workout history for viewing
- Installable on iOS home screen

## File Structure

```
/src
  /components
    /ui           → shadcn components
    /workout      → workout-specific components
    /dashboard    → dashboard components
  /lib
    /data
      types.ts
      exercises.ts   → mock exercise library
      workouts.ts    → mock workout history
      /hooks
        useExercises.ts
        useWorkouts.ts
        useActiveWorkout.ts
        useMuscleStatus.ts
  /routes           → TanStack Router pages
```

## Deferred Features

- Progress charts (estimated 1RM, volume over time)
- User preferences (units, increment amounts)
- Workout templates
- Rest timer between sets
