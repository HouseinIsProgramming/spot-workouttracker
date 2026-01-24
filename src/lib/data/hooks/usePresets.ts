import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { FOCUS_PRESETS, type MuscleGroup } from "../types";

export type CustomPreset = {
  name: string;
  muscles: MuscleGroup[];
  isBuiltInOverride?: boolean;
};

export type DisplayPreset = {
  name: string;
  muscles: MuscleGroup[];
  isBuiltIn: boolean;
  isModified: boolean;
};

// Check if a preset name is a built-in one
export function isBuiltInPreset(name: string): boolean {
  return Object.keys(FOCUS_PRESETS).includes(name);
}

export function usePresets() {
  const convexPresets = useQuery(api.presets.list);
  const upsertMutation = useMutation(api.presets.upsert);
  const removeMutation = useMutation(api.presets.remove);

  const customPresets = useMemo((): CustomPreset[] => {
    if (!convexPresets) return [];
    return convexPresets.map((p) => ({
      name: p.name,
      muscles: p.muscles as MuscleGroup[],
      isBuiltInOverride: p.isBuiltInOverride,
    }));
  }, [convexPresets]);

  // Merge built-in and custom presets for display
  const allPresets = useMemo((): DisplayPreset[] => {
    const builtIns = Object.entries(FOCUS_PRESETS).map(([name, muscles]) => {
      const customOverride = customPresets.find((p) => p.name === name);
      return {
        name,
        muscles: customOverride ? customOverride.muscles : muscles,
        isBuiltIn: true,
        isModified: !!customOverride,
      };
    });

    const customOnly = customPresets
      .filter((p) => !isBuiltInPreset(p.name))
      .map((p) => ({
        name: p.name,
        muscles: p.muscles,
        isBuiltIn: false,
        isModified: false,
      }));

    return [...builtIns, ...customOnly];
  }, [customPresets]);

  // Get all presets merged (for quick start)
  const quickStartPresets = useMemo((): Record<string, MuscleGroup[]> => {
    const customMap: Record<string, MuscleGroup[]> = {};
    customPresets.forEach((p) => {
      customMap[p.name] = p.muscles;
    });
    return { ...FOCUS_PRESETS, ...customMap };
  }, [customPresets]);

  return {
    customPresets,
    allPresets,
    quickStartPresets,
    isLoading: convexPresets === undefined,

    savePreset: async (name: string, muscles: MuscleGroup[]) => {
      const isBuiltIn = isBuiltInPreset(name);
      await upsertMutation({
        name,
        muscles,
        isBuiltInOverride: isBuiltIn,
      });
    },

    deletePreset: async (name: string) => {
      await removeMutation({ name });
    },

    resetToDefault: async (name: string) => {
      // Remove the custom override to restore built-in default
      await removeMutation({ name });
    },
  };
}
