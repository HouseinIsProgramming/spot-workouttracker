import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { builtInExercises } from "../exercises";
import type { Exercise, MuscleGroup } from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

// Get all exercises (built-in + custom) with reactivity
export function useExercises(): Exercise[] {
  const customExercises = useQuery(api.exercises.list);
  const userSettings = useQuery(api.userSettings.get);

  return useMemo(() => {
    const archivedBuiltinIds = userSettings?.archivedBuiltinExerciseIds ?? [];

    // Active built-in exercises (not archived)
    const activeBuiltins = builtInExercises.filter(
      (e) => !archivedBuiltinIds.includes(e.id)
    );

    // Active custom exercises (already filtered by query)
    const activeCustom = (customExercises ?? []).map((e) => ({
      id: e._id,
      name: e.name,
      muscleGroups: e.muscleGroups as MuscleGroup[],
      equipment: e.equipment as Exercise["equipment"],
      archivedAt: e.archivedAt,
      basedOnId: e.basedOnId,
    }));

    return [...activeBuiltins, ...activeCustom];
  }, [customExercises, userSettings]);
}

export function useCustomExercises(): Exercise[] {
  const customExercises = useQuery(api.exercises.listAll);

  return useMemo(() => {
    return (customExercises ?? []).map((e) => ({
      id: e._id,
      name: e.name,
      muscleGroups: e.muscleGroups as MuscleGroup[],
      equipment: e.equipment as Exercise["equipment"],
      archivedAt: e.archivedAt,
      basedOnId: e.basedOnId,
    }));
  }, [customExercises]);
}

export function useArchivedExercises(): Exercise[] {
  const archivedCustom = useQuery(api.exercises.listArchived);
  const userSettings = useQuery(api.userSettings.get);

  return useMemo(() => {
    const archivedBuiltinIds = userSettings?.archivedBuiltinExerciseIds ?? [];

    // Archived built-ins
    const archivedBuiltins = builtInExercises
      .filter((e) => archivedBuiltinIds.includes(e.id))
      .map((e) => ({ ...e, archivedAt: Date.now() }));

    // Archived custom exercises
    const customArchived = (archivedCustom ?? []).map((e) => ({
      id: e._id,
      name: e.name,
      muscleGroups: e.muscleGroups as MuscleGroup[],
      equipment: e.equipment as Exercise["equipment"],
      archivedAt: e.archivedAt,
      basedOnId: e.basedOnId,
    }));

    return [...archivedBuiltins, ...customArchived];
  }, [archivedCustom, userSettings]);
}

export function useExercise(id: string): Exercise | undefined {
  const exercises = useExercises();
  const archivedExercises = useArchivedExercises();

  return useMemo(() => {
    // First check active exercises
    const active = exercises.find((e) => e.id === id);
    if (active) return active;

    // Then check archived
    return archivedExercises.find((e) => e.id === id);
  }, [exercises, archivedExercises, id]);
}

// Exercise mutation hooks
export function useExerciseMutations() {
  const addMutation = useMutation(api.exercises.add);
  const updateMutation = useMutation(api.exercises.update);
  const archiveMutation = useMutation(api.exercises.archive);
  const restoreMutation = useMutation(api.exercises.restore);
  const removeMutation = useMutation(api.exercises.remove);
  const archiveBuiltinMutation = useMutation(
    api.userSettings.archiveBuiltinExercise
  );
  const restoreBuiltinMutation = useMutation(
    api.userSettings.restoreBuiltinExercise
  );

  return {
    addCustomExercise: async (
      exercise: Omit<Exercise, "id">
    ): Promise<string> => {
      const id = await addMutation({
        name: exercise.name,
        muscleGroups: exercise.muscleGroups,
        equipment: exercise.equipment,
        basedOnId: exercise.basedOnId,
      });
      return id;
    },
    updateCustomExercise: (
      id: string,
      updates: Partial<Omit<Exercise, "id">>
    ) =>
      updateMutation({
        id: id as Id<"exercises">,
        name: updates.name,
        muscleGroups: updates.muscleGroups,
        equipment: updates.equipment,
      }),
    archiveExercise: (id: string, isBuiltIn: boolean) => {
      if (isBuiltIn) {
        return archiveBuiltinMutation({ exerciseId: id });
      }
      return archiveMutation({ id: id as Id<"exercises"> });
    },
    restoreExercise: (id: string, isBuiltIn: boolean) => {
      if (isBuiltIn) {
        return restoreBuiltinMutation({ exerciseId: id });
      }
      return restoreMutation({ id: id as Id<"exercises"> });
    },
    deleteCustomExercise: (id: string) =>
      removeMutation({ id: id as Id<"exercises"> }),
    editBuiltInExercise: async (
      builtInId: string,
      updates: {
        name: string;
        muscleGroups: MuscleGroup[];
        equipment?: Exercise["equipment"];
      }
    ): Promise<string> => {
      // Archive the built-in
      await archiveBuiltinMutation({ exerciseId: builtInId });
      // Create a new custom exercise based on it
      const newId = await addMutation({
        name: updates.name,
        muscleGroups: updates.muscleGroups,
        equipment: updates.equipment,
        basedOnId: builtInId,
      });
      return newId;
    },
  };
}

type SearchContext = {
  query: string;
  workoutFocus?: MuscleGroup[];
  exercisesInWorkout?: string[];
  recentExerciseIds?: string[];
};

function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (t === q) return 100;

  // Starts with
  if (t.startsWith(q)) return 80;

  // Contains
  if (t.includes(q)) return 60;

  // Fuzzy character match
  let qIdx = 0;
  let score = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      score += 10;
      qIdx++;
    }
  }
  return qIdx === q.length ? score : 0;
}

function rankExercise(exercise: Exercise, context: SearchContext): number {
  let score = 0;

  // 1. Text match (fuzzy)
  if (context.query) {
    score += fuzzyMatch(context.query, exercise.name);
  } else {
    score += 10; // Base score when no query
  }

  // 2. Muscle group relevance (big boost for workout focus)
  if (context.workoutFocus?.length) {
    const overlap = exercise.muscleGroups.filter((mg) =>
      context.workoutFocus!.includes(mg)
    ).length;
    score += overlap * 25;
  }

  // 3. Recency (exercises you do often ranked higher)
  if (context.recentExerciseIds?.includes(exercise.id)) {
    score += 15;
  }

  // 4. Already in workout? (deprioritize to avoid duplicates)
  if (context.exercisesInWorkout?.includes(exercise.id)) {
    score -= 50;
  }

  return score;
}

export function useExerciseSearch(context: SearchContext) {
  const allExercises = useExercises();

  return useMemo(() => {
    const scored = allExercises
      .map((exercise) => ({
        exercise,
        score: rankExercise(exercise, context),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(({ exercise }) => exercise);
  }, [
    allExercises,
    context.query,
    context.workoutFocus,
    context.exercisesInWorkout,
    context.recentExerciseIds,
  ]);
}

export function useExercisesByMuscle(muscleGroup: MuscleGroup) {
  const allExercises = useExercises();

  return useMemo(
    () => allExercises.filter((e) => e.muscleGroups.includes(muscleGroup)),
    [allExercises, muscleGroup]
  );
}
