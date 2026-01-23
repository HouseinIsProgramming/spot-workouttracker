import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Import data from localStorage (called once on first login)
export const importFromLocalStorage = mutation({
  args: {
    workouts: v.array(
      v.object({
        id: v.string(),
        focus: v.array(v.string()),
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        archivedAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        exercises: v.array(
          v.object({
            id: v.string(),
            exerciseId: v.string(),
            sets: v.array(
              v.object({
                id: v.string(),
                weight: v.number(),
                reps: v.number(),
                rpe: v.optional(v.number()),
                type: v.string(),
                completedAt: v.number(),
                prs: v.optional(v.array(v.string())),
              })
            ),
          })
        ),
      })
    ),
    exercises: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        muscleGroups: v.array(v.string()),
        equipment: v.optional(v.string()),
      })
    ),
    presets: v.array(
      v.object({
        name: v.string(),
        muscles: v.array(v.string()),
        isBuiltInOverride: v.optional(v.boolean()),
      })
    ),
  },
  handler: async (ctx, { workouts, exercises, presets }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has data (prevent duplicate imports)
    const existingWorkouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingWorkouts) {
      return { imported: false, reason: "Data already exists" };
    }

    // Import workouts
    for (const workout of workouts) {
      await ctx.db.insert("workouts", {
        userId,
        focus: workout.focus,
        startedAt: workout.startedAt,
        completedAt: workout.completedAt,
        archivedAt: workout.archivedAt,
        notes: workout.notes,
        exercises: workout.exercises,
      });
    }

    // Import custom exercises
    for (const exercise of exercises) {
      await ctx.db.insert("exercises", {
        userId,
        name: exercise.name,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
      });
    }

    // Import presets
    for (const preset of presets) {
      await ctx.db.insert("presets", {
        userId,
        name: preset.name,
        muscles: preset.muscles,
        isBuiltInOverride: preset.isBuiltInOverride ?? false,
      });
    }

    return {
      imported: true,
      counts: {
        workouts: workouts.length,
        exercises: exercises.length,
        presets: presets.length,
      },
    };
  },
});
