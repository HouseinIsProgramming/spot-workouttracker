import { test, expect } from '@playwright/test'
import { startWorkout, addExercise, logSet, completeWorkout, ensureNoActiveWorkout, waitForApp } from './helpers/workout'

test.describe('Workout Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await ensureNoActiveWorkout(page)
  })

  test('start workout, add exercise, log sets, complete, verify in history', async ({ page }) => {
    // 1. Start workout with Back focus
    await startWorkout(page, ['back'])

    // 2. Add an exercise
    await addExercise(page, 'Barbell Row')

    // 3. Log sets
    await logSet(page, 60, 10)
    await logSet(page, 70, 8)
    await logSet(page, 75, 6)

    // 4. Verify sets are visible
    await expect(page.locator('text=3 working')).toBeVisible()

    // 5. Complete the workout
    await completeWorkout(page)

    // 6. Verify we're on history page
    await expect(page).toHaveURL(/\/history/)

    // 7. Verify the workout appears with correct focus
    await expect(page.locator('text=Back').first()).toBeVisible()
    await expect(page.locator('text=1 exercise').first()).toBeVisible()

    // 8. Click into the workout detail
    await page.locator('a[href*="/history/"]').first().click()
    await page.waitForURL(/\/history\//)

    // 9. Verify exercise name and set data in detail view
    await expect(page.locator('text=Barbell Row')).toBeVisible()
    await expect(page.locator('text=60kg × 10')).toBeVisible()
    await expect(page.locator('text=70kg × 8')).toBeVisible()
    await expect(page.locator('text=75kg × 6')).toBeVisible()
  })

  test('start workout with multiple muscle groups', async ({ page }) => {
    await startWorkout(page, ['chest', 'triceps'])

    // Verify focus label shows both muscles
    await expect(page.locator('h1')).toContainText(/Chest.*Triceps|Triceps.*Chest/)
  })

  test('start freestyle workout (no muscles selected)', async ({ page }) => {
    await ensureNoActiveWorkout(page)
    await page.goto('/workout')
    await waitForApp(page)
    await expect(page.locator('text=No Active Workout')).toBeVisible({ timeout: 15000 })

    await page.getByRole('button', { name: 'Start Workout' }).click()

    // Wait for drawer
    await expect(page.locator('text=Muscle Recovery')).toBeVisible({ timeout: 5000 })

    // Click start without selecting any muscles
    await page.getByRole('button', { name: 'Start Freestyle' }).click()

    // Verify freestyle label
    await expect(page.locator('h1:has-text("Freestyle")')).toBeVisible({ timeout: 5000 })
  })

  test('add multiple exercises to a workout', async ({ page }) => {
    await startWorkout(page, ['chest'])

    await addExercise(page, 'Bench Press')
    await addExercise(page, 'Incline Bench')

    // Verify both exercise cards visible
    await expect(page.locator('h3', { hasText: /^Bench Press$/ })).toBeVisible()
    await expect(page.locator('h3', { hasText: /^Incline Bench/ })).toBeVisible()

    // Verify exercise count in header
    await expect(page.locator('text=2 exercises')).toBeVisible()
  })
})
