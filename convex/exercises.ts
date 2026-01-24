import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all custom exercises for the current user (excluding archived)
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return exercises.filter((e) => !e.archivedAt);
  },
});

// Get all custom exercises including archived
export const listAll = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get archived custom exercises only
export const listArchived = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const exercises = await ctx.db
      .query("exercises")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return exercises.filter((e) => e.archivedAt);
  },
});

// Add a custom exercise
export const add = mutation({
  args: {
    name: v.string(),
    muscleGroups: v.array(v.string()),
    equipment: v.optional(v.string()),
    basedOnId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("exercises", {
      userId,
      name: args.name,
      muscleGroups: args.muscleGroups,
      equipment: args.equipment,
      basedOnId: args.basedOnId,
    });
  },
});

// Update a custom exercise
export const update = mutation({
  args: {
    id: v.id("exercises"),
    name: v.optional(v.string()),
    muscleGroups: v.optional(v.array(v.string())),
    equipment: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exercise = await ctx.db.get(id);
    if (!exercise || exercise.userId !== userId) {
      throw new Error("Exercise not found");
    }

    // Filter out undefined values
    const patch: Record<string, unknown> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.muscleGroups !== undefined)
      patch.muscleGroups = updates.muscleGroups;
    if (updates.equipment !== undefined) patch.equipment = updates.equipment;

    await ctx.db.patch(id, patch);
  },
});

// Archive a custom exercise (soft delete)
export const archive = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exercise = await ctx.db.get(id);
    if (!exercise || exercise.userId !== userId) {
      throw new Error("Exercise not found");
    }

    await ctx.db.patch(id, { archivedAt: Date.now() });
  },
});

// Restore an archived custom exercise
export const restore = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exercise = await ctx.db.get(id);
    if (!exercise || exercise.userId !== userId) {
      throw new Error("Exercise not found");
    }

    await ctx.db.patch(id, { archivedAt: undefined });
  },
});

// Permanently delete a custom exercise
export const remove = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const exercise = await ctx.db.get(id);
    if (!exercise || exercise.userId !== userId) {
      throw new Error("Exercise not found");
    }

    await ctx.db.delete(id);
  },
});
