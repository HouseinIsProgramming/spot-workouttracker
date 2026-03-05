import { Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { BottomNav } from '@/components/navigation/BottomNav'
import { SignIn } from '@/components/auth/SignIn'
import { MigrationHandler } from '@/components/migration/MigrationHandler'
import { ServiceWorkerUpdater } from '@/components/pwa/ServiceWorkerUpdater'
import { useAuth } from '@/lib/auth'
import { Dumbbell } from 'lucide-react'

export function RootLayout() {
  const { isLoading, isAuthenticated } = useAuth()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center safe-area-pt">
        <div className="text-center space-y-3">
          <Dumbbell className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - show sign in
  if (!isAuthenticated) {
    return (
      <div className="safe-area-pt">
        <SignIn />
        <Toaster position="top-center" />
        <ServiceWorkerUpdater />
      </div>
    )
  }

  // Authenticated - show app with migration handler
  return (
    <MigrationHandler>
      <div className="min-h-dvh bg-background flex flex-col">
        {/* Frosted top bar for standalone PWA */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
        <main className="flex-1 pb-nav-safe overflow-y-auto safe-area-pt" style={{ touchAction: 'pan-y pinch-zoom' }}>
          <Outlet />
        </main>
        <BottomNav />
        <Toaster position="top-center" />
        <ServiceWorkerUpdater />
      </div>
    </MigrationHandler>
  )
}
