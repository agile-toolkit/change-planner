import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, Action } from './types'
import { FACET_IDS } from './types'
import FacetCard from './components/FacetCard'
import FacetPlanner from './components/FacetPlanner'
import InitiativeCanvas from './components/InitiativeCanvas'
import HomeScreen from './components/HomeScreen'
import ActionTracker from './components/ActionTracker'
import ProgressView from './components/ProgressView'
import LearnView from './components/LearnView'

const STORAGE_KEY = 'change-planner-initiatives'

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

            {!current ? (
              <HomeScreen
                initiatives={initiatives}
                onNew={handleNew}
                onLoad={id => {
                  setCurrentId(id)
                  setCanvasTab('workspace')
                }}
                onDelete={handleDelete}
              />
            ) : (
              <>
                {current && (
                  <div className="flex gap-1 mb-6 border-b border-gray-200 pb-2">
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
                  </div>
                )}

                {canvasTab === 'workspace' ? (
                  <div className="space-y-6">
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
    </div>
  )
}
