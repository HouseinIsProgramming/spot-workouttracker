import { Link, useLocation } from '@tanstack/react-router'
import { Home, Dumbbell, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useActiveWorkout } from '@/lib/data/hooks'

// Order: History, Settings on left | Home, Workout on right (thumb-friendly)
const navItems = [
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/', icon: Home, label: 'Home' },
  { to: '/workout', icon: Dumbbell, label: 'Workout' },
] as const

export function BottomNav() {
  const location = useLocation()
  const { isActive } = useActiveWorkout()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/60 backdrop-blur-xl safe-area-pb z-50 border-t border-border/30">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isCurrentPath = location.pathname === to ||
            (to !== '/' && location.pathname.startsWith(to))

          const showIndicator = to === '/workout' && isActive

          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full gap-1',
                'transition-colors duration-150',
                isCurrentPath
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {showIndicator && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
