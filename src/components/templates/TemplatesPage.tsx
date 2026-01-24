import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Plus, Trash2, Edit2, Dumbbell, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTemplates, type WorkoutTemplate } from '@/lib/data/hooks'
import { TemplateEditor } from './TemplateEditor'
import { toast } from 'sonner'

export function TemplatesPage() {
  const { templates, isLoading, deleteTemplate } = useTemplates()
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleDelete = async (templateId: string) => {
    if (confirmDelete === templateId) {
      await deleteTemplate(templateId as any)
      toast.success('Template deleted')
      setConfirmDelete(null)
    } else {
      setConfirmDelete(templateId)
      setTimeout(() => setConfirmDelete((curr) => curr === templateId ? null : curr), 2000)
    }
  }

  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setShowEditor(true)
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setEditingTemplate(null)
  }

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        onClose={handleEditorClose}
      />
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Workout Templates</h1>
          <p className="text-sm text-muted-foreground">
            Pre-plan your workouts
          </p>
        </div>
      </header>

      {/* Templates list */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="bg-muted/30 rounded-xl p-8 text-center">
          <Dumbbell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No templates yet</p>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-card rounded-xl border border-border/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{template.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                    {template.focus.length > 0 && (
                      <> · {template.focus.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(template)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(template.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    confirmDelete === template.id
                      ? 'text-destructive bg-destructive/10'
                      : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create button (floating) */}
      {templates.length > 0 && (
        <div className="fixed bottom-20 right-4">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={handleCreate}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
