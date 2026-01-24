import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Add sample workout data for testing
export const addSampleData = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Sample workouts from past week
    const sampleWorkouts = [
      {
        focus: ["chest", "triceps"],
        startedAt: now - 2 * DAY,
        completedAt: now - 2 * DAY + 45 * 60 * 1000,
        exercises: [
          {
            id: "we1",
            exerciseId: "bench-press",
            sets: [
              { id: "s1", weight: 60, reps: 10, type: "warmup", completedAt: now - 2 * DAY },
              { id: "s2", weight: 80, reps: 8, type: "normal", completedAt: now - 2 * DAY },
              { id: "s3", weight: 85, reps: 6, type: "normal", completedAt: now - 2 * DAY },
              { id: "s4", weight: 85, reps: 5, type: "normal", completedAt: now - 2 * DAY },
            ],
          },
          {
            id: "we2",
            exerciseId: "incline-bench",
            sets: [
              { id: "s5", weight: 60, reps: 10, type: "normal", completedAt: now - 2 * DAY },
              { id: "s6", weight: 65, reps: 8, type: "normal", completedAt: now - 2 * DAY },
              { id: "s7", weight: 65, reps: 7, type: "normal", completedAt: now - 2 * DAY },
            ],
          },
          {
            id: "we3",
            exerciseId: "tricep-pushdown",
            sets: [
              { id: "s8", weight: 25, reps: 12, type: "normal", completedAt: now - 2 * DAY },
              { id: "s9", weight: 27.5, reps: 10, type: "normal", completedAt: now - 2 * DAY },
              { id: "s10", weight: 27.5, reps: 9, type: "normal", completedAt: now - 2 * DAY },
            ],
          },
        ],
      },
      {
        focus: ["back", "biceps"],
        startedAt: now - 4 * DAY,
        completedAt: now - 4 * DAY + 50 * 60 * 1000,
        exercises: [
          {
            id: "we4",
            exerciseId: "deadlift",
            sets: [
              { id: "s11", weight: 60, reps: 8, type: "warmup", completedAt: now - 4 * DAY },
              { id: "s12", weight: 100, reps: 5, type: "normal", completedAt: now - 4 * DAY },
              { id: "s13", weight: 110, reps: 5, type: "normal", completedAt: now - 4 * DAY },
              { id: "s14", weight: 120, reps: 3, type: "normal", completedAt: now - 4 * DAY, prs: ["weight"] },
            ],
          },
          {
            id: "we5",
            exerciseId: "barbell-row",
            sets: [
              { id: "s15", weight: 50, reps: 10, type: "normal", completedAt: now - 4 * DAY },
              { id: "s16", weight: 55, reps: 8, type: "normal", completedAt: now - 4 * DAY },
              { id: "s17", weight: 55, reps: 8, type: "normal", completedAt: now - 4 * DAY },
            ],
          },
          {
            id: "we6",
            exerciseId: "barbell-curl",
            sets: [
              { id: "s18", weight: 20, reps: 12, type: "normal", completedAt: now - 4 * DAY },
              { id: "s19", weight: 22.5, reps: 10, type: "normal", completedAt: now - 4 * DAY },
              { id: "s20", weight: 22.5, reps: 8, type: "normal", completedAt: now - 4 * DAY },
            ],
          },
        ],
      },
      {
        focus: ["legs", "glutes"],
        startedAt: now - 6 * DAY,
        completedAt: now - 6 * DAY + 55 * 60 * 1000,
        exercises: [
          {
            id: "we7",
            exerciseId: "squat",
            sets: [
              { id: "s21", weight: 40, reps: 10, type: "warmup", completedAt: now - 6 * DAY },
              { id: "s22", weight: 80, reps: 8, type: "normal", completedAt: now - 6 * DAY },
              { id: "s23", weight: 90, reps: 6, type: "normal", completedAt: now - 6 * DAY },
              { id: "s24", weight: 95, reps: 5, type: "normal", completedAt: now - 6 * DAY },
            ],
          },
          {
            id: "we8",
            exerciseId: "leg-press",
            sets: [
              { id: "s25", weight: 120, reps: 12, type: "normal", completedAt: now - 6 * DAY },
              { id: "s26", weight: 140, reps: 10, type: "normal", completedAt: now - 6 * DAY },
              { id: "s27", weight: 140, reps: 10, type: "normal", completedAt: now - 6 * DAY },
            ],
          },
          {
            id: "we9",
            exerciseId: "hip-thrust",
            sets: [
              { id: "s28", weight: 60, reps: 12, type: "normal", completedAt: now - 6 * DAY },
              { id: "s29", weight: 70, reps: 10, type: "normal", completedAt: now - 6 * DAY },
              { id: "s30", weight: 70, reps: 10, type: "normal", completedAt: now - 6 * DAY },
            ],
          },
        ],
      },
    ];

    // Add sample custom exercise
    await ctx.db.insert("exercises", {
      userId,
      name: "Sample Custom Exercise",
      muscleGroups: ["chest", "shoulders"],
      equipment: "dumbbell",
    });

    // Add sample workouts
    for (const workout of sampleWorkouts) {
      await ctx.db.insert("workouts", {
        userId,
        ...workout,
      });
    }

    return { workoutsAdded: sampleWorkouts.length, exercisesAdded: 1 };
  },
});

// Clear all user data (for testing)
export const clearAllData = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete all workouts
    const workouts = await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const w of workouts) {
      await ctx.db.delete(w._id);
    }

    // Delete active workout
    const activeWorkout = await ctx.db
      .query("activeWorkouts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (activeWorkout) {
      await ctx.db.delete(activeWorkout._id);
    }

    // Delete all custom exercises
    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const e of exercises) {
      await ctx.db.delete(e._id);
    }

    // Delete all presets
    const presets = await ctx.db
      .query("presets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const p of presets) {
      await ctx.db.delete(p._id);
    }

    // Delete user settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    return {
      deleted: {
        workouts: workouts.length,
        exercises: exercises.length,
        presets: presets.length,
      },
    };
  },
});
