import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

// localStorage keys to migrate
const STORAGE_KEYS = {
  activeWorkout: "workout-tracker-active-workout",
  completedWorkouts: "workout-tracker-completed-workouts",
  customExercises: "workout-tracker-custom-exercises",
  archivedBuiltin: "workout-tracker-archived-builtin",
  customPresets: "workout-tracker-custom-presets",
};

// Read localStorage data safely
function readLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

// Check if there's any localStorage data to migrate
export function hasLocalStorageData(): boolean {
  return Object.values(STORAGE_KEYS).some((key) => {
    const value = localStorage.getItem(key);
    if (!value) return false;
    try {
      const parsed = JSON.parse(value);
      // Check if it's a non-empty array or non-null object
      if (Array.isArray(parsed)) return parsed.length > 0;
      return parsed !== null;
    } catch {
      return false;
    }
  });
}

// Clear all localStorage data after migration
export function clearLocalStorageData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// Get localStorage data for migration
export function getLocalStorageData() {
  const activeWorkout = readLocalStorage<{
    id: string;
    focus: string[];
    startedAt: number;
    notes?: string;
    exercises: Array<{
      id: string;
      exerciseId: string;
      sets: Array<{
        id: string;
        weight: number;
        reps: number;
        rpe?: number;
        type: string;
        completedAt: number;
        checkedAt?: number;
        prs?: string[];
      }>;
    }>;
  } | null>(STORAGE_KEYS.activeWorkout, null);

  const completedWorkouts = readLocalStorage<
    Array<{
      id: string;
      focus: string[];
      startedAt: number;
      completedAt?: number;
      archivedAt?: number;
      notes?: string;
      exercises: Array<{
        id: string;
        exerciseId: string;
        sets: Array<{
          id: string;
          weight: number;
          reps: number;
          rpe?: number;
          type: string;
          completedAt: number;
          checkedAt?: number;
          prs?: string[];
        }>;
      }>;
    }>
  >(STORAGE_KEYS.completedWorkouts, []);

  const customExercises = readLocalStorage<
    Array<{
      id: string;
      name: string;
      muscleGroups: string[];
      equipment?: string;
      archivedAt?: number;
      basedOnId?: string;
    }>
  >(STORAGE_KEYS.customExercises, []);

  const archivedBuiltinExerciseIds = readLocalStorage<string[]>(
    STORAGE_KEYS.archivedBuiltin,
    []
  );

  const presets = readLocalStorage<
    Array<{
      name: string;
      muscles: string[];
      isBuiltInOverride?: boolean;
    }>
  >(STORAGE_KEYS.customPresets, []);

  return {
    activeWorkout,
    completedWorkouts,
    customExercises,
    archivedBuiltinExerciseIds,
    presets,
  };
}

// Migration status hook
export function useMigrationStatus() {
  const needsMigration = useQuery(api.migrations.needsMigration);
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    setHasLocalData(hasLocalStorageData());
  }, []);

  return {
    needsMigration: needsMigration === true && hasLocalData,
    isLoading: needsMigration === undefined,
  };
}

// Migration hook
export function useMigration() {
  const importMutation = useMutation(api.migrations.importFromLocalStorage);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    imported: boolean;
    counts?: {
      activeWorkout: number;
      completedWorkouts: number;
      customExercises: number;
      archivedBuiltinExerciseIds: number;
      presets: number;
    };
  } | null>(null);

  const migrate = async () => {
    setIsMigrating(true);
    setError(null);

    try {
      const data = getLocalStorageData();

      const migrationResult = await importMutation({
        activeWorkout: data.activeWorkout ?? undefined,
        completedWorkouts: data.completedWorkouts,
        customExercises: data.customExercises,
        archivedBuiltinExerciseIds: data.archivedBuiltinExerciseIds,
        presets: data.presets,
      });

      if (migrationResult.imported) {
        // Clear localStorage after successful migration
        clearLocalStorageData();
      }

      setResult(migrationResult);
      return migrationResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Migration failed";
      setError(message);
      throw err;
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    migrate,
    isMigrating,
    error,
    result,
  };
}
