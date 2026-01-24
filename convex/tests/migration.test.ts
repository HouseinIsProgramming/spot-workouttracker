import { convexTest } from "convex-test";
import { describe, test, expect } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { Id } from "../_generated/dataModel";

// Helper to create authenticated context
async function createAuthenticatedTest() {
  const t = convexTest(schema);

  // Create a user in the users table
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {});
  });

  // Return test client with identity set
  return {
    t: t.withIdentity({ subject: userId }),
    userId: userId as unknown as Id<"users">,
  };
}

describe("Active Workout Operations", () => {
  test("Test 1: startWorkout creates new active workout with focus", async () => {
    const { t } = await createAuthenticatedTest();

    const workout = await t.mutation(api.activeWorkouts.start, {
      focus: ["chest", "triceps"],
    });

    expect(workout).toBeDefined();
    expect(workout?.focus).toEqual(["chest", "triceps"]);
    expect(workout?.exercises).toEqual([]);
    expect(workout?.startedAt).toBeDefined();
  });

  test("Test 2: addExercise adds exercise to active workout", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    const workout = await t.query(api.activeWorkouts.get);
    expect(workout?.exercises).toHaveLength(1);
    expect(workout?.exercises[0].exerciseId).toBe("bench-press");
    expect(workout?.exercises[0].sets).toEqual([]);
  });

  test("Test 3: addSet adds set with correct data", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    let workout = await t.query(api.activeWorkouts.get);
    const workoutExerciseId = workout?.exercises[0].id;

    await t.mutation(api.activeWorkouts.addSet, {
      workoutExerciseId: workoutExerciseId!,
      weight: 100,
      reps: 10,
      type: "normal",
    });

    workout = await t.query(api.activeWorkouts.get);
    expect(workout?.exercises[0].sets).toHaveLength(1);
    expect(workout?.exercises[0].sets[0].weight).toBe(100);
    expect(workout?.exercises[0].sets[0].reps).toBe(10);
  });

  test("Test 4: updateSet modifies existing set", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    let workout = await t.query(api.activeWorkouts.get);
    const workoutExerciseId = workout?.exercises[0].id;

    await t.mutation(api.activeWorkouts.addSet, {
      workoutExerciseId: workoutExerciseId!,
      weight: 100,
      reps: 10,
      type: "normal",
    });

    workout = await t.query(api.activeWorkouts.get);
    const setId = workout?.exercises[0].sets[0].id;

    await t.mutation(api.activeWorkouts.updateSet, {
      workoutExerciseId: workoutExerciseId!,
      setId: setId!,
      weight: 110,
    });

    workout = await t.query(api.activeWorkouts.get);
    expect(workout?.exercises[0].sets[0].weight).toBe(110);
  });

  test("Test 5: removeSet deletes set from exercise", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    let workout = await t.query(api.activeWorkouts.get);
    const workoutExerciseId = workout?.exercises[0].id;

    // Add two sets
    await t.mutation(api.activeWorkouts.addSet, {
      workoutExerciseId: workoutExerciseId!,
      weight: 100,
      reps: 10,
      type: "normal",
    });
    await t.mutation(api.activeWorkouts.addSet, {
      workoutExerciseId: workoutExerciseId!,
      weight: 100,
      reps: 8,
      type: "normal",
    });

    workout = await t.query(api.activeWorkouts.get);
    expect(workout?.exercises[0].sets).toHaveLength(2);

    const firstSetId = workout?.exercises[0].sets[0].id;

    await t.mutation(api.activeWorkouts.removeSet, {
      workoutExerciseId: workoutExerciseId!,
      setId: firstSetId!,
    });

    workout = await t.query(api.activeWorkouts.get);
    expect(workout?.exercises[0].sets).toHaveLength(1);
  });

  test("Test 6: completeWorkout moves active workout to completed", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    let workout = await t.query(api.activeWorkouts.get);
    const workoutExerciseId = workout?.exercises[0].id;

    await t.mutation(api.activeWorkouts.addSet, {
      workoutExerciseId: workoutExerciseId!,
      weight: 100,
      reps: 10,
      type: "normal",
    });

    await t.mutation(api.activeWorkouts.complete, {});

    // Active workout should be null
    const activeWorkout = await t.query(api.activeWorkouts.get);
    expect(activeWorkout).toBeNull();

    // Completed workouts should have one entry
    const completedWorkouts = await t.query(api.workouts.list);
    expect(completedWorkouts).toHaveLength(1);
    expect(completedWorkouts[0].completedAt).toBeDefined();
  });

  test("Test 7: discardWorkout removes active workout without saving", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.activeWorkouts.start, { focus: ["chest"] });
    await t.mutation(api.activeWorkouts.addExercise, {
      exerciseId: "bench-press",
    });

    await t.mutation(api.activeWorkouts.discard, {});

    const activeWorkout = await t.query(api.activeWorkouts.get);
    expect(activeWorkout).toBeNull();

    const completedWorkouts = await t.query(api.workouts.list);
    expect(completedWorkouts).toHaveLength(0);
  });
});

describe("Workout Queries", () => {
  test("Test 8: listWorkouts excludes archived workouts", async () => {
    const { t, userId } = await createAuthenticatedTest();

    // Create 3 workouts
    for (let i = 0; i < 3; i++) {
      await t.run(async (ctx) => {
        await ctx.db.insert("workouts", {
          userId,
          focus: ["chest"],
          startedAt: Date.now() - i * 1000,
          completedAt: Date.now() - i * 1000,
          exercises: [],
        });
      });
    }

    let workouts = await t.query(api.workouts.list);
    expect(workouts).toHaveLength(3);

    // Archive one workout
    await t.mutation(api.workouts.archive, { id: workouts[0]._id });

    workouts = await t.query(api.workouts.list);
    expect(workouts).toHaveLength(2);
  });

  test("Test 9: getExercisePRs returns correct max values", async () => {
    const { t, userId } = await createAuthenticatedTest();

    // Create workout with known sets
    await t.run(async (ctx) => {
      await ctx.db.insert("workouts", {
        userId,
        focus: ["chest"],
        startedAt: Date.now(),
        completedAt: Date.now(),
        exercises: [
          {
            id: "ex1",
            exerciseId: "bench-press",
            sets: [
              {
                id: "s1",
                weight: 100,
                reps: 10,
                type: "normal",
                completedAt: Date.now(),
              },
              {
                id: "s2",
                weight: 110,
                reps: 8,
                type: "normal",
                completedAt: Date.now(),
              },
              {
                id: "s3",
                weight: 100,
                reps: 12,
                type: "normal",
                completedAt: Date.now(),
              },
            ],
          },
        ],
      });
    });

    const prs = await t.query(api.workouts.getExercisePRs, {
      exerciseId: "bench-press",
    });

    expect(prs.maxWeight).toBe(110);
    expect(prs.maxWeightReps).toBe(8); // reps at max weight
    expect(prs.hypertrophy.weight).toBe(110); // best weight in 6-12 rep range
    expect(prs.maxRepsAtWeight[100]).toBe(12);
    expect(prs.maxRepsAtWeight[110]).toBe(8);
  });
});

describe("Exercise Operations", () => {
  test("Test 10: archiveExercise soft deletes exercise", async () => {
    const { t } = await createAuthenticatedTest();

    // Add a custom exercise
    const exerciseId = await t.mutation(api.exercises.add, {
      name: "My Custom Exercise",
      muscleGroups: ["chest"],
    });

    // Verify it appears in list
    let exercises = await t.query(api.exercises.list);
    expect(exercises.some((e) => e._id === exerciseId)).toBe(true);

    // Archive it
    await t.mutation(api.exercises.archive, { id: exerciseId });

    // Verify it's no longer in active list
    exercises = await t.query(api.exercises.list);
    expect(exercises.some((e) => e._id === exerciseId)).toBe(false);

    // Verify it's in archived list
    const archived = await t.query(api.exercises.listArchived);
    expect(archived.some((e) => e._id === exerciseId)).toBe(true);
  });

  test("Test 11: archiveBuiltinExercise adds to archived list", async () => {
    const { t } = await createAuthenticatedTest();

    await t.mutation(api.userSettings.archiveBuiltinExercise, {
      exerciseId: "bench-press",
    });

    const settings = await t.query(api.userSettings.get);
    expect(settings?.archivedBuiltinExerciseIds).toContain("bench-press");
  });

  test("Test 12: editBuiltInExercise creates copy with basedOnId", async () => {
    const { t } = await createAuthenticatedTest();

    // Archive the built-in first
    await t.mutation(api.userSettings.archiveBuiltinExercise, {
      exerciseId: "bench-press",
    });

    // Create a new exercise based on it
    const newExerciseId = await t.mutation(api.exercises.add, {
      name: "My Bench Press",
      muscleGroups: ["chest", "triceps"],
      basedOnId: "bench-press",
    });

    const exercises = await t.query(api.exercises.listAll);
    const newExercise = exercises.find((e) => e._id === newExerciseId);

    expect(newExercise).toBeDefined();
    expect(newExercise?.basedOnId).toBe("bench-press");
    expect(newExercise?.name).toBe("My Bench Press");

    // Verify built-in is archived
    const settings = await t.query(api.userSettings.get);
    expect(settings?.archivedBuiltinExerciseIds).toContain("bench-press");
  });
});

describe("Migration", () => {
  test("Test 13: importFromLocalStorage migrates all data correctly", async () => {
    const { t } = await createAuthenticatedTest();

    const result = await t.mutation(api.migrations.importFromLocalStorage, {
      activeWorkout: {
        id: "active1",
        focus: ["chest"],
        startedAt: Date.now(),
        exercises: [],
      },
      completedWorkouts: [
        {
          id: "w1",
          focus: ["back"],
          startedAt: Date.now() - 86400000,
          completedAt: Date.now() - 86400000,
          exercises: [],
        },
        {
          id: "w2",
          focus: ["legs"],
          startedAt: Date.now() - 172800000,
          completedAt: Date.now() - 172800000,
          exercises: [],
        },
        {
          id: "w3",
          focus: ["shoulders"],
          startedAt: Date.now() - 259200000,
          completedAt: Date.now() - 259200000,
          exercises: [],
        },
      ],
      customExercises: [
        { id: "custom-1", name: "Exercise 1", muscleGroups: ["chest"] },
        { id: "custom-2", name: "Exercise 2", muscleGroups: ["back"] },
      ],
      archivedBuiltinExerciseIds: ["deadlift"],
      presets: [],
    });

    expect(result.imported).toBe(true);
    expect(result.counts?.activeWorkout).toBe(1);
    expect(result.counts?.completedWorkouts).toBe(3);
    expect(result.counts?.customExercises).toBe(2);
    expect(result.counts?.archivedBuiltinExerciseIds).toBe(1);

    // Verify data exists
    const activeWorkout = await t.query(api.activeWorkouts.get);
    expect(activeWorkout).not.toBeNull();

    const workouts = await t.query(api.workouts.list);
    expect(workouts).toHaveLength(3);

    const exercises = await t.query(api.exercises.listAll);
    expect(exercises).toHaveLength(2);

    const settings = await t.query(api.userSettings.get);
    expect(settings?.archivedBuiltinExerciseIds).toContain("deadlift");
  });

  test("Test 14: migration remaps custom exercise IDs", async () => {
    const { t } = await createAuthenticatedTest();

    const result = await t.mutation(api.migrations.importFromLocalStorage, {
      completedWorkouts: [
        {
          id: "w1",
          focus: ["chest"],
          startedAt: Date.now(),
          completedAt: Date.now(),
          exercises: [
            {
              id: "we1",
              exerciseId: "custom-abc123", // References custom exercise
              sets: [],
            },
          ],
        },
      ],
      customExercises: [
        { id: "custom-abc123", name: "Custom Press", muscleGroups: ["chest"] },
      ],
      archivedBuiltinExerciseIds: [],
      presets: [],
    });

    expect(result.imported).toBe(true);

    // Get the new Convex ID for the custom exercise
    const newExerciseId = result.exerciseIdMap?.["custom-abc123"];
    expect(newExerciseId).toBeDefined();

    // Verify workout uses the new Convex ID
    const workouts = await t.query(api.workouts.list);
    expect(workouts[0].exercises[0].exerciseId).toBe(newExerciseId);
  });

  test("Test 15: migration is idempotent", async () => {
    const { t } = await createAuthenticatedTest();

    const migrationData = {
      completedWorkouts: [
        {
          id: "w1",
          focus: ["chest"],
          startedAt: Date.now(),
          completedAt: Date.now(),
          exercises: [],
        },
      ],
      customExercises: [],
      archivedBuiltinExerciseIds: [],
      presets: [],
    };

    // First migration
    const result1 = await t.mutation(
      api.migrations.importFromLocalStorage,
      migrationData
    );
    expect(result1.imported).toBe(true);

    // Second migration should be skipped
    const result2 = await t.mutation(
      api.migrations.importFromLocalStorage,
      migrationData
    );
    expect(result2.imported).toBe(false);
    expect(result2.reason).toBe("Already migrated");

    // Verify no duplicate data
    const workouts = await t.query(api.workouts.list);
    expect(workouts).toHaveLength(1);
  });
});
