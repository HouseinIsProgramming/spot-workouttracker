import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Set } from '@/lib/data/types'

type SetRowProps = {
  set: Set
  index: number
  onDelete: () => void
}

const setTypeStyles: Record<string, string> = {
  warmup: 'text-muted-foreground',
  dropset: 'text-orange-400',
  myorep: 'text-purple-400',
  failure: 'text-red-400',
  'rest-pause': 'text-blue-400',
}

export function SetRow({ set, index, onDelete }: SetRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleDeleteClick = () => {
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

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2 px-3 rounded-lg transition-all group',
        confirmDelete ? 'bg-destructive/10' : 'hover:bg-muted/50'
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
          'text-lg tabular-nums',
          isWarmup ? 'font-normal' : 'font-semibold'
        )}>
          {set.weight}
        </span>
        <span className="text-muted-foreground text-sm">kg</span>
        <span className="text-muted-foreground mx-1">×</span>
        <span className={cn(
          'text-lg tabular-nums',
          isWarmup ? 'font-normal' : 'font-semibold'
        )}>
          {set.reps}
        </span>
      </div>

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

      {/* Delete button */}
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
    </div>
  )
}
