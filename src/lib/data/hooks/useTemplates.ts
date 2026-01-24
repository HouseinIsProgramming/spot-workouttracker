import { useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { MuscleGroup } from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

export type WorkoutTemplate = {
  id: Id<"workoutTemplates">;
  name: string;
  focus: MuscleGroup[];
  exercises: { id: string; exerciseId: string }[];
  createdAt: number;
  updatedAt: number;
};

export function useTemplates() {
  const templatesData = useQuery(api.workoutTemplates.list);
  const createMutation = useMutation(api.workoutTemplates.create);
  const updateMutation = useMutation(api.workoutTemplates.update);
  const removeMutation = useMutation(api.workoutTemplates.remove);

  const templates: WorkoutTemplate[] = useMemo(() => {
    if (!templatesData) return [];
    return templatesData.map((t) => ({
      id: t._id,
      name: t.name,
      focus: t.focus as MuscleGroup[],
      exercises: t.exercises,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }, [templatesData]);

  const createTemplate = useCallback(
    async (
      name: string,
      focus: MuscleGroup[],
      exerciseIds: string[]
    ): Promise<Id<"workoutTemplates">> => {
      const exercises = exerciseIds.map((exerciseId) => ({
        id: Math.random().toString(36).substring(2, 9),
        exerciseId,
      }));
      return await createMutation({ name, focus, exercises });
    },
    [createMutation]
  );

  const updateTemplate = useCallback(
    async (
      id: Id<"workoutTemplates">,
      updates: {
        name?: string;
        focus?: MuscleGroup[];
        exerciseIds?: string[];
      }
    ) => {
      const exercises = updates.exerciseIds?.map((exerciseId) => ({
        id: Math.random().toString(36).substring(2, 9),
        exerciseId,
      }));
      await updateMutation({
        id,
        name: updates.name,
        focus: updates.focus,
        exercises,
      });
    },
    [updateMutation]
  );

  const deleteTemplate = useCallback(
    async (id: Id<"workoutTemplates">) => {
      await removeMutation({ id });
    },
    [removeMutation]
  );

  return {
    templates,
    isLoading: templatesData === undefined,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
