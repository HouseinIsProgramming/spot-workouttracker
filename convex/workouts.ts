import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all non-archived workouts for the current user
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return workouts
      .filter((w) => !w.archivedAt && w.completedAt)
      .sort((a, b) => b.startedAt - a.startedAt);
  },
});

// Get archived workouts
export const listArchived = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return workouts
      .filter((w) => w.archivedAt)
      .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0));
  },
});

// Get a single workout by ID
export const get = query({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) return null;

    return workout;
  },
});

// Add a completed workout
export const add = mutation({
  args: {
    focus: v.array(v.string()),
    startedAt: v.number(),
    completedAt: v.number(),
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("workouts", {
      userId,
      ...args,
    });
  },
});

// Archive a workout (soft delete)
export const archive = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(id, { archivedAt: Date.now() });
  },
});

// Restore an archived workout
export const restore = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(id, { archivedAt: undefined });
  },
});

// Permanently delete a workout
export const remove = mutation({
  args: { id: v.id("workouts") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db.get(id);
    if (!workout || workout.userId !== userId) {
      throw new Error("Workout not found");
    }

    await ctx.db.delete(id);
  },
});

// Get exercise history for PR calculations
export const getExerciseHistory = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, { exerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return workouts
      .filter((w) => !w.archivedAt && w.completedAt)
      .map((workout) => {
        const workoutExercise = workout.exercises.find(
          (e) => e.exerciseId === exerciseId
        );
        if (!workoutExercise) return null;
        return { workout, workoutExercise };
      })
      .filter(Boolean)
      .sort((a, b) => b!.workout.startedAt - a!.workout.startedAt);
  },
});

// Get PRs for a specific exercise
export const getExercisePRs = query({
  args: { exerciseId: v.string() },
  handler: async (ctx, { exerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        maxWeight: 0,
        maxVolume: 0,
        maxRepsAtWeight: {} as Record<number, number>,
      };
    }

    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const prs = {
      maxWeight: 0,
      maxVolume: 0,
      maxRepsAtWeight: {} as Record<number, number>,
    };

    for (const workout of workouts) {
      if (!workout.completedAt || workout.archivedAt) continue;

      const workoutExercise = workout.exercises.find(
        (e) => e.exerciseId === exerciseId
      );
      if (!workoutExercise) continue;

      for (const set of workoutExercise.sets) {
        if (set.type === "warmup") continue;

        // Track max weight
        if (set.weight > prs.maxWeight) {
          prs.maxWeight = set.weight;
        }

        // Track max volume (weight × reps)
        const volume = set.weight * set.reps;
        if (volume > prs.maxVolume) {
          prs.maxVolume = volume;
        }

        // Track max reps at each weight
        if (
          !prs.maxRepsAtWeight[set.weight] ||
          set.reps > prs.maxRepsAtWeight[set.weight]
        ) {
          prs.maxRepsAtWeight[set.weight] = set.reps;
        }
      }
    }

    return prs;
  },
});
