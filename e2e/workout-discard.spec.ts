import { test, expect } from '@playwright/test'
import { startWorkout, addExercise, logSet, discardWorkout, ensureNoActiveWorkout, waitForApp } from './helpers/workout'

test.describe('Workout Discard', () => {
  test.beforeEach(async ({ page }) => {
    await ensureNoActiveWorkout(page)
  })

  test('discard removes workout completely', async ({ page }) => {
    // Start and populate a workout
    await startWorkout(page, ['back'])
    await addExercise(page, 'Pull Ups')
    await logSet(page, 0, 10)

    // Discard it
    await discardWorkout(page)

    // Verify redirected home
    await expect(page).toHaveURL('/')

    // Go to workout page - should show "No Active Workout"
    await page.goto('/workout')
    await waitForApp(page)
    await expect(page.locator('text=No Active Workout')).toBeVisible({ timeout: 10000 })
  })

  test('discard requires double-tap confirmation', async ({ page }) => {
    await startWorkout(page, ['chest'])

    // Open dropdown
    await page.locator('header button[data-size="icon"]').click()

    // First click shows confirmation text (menu stays open via onSelect preventDefault)
    await page.locator('[role="menuitem"]:has-text("Discard Workout")').click()
    await expect(page.locator('[role="menuitem"]:has-text("Tap again to discard")')).toBeVisible()

    // Wait for the 2s timeout to reset
    await page.waitForTimeout(2500)

    // Text should revert (menu is still open)
    await expect(page.locator('[role="menuitem"]:has-text("Discard Workout")')).toBeVisible({ timeout: 3000 })
  })
})
