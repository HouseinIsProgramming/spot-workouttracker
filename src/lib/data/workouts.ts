import type { Workout } from './types'

// Helper to generate timestamps relative to now
const hoursAgo = (hours: number) => Date.now() - hours * 60 * 60 * 1000
const daysAgo = (days: number) => hoursAgo(days * 24)

// Mock workout data - a few weeks of realistic training
export const mockWorkouts: Workout[] = [
  // Today - Push day (in the last 12 hours)
  {
    id: 'w1',
    focus: ['chest', 'shoulders', 'triceps'],
    startedAt: hoursAgo(10),
    completedAt: hoursAgo(9),
    exercises: [
      {
        id: 'we1',
        exerciseId: 'bench-press',
        sets: [
          { id: 's1', weight: 60, reps: 10, type: 'warmup', completedAt: hoursAgo(10) },
          { id: 's2', weight: 80, reps: 8, type: 'normal', completedAt: hoursAgo(9.9) },
          { id: 's3', weight: 80, reps: 8, type: 'normal', completedAt: hoursAgo(9.8) },
          { id: 's4', weight: 80, reps: 7, type: 'normal', rpe: 9, completedAt: hoursAgo(9.7) },
        ],
      },
      {
        id: 'we2',
        exerciseId: 'db-shoulder-press',
        sets: [
          { id: 's5', weight: 24, reps: 10, type: 'normal', completedAt: hoursAgo(9.5) },
          { id: 's6', weight: 24, reps: 9, type: 'normal', completedAt: hoursAgo(9.4) },
          { id: 's7', weight: 24, reps: 8, type: 'normal', rpe: 8, completedAt: hoursAgo(9.3) },
        ],
      },
      {
        id: 'we3',
        exerciseId: 'tricep-pushdown',
        sets: [
          { id: 's8', weight: 30, reps: 12, type: 'normal', completedAt: hoursAgo(9.2) },
          { id: 's9', weight: 30, reps: 11, type: 'normal', completedAt: hoursAgo(9.1) },
          { id: 's10', weight: 25, reps: 15, type: 'dropset', completedAt: hoursAgo(9.05) },
        ],
      },
    ],
  },

  // 2 days ago - Pull day
  {
    id: 'w2',
    focus: ['back', 'biceps'],
    startedAt: daysAgo(2),
    completedAt: daysAgo(2) + 60 * 60 * 1000,
    exercises: [
      {
        id: 'we4',
        exerciseId: 'deadlift',
        sets: [
          { id: 's11', weight: 100, reps: 5, type: 'warmup', completedAt: daysAgo(2) },
          { id: 's12', weight: 140, reps: 5, type: 'normal', completedAt: daysAgo(2) + 5 * 60000 },
          { id: 's13', weight: 140, reps: 5, type: 'normal', completedAt: daysAgo(2) + 10 * 60000 },
          { id: 's14', weight: 140, reps: 4, type: 'normal', rpe: 9, completedAt: daysAgo(2) + 15 * 60000 },
        ],
      },
      {
        id: 'we5',
        exerciseId: 'barbell-row',
        sets: [
          { id: 's15', weight: 70, reps: 8, type: 'normal', completedAt: daysAgo(2) + 20 * 60000 },
          { id: 's16', weight: 70, reps: 8, type: 'normal', completedAt: daysAgo(2) + 25 * 60000 },
          { id: 's17', weight: 70, reps: 7, type: 'normal', completedAt: daysAgo(2) + 30 * 60000 },
        ],
      },
      {
        id: 'we6',
        exerciseId: 'barbell-curl',
        sets: [
          { id: 's18', weight: 30, reps: 10, type: 'normal', completedAt: daysAgo(2) + 40 * 60000 },
          { id: 's19', weight: 30, reps: 9, type: 'normal', completedAt: daysAgo(2) + 45 * 60000 },
          { id: 's20', weight: 30, reps: 8, type: 'myorep', completedAt: daysAgo(2) + 50 * 60000 },
        ],
      },
    ],
  },

  // 4 days ago - Legs
  {
    id: 'w3',
    focus: ['legs', 'glutes'],
    startedAt: daysAgo(4),
    completedAt: daysAgo(4) + 75 * 60 * 1000,
    exercises: [
      {
        id: 'we7',
        exerciseId: 'squat',
        sets: [
          { id: 's21', weight: 60, reps: 8, type: 'warmup', completedAt: daysAgo(4) },
          { id: 's22', weight: 100, reps: 6, type: 'normal', completedAt: daysAgo(4) + 5 * 60000 },
          { id: 's23', weight: 100, reps: 6, type: 'normal', completedAt: daysAgo(4) + 10 * 60000 },
          { id: 's24', weight: 100, reps: 5, type: 'normal', rpe: 9, completedAt: daysAgo(4) + 15 * 60000 },
        ],
      },
      {
        id: 'we8',
        exerciseId: 'rdl',
        sets: [
          { id: 's25', weight: 80, reps: 10, type: 'normal', completedAt: daysAgo(4) + 25 * 60000 },
          { id: 's26', weight: 80, reps: 10, type: 'normal', completedAt: daysAgo(4) + 30 * 60000 },
          { id: 's27', weight: 80, reps: 9, type: 'normal', completedAt: daysAgo(4) + 35 * 60000 },
        ],
      },
      {
        id: 'we9',
        exerciseId: 'leg-extension',
        sets: [
          { id: 's28', weight: 50, reps: 15, type: 'normal', completedAt: daysAgo(4) + 45 * 60000 },
          { id: 's29', weight: 50, reps: 14, type: 'normal', completedAt: daysAgo(4) + 50 * 60000 },
          { id: 's30', weight: 50, reps: 12, type: 'failure', completedAt: daysAgo(4) + 55 * 60000 },
        ],
      },
    ],
  },

  // 6 days ago - Push
  {
    id: 'w4',
    focus: ['chest', 'shoulders', 'triceps'],
    startedAt: daysAgo(6),
    completedAt: daysAgo(6) + 55 * 60 * 1000,
    exercises: [
      {
        id: 'we10',
        exerciseId: 'bench-press',
        sets: [
          { id: 's31', weight: 60, reps: 10, type: 'warmup', completedAt: daysAgo(6) },
          { id: 's32', weight: 77.5, reps: 8, type: 'normal', completedAt: daysAgo(6) + 5 * 60000 },
          { id: 's33', weight: 77.5, reps: 8, type: 'normal', completedAt: daysAgo(6) + 10 * 60000 },
          { id: 's34', weight: 77.5, reps: 7, type: 'normal', completedAt: daysAgo(6) + 15 * 60000 },
        ],
      },
      {
        id: 'we11',
        exerciseId: 'ohp',
        sets: [
          { id: 's35', weight: 50, reps: 8, type: 'normal', completedAt: daysAgo(6) + 25 * 60000 },
          { id: 's36', weight: 50, reps: 7, type: 'normal', completedAt: daysAgo(6) + 30 * 60000 },
          { id: 's37', weight: 50, reps: 6, type: 'normal', rpe: 9, completedAt: daysAgo(6) + 35 * 60000 },
        ],
      },
    ],
  },

  // 8 days ago - Pull
  {
    id: 'w5',
    focus: ['back', 'biceps'],
    startedAt: daysAgo(8),
    completedAt: daysAgo(8) + 50 * 60 * 1000,
    exercises: [
      {
        id: 'we12',
        exerciseId: 'pull-ups',
        sets: [
          { id: 's38', weight: 0, reps: 10, type: 'normal', completedAt: daysAgo(8) },
          { id: 's39', weight: 0, reps: 9, type: 'normal', completedAt: daysAgo(8) + 3 * 60000 },
          { id: 's40', weight: 0, reps: 8, type: 'normal', completedAt: daysAgo(8) + 6 * 60000 },
        ],
      },
      {
        id: 'we13',
        exerciseId: 'db-row',
        sets: [
          { id: 's41', weight: 32, reps: 10, type: 'normal', completedAt: daysAgo(8) + 15 * 60000 },
          { id: 's42', weight: 32, reps: 10, type: 'normal', completedAt: daysAgo(8) + 20 * 60000 },
          { id: 's43', weight: 32, reps: 9, type: 'normal', completedAt: daysAgo(8) + 25 * 60000 },
        ],
      },
    ],
  },

  // 10 days ago - Legs
  {
    id: 'w6',
    focus: ['legs', 'glutes', 'core'],
    startedAt: daysAgo(10),
    completedAt: daysAgo(10) + 65 * 60 * 1000,
    exercises: [
      {
        id: 'we14',
        exerciseId: 'squat',
        sets: [
          { id: 's44', weight: 60, reps: 8, type: 'warmup', completedAt: daysAgo(10) },
          { id: 's45', weight: 95, reps: 6, type: 'normal', completedAt: daysAgo(10) + 5 * 60000 },
          { id: 's46', weight: 95, reps: 6, type: 'normal', completedAt: daysAgo(10) + 10 * 60000 },
          { id: 's47', weight: 95, reps: 6, type: 'normal', completedAt: daysAgo(10) + 15 * 60000 },
        ],
      },
      {
        id: 'we15',
        exerciseId: 'hip-thrust',
        sets: [
          { id: 's48', weight: 80, reps: 12, type: 'normal', completedAt: daysAgo(10) + 25 * 60000 },
          { id: 's49', weight: 80, reps: 12, type: 'normal', completedAt: daysAgo(10) + 30 * 60000 },
          { id: 's50', weight: 80, reps: 11, type: 'normal', completedAt: daysAgo(10) + 35 * 60000 },
        ],
      },
      {
        id: 'we16',
        exerciseId: 'plank',
        sets: [
          { id: 's51', weight: 0, reps: 60, type: 'normal', completedAt: daysAgo(10) + 45 * 60000 },
          { id: 's52', weight: 0, reps: 45, type: 'normal', completedAt: daysAgo(10) + 50 * 60000 },
        ],
      },
    ],
  },
]
