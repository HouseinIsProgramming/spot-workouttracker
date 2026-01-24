import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Check if user needs migration
export const needsMigration = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return !settings?.migratedFromLocalStorage;
  },
});

// Shared set schema for validation
const setSchema = v.object({
  id: v.string(),
  weight: v.number(),
  reps: v.number(),
  rpe: v.optional(v.number()),
  type: v.string(),
  completedAt: v.number(),
  checkedAt: v.optional(v.number()),
  prs: v.optional(v.array(v.string())),
});

const workoutExerciseSchema = v.object({
  id: v.string(),
  exerciseId: v.string(),
  sets: v.array(setSchema),
});

// Full migration from localStorage
export const importFromLocalStorage = mutation({
  args: {
    activeWorkout: v.optional(
      v.object({
        id: v.string(),
        focus: v.array(v.string()),
        startedAt: v.number(),
        notes: v.optional(v.string()),
        exercises: v.array(workoutExerciseSchema),
      })
    ),
    completedWorkouts: v.array(
      v.object({
        id: v.string(),
        focus: v.array(v.string()),
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        archivedAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        exercises: v.array(workoutExerciseSchema),
      })
    ),
    customExercises: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        muscleGroups: v.array(v.string()),
        equipment: v.optional(v.string()),
        archivedAt: v.optional(v.number()),
        basedOnId: v.optional(v.string()),
      })
    ),
    archivedBuiltinExerciseIds: v.array(v.string()),
    presets: v.array(
      v.object({
        name: v.string(),
        muscles: v.array(v.string()),
        isBuiltInOverride: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (
    ctx,
    {
      activeWorkout,
      completedWorkouts,
      customExercises,
      archivedBuiltinExerciseIds,
      presets,
    }
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already migrated
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (settings?.migratedFromLocalStorage) {
      return { imported: false, reason: "Already migrated" };
    }

    // Build ID mapping for custom exercises (localStorage ID -> Convex doc ID)
    const exerciseIdMap: Record<string, string> = {};

    // Import custom exercises first (to get ID mapping)
    for (const exercise of customExercises) {
      const convexId = await ctx.db.insert("exercises", {
        userId,
        name: exercise.name,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        archivedAt: exercise.archivedAt,
        basedOnId: exercise.basedOnId,
      });
      exerciseIdMap[exercise.id] = convexId;
    }

    // Helper to remap exercise IDs in workouts
    function remapExerciseIds(
      exercises: Array<{
        id: string;
        exerciseId: string;
        sets: Array<{
          id: string;
          weight: number;
          reps: number;
          rpe?: number;
          type: string;
          completedAt: number;
          checkedAt?: number;
          prs?: string[];
        }>;
      }>
    ) {
      return exercises.map((e) => ({
        ...e,
        exerciseId: exerciseIdMap[e.exerciseId] ?? e.exerciseId,
      }));
    }

    // Import completed workouts with remapped IDs
    for (const workout of completedWorkouts) {
      await ctx.db.insert("workouts", {
        userId,
        focus: workout.focus,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
        archivedAt: workout.archivedAt,
        notes: workout.notes,
        exercises: remapExerciseIds(workout.exercises),
      });
    }

    // Import active workout with remapped IDs
    if (activeWorkout) {
      await ctx.db.insert("activeWorkouts", {
        userId,
        focus: activeWorkout.focus,
        startedAt: activeWorkout.startedAt,
        notes: activeWorkout.notes,
        exercises: remapExerciseIds(activeWorkout.exercises),
      });
    }

    // Import presets
    for (const preset of presets) {
      // Check if preset already exists
      const existing = await ctx.db
        .query("presets")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const existingPreset = existing.find((p) => p.name === preset.name);
      if (!existingPreset) {
        await ctx.db.insert("presets", {
          userId,
          name: preset.name,
          muscles: preset.muscles,
          isBuiltInOverride: preset.isBuiltInOverride ?? false,
        });
      }
    }

    // Create or update user settings with archived built-in IDs
    if (settings) {
      await ctx.db.patch(settings._id, {
        archivedBuiltinExerciseIds,
        migratedFromLocalStorage: true,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId,
        archivedBuiltinExerciseIds,
        migratedFromLocalStorage: true,
      });
    }

    return {
      imported: true,
      counts: {
        activeWorkout: activeWorkout ? 1 : 0,
        completedWorkouts: completedWorkouts.length,
        customExercises: customExercises.length,
        archivedBuiltinExerciseIds: archivedBuiltinExerciseIds.length,
        presets: presets.length,
      },
      exerciseIdMap,
    };
  },
});
