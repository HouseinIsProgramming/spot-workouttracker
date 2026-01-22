import { Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { BottomNav } from '@/components/navigation/BottomNav'

export function RootLayout() {
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster position="top-center" />
    </div>
  )
}
