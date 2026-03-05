import { useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { toast } from 'sonner'

export function ServiceWorkerUpdater() {
  useEffect(() => {
    const updateSW = registerSW({
      onNeedRefresh() {
        toast('A new version is available', {
          action: {
            label: 'Refresh',
            onClick: () => updateSW(),
          },
          duration: Infinity,
        })
      },
    })
  }, [])

  return null
}
