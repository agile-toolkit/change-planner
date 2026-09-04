import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, Action, ActionStatus } from './types'
import type { InitiativeTemplate } from './data/templates'
import { FACET_IDS } from './types'
import AppHeader from './components/AppHeader'
import ThemeToggle from './components/ThemeToggle'
import FacilitatorToggle from './components/FacilitatorToggle'
import { useFacilitatorMode } from './components/useFacilitatorMode'
import { CloseIcon, LinkIcon } from './components/icons'
import FacetCard from './components/FacetCard'
import FacetPlanner from './components/FacetPlanner'
import InitiativeCanvas from './components/InitiativeCanvas'
import HomeScreen from './components/HomeScreen'
import ActionTracker from './components/ActionTracker'
import ProgressView from './components/ProgressView'
import LearnView from './components/LearnView'
import ExportButton from './components/ExportButton'
import SharedView from './components/SharedView'
import RoadmapView from './components/RoadmapView'
import AssessmentView from './components/AssessmentView'
import BoardView from './components/BoardView'
import { encodeInitiative, decodeInitiative } from './utils/sharing'
import {
  parseMmSnapshotParam,
  parsePrefillParams,
  readPendingSalaryChange,
  clearPendingSalaryChange,
  pendingSalaryChangeToInitiative,
  type PendingSalaryChange,
} from './utils/crossAppImport'
import { BACKUP_VERSION, newInitiative, loadInitiatives, save } from './storage'

type View = 'canvas' | 'learn'
type CanvasTab = 'workspace' | 'guided' | 'roadmap' | 'board' | 'assess'

export default function App() {
  const { t } = useTranslation()
  const [facilitatorMode, toggleFacilitatorMode] = useFacilitatorMode('agile-toolkit:facilitatorMode')
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
  const [shareMsg, setShareMsg] = useState(false)
  const [sharedInitiative, setSharedInitiative] = useState<Initiative | null>(() => {
    const hash = window.location.hash
    if (hash.startsWith('#share=')) {
      return decodeInitiative(hash.slice(7))
    }
    return null
  })
  const [pendingSalaryChange, setPendingSalaryChange] = useState<PendingSalaryChange | null>(
    () => readPendingSalaryChange()
  )
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

  const handleDuplicate = (id: string) => {
    const source = initiatives.find(i => i.id === id)
    if (!source) return
    const prefix = t('home.duplicate_prefix')
    const cloned: Initiative = {
      ...source,
      id: crypto.randomUUID(),
      title: `${prefix} ${source.title}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: undefined,
      actions: source.actions.map(a => ({
        ...a,
        id: crypto.randomUUID(),
        status: 'todo' as ActionStatus,
        hypothesis: a.hypothesis ? { ...a.hypothesis, outcome: undefined } : undefined,
      })),
      stakeholderProfiles: source.stakeholderProfiles.map(p => ({ ...p, id: crypto.randomUUID() })),
    }
    setInitiatives(prev => {
      const next = [...prev, cloned]
      save(next)
      return next
    })
    setCurrentId(cloned.id)
    setShowList(false)
    setCanvasTab('workspace')
    setActiveFacet('dance')
  }

  const handleImportFromBoard = (actions: Action[]) => {
    const initiative: Initiative = {
      ...newInitiative(),
      title: t('import_board.new_initiative_title'),
      actions,
    }
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

  const handleShareImport = (initiative: Initiative) => {
    const fresh: Initiative = { ...initiative, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() }
    setInitiatives(prev => {
      const next = [...prev, fresh]
      save(next)
      return next
    })
    setCurrentId(fresh.id)
    setSharedInitiative(null)
    window.location.hash = ''
    setCanvasTab('workspace')
    setActiveFacet('dance')
  }

  const handleShare = () => {
    if (!current) return
    const encoded = encodeInitiative(current)
    const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      setShareMsg(true)
      setTimeout(() => setShareMsg(false), 2000)
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

  // Cross-app handoffs delivered via URL query params (Moving Motivators'
  // "Export to Change Planner", Improvement Board's/others' ?prefill=) are
  // one-shot: consume on mount and strip the param so a page refresh
  // doesn't re-import.
  useEffect(() => {
    const search = window.location.search
    if (!search) return
    const imported = parseMmSnapshotParam(search) ?? parsePrefillParams(search)
    if (imported) handleNewFromTemplate(imported)
    window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImportSalaryChange = () => {
    if (!pendingSalaryChange) return
    handleNewFromTemplate(pendingSalaryChangeToInitiative(pendingSalaryChange))
    clearPendingSalaryChange()
    setPendingSalaryChange(null)
  }

  const handleDismissSalaryChange = () => {
    clearPendingSalaryChange()
    setPendingSalaryChange(null)
  }

  const patch = (partial: Partial<Initiative>) => {
    if (!current) return
    upsert({ ...current, ...partial })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950" data-accent="cobalt">
      <AppHeader
        title={t('app.title')}
        onTitleClick={() => { setView('canvas'); setCurrentId(null) }}
        hideLanguagePicker={facilitatorMode}
        navItems={facilitatorMode ? [] : [
          { key: 'learn', label: t('learn.title'), active: view === 'learn', onClick: () => setView('learn') },
        ]}
      >
        <ThemeToggle />
        <FacilitatorToggle
          active={facilitatorMode}
          onToggle={toggleFacilitatorMode}
          labelOn={t('facilitator.toggle_on')}
          labelOff={t('facilitator.toggle_off')}
        />
      </AppHeader>

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
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 min-w-[240px]">
                      {initiatives.map(i => (
                        <div
                          key={i.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentId(i.id)
                              setShowList(false)
                            }}
                            className={`text-sm flex-1 text-left ${i.id === currentId ? 'font-semibold text-brand-600' : 'text-gray-700 dark:text-gray-300'}`}
                          >
                            {i.title || 'Untitled'}
                            {i.completedAt ? <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(archived)</span> : null}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(i.id)}
                            className="text-gray-300 dark:text-gray-600 hover:text-red-400 ml-2 text-xs"
                          >
                            <CloseIcon className="w-3.5 h-3.5" />
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

            {!current && pendingSalaryChange && (
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-lg bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
                <span className="text-sm text-brand-800 dark:text-brand-200">
                  {t('cross_app.salary_pending', { title: pendingSalaryChange.title })}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={handleImportSalaryChange} className="btn-primary text-sm py-1.5">
                    {t('cross_app.import')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismissSalaryChange}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2"
                  >
                    {t('cross_app.dismiss')}
                  </button>
                </div>
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
                onDuplicate={handleDuplicate}
                onExportBackup={handleExportBackup}
                onImportBackup={() => importInputRef.current?.click()}
                onImportFromBoard={handleImportFromBoard}
              />
            ) : (
              <>
                {current && (
                  <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <button
                      type="button"
                      onClick={() => setCanvasTab('workspace')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'workspace' ? 'bg-brand-100 text-brand-700 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {t('nav.workspace')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTab('guided')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'guided' ? 'bg-brand-100 text-brand-700 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {t('nav.guided')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTab('roadmap')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'roadmap' ? 'bg-brand-100 text-brand-700 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {t('roadmap.tab')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTab('board')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'board' ? 'bg-brand-100 text-brand-700 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {t('board.tab')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasTab('assess')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${canvasTab === 'assess' ? 'bg-brand-100 text-brand-700 dark:bg-gray-800 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {t('assess.tab')}
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
                      <div className="relative">
                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={t('share.button')}
                        >
                          <LinkIcon className="w-3.5 h-3.5" /> {t('share.button')}
                        </button>
                        {shareMsg && (
                          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                            {t('share.copied')}
                          </span>
                        )}
                      </div>
                      <ExportButton initiative={current} workspaceRef={workspaceRef} />
                    </div>
                  </div>
                )}

                {canvasTab === 'workspace' ? (
                  <div ref={workspaceRef} className="space-y-6">
                    {current.completedAt && (
                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
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
                ) : canvasTab === 'roadmap' ? (
                  <RoadmapView
                    initiative={current}
                    onUpdate={(action) =>
                      patch({ actions: current.actions.map(a => a.id === action.id ? action : a) })
                    }
                    onUpdateMilestones={(milestones) => patch({ milestones })}
                  />
                ) : canvasTab === 'board' ? (
                  <BoardView
                    initiative={current}
                    onUpdate={(action) =>
                      patch({ actions: current.actions.map(a => a.id === action.id ? action : a) })
                    }
                  />
                ) : canvasTab === 'assess' ? (
                  <AssessmentView initiative={current} onChange={patch} />
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

      {sharedInitiative && (
        <SharedView
          initiative={sharedInitiative}
          onImport={handleShareImport}
          onClose={() => { setSharedInitiative(null); window.location.hash = '' }}
        />
      )}
    </div>
  )
}
