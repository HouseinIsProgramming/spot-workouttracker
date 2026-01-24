import { useState, useRef, useEffect } from 'react'
import { Check, X, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Set, PRType } from '@/lib/data/types'

type SetRowProps = {
  set: Set
  index: number
  onDelete?: () => void
  onUpdate?: (updates: Partial<Omit<Set, 'id'>>) => void
  onToggleComplete?: () => void // Toggle completedAt
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

// Scale font size based on character count
function getInputFontSize(value: number): string {
  const len = String(value).length
  if (len <= 2) return 'text-lg'
  if (len <= 3) return 'text-base'
  if (len <= 4) return 'text-sm'
  return 'text-xs'
}

export function SetRow({ set, index, onDelete, onUpdate, onToggleComplete, compact }: SetRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editWeight, setEditWeight] = useState(set.weight)
  const [editReps, setEditReps] = useState(set.reps)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const weightInputRef = useRef<HTMLInputElement>(null)

  // Reset edit values when set changes
  useEffect(() => {
    setEditWeight(set.weight)
    setEditReps(set.reps)
  }, [set.weight, set.reps])

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

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete()
    }
  }

  const handleStartEdit = () => {
    if (!onUpdate) return
    setIsEditing(true)
    setTimeout(() => weightInputRef.current?.focus(), 0)
  }

  const handleSaveEdit = () => {
    if (!onUpdate) return
    if (editWeight !== set.weight || editReps !== set.reps) {
      onUpdate({ weight: editWeight, reps: editReps })
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditWeight(set.weight)
    setEditReps(set.reps)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') handleCancelEdit()
  }

  const isWarmup = set.type === 'warmup'
  const isCompleted = !!set.completedAt
  const hasPRs = set.prs && set.prs.length > 0

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg transition-all group',
        compact ? 'py-1 px-2' : 'py-2 px-3',
        confirmDelete ? 'bg-destructive/10' : '',
        hasPRs && !confirmDelete && 'bg-yellow-500/5',
        isCompleted && !confirmDelete && !hasPRs && 'bg-primary/5'
      )}
    >
      {/* Checkmark toggle - show if we can toggle completion */}
      {onToggleComplete && (
        <button
          type="button"
          onClick={handleToggleComplete}
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-all',
            isCompleted
              ? 'bg-primary text-primary-foreground'
              : 'border-2 border-muted-foreground/30 hover:border-primary/50'
          )}
        >
          {isCompleted && <Check className="h-3.5 w-3.5" />}
        </button>
      )}

      {/* PR badge */}
      {hasPRs && (
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex-shrink-0">
          <Trophy className="h-3 w-3" />
          <span className="text-[10px] font-bold">
            {set.prs!.map((pr) => prShortLabels[pr]).join('')}
          </span>
        </span>
      )}

      {/* Set number */}
      <span className={cn(
        'w-5 text-sm font-medium flex-shrink-0',
        isWarmup ? 'text-muted-foreground' : 'text-muted-foreground'
      )}>
        {index}
      </span>

      {/* Set type badge (only for non-normal) */}
      {set.type !== 'normal' && (
        <span className={cn(
          'text-[10px] uppercase tracking-wider font-medium flex-shrink-0',
          setTypeStyles[set.type] || 'text-muted-foreground'
        )}>
          {set.type === 'warmup' ? 'W' : set.type === 'rest-pause' ? 'RP' : set.type.charAt(0).toUpperCase()}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Weight × Reps - on the right */}
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            ref={weightInputRef}
            type="number"
            inputMode="decimal"
            value={editWeight}
            onChange={(e) => setEditWeight(Math.max(0, parseFloat(e.target.value) || 0))}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-16 text-right font-semibold tabular-nums bg-muted/50 rounded px-2 py-1 border-0 outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              getInputFontSize(editWeight)
            )}
          />
          <span className="text-muted-foreground text-xs">kg</span>
          <span className="text-muted-foreground mx-0.5">×</span>
          <input
            type="number"
            inputMode="numeric"
            value={editReps}
            onChange={(e) => setEditReps(Math.max(1, parseInt(e.target.value) || 1))}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-12 text-right font-semibold tabular-nums bg-muted/50 rounded px-2 py-1 border-0 outline-none focus:ring-2 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              getInputFontSize(editReps)
            )}
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground ml-1"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleStartEdit}
          disabled={!onUpdate}
          className={cn(
            'flex items-baseline gap-1 transition-colors rounded px-2 py-0.5 -mr-2',
            onUpdate && 'hover:bg-muted/50 cursor-pointer',
            setTypeStyles[set.type] || 'text-foreground'
          )}
        >
          <span className={cn(
            'tabular-nums',
            compact ? 'text-base' : 'text-lg',
            isWarmup ? 'font-normal' : 'font-semibold'
          )}>
            {set.weight}
          </span>
          <span className="text-muted-foreground text-xs">kg</span>
          <span className="text-muted-foreground mx-0.5">×</span>
          <span className={cn(
            'tabular-nums',
            compact ? 'text-base' : 'text-lg',
            isWarmup ? 'font-normal' : 'font-semibold'
          )}>
            {set.reps}
          </span>
        </button>
      )}

      {/* RPE if present */}
      {set.rpe && !isEditing && (
        <span className="text-xs text-muted-foreground">
          @{set.rpe}
        </span>
      )}

      {/* Delete button (only if onDelete provided and not editing) */}
      {onDelete && !isEditing && (
        <button
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            'w-7 h-7 flex items-center justify-center rounded-full transition-all flex-shrink-0',
            confirmDelete
              ? 'bg-destructive text-destructive-foreground'
              : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
