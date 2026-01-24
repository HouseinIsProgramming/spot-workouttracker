import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Dumbbell, ChevronRight, X, Plus, RotateCcw, LogOut, ChevronDown, Wrench, Trash2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FOCUS_PRESETS, ALL_MUSCLE_GROUPS, type MuscleGroup } from '@/lib/data/types'
import { useAuth } from '@/lib/auth'
import { toast } from 'sonner'

const CUSTOM_PRESETS_KEY = 'workout-tracker-custom-presets'

type CustomPreset = {
  name: string
  muscles: MuscleGroup[]
  isBuiltInOverride?: boolean // true if this overrides a built-in preset
}

// Load/save custom presets from localStorage
function loadCustomPresets(): CustomPreset[] {
  try {
    const stored = localStorage.getItem(CUSTOM_PRESETS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveCustomPresets(presets: CustomPreset[]) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets))
}

export function getQuickStartPresets(): Record<string, MuscleGroup[]> {
  const custom = loadCustomPresets()
  const customMap: Record<string, MuscleGroup[]> = {}
  custom.forEach((p) => {
    customMap[p.name] = p.muscles
  })
  // Custom presets override built-in ones with same name
  return { ...FOCUS_PRESETS, ...customMap }
}

// Check if a preset name is a built-in one
function isBuiltInPreset(name: string): boolean {
  return Object.keys(FOCUS_PRESETS).includes(name)
}

export function SettingsPage() {
  const { signOut } = useAuth()
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(loadCustomPresets)
  const [editingPreset, setEditingPreset] = useState<{ name: string; muscles: MuscleGroup[]; isNew: boolean } | null>(null)
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetMuscles, setNewPresetMuscles] = useState<MuscleGroup[]>([])
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [showDevTools, setShowDevTools] = useState(false)
  const [isAddingData, setIsAddingData] = useState(false)
  const [isClearingData, setIsClearingData] = useState(false)

  const addSampleData = useMutation(api.devTools.addSampleData)
  const clearAllData = useMutation(api.devTools.clearAllData)

  // Merge built-in and custom presets for display
  const allPresets = Object.entries(FOCUS_PRESETS).map(([name, muscles]) => {
    const customOverride = customPresets.find((p) => p.name === name)
    return {
      name,
      muscles: customOverride ? customOverride.muscles : muscles,
      isBuiltIn: true,
      isModified: !!customOverride,
    }
  }).concat(
    customPresets
      .filter((p) => !isBuiltInPreset(p.name))
      .map((p) => ({
        name: p.name,
        muscles: p.muscles,
        isBuiltIn: false,
        isModified: false,
      }))
  )

  const handleSavePreset = () => {
    if (!newPresetName.trim() || newPresetMuscles.length === 0) return

    const name = newPresetName.trim().toLowerCase()
    const isBuiltIn = isBuiltInPreset(name)

    const newPreset: CustomPreset = {
      name,
      muscles: newPresetMuscles,
      isBuiltInOverride: isBuiltIn,
    }

    // Check if we're updating an existing custom preset or adding new
    const existingIndex = customPresets.findIndex((p) => p.name === name)
    let updated: CustomPreset[]

    if (existingIndex >= 0) {
      updated = customPresets.map((p) => (p.name === name ? newPreset : p))
    } else {
      updated = [...customPresets, newPreset]
    }

    setCustomPresets(updated)
    saveCustomPresets(updated)
    setShowAddPreset(false)
    setEditingPreset(null)
    setNewPresetName('')
    setNewPresetMuscles([])
  }

  const handleDeletePreset = (name: string) => {
    // Only delete custom presets (not built-in overrides restoration)
    const updated = customPresets.filter((p) => p.name !== name)
    setCustomPresets(updated)
    saveCustomPresets(updated)
  }

  const handleResetToDefault = (name: string) => {
    // Remove the custom override to restore built-in default
    const updated = customPresets.filter((p) => p.name !== name)
    setCustomPresets(updated)
    saveCustomPresets(updated)
  }

  const handleEditPreset = (preset: { name: string; muscles: MuscleGroup[] }) => {
    setEditingPreset({ ...preset, isNew: false })
    setNewPresetName(preset.name)
    setNewPresetMuscles(preset.muscles)
    setShowAddPreset(true)
  }

  const toggleMuscle = (muscle: MuscleGroup) => {
    setNewPresetMuscles((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    )
  }

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-lg font-semibold">Settings</h1>
      </header>

      {/* Exercise Library Link */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Exercise Management
        </h2>
        <Link to="/exercises">
          <div className="bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Exercise Library</p>
              <p className="text-xs text-muted-foreground">Browse and create exercises</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Link>
      </section>

      {/* Quick Start Presets */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Start Presets
          </h2>
          <button
            type="button"
            onClick={() => {
              setShowAddPreset(true)
              setEditingPreset(null)
              setNewPresetName('')
              setNewPresetMuscles([])
            }}
            className="text-xs text-primary flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        {/* All presets - editable */}
        <div className="space-y-2">
          {allPresets.map((preset) => (
            <div
              key={preset.name}
              className="bg-card rounded-lg border border-border/50 p-3 flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm capitalize">{preset.name}</p>
                  {preset.isModified && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Modified
                    </span>
                  )}
                  {!preset.isBuiltIn && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {preset.muscles.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleEditPreset(preset)}
                className="text-xs text-primary px-2 py-1"
              >
                Edit
              </button>
              {preset.isModified && (
                <button
                  type="button"
                  onClick={() => handleResetToDefault(preset.name)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground"
                  title="Reset to default"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
              {!preset.isBuiltIn && (
                <button
                  type="button"
                  onClick={() => handleDeletePreset(preset.name)}
                  className="text-xs text-destructive px-2 py-1"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add/Edit preset form */}
        {showAddPreset && (
          <div className="mt-4 bg-card rounded-xl border border-border/50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">
                {editingPreset ? 'Edit Preset' : 'New Preset'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddPreset(false)
                  setEditingPreset(null)
                }}
                className="text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="Preset name (e.g., arms)"
              className="w-full h-10 px-3 rounded-lg bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex flex-wrap gap-2">
              {ALL_MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => toggleMuscle(muscle)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs capitalize transition-all',
                    newPresetMuscles.includes(muscle)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground'
                  )}
                >
                  {muscle}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSavePreset}
              disabled={!newPresetName.trim() || newPresetMuscles.length === 0}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm disabled:opacity-50"
            >
              {editingPreset ? 'Save Changes' : 'Create Preset'}
            </button>
          </div>
        )}
      </section>

      {/* Account */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Account
        </h2>
        <button
          type="button"
          onClick={() => signOut()}
          className="w-full bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Sign Out</p>
            <p className="text-xs text-muted-foreground">Switch accounts or sign out</p>
          </div>
        </button>
      </section>

      {/* Dev Tools (collapsible) */}
      <section>
        <button
          type="button"
          onClick={() => setShowDevTools(!showDevTools)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
        >
          <Wrench className="h-3 w-3" />
          Dev Stuff
          <ChevronDown className={cn("h-3 w-3 transition-transform", showDevTools && "rotate-180")} />
        </button>

        {showDevTools && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={async () => {
                setIsAddingData(true)
                try {
                  const result = await addSampleData()
                  toast.success('Sample data added', {
                    description: `${result.workoutsAdded} workouts, ${result.exercisesAdded} exercise`,
                  })
                } catch (err) {
                  toast.error('Failed to add sample data')
                } finally {
                  setIsAddingData(false)
                }
              }}
              disabled={isAddingData}
              className="w-full bg-card rounded-xl border border-border/50 p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{isAddingData ? 'Adding...' : 'Add Sample Data'}</p>
                <p className="text-xs text-muted-foreground">Add 3 sample workouts for testing</p>
              </div>
            </button>

            <button
              type="button"
              onClick={async () => {
                if (!confirm('This will delete ALL your data. Are you sure?')) return
                setIsClearingData(true)
                try {
                  const result = await clearAllData()
                  toast.success('All data cleared', {
                    description: `Deleted ${result.deleted.workouts} workouts, ${result.deleted.exercises} exercises`,
                  })
                } catch (err) {
                  toast.error('Failed to clear data')
                } finally {
                  setIsClearingData(false)
                }
              }}
              disabled={isClearingData}
              className="w-full bg-card rounded-xl border border-destructive/30 p-4 flex items-center gap-3 hover:bg-destructive/5 transition-colors text-left disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-destructive">{isClearingData ? 'Clearing...' : 'Clear All Data'}</p>
                <p className="text-xs text-muted-foreground">Delete all workouts, exercises, and settings</p>
              </div>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
