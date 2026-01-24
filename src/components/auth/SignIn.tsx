import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Dumbbell, Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function SignIn() {
  const { signIn, signInWithPassword, signUpWithPassword, isLoading } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsSubmitting(true)
    try {
      if (mode === 'signIn') {
        await signInWithPassword(email, password)
      } else {
        await signUpWithPassword(email, password)
        toast.success('Account created!')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      toast.error(mode === 'signIn' ? 'Sign in failed' : 'Sign up failed', {
        description: message.includes('Invalid') ? 'Invalid email or password' : message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Logo */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Workout Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track your lifts, hit PRs, get stronger
          </p>
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isFormLoading}
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              disabled={isFormLoading}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-12 rounded-xl"
            disabled={isFormLoading || !email || !password}
          >
            {isFormLoading ? (
              'Please wait...'
            ) : (
              <>
                {mode === 'signIn' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle sign in / sign up */}
        <button
          type="button"
          onClick={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          disabled={isFormLoading}
        >
          {mode === 'signIn' ? (
            <>Don't have an account? <span className="text-primary font-medium">Sign up</span></>
          ) : (
            <>Already have an account? <span className="text-primary font-medium">Sign in</span></>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">or continue with</span>
          </div>
        </div>

        {/* GitHub button */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-12 rounded-xl"
          onClick={signIn}
          disabled={isFormLoading}
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </Button>

        <p className="text-xs text-muted-foreground">
          Your data syncs across all your devices
        </p>
      </div>
    </div>
  )
}
