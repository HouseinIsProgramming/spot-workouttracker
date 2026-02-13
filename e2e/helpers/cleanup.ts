import { type Page } from '@playwright/test'

const CONVEX_URL = 'https://brave-dogfish-97.convex.cloud'

/**
 * Clear the active workout via Convex HTTP API.
 * Uses the auth token already stored in localStorage by the auth setup.
 */
export async function clearActiveWorkout(page: Page) {
  // Navigate to app so localStorage is available from the correct origin
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  const result = await page.evaluate(async (url) => {
    // Find the Convex auth token in localStorage
    // convex-dev/auth stores it under a key like `__convexAuthJWT_...`
    let token: string | null = null
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('convexAuth') || key.includes('ConvexAuth') || key.includes('__convexAuth'))) {
        const val = localStorage.getItem(key)
        if (val && val.startsWith('ey')) {
          token = val
          break
        }
      }
    }

    // Fallback: scan all keys for JWT-looking values
    if (!token) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const val = localStorage.getItem(key)
          if (val && val.startsWith('eyJ') && val.length > 100) {
            token = val
            break
          }
        }
      }
    }

    if (!token) return { ok: false, error: 'no-token' }

    try {
      const res = await fetch(`${url}/api/mutation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: 'devTools:clearAllData',
          args: {},
          format: 'json',
        }),
      })
      return { ok: res.ok, status: res.status }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  }, CONVEX_URL)

  if (!result.ok) {
    // Fallback: if API cleanup fails, we'll let the test handle it
    console.warn('API cleanup failed:', result)
  }
}
