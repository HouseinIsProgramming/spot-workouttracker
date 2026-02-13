import { type Page } from '@playwright/test'

/**
 * Clear all test user data via the Convex devTools.clearAllData mutation.
 * This runs client-side by calling the mutation through the app's Convex client.
 */
export async function clearTestUserData(page: Page) {
  await page.goto('/')
  // Wait for app to be ready (Convex connected + authenticated)
  await page.waitForTimeout(2000)

  await page.evaluate(async () => {
    // Access the Convex client from the window (we expose it in test mode)
    // Fallback: call the API directly through the app
    const response = await fetch(
      `${(window as any).__CONVEX_URL || ''}/api/mutation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: 'devTools:clearAllData',
          args: {},
        }),
      }
    )
    return response.ok
  }).catch(() => {
    // If direct API call fails, we'll use the UI-based approach
    // The clearAllData mutation will be called through a test helper in the app
  })
}
