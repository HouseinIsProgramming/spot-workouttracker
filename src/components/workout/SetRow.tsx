import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Set } from '@/lib/data/types'

type SetRowProps = {
  set: Set
  index: number
  onDelete: () => void
}

const setTypeLabels: Record<string, string> = {
  warmup: 'W',
  dropset: 'D',
  myorep: 'M',
  failure: 'F',
  'rest-pause': 'RP',
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
      // Reset after 2 seconds
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setConfirmDelete(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-md bg-muted/50 group">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground w-6">{index}</span>
        <span className="font-medium">{set.weight}kg</span>
        <span className="text-muted-foreground">×</span>
        <span className="font-medium">{set.reps}</span>
        {set.rpe && (
          <Badge variant="outline" className="text-xs">
            RPE {set.rpe}
          </Badge>
        )}
        {set.type !== 'normal' && (
          <Badge variant="secondary" className="text-xs">
            {setTypeLabels[set.type] || set.type}
          </Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-8 w-8 transition-all',
          confirmDelete
            ? 'opacity-100 bg-destructive text-destructive-foreground hover:bg-destructive/90'
            : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive'
        )}
        onClick={handleDeleteClick}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
