import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, Action } from './types'
import type { InitiativeTemplate } from './data/templates'
import { FACET_IDS } from './types'
import FacetCard from './components/FacetCard'
import FacetPlanner from './components/FacetPlanner'
import InitiativeCanvas from './components/InitiativeCanvas'
import HomeScreen from './components/HomeScreen'
import ActionTracker from './components/ActionTracker'
import ProgressView from './components/ProgressView'
import LearnView from './components/LearnView'
import ExportButton from './components/ExportButton'

const STORAGE_KEY = 'change-planner-initiatives'
const BACKUP_VERSION = 1

function newInitiative(): Initiative {
  return {
    id: crypto.randomUUID(),
    title: '',
    goal: '',
    context: '',
    stakeholders: '',
    relatedSprints: '',
    facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    actions: [],
    stakeholderProfiles: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function loadInitiatives(): Initiative[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}
function save(initiatives: Initiative[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives))
}

type View = 'canvas' | 'learn'
type CanvasTab = 'workspace' | 'guided'

export default function App() {
  const { t, i18n } = useTranslation()
  const [view, setView] = useState<View>('canvas')
  const [canvasTab, setCanvasTab] = useState<CanvasTab>('workspace')
  const [activeFacet, setActiveFacet] = useState<FacetId>('dance')
  const [initiatives, setInitiatives] = useState<Initiative[]>(loadInitiatives)
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const saved = loadInitiatives()
    return saved.length > 0 ? saved[0].id : null
  })
  const [showList, setShowList] = useState(false)
  const [importMsg, setImportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  const current = initiatives.find(i => i.id === currentId) ?? null

  const upsert = useCallback((updated: Initiative) => {
    setInitiatives(prev => {
      const exists = prev.find(i => i.id === updated.id)
      const next = exists
        ? prev.map(i => (i.id === updated.id ? { ...updated, updatedAt: Date.now() } : i))
        : [...prev, { ...updated, updatedAt: Date.now() }]
      save(next)
      return next
    })
  }, [])

  const handleNew = () => {
    const initiative = newInitiative()
    setInitiatives(prev => {
      const next = [...prev, initiative]
      save(next)
      return next
    })
    setCurrentId(initiative.id)
    setShowList(false)
    setCanvasTab('workspace')
    setActiveFacet('dance')
  }

  const handleNewFromTemplate = (data: InitiativeTemplate['data']) => {
    const initiative: Initiative = { ...newInitiative(), ...data }
    setInitiatives(prev => {
      const next = [...prev, initiative]
      save(next)
      return next
    })
    setCurrentId(initiative.id)
    setShowList(false)
    setCanvasTab('workspace')
    setActiveFacet('dance')
  }

  const handleDelete = (id: string) => {
    if (!confirm(t('canvas.delete_confirm'))) return
    setInitiatives(prev => {
      const next = prev.filter(i => i.id !== id)
      save(next)
      return next
    })
    if (currentId === id) setCurrentId(initiatives.find(i => i.id !== id)?.id ?? null)
    setShowList(false)
  }

  const handleArchive = (id: string) => {
    setInitiatives(prev => {
      const next = prev.map(i => i.id === id ? { ...i, completedAt: Date.now() } : i)
      save(next)
      return next
    })
    if (currentId === id) setCurrentId(null)
  }

  const handleUnarchive = (id: string) => {
    setInitiatives(prev => {
      const next = prev.map(i => i.id === id ? { ...i, completedAt: undefined } : i)
      save(next)
      return next
    })
  }

  const handleExportBackup = () => {
    const payload = JSON.stringify({ version: BACKUP_VERSION, initiatives }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `change-planner-backup-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string)
        const incoming: Initiative[] = Array.isArray(raw) ? raw : (raw?.initiatives ?? null)
        if (!Array.isArray(incoming)) throw new Error('invalid')
        setInitiatives(prev => {
          const existingIds = new Set(prev.map(i => i.id))
          const merged = [...prev, ...incoming.filter(i => !existingIds.has(i.id))]
          save(merged)
          const added = incoming.filter(i => !existingIds.has(i.id)).length
          setImportMsg({ type: 'ok', text: t('backup.import_success', { count: added }) })
          setTimeout(() => setImportMsg(null), 4000)
          return merged
        })
      } catch {
        setImportMsg({ type: 'err', text: t('backup.import_error') })
        setTimeout(() => setImportMsg(null), 4000)
      }
    }
    reader.readAsText(file)
    if (importInputRef.current) importInputRef.current.value = ''
  }

  const patch = (partial: Partial<Initiative>) => {
    if (!current) return
    upsert({ ...current, ...partial })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href="https://agile-toolkit.github.io/"
              title="Agile Toolkit"
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1"/>
                <rect x="9" y="1" width="6" height="6" rx="1"/>
                <rect x="1" y="9" width="6" height="6" rx="1"/>
                <rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setView('canvas')}
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              {t('app.title')}
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setView('canvas')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'canvas' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setView('learn')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'learn' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {t('learn.title')}
            </button>
            <div className="ml-2 flex items-center gap-0.5">
              {(['en', 'es', 'be', 'ru'] as const).map(lng => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => i18n.changeLanguage(lng)}
                  className={`text-xs px-1.5 py-0.5 rounded transition-colors ${i18n.language.startsWith(lng) ? 'bg-brand-100 text-brand-700 font-semibold' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {view === 'learn' && <LearnView />}

        {view === 'canvas' && (
          <>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <button type="button" onClick={handleNew} className="btn-primary">
                + {t('canvas.new')}
              </button>
              {initiatives.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowList(v => !v)}
                    className="btn-secondary text-sm"
                  >
                    {current?.title || 'Untitled'} ▾
                  </button>
                  {showList && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[240px]">
                      {initiatives.map(i => (
                        <div
                          key={i.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentId(i.id)
                              setShowList(false)
                            }}
                            className={`text-sm flex-1 text-left ${i.id === currentId ? 'font-semibold text-brand-600' : 'text-gray-700'}`}
                          >
                            {i.title || 'Untitled'}
                            {i.completedAt ? <span className="ml-1 text-xs text-gray-400">(archived)</span> : null}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(i.id)}
                            className="text-gray-300 hover:text-red-400 ml-2 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {importMsg && (
              <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${importMsg.type === 'ok' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {importMsg.text}
              </div>
            )}

            {!current ? (
              <HomeScreen
                initiatives={initiatives}
                onNew={handleNew}
                onNewFromTemplate={handleNewFromTemplate}
                onLoad={id => {
                  setCurrentId(id)
                  setCanvasTab('workspace')
                }}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onExportBackup={handleExportBackup}
                onImportBackup={() => importInputRef.current?.click()}
              />
            ) : (
              <>
                {current && (
                  <div className="flex items-center gap-1 mb-6 border-b border-gray-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setCanvasTab('workspace')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'workspace' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      {t('nav.workspace')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTab('guided')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'guided' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      {t('nav.guided')}
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      {current.completedAt ? (
                        <button
                          type="button"
                          onClick={() => handleUnarchive(current.id)}
                          className="text-sm text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          {t('backup.unarchive')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(t('backup.archive_confirm'))) handleArchive(current.id)
                          }}
                          className="text-sm text-gray-500 hover:text-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          {t('backup.archive')}
                        </button>
                      )}
                      <ExportButton initiative={current} workspaceRef={workspaceRef} />
                    </div>
                  </div>
                )}

                {canvasTab === 'workspace' ? (
                  <div ref={workspaceRef} className="space-y-6">
                    {current.completedAt && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
                        {t('backup.archived_banner', { date: new Date(current.completedAt).toLocaleDateString() })}
                      </div>
                    )}
                    <InitiativeCanvas initiative={current} onChange={patch} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FACET_IDS.map(facet => (
                        <FacetCard
                          key={facet}
                          facetId={facet}
                          notes={current.facetNotes[facet]}
                          actionCount={current.actions.filter(a => a.facet === facet).length}
                          onNotesChange={notes =>
                            patch({ facetNotes: { ...current.facetNotes, [facet]: notes } })
                          }
                          {...(facet === 'mind' ? {
                            stakeholderProfiles: current.stakeholderProfiles ?? [],
                            onProfilesChange: (profiles) => patch({ stakeholderProfiles: profiles }),
                          } : {})}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProgressView initiative={current} onChange={patch} />
                      <ActionTracker
                        actions={current.actions}
                        onAdd={(action: Action) => patch({ actions: [...current.actions, action] })}
                        onUpdate={(action: Action) =>
                          patch({
                            actions: current.actions.map(a => (a.id === action.id ? action : a)),
                          })
                        }
                        onDelete={(id: string) =>
                          patch({ actions: current.actions.filter(a => a.id !== id) })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <FacetPlanner
                    initiative={current}
                    activeFacet={activeFacet}
                    facetIds={FACET_IDS}
                    onChange={patch}
                    onFacetChange={setActiveFacet}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImportBackup}
      />
    </div>
  )
}
