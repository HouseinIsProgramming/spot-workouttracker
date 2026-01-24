import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// List all templates for the current user
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("workoutTemplates")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get a single template by ID
export const get = query({
  args: { id: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) return null;

    return template;
  },
});

// Create a new template
export const create = mutation({
  args: {
    name: v.string(),
    focus: v.array(v.string()),
    exercises: v.array(
      v.object({
        id: v.string(),
        exerciseId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("workoutTemplates", {
      userId,
      name: args.name,
      focus: args.focus,
      exercises: args.exercises,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing template
export const update = mutation({
  args: {
    id: v.id("workoutTemplates"),
    name: v.optional(v.string()),
    focus: v.optional(v.array(v.string())),
    exercises: v.optional(
      v.array(
        v.object({
          id: v.string(),
          exerciseId: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) {
      throw new Error("Template not found");
    }

    await ctx.db.patch(args.id, {
      ...(args.name !== undefined && { name: args.name }),
      ...(args.focus !== undefined && { focus: args.focus }),
      ...(args.exercises !== undefined && { exercises: args.exercises }),
      updatedAt: Date.now(),
    });
  },
});

// Delete a template
export const remove = mutation({
  args: { id: v.id("workoutTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== userId) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.id);
  },
});
