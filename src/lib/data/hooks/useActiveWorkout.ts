import { useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type {
  MuscleGroup,
  Workout,
  WorkoutExercise,
  SetType,
  PRType,
} from "../types";
import type { Id } from "../../../../convex/_generated/dataModel";

export function useActiveWorkout() {
  const activeWorkoutData = useQuery(api.activeWorkouts.get);
  const startMutation = useMutation(api.activeWorkouts.start);
  const addExerciseMutation = useMutation(api.activeWorkouts.addExercise);
  const removeExerciseMutation = useMutation(api.activeWorkouts.removeExercise);
  const restoreExerciseMutation = useMutation(
    api.activeWorkouts.restoreExercise
  );
  const addSetMutation = useMutation(api.activeWorkouts.addSet);
  const updateSetMutation = useMutation(api.activeWorkouts.updateSet);
  const removeSetMutation = useMutation(api.activeWorkouts.removeSet);
  const setNotesMutation = useMutation(api.activeWorkouts.setNotes);
  const completeMutation = useMutation(api.activeWorkouts.complete);
  const discardMutation = useMutation(api.activeWorkouts.discard);
  const toggleSetCompletionMutation = useMutation(
    api.activeWorkouts.toggleSetCompletion
  );

  // Transform Convex document to Workout type (using _id as id)
  const workout: Workout | null = useMemo(() => {
    if (!activeWorkoutData) return null;
    return {
      id: activeWorkoutData._id,
      focus: activeWorkoutData.focus as MuscleGroup[],
      startedAt: activeWorkoutData.startedAt,
      notes: activeWorkoutData.notes,
      exercises: activeWorkoutData.exercises as WorkoutExercise[],
    };
  }, [activeWorkoutData]);

  const startWorkout = useCallback(
    async (focus: MuscleGroup[], templateId?: Id<"workoutTemplates">) => {
      const result = await startMutation({ focus, templateId });
      if (!result) throw new Error("Failed to start workout");
      return {
        id: result._id,
        focus: result.focus as MuscleGroup[],
        startedAt: result.startedAt,
        exercises: result.exercises as WorkoutExercise[],
      } as Workout;
    },
    [startMutation]
  );

  const addExercise = useCallback(
    async (exerciseId: string) => {
      await addExerciseMutation({ exerciseId });
    },
    [addExerciseMutation]
  );

  const removeExercise = useCallback(
    async (workoutExerciseId: string) => {
      await removeExerciseMutation({ workoutExerciseId });
    },
    [removeExerciseMutation]
  );

  const restoreExercise = useCallback(
    async (exercise: WorkoutExercise, atIndex?: number) => {
      await restoreExerciseMutation({
        exercise: {
          id: exercise.id,
          exerciseId: exercise.exerciseId,
          sets: exercise.sets.map((s) => ({
            id: s.id,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            type: s.type,
            completedAt: s.completedAt,
            checkedAt: s.checkedAt,
            prs: s.prs,
          })),
        },
        atIndex,
      });
    },
    [restoreExerciseMutation]
  );

  const addSet = useCallback(
    async (
      workoutExerciseId: string,
      weight: number,
      reps: number,
      type: SetType = "normal",
      rpe?: number,
      prs?: PRType[],
      autoComplete: boolean = true
    ) => {
      await addSetMutation({
        workoutExerciseId,
        weight,
        reps,
        type,
        rpe,
        prs,
        autoComplete,
      });
    },
    [addSetMutation]
  );

  const toggleSetCompletion = useCallback(
    async (workoutExerciseId: string, setId: string) => {
      await toggleSetCompletionMutation({ workoutExerciseId, setId });
    },
    [toggleSetCompletionMutation]
  );

  const updateSet = useCallback(
    async (
      workoutExerciseId: string,
      setId: string,
      updates: Partial<{
        weight: number;
        reps: number;
        type: SetType;
        rpe: number;
        prs: PRType[];
        checkedAt: number;
      }>
    ) => {
      await updateSetMutation({
        workoutExerciseId,
        setId,
        ...updates,
      });
    },
    [updateSetMutation]
  );

  const removeSet = useCallback(
    async (workoutExerciseId: string, setId: string) => {
      await removeSetMutation({ workoutExerciseId, setId });
    },
    [removeSetMutation]
  );

  const setNotes = useCallback(
    async (notes: string) => {
      await setNotesMutation({ notes });
    },
    [setNotesMutation]
  );

  const completeWorkout = useCallback(async () => {
    await completeMutation();
  }, [completeMutation]);

  const discardWorkout = useCallback(async () => {
    await discardMutation();
  }, [discardMutation]);

  return {
    workout,
    isActive: workout !== null,
    startWorkout,
    addExercise,
    removeExercise,
    restoreExercise,
    addSet,
    updateSet,
    removeSet,
    toggleSetCompletion,
    setNotes,
    completeWorkout,
    discardWorkout,
  };
}
