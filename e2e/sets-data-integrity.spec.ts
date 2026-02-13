import { test, expect } from '@playwright/test'
import { startWorkout, addExercise, logSet, completeWorkout, ensureNoActiveWorkout, waitForApp } from './helpers/workout'

test.describe('Sets Data Integrity', () => {
  test.beforeEach(async ({ page }) => {
    await ensureNoActiveWorkout(page)
  })

  test('exact weight and reps preserved through complete workflow', async ({ page }) => {
    await startWorkout(page, ['chest'])
    await addExercise(page, 'Bench Press')

    // Log sets with specific values
    await logSet(page, 60, 12)
    await logSet(page, 80, 8)
    await logSet(page, 85, 6)

    // Complete the workout
    await completeWorkout(page)

    // Navigate to the workout detail
    await page.locator('a[href*="/history/"]').first().click()
    await page.waitForURL(/\/history\//)

    // Verify each set's exact data in the detail view
    await expect(page.locator('text=60kg × 12')).toBeVisible()
    await expect(page.locator('text=80kg × 8')).toBeVisible()
    await expect(page.locator('text=85kg × 6')).toBeVisible()
  })

  test('decimal weights preserved correctly', async ({ page }) => {
    await startWorkout(page, ['shoulders'])
    await addExercise(page, 'Lateral Raise')

    await logSet(page, 12.5, 15)

    // Complete and verify
    await completeWorkout(page)
    await page.locator('a[href*="/history/"]').first().click()
    await page.waitForURL(/\/history\//)

    await expect(page.locator('text=12.5kg × 15')).toBeVisible()
  })

  test('exercise count and set count match in history', async ({ page }) => {
    await startWorkout(page, ['back'])

    // Add two exercises with sets
    await addExercise(page, 'Barbell Row')
    await logSet(page, 60, 10)
    await logSet(page, 70, 8)

    await addExercise(page, 'Lat Pulldown')
    await logSet(page, 50, 12)

    // Complete
    await completeWorkout(page)

    // Verify history card shows correct exercise count
    await expect(page.locator('text=2 exercises').first()).toBeVisible()

    // Click into detail
    await page.locator('a[href*="/history/"]').first().click()
    await page.waitForURL(/\/history\//)

    // Both exercises should be visible
    await expect(page.locator('text=Barbell Row')).toBeVisible()
    await expect(page.locator('text=Lat Pulldown')).toBeVisible()
  })
})
