import { createRouter, createRootRoute, createRoute } from '@tanstack/react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { WorkoutPage } from '@/components/workout/WorkoutPage'
import { HistoryPage } from '@/components/history/HistoryPage'
import { WorkoutDetail } from '@/components/history/WorkoutDetail'
import { ExercisesPage } from '@/components/exercises/ExercisesPage'
import { ExerciseDetail } from '@/components/exercises/ExerciseDetail'
import { SettingsPage } from '@/components/settings/SettingsPage'

// Root route
const rootRoute = createRootRoute({
  component: RootLayout,
})

// Index route (Dashboard)
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

// Workout route
const workoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workout',
  component: WorkoutPage,
})

// History routes
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
})

const historyDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history/$id',
  component: WorkoutDetail,
})

// Exercise routes
const exercisesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises',
  component: ExercisesPage,
})

const exerciseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exercises/$id',
  component: ExerciseDetail,
})

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

// Build route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  workoutRoute,
  historyRoute,
  historyDetailRoute,
  exercisesRoute,
  exerciseDetailRoute,
  settingsRoute,
])

// Create router
export const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
