import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user settings (creates default if not exists)
export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Return default settings if none exist
    if (!settings) {
      return {
        userId,
        archivedBuiltinExerciseIds: [],
        migratedFromLocalStorage: false,
      };
    }

    return settings;
  },
});

// Internal helper to ensure settings exist
async function ensureSettings(
  ctx: { db: any },
  userId: any
): Promise<{ _id: any; archivedBuiltinExerciseIds: string[] }> {
  const existing = await ctx.db
    .query("userSettings")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (existing) return existing;

  const id = await ctx.db.insert("userSettings", {
    userId,
    archivedBuiltinExerciseIds: [],
  });

  return { _id: id, archivedBuiltinExerciseIds: [] };
}

// Archive a built-in exercise
export const archiveBuiltinExercise = mutation({
  args: {
    exerciseId: v.string(),
  },
  handler: async (ctx, { exerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const settings = await ensureSettings(ctx, userId);

    if (!settings.archivedBuiltinExerciseIds.includes(exerciseId)) {
      await ctx.db.patch(settings._id, {
        archivedBuiltinExerciseIds: [
          ...settings.archivedBuiltinExerciseIds,
          exerciseId,
        ],
      });
    }
  },
});

// Restore a built-in exercise
export const restoreBuiltinExercise = mutation({
  args: {
    exerciseId: v.string(),
  },
  handler: async (ctx, { exerciseId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const settings = await ensureSettings(ctx, userId);

    await ctx.db.patch(settings._id, {
      archivedBuiltinExerciseIds: settings.archivedBuiltinExerciseIds.filter(
        (id: string) => id !== exerciseId
      ),
    });
  },
});

// Mark migration as complete
export const markMigrated = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const settings = await ensureSettings(ctx, userId);

    await ctx.db.patch(settings._id, {
      migratedFromLocalStorage: true,
    });
  },
});
