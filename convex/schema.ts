import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Custom exercises created by users
  exercises: defineTable({
    userId: v.id("users"),
    name: v.string(),
    muscleGroups: v.array(v.string()),
    equipment: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Completed workouts
  workouts: defineTable({
    userId: v.id("users"),
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
    .index("by_user", ["userId"])
    .index("by_user_completed", ["userId", "completedAt"]),

  // Custom quick start presets
  presets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    muscles: v.array(v.string()),
    isBuiltInOverride: v.boolean(),
  }).index("by_user", ["userId"]),
});
