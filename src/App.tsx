import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, Action } from './types'
import FacetCard from './components/FacetCard'
import ActionTracker from './components/ActionTracker'
import ProgressView from './components/ProgressView'
import LearnView from './components/LearnView'

const STORAGE_KEY = 'change-planner-initiatives'
const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

function newInitiative(): Initiative {
  return {
    id: crypto.randomUUID(),
    title: '',
    goal: '',
    context: '',
    stakeholders: '',
    facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    actions: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function loadInitiatives(): Initiative[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function save(initiatives: Initiative[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives))
}

type View = 'canvas' | 'learn'

export default function App() {
  const { t, i18n } = useTranslation()
  const [view, setView] = useState<View>('canvas')
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
        ? prev.map(i => i.id === updated.id ? { ...updated, updatedAt: Date.now() } : i)
        : [...prev, { ...updated, updatedAt: Date.now() }]
      save(next)
      return next
    })
  }, [])

  const handleNew = () => {
    const initiative = newInitiative()
    setInitiatives(prev => { const next = [...prev, initiative]; save(next); return next })
    setCurrentId(initiative.id)
    setShowList(false)
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setView('canvas')} className="font-semibold text-brand-600 hover:text-brand-700">
            {t('app.title')}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('canvas')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'canvas' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              Canvas
            </button>
            <button
              onClick={() => setView('learn')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === 'learn' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {t('learn.title')}
            </button>
            <button
              onClick={() => i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru')}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {view === 'learn' && <LearnView />}

        {view === 'canvas' && (
          <>
            {/* Initiative selector bar */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={handleNew} className="btn-primary">
                + {t('canvas.new')}
              </button>
              {current && (
                <button onClick={() => window.print()} className="btn-secondary no-print">
                  {t('canvas.print')}
                </button>
              )}
              {initiatives.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowList(v => !v)}
                    className="btn-secondary text-sm"
                  >
                    {current?.title || 'Untitled'} ▾
                  </button>
                  {showList && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[240px]">
                      {initiatives.map(i => (
                        <div key={i.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                          <button
                            onClick={() => { setCurrentId(i.id); setShowList(false) }}
                            className={`text-sm flex-1 text-left ${i.id === currentId ? 'font-semibold text-brand-600' : 'text-gray-700'}`}
                          >
                            {i.title || 'Untitled'}
                          </button>
                          <button onClick={() => handleDelete(i.id)} className="text-gray-300 hover:text-red-400 ml-2 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!current ? (
              <div className="max-w-2xl mx-auto">
                <div className="card text-center py-12">
                  <div className="text-5xl mb-4">🌍</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('home.headline')}</h1>
                  <p className="text-gray-500 mb-6 text-sm">{t('home.subheadline')}</p>
                  <button onClick={handleNew} className="btn-primary">{t('home.cta')}</button>
                </div>
                <div className="card mt-4">
                  <h2 className="font-semibold text-gray-900 mb-2">{t('home.framework_title')}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{t('home.framework_body')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Canvas meta */}
                <div className="card">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="label">{t('canvas.title_label')}</label>
                      <input
                        className="input text-lg font-semibold"
                        placeholder={t('canvas.title_placeholder')}
                        value={current.title}
                        onChange={e => patch({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">{t('canvas.goal_label')}</label>
                      <textarea className="input resize-none" rows={2} placeholder={t('canvas.goal_placeholder')} value={current.goal} onChange={e => patch({ goal: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">{t('canvas.stakeholders_label')}</label>
                      <textarea className="input resize-none" rows={2} placeholder={t('canvas.stakeholders_placeholder')} value={current.stakeholders} onChange={e => patch({ stakeholders: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">{t('canvas.context_label')}</label>
                      <textarea className="input resize-none" rows={2} placeholder={t('canvas.context_placeholder')} value={current.context} onChange={e => patch({ context: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* 4 Facets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FACET_IDS.map(facet => (
                    <FacetCard
                      key={facet}
                      facetId={facet}
                      notes={current.facetNotes[facet]}
                      actionCount={current.actions.filter(a => a.facet === facet).length}
                      onNotesChange={notes => patch({ facetNotes: { ...current.facetNotes, [facet]: notes } })}
                    />
                  ))}
                </div>

                {/* Progress + Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ProgressView initiative={current} />
                  <ActionTracker
                    actions={current.actions}
                    onAdd={(action: Action) => patch({ actions: [...current.actions, action] })}
                    onUpdate={(action: Action) => patch({ actions: current.actions.map(a => a.id === action.id ? action : a) })}
                    onDelete={(id: string) => patch({ actions: current.actions.filter(a => a.id !== id) })}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
