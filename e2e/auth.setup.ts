import { test as setup, expect } from '@playwright/test'

const TEST_EMAIL = 'test@test.com'
const TEST_PASSWORD = 'testuser123'

setup('authenticate', async ({ page }) => {
  await page.goto('/')

  // Wait for sign-in form to fully render
  await page.getByPlaceholder('Email').waitFor({ timeout: 10000 })

  await page.getByPlaceholder('Email').fill(TEST_EMAIL)
  await page.getByPlaceholder('Password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: /Sign In/ }).click()

  // Wait for the bottom nav to appear — it only renders when authenticated
  await expect(page.locator('text=Home')).toBeVisible({ timeout: 15000 })

  // Give Convex time to fully sync and write tokens to localStorage
  await page.waitForTimeout(3000)

  // Save auth state (cookies + localStorage with Convex JWT)
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
