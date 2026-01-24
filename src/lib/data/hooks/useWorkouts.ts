import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { getExerciseById } from "../exercises";
import type {
  MuscleGroup,
  MuscleStatus,
  Workout,
  WorkoutExercise,
  Set as WorkoutSet,
  PRType,
} from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

// Get all non-archived, completed workouts
export function useWorkouts(): Workout[] {
  const convexWorkouts = useQuery(api.workouts.list);

  return useMemo(() => {
    if (!convexWorkouts) return [];

    return convexWorkouts.map((w) => ({
      id: w._id,
      focus: w.focus as MuscleGroup[],
      startedAt: w.startedAt,
      completedAt: w.completedAt,
      archivedAt: w.archivedAt,
      notes: w.notes,
      exercises: w.exercises as WorkoutExercise[],
    }));
  }, [convexWorkouts]);
}

// Get only archived workouts
export function useArchivedWorkouts(): Workout[] {
  const convexWorkouts = useQuery(api.workouts.listArchived);

  return useMemo(() => {
    if (!convexWorkouts) return [];

    return convexWorkouts.map((w) => ({
      id: w._id,
      focus: w.focus as MuscleGroup[],
      startedAt: w.startedAt,
      completedAt: w.completedAt,
      archivedAt: w.archivedAt,
      notes: w.notes,
      exercises: w.exercises as WorkoutExercise[],
    }));
  }, [convexWorkouts]);
}

// Get a single workout by ID
export function useWorkout(id: string): Workout | undefined {
  const workout = useQuery(api.workouts.get, { id: id as Id<"workouts"> });

  return useMemo(() => {
    if (!workout) return undefined;

    return {
      id: workout._id,
      focus: workout.focus as MuscleGroup[],
      startedAt: workout.startedAt,
      completedAt: workout.completedAt,
      archivedAt: workout.archivedAt,
      notes: workout.notes,
      exercises: workout.exercises as WorkoutExercise[],
    };
  }, [workout]);
}

// Get workout history for a specific exercise
export function useExerciseHistory(exerciseId: string) {
  const history = useQuery(api.workouts.getExerciseHistory, { exerciseId });

  return useMemo(() => {
    if (!history) return [];

    return history.map((h) => {
      if (!h) return null;
      return {
        workout: {
          id: h.workout._id,
          focus: h.workout.focus as MuscleGroup[],
          startedAt: h.workout.startedAt,
          completedAt: h.workout.completedAt,
          exercises: h.workout.exercises as WorkoutExercise[],
        } as Workout,
        workoutExercise: h.workoutExercise as WorkoutExercise,
      };
    }).filter(Boolean) as { workout: Workout; workoutExercise: WorkoutExercise }[];
  }, [history]);
}

// Get the most recent sets for an exercise (for smart defaults)
export function useLastExerciseSets(
  exerciseId: string
): WorkoutSet[] | undefined {
  const history = useExerciseHistory(exerciseId);
  if (history.length === 0) return undefined;
  return history[0].workoutExercise.sets.filter((s) => s.type !== "warmup");
}

// Hook versions of mutation functions for components that need them
export function useWorkoutMutations() {
  const archiveMutation = useMutation(api.workouts.archive);
  const restoreMutation = useMutation(api.workouts.restore);
  const removeMutation = useMutation(api.workouts.remove);
  const addMutation = useMutation(api.workouts.add);

  return {
    archiveWorkout: (id: string) =>
      archiveMutation({ id: id as Id<"workouts"> }),
    restoreWorkout: (id: string) =>
      restoreMutation({ id: id as Id<"workouts"> }),
    permanentlyDeleteWorkout: (id: string) =>
      removeMutation({ id: id as Id<"workouts"> }),
    addCompletedWorkout: (workout: Workout) =>
      addMutation({
        focus: workout.focus,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt ?? Date.now(),
        notes: workout.notes,
        exercises: workout.exercises.map((e) => ({
          id: e.id,
          exerciseId: e.exerciseId,
          sets: e.sets.map((s) => ({
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            type: s.type,
            completedAt: s.completedAt,
            prs: s.prs,
          })),
        })),
      }),
  };
}

// Non-hook version for use in callbacks (deprecated, use useWorkoutMutations)
export function archiveWorkout(_workoutId: string) {
  console.warn(
    "archiveWorkout() is deprecated. Use useWorkoutMutations().archiveWorkout() instead."
  );
}

export function restoreWorkout(_workoutId: string) {
  console.warn(
    "restoreWorkout() is deprecated. Use useWorkoutMutations().restoreWorkout() instead."
  );
}

export function permanentlyDeleteWorkout(_workoutId: string) {
  console.warn(
    "permanentlyDeleteWorkout() is deprecated. Use useWorkoutMutations().permanentlyDeleteWorkout() instead."
  );
}

export function addCompletedWorkout(_workout: Workout) {
  console.warn(
    "addCompletedWorkout() is deprecated. Use useWorkoutMutations().addCompletedWorkout() instead."
  );
}

// Calculate total volume for a workout
export function calculateWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce((total, we) => {
    return (
      total +
      we.sets
        .filter((s) => s.type !== "warmup")
        .reduce((setTotal, set) => setTotal + set.weight * set.reps, 0)
    );
  }, 0);
}

// Get recently used exercise IDs (for search ranking)
export function useRecentExerciseIds(limit = 20): string[] {
  const workouts = useWorkouts();

  return useMemo(() => {
    const ids = new Set<string>();
    for (const workout of workouts) {
      for (const we of workout.exercises) {
        ids.add(we.exerciseId);
        if (ids.size >= limit) return Array.from(ids);
      }
    }
    return Array.from(ids);
  }, [workouts, limit]);
}

// Muscle freshness calculations
const HOURS_TOO_RECENT = 36;
const HOURS_RECOVERING = 48;
const HOURS_COLD = 120;

export function getMuscleStatus(hoursSinceWorked: number | null): MuscleStatus {
  if (hoursSinceWorked === null) return "cold";
  if (hoursSinceWorked < HOURS_TOO_RECENT) return "too-recent";
  if (hoursSinceWorked < HOURS_RECOVERING) return "recovering";
  if (hoursSinceWorked < HOURS_COLD) return "ready";
  return "cold";
}

export function useMuscleStatus(): Record<
  MuscleGroup,
  { status: MuscleStatus; hoursSince: number | null }
> {
  const workouts = useWorkouts();

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
    };

    const now = Date.now();

    // Find most recent workout for each muscle group
    for (const workout of workouts) {
      if (!workout.completedAt) continue;

      for (const we of workout.exercises) {
        const exercise = getExerciseById(we.exerciseId);
        if (!exercise) continue;

        for (const muscleGroup of exercise.muscleGroups) {
          const hoursSince = (now - workout.completedAt) / (1000 * 60 * 60);
          if (
            lastWorked[muscleGroup] === null ||
            hoursSince < lastWorked[muscleGroup]!
          ) {
            lastWorked[muscleGroup] = hoursSince;
          }
        }
      }
    }

    const result: Record<
      MuscleGroup,
      { status: MuscleStatus; hoursSince: number | null }
    > = {} as never;

    for (const [muscle, hours] of Object.entries(lastWorked)) {
      result[muscle as MuscleGroup] = {
        status: getMuscleStatus(hours),
        hoursSince: hours !== null ? Math.round(hours) : null,
      };
    }

    return result;
  }, [workouts]);
}

// PR Detection
export type RepRangePR = {
  weight: number;
  reps: number;
};

export type ExercisePRs = {
  maxWeight: number;
  maxWeightReps: number;
  strength: RepRangePR;    // 1-5 reps
  hypertrophy: RepRangePR; // 6-12 reps
  endurance: RepRangePR;   // 12+ reps
  maxRepsAtWeight: Record<number, number>; // weight -> max reps
};

const emptyPRs: ExercisePRs = {
  maxWeight: 0,
  maxWeightReps: 0,
  strength: { weight: 0, reps: 0 },
  hypertrophy: { weight: 0, reps: 0 },
  endurance: { weight: 0, reps: 0 },
  maxRepsAtWeight: {},
};

// Hook to get PRs for an exercise
export function useExercisePRs(exerciseId: string): ExercisePRs {
  const prs = useQuery(api.workouts.getExercisePRs, { exerciseId });

  return useMemo(() => {
    if (!prs) {
      return emptyPRs;
    }
    return prs as ExercisePRs;
  }, [prs]);
}

// Get the current PRs for an exercise (non-reactive, for callbacks)
// Uses the hook internally via a store pattern
let prCache: Record<string, ExercisePRs> = {};

export function getExercisePRs(exerciseId: string): ExercisePRs {
  // Return cached value if available, otherwise return empty PRs
  // The actual values will be populated by useExercisePRs hook
  return prCache[exerciseId] ?? emptyPRs;
}

// Update PR cache (called from components using useExercisePRs)
export function updatePRCache(exerciseId: string, prs: ExercisePRs) {
  prCache[exerciseId] = prs;
}

// Check what PRs a new set would achieve
export function checkForPRs(
  exerciseId: string,
  weight: number,
  reps: number,
  setType: string
): PRType[] {
  if (setType === "warmup") return [];

  const currentPRs = getExercisePRs(exerciseId);
  const achievedPRs: PRType[] = [];

  // Weight PR: heavier than ever before
  if (weight > currentPRs.maxWeight) {
    achievedPRs.push("weight");
  }

  // Rep range PR: heavier than ever in this rep range
  if (reps >= 1 && reps <= 5 && weight > currentPRs.strength.weight && currentPRs.strength.weight > 0) {
    achievedPRs.push("volume"); // Reusing "volume" for rep range PRs
  } else if (reps >= 6 && reps <= 12 && weight > currentPRs.hypertrophy.weight && currentPRs.hypertrophy.weight > 0) {
    achievedPRs.push("volume");
  } else if (reps > 12 && weight > currentPRs.endurance.weight && currentPRs.endurance.weight > 0) {
    achievedPRs.push("volume");
  }

  // Reps PR: more reps at this weight than ever
  const maxRepsAtWeight = currentPRs.maxRepsAtWeight[weight] ?? 0;
  if (reps > maxRepsAtWeight && maxRepsAtWeight > 0) {
    achievedPRs.push("reps");
  }

  return achievedPRs;
}
