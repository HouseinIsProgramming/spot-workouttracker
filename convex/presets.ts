import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all custom presets for the current user
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("presets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Add or update a preset
export const upsert = mutation({
  args: {
    name: v.string(),
    muscles: v.array(v.string()),
    isBuiltInOverride: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if preset with same name exists
    const existing = await ctx.db
      .query("presets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const existingPreset = existing.find((p) => p.name === args.name);

    if (existingPreset) {
      await ctx.db.patch(existingPreset._id, {
        muscles: args.muscles,
        isBuiltInOverride: args.isBuiltInOverride,
      });
      return existingPreset._id;
    } else {
      return await ctx.db.insert("presets", {
        userId,
        ...args,
      });
    }
  },
});

// Delete a preset
export const remove = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const presets = await ctx.db
      .query("presets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const preset = presets.find((p) => p.name === name);
    if (preset) {
      await ctx.db.delete(preset._id);
    }
  },
});
