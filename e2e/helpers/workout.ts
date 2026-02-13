import { type Page, expect } from '@playwright/test'

const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testuser123'

/** Ensure we're authenticated and on a loaded page. Re-authenticates if token expired. */
export async function waitForApp(page: Page) {
  // Wait for either sign-in page or authenticated app to render
  const signInMarker = page.getByPlaceholder('Email')
  const appMarker = page.locator('nav')
  await expect(signInMarker.or(appMarker)).toBeVisible({ timeout: 15000 })

  // If we see the sign-in page, re-authenticate
  if (await signInMarker.isVisible().catch(() => false)) {
    await signInMarker.fill(TEST_EMAIL)
    await page.getByPlaceholder('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Sign In/ }).click()
    await expect(appMarker).toBeVisible({ timeout: 15000 })
  }
}

/** Navigate to workout page and start a new workout with given muscle groups */
export async function startWorkout(page: Page, muscleGroups: string[]) {
  // Ensure clean state first
  await ensureNoActiveWorkout(page)

  await page.goto('/workout')
  await waitForApp(page)

  // Wait for Convex to fully load — the "No Active Workout" view must be stable
  await expect(page.locator('text=No Active Workout')).toBeVisible({ timeout: 15000 })

  // Click "Start Workout" button
  await page.getByRole('button', { name: 'Start Workout' }).click()

  // Wait for drawer content — "Muscle Recovery" heading only exists inside the drawer
  await expect(page.locator('text=Muscle Recovery')).toBeVisible({ timeout: 5000 })

  // Select muscle groups from the recovery heatmap grid
  for (const muscle of muscleGroups) {
    const btn = page.locator('.grid button').filter({ hasText: new RegExp(`^${muscle}`, 'i') })
    await btn.click()
  }

  // Click the start button inside the drawer.
  // Scroll it into view first (drawer content may overflow), then force-click (vaul overlay intercepts).
  const startAction = page.locator('[data-slot="drawer-content"] button:has-text("Start ")')
  await startAction.scrollIntoViewIfNeeded()
  await startAction.click({ force: true })

  // Wait for the active workout page to load
  await expect(page.locator('text=Add Exercise')).toBeVisible({ timeout: 10000 })
}

/** Add an exercise by name using the exercise picker */
export async function addExercise(page: Page, exerciseName: string) {
  // Click "Add Exercise" dashed button
  await page.locator('button:has-text("Add Exercise")').click()

  // Wait for picker drawer's search input
  const searchInput = page.getByPlaceholder('Search exercises...')
  await searchInput.waitFor({ timeout: 5000 })

  // Search for the exercise
  await searchInput.fill(exerciseName)
  await page.waitForTimeout(500)

  // Click the matching exercise (first non-disabled)
  const exerciseBtn = page.locator('[data-slot="drawer-content"] button').filter({ hasText: exerciseName }).first()
  await exerciseBtn.click({ force: true })

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

  // Wait for Convex mutation + rerender
  await page.waitForTimeout(1000)
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

/** Cleanup: discard any active workout before a test */
export async function ensureNoActiveWorkout(page: Page) {
  await page.goto('/workout')
  await waitForApp(page)

  // Wait for Convex data to fully load before checking
  await page.waitForTimeout(3000)

  // Now check if there's an active workout
  const hasActiveWorkout = await page.locator('h1:has-text("Freestyle"), h1:has-text("Back"), h1:has-text("Chest"), h1:has-text("Legs"), h1:has-text("Shoulders")').isVisible().catch(() => false)

  if (hasActiveWorkout) {
    // Open dropdown, do the two-tap discard
    await page.locator('header button[data-size="icon"]').click()
    await page.waitForTimeout(300)

    // First click on discard
    await page.locator('[role="menuitem"]:has-text("Discard")').click()
    await page.waitForTimeout(500)

    // The menu should stay open with "Tap again" text (onSelect preventDefault)
    // If the menu closed (old code without fix), reopen and try again
    const tapAgain = page.locator('[role="menuitem"]:has-text("Tap again")')
    if (await tapAgain.isVisible({ timeout: 1000 }).catch(() => false)) {
      await tapAgain.click()
    } else {
      // Menu closed — reopen and try second tap
      await page.locator('header button[data-size="icon"]').click()
      await page.waitForTimeout(300)
      // confirmDiscard should still be true (2s timeout hasn't elapsed)
      await page.locator('[role="menuitem"]:has-text("Tap again")').click()
    }

    // Wait for discard to complete and navigation
    await page.waitForURL('/', { timeout: 10000 })
    await page.waitForTimeout(2000)
  }
}
