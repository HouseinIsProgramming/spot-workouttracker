import { useState, useRef } from 'react'
import { X, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Set, PRType } from '@/lib/data/types'

type SetRowProps = {
  set: Set
  index: number
  onDelete?: () => void // Optional for history view
  compact?: boolean // For history view
}

const setTypeStyles: Record<string, string> = {
  warmup: 'text-muted-foreground',
  dropset: 'text-orange-400',
  myorep: 'text-purple-400',
  failure: 'text-red-400',
  'rest-pause': 'text-blue-400',
}

const prShortLabels: Record<PRType, string> = {
  weight: 'W',
  volume: 'V',
  reps: 'R',
}

export function SetRow({ set, index, onDelete, compact }: SetRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleDeleteClick = () => {
    if (!onDelete) return
    if (confirmDelete) {
      onDelete()
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  const isWarmup = set.type === 'warmup'
  const hasPRs = set.prs && set.prs.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg transition-all group',
        compact ? 'py-1 px-2' : 'py-2 px-3',
        confirmDelete ? 'bg-destructive/10' : onDelete ? 'hover:bg-muted/50' : '',
        hasPRs && 'bg-yellow-500/5'
      )}
    >
      {/* Set number */}
      <span className={cn(
        'w-6 text-sm font-medium',
        isWarmup ? 'text-muted-foreground' : 'text-foreground'
      )}>
        {index}
      </span>

      {/* Weight × Reps - the main info */}
      <div className={cn(
        'flex-1 flex items-baseline gap-1.5',
        setTypeStyles[set.type] || 'text-foreground'
      )}>
        <span className={cn(
          'tabular-nums',
          compact ? 'text-base' : 'text-lg',
          isWarmup ? 'font-normal' : 'font-semibold'
        )}>
          {set.weight}
        </span>
        <span className="text-muted-foreground text-sm">kg</span>
        <span className="text-muted-foreground mx-1">×</span>
        <span className={cn(
          'tabular-nums',
          compact ? 'text-base' : 'text-lg',
          isWarmup ? 'font-normal' : 'font-semibold'
        )}>
          {set.reps}
        </span>
      </div>

      {/* PR badge */}
      {hasPRs && (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
          <Trophy className="h-3 w-3" />
          <span className="text-[10px] font-bold">
            {set.prs!.map((pr) => prShortLabels[pr]).join('')}
          </span>
        </span>
      )}

      {/* Set type badge (only for non-normal) */}
      {set.type !== 'normal' && (
        <span className={cn(
          'text-[10px] uppercase tracking-wider font-medium',
          setTypeStyles[set.type] || 'text-muted-foreground'
        )}>
          {set.type === 'warmup' ? 'W' : set.type === 'rest-pause' ? 'RP' : set.type.charAt(0).toUpperCase()}
        </span>
      )}

      {/* RPE if present */}
      {set.rpe && (
        <span className="text-xs text-muted-foreground">
          @{set.rpe}
        </span>
      )}

      {/* Delete button (only if onDelete provided) */}
      {onDelete && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-full transition-all',
            confirmDelete
              ? 'bg-destructive text-destructive-foreground'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
