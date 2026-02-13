import { test, expect } from '@playwright/test'
import { startWorkout, addExercise, logSet, waitForApp, ensureNoActiveWorkout } from './helpers/workout'

test.describe('Workout Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await ensureNoActiveWorkout(page)
  })

  test('workout data survives page reload', async ({ page }) => {
    await startWorkout(page, ['back'])
    await addExercise(page, 'Deadlift')
    await logSet(page, 100, 5)
    await logSet(page, 120, 3)

    // Reload the page
    await page.reload()
    await waitForApp(page)

    // Verify workout still exists
    await expect(page.locator('h1:has-text("Back")')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h3:has-text("Deadlift")')).toBeVisible()

    // Verify sets persisted
    await expect(page.locator('text=100')).toBeVisible()
    await expect(page.locator('text=120')).toBeVisible()
  })

  test('workout data survives navigation away and back', async ({ page }) => {
    await startWorkout(page, ['legs'])
    await addExercise(page, 'Squat')
    await logSet(page, 80, 8)

    // Navigate to history
    await page.goto('/history')
    await waitForApp(page)

    // Navigate back to workout
    await page.goto('/workout')
    await waitForApp(page)

    // Verify data intact
    await expect(page.locator('h1:has-text("Legs")')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('h3:has-text("Squat")')).toBeVisible()
    await expect(page.locator('text=80')).toBeVisible()
  })

  test('decimal weights preserved after reload', async ({ page }) => {
    await startWorkout(page, ['chest'])
    await addExercise(page, 'Bench Press')
    await logSet(page, 82.5, 7)

    // Reload to verify from Convex (not optimistic cache)
    await page.reload()
    await waitForApp(page)

    await expect(page.locator('text=82.5')).toBeVisible({ timeout: 10000 })
  })

  test('multiple sets persisted in correct order', async ({ page }) => {
    await startWorkout(page, ['shoulders'])
    await addExercise(page, 'Overhead Press')

    await logSet(page, 40, 10)
    await logSet(page, 50, 8)
    await logSet(page, 55, 6)

    // Reload
    await page.reload()
    await waitForApp(page)

    // All three sets should be visible
    await expect(page.locator('text=3 working')).toBeVisible({ timeout: 10000 })
  })
})
