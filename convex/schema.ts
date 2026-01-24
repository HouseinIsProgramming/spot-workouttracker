import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Shared set schema for both active and completed workouts
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

// Shared workout exercise schema
const workoutExerciseSchema = v.object({
  id: v.string(),
  exerciseId: v.string(),
  sets: v.array(setSchema),
});

export default defineSchema({
  ...authTables,

  // Custom exercises created by users
  exercises: defineTable({
    userId: v.id("users"),
    name: v.string(),
    muscleGroups: v.array(v.string()),
    equipment: v.optional(v.string()),
    archivedAt: v.optional(v.number()),
    basedOnId: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Completed workouts
  workouts: defineTable({
    userId: v.id("users"),
    focus: v.array(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    exercises: v.array(workoutExerciseSchema),
  })
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completedAt"]),

  // Active workout (one per user for cross-device sync)
  activeWorkouts: defineTable({
    userId: v.id("users"),
    focus: v.array(v.string()),
    startedAt: v.number(),
    notes: v.optional(v.string()),
    exercises: v.array(workoutExerciseSchema),
  }).index("by_user", ["userId"]),

  // User settings (archived built-in exercises, preferences)
  userSettings: defineTable({
    userId: v.id("users"),
    archivedBuiltinExerciseIds: v.array(v.string()),
    migratedFromLocalStorage: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  // Custom quick start presets
  presets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    muscles: v.array(v.string()),
    isBuiltInOverride: v.boolean(),
  }).index("by_user", ["userId"]),
});
