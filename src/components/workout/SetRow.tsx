import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
