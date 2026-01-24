import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Get current user's active workout
export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

// Start a new workout (optionally from a template)
export const start = mutation({
  args: {
    focus: v.array(v.string()),
    templateId: v.optional(v.id("workoutTemplates")),
  },
  handler: async (ctx, { focus, templateId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if there's already an active workout
    const existing = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new Error("Already have an active workout");
    }

    // If starting from template, pre-fill exercises
    let exercises: { id: string; exerciseId: string; sets: never[] }[] = [];
    if (templateId) {
      const template = await ctx.db.get(templateId);
      if (template && template.userId === userId) {
        exercises = template.exercises.map((e) => ({
          id: generateId(),
          exerciseId: e.exerciseId,
          sets: [],
        }));
      }
    }

    const id = await ctx.db.insert("activeWorkouts", {
      userId,
      focus,
      startedAt: Date.now(),
      exercises,
    });

    return await ctx.db.get(id);
  },
});

// Add an exercise to the active workout
export const addExercise = mutation({
  args: {
    exerciseId: v.string(),
  },
  handler: async (ctx, { exerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const newExercise = {
      id: generateId(),
      exerciseId,
      sets: [],
    };

    await ctx.db.patch(workout._id, {
      exercises: [...workout.exercises, newExercise],
    });

    return newExercise;
  },
});

// Remove an exercise from the active workout
export const removeExercise = mutation({
  args: {
    workoutExerciseId: v.string(),
  },
  handler: async (ctx, { workoutExerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const exerciseIndex = workout.exercises.findIndex(
      (e) => e.id === workoutExerciseId
    );
    if (exerciseIndex === -1) throw new Error("Exercise not found");

    const removedExercise = workout.exercises[exerciseIndex];

    await ctx.db.patch(workout._id, {
      exercises: workout.exercises.filter((e) => e.id !== workoutExerciseId),
    });

    return { exercise: removedExercise, index: exerciseIndex };
  },
});

// Restore a removed exercise at a specific index
export const restoreExercise = mutation({
  args: {
    exercise: v.object({
      id: v.string(),
      exerciseId: v.string(),
      sets: v.array(
        v.object({
          id: v.string(),
          weight: v.number(),
          reps: v.number(),
          rpe: v.optional(v.number()),
          type: v.string(),
          completedAt: v.optional(v.number()),
          checkedAt: v.optional(v.number()),
          prs: v.optional(v.array(v.string())),
        })
      ),
    }),
    atIndex: v.optional(v.number()),
  },
  handler: async (ctx, { exercise, atIndex }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const exercises = [...workout.exercises];
    if (atIndex !== undefined && atIndex >= 0 && atIndex <= exercises.length) {
      exercises.splice(atIndex, 0, exercise);
    } else {
      exercises.push(exercise);
    }

    await ctx.db.patch(workout._id, { exercises });
  },
});

// Add a set to an exercise
export const addSet = mutation({
  args: {
    workoutExerciseId: v.string(),
    weight: v.number(),
    reps: v.number(),
    type: v.string(),
    rpe: v.optional(v.number()),
    prs: v.optional(v.array(v.string())),
    autoComplete: v.optional(v.boolean()), // Default true (freestyle), false for templates
  },
  handler: async (
    ctx,
    { workoutExerciseId, weight, reps, type, rpe, prs, autoComplete = true }
  ) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const newSet = {
      id: generateId(),
      weight,
      reps,
      type,
      rpe,
      completedAt: autoComplete ? Date.now() : undefined,
      prs: prs && prs.length > 0 ? prs : undefined,
    };

    const exercises = workout.exercises.map((e) => {
      if (e.id !== workoutExerciseId) return e;
      return {
        ...e,
        sets: [...e.sets, newSet],
      };
    });

    await ctx.db.patch(workout._id, { exercises });

    return newSet;
  },
});

// Toggle set completion status (for checkbox UI)
export const toggleSetCompletion = mutation({
  args: {
    workoutExerciseId: v.string(),
    setId: v.string(),
  },
  handler: async (ctx, { workoutExerciseId, setId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const exercises = workout.exercises.map((e) => {
      if (e.id !== workoutExerciseId) return e;
      return {
        ...e,
        sets: e.sets.map((s) => {
          if (s.id !== setId) return s;
          // Toggle: if completed, uncomplete; if uncompleted, complete
          return {
            ...s,
            completedAt: s.completedAt ? undefined : Date.now(),
          };
        }),
      };
    });

    await ctx.db.patch(workout._id, { exercises });
  },
});

// Update an existing set
export const updateSet = mutation({
  args: {
    workoutExerciseId: v.string(),
    setId: v.string(),
    weight: v.optional(v.number()),
    reps: v.optional(v.number()),
    type: v.optional(v.string()),
    rpe: v.optional(v.number()),
    prs: v.optional(v.array(v.string())),
    checkedAt: v.optional(v.number()),
  },
  handler: async (ctx, { workoutExerciseId, setId, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const exercises = workout.exercises.map((e) => {
      if (e.id !== workoutExerciseId) return e;
      return {
        ...e,
        sets: e.sets.map((s) => {
          if (s.id !== setId) return s;
          const updated = { ...s };
          if (updates.weight !== undefined) updated.weight = updates.weight;
          if (updates.reps !== undefined) updated.reps = updates.reps;
          if (updates.type !== undefined) updated.type = updates.type;
          if (updates.rpe !== undefined) updated.rpe = updates.rpe;
          if (updates.prs !== undefined) updated.prs = updates.prs;
          if (updates.checkedAt !== undefined)
            updated.checkedAt = updates.checkedAt;
          return updated;
        }),
      };
    });

    await ctx.db.patch(workout._id, { exercises });
  },
});

// Remove a set from an exercise
export const removeSet = mutation({
  args: {
    workoutExerciseId: v.string(),
    setId: v.string(),
  },
  handler: async (ctx, { workoutExerciseId, setId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    const exercises = workout.exercises.map((e) => {
      if (e.id !== workoutExerciseId) return e;
      return {
        ...e,
        sets: e.sets.filter((s) => s.id !== setId),
      };
    });

    await ctx.db.patch(workout._id, { exercises });
  },
});

// Set workout notes
export const setNotes = mutation({
  args: {
    notes: v.string(),
  },
  handler: async (ctx, { notes }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    await ctx.db.patch(workout._id, { notes });
  },
});

// Complete the workout (move to workouts table)
export const complete = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    // Create completed workout in workouts table
    const completedId = await ctx.db.insert("workouts", {
      userId,
      focus: workout.focus,
      startedAt: workout.startedAt,
      completedAt: Date.now(),
      notes: workout.notes,
      exercises: workout.exercises,
    });

    // Delete the active workout
    await ctx.db.delete(workout._id);

    return completedId;
  },
});

// Discard the workout without saving
export const discard = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const workout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!workout) throw new Error("No active workout");

    await ctx.db.delete(workout._id);
  },
});
