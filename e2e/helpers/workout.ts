import { type Page, expect } from '@playwright/test'
import { clearActiveWorkout } from './cleanup'

const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testuser123'

/** Ensure we're authenticated and on a loaded page. Re-authenticates if token expired. */
export async function waitForApp(page: Page) {
  const signInMarker = page.getByPlaceholder('Email')
  const appMarker = page.locator('nav')
  await expect(signInMarker.or(appMarker)).toBeVisible({ timeout: 15000 })

  if (await signInMarker.isVisible().catch(() => false)) {
    await signInMarker.fill(TEST_EMAIL)
    await page.getByPlaceholder('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Sign In/ }).click()
    await expect(appMarker).toBeVisible({ timeout: 15000 })
  }
}

/** Navigate to workout page and start a new workout with given muscle groups */
export async function startWorkout(page: Page, muscleGroups: string[]) {
  await page.goto('/workout')
  await waitForApp(page)

  // Wait for Convex to load — "No Active Workout" must be stable
  await expect(page.locator('text=No Active Workout')).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: 'Start Workout' }).click()

  // Wait for drawer — "Muscle Recovery" heading only exists inside the drawer
  await expect(page.locator('text=Muscle Recovery')).toBeVisible({ timeout: 5000 })

  for (const muscle of muscleGroups) {
    const btn = page.locator('.grid button').filter({ hasText: new RegExp(`^${muscle}`, 'i') })
    await btn.click()
  }

  // Scroll start button into view (drawer may overflow), force-click (vaul overlay intercepts)
  const startAction = page.locator('[data-slot="drawer-content"] button:has-text("Start ")')
  await startAction.scrollIntoViewIfNeeded()
  await startAction.click({ force: true })

  // Wait for active workout page
  await expect(page.locator('text=Add Exercise')).toBeVisible({ timeout: 10000 })
}

/** Add an exercise by name using the exercise picker */
export async function addExercise(page: Page, exerciseName: string) {
  await page.locator('button:has-text("Add Exercise")').click()

  const searchInput = page.getByPlaceholder('Search exercises...')
  await searchInput.waitFor({ timeout: 5000 })

  await searchInput.fill(exerciseName)

  // Wait for search results to filter — wait for the matching button to appear
  const exerciseBtn = page.locator('[data-slot="drawer-content"] button').filter({ hasText: exerciseName }).first()
  await expect(exerciseBtn).toBeVisible({ timeout: 3000 })

  // Drawer overlay clips the viewport — use JS click to bypass
  await exerciseBtn.evaluate((el: HTMLElement) => el.click())

  // Wait for drawer to close and exercise card to appear
  await expect(page.locator(`h3:has-text("${exerciseName}")`)).toBeVisible({ timeout: 5000 })
}

/** Log a set with given weight and reps for the last exercise card's input */
export async function logSet(page: Page, weight: number, reps: number) {
  const weightInput = page.locator('input[inputmode="decimal"]').last()
  const repsInput = page.locator('input[inputmode="numeric"]').last()

  await weightInput.click()
  await weightInput.fill(String(weight))

  await repsInput.click()
  await repsInput.fill(String(reps))

  await page.locator('button:has-text("Log")').last().click()

  // Brief wait for Convex mutation — no DOM signal available (input keeps its value)
  await page.waitForTimeout(500)
}

/** Complete the current workout via the bottom button */
export async function completeWorkout(page: Page) {
  const completeBtn = page.getByRole('button', { name: 'Complete Workout' })
  await completeBtn.click()

  const confirmBtn = page.getByRole('button', { name: 'Tap again to complete' })
  await expect(confirmBtn).toBeVisible({ timeout: 2000 })
  await confirmBtn.click()

  await page.waitForURL(/\/history/, { timeout: 10000 })
}

/** Discard the current workout via the dropdown menu */
export async function discardWorkout(page: Page) {
  await page.locator('header button[data-size="icon"]').click()
  await page.locator('[role="menuitem"]:has-text("Discard Workout")').click()

  await expect(page.locator('[role="menuitem"]:has-text("Tap again to discard")')).toBeVisible({ timeout: 2000 })
  await page.locator('[role="menuitem"]:has-text("Tap again to discard")').click()

  await page.waitForURL('/', { timeout: 5000 })
}

/** Cleanup: clear active workout via Convex API before a test */
export async function ensureNoActiveWorkout(page: Page) {
  await clearActiveWorkout(page)
  // Wait for Convex subscriptions to propagate the deletion
  // (prevents "element detached from DOM" when component re-renders)
  await page.waitForTimeout(1500)
}
