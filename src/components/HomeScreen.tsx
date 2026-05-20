import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FACET_IDS, type FacetId, type Initiative } from '../types'
import { TEMPLATES, type InitiativeTemplate } from '../data/templates'

type SortKey = 'latest' | 'actions' | 'alpha'

const FACET_DOT_COLOR: Record<FacetId, string> = {
  dance: 'bg-blue-500',
  mind: 'bg-green-500',
  stimulate: 'bg-orange-500',
  change: 'bg-purple-500',
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

function sortInitiatives(list: Initiative[], key: SortKey): Initiative[] {
  const copy = [...list]
  if (key === 'latest') return copy.sort((a, b) => b.updatedAt - a.updatedAt)
  if (key === 'actions') {
    return copy.sort((a, b) => {
      const aOpen = a.actions.filter(x => x.status === 'todo').length
      const bOpen = b.actions.filter(x => x.status === 'todo').length
      return bOpen - aOpen
    })
  }
  return copy.sort((a, b) => a.title.localeCompare(b.title))
}

interface Props {
  initiatives: Initiative[]
  onNew: () => void
  onNewFromTemplate: (data: InitiativeTemplate['data']) => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onExportBackup: () => void
  onImportBackup: () => void
}

export default function HomeScreen({
  initiatives,
  onNew,
  onNewFromTemplate,
  onLoad,
  onDelete,
  onArchive,
  onUnarchive,
  onExportBackup,
  onImportBackup,
}: Props) {
  const { t } = useTranslation()
  const [showArchived, setShowArchived] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('latest')

  const active = sortInitiatives(initiatives.filter(i => !i.completedAt), sortBy)
  const archived = initiatives.filter(i => !!i.completedAt)

  return (
    <div className="space-y-8">
      <div className="text-center py-8 max-w-2xl mx-auto">
        <div className="text-5xl mb-4" aria-hidden>
          🌍
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('home.headline')}</h1>
        <p className="text-slate-600 text-lg leading-relaxed">{t('home.subheadline')}</p>
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <button type="button" onClick={onNew} className="btn-primary text-lg px-6 py-3">
            {t('home.cta')}
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="btn-secondary text-lg px-6 py-3"
          >
            {t('templates.modal_trigger')}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('home.facets_preview')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FACET_IDS.map(id => (
            <div key={id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-2xl mb-2" aria-hidden>
                {id === 'dance'
                  ? '💃'
                  : id === 'mind'
                    ? '🧠'
                    : id === 'stimulate'
                      ? '🕸️'
                      : '🌱'}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{t(`facets.${id}.label`)}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{t(`facets.${id}.description`)}</p>
            </div>
          ))}
        </div>
        <div className="card mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">{t('home.framework_title')}</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{t('home.framework_body')}</p>
        </div>
      </div>

      {initiatives.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-slate-800">{t('home.saved_title')}</h2>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                {(['latest', 'actions', 'alpha'] as SortKey[]).map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${sortBy === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {t(`home.sort_${key}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onImportBackup}
                title={t('backup.import_hint')}
                className="text-sm text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2v8M5 7l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" strokeLinecap="round"/>
                </svg>
                {t('backup.import')}
              </button>
              <button
                type="button"
                onClick={onExportBackup}
                title={t('backup.export_hint')}
                className="text-sm text-gray-500 hover:text-brand-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 10V2M5 5l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 11v2a1 1 0 001 1h8a1 1 0 001-1v-2" strokeLinecap="round"/>
                </svg>
                {t('backup.export')}
              </button>
            </div>
          </div>

          {active.length > 0 && (
            <ul className="space-y-2">
              {active.map(init => (
                <InitiativeRow
                  key={init.id}
                  initiative={init}
                  onLoad={onLoad}
                  onDelete={onDelete}
                  onArchive={onArchive}
                  onUnarchive={onUnarchive}
                  t={t}
                />
              ))}
            </ul>
          )}

          {archived.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowArchived(v => !v)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium py-1"
              >
                <span>{showArchived ? '▾' : '▸'}</span>
                {t('backup.archived_section', { count: archived.length })}
              </button>
              {showArchived && (
                <ul className="mt-2 space-y-2">
                  {archived.map(init => (
                    <InitiativeRow
                      key={init.id}
                      initiative={init}
                      onLoad={onLoad}
                      onDelete={onDelete}
                      onArchive={onArchive}
                      onUnarchive={onUnarchive}
                      t={t}
                      isArchived
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {showTemplates && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTemplates(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">{t('templates.modal_title')}</h2>
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowTemplates(false)
                  onNew()
                }}
                className="text-left border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-brand-400 hover:bg-brand-50 transition-colors group"
              >
                <div className="text-2xl mb-2">📄</div>
                <div className="font-semibold text-slate-800 group-hover:text-brand-700">
                  {t('templates.blank_title')}
                </div>
                <div className="text-sm text-slate-500 mt-1">{t('templates.blank_desc')}</div>
              </button>

              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setShowTemplates(false)
                    onNewFromTemplate(tpl.data)
                  }}
                  className="text-left border border-slate-200 rounded-xl p-4 hover:border-brand-400 hover:bg-brand-50 transition-colors shadow-sm group"
                >
                  <div className="text-2xl mb-2">{tpl.emoji}</div>
                  <div className="font-semibold text-slate-800 group-hover:text-brand-700">
                    {t(`templates.${tpl.id}.name`)}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 leading-snug">
                    {t(`templates.${tpl.id}.desc`)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface StatsProps {
  initiative: Initiative
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, opts?: any) => string
  isArchived: boolean
}

function InitiativeStats({ initiative: init, t, isArchived }: StatsProps) {
  const today = new Date().toISOString().slice(0, 10)
  const openActions = init.actions.filter(a => a.status === 'todo')
  const overdueCount = openActions.filter(a => a.dueDate && a.dueDate < today).length
  const facetCoverage = FACET_IDS.map(f => ({
    id: f,
    covered:
      (init.facetNotes[f]?.trim().length ?? 0) > 0 ||
      init.actions.some(a => a.facet === f),
  }))
  const displayDate = isArchived && init.completedAt
    ? t('backup.archived_on', { date: new Date(init.completedAt).toLocaleDateString() })
    : relativeTime(init.updatedAt)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      <span>{displayDate}</span>
      <span className={openActions.length > 0 ? 'text-slate-600 font-medium' : ''}>
        {t('home.open_actions', { count: openActions.length })}
      </span>
      {overdueCount > 0 && (
        <span className="inline-flex items-center gap-1 text-red-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          {t('home.overdue_actions', { count: overdueCount })}
        </span>
      )}
      <span className="flex items-center gap-1" title={t('home.facet_coverage')}>
        {facetCoverage.map(({ id, covered }) => (
          <span
            key={id}
            className={`w-2 h-2 rounded-full inline-block ${covered ? FACET_DOT_COLOR[id] : 'bg-slate-200'}`}
            title={t(`facets.${id}.label`)}
          />
        ))}
      </span>
    </div>
  )
}

interface RowProps {
  initiative: Initiative
  onLoad: (id: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, opts?: any) => string
  isArchived?: boolean
}

function InitiativeRow({ initiative: init, onLoad, onDelete, onArchive, onUnarchive, t, isArchived }: RowProps) {
  return (
    <li className={`bg-white border rounded-lg px-4 py-3 shadow-sm ${isArchived ? 'border-gray-100 opacity-70' : 'border-slate-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-medium text-slate-800">
            {init.title.trim() ? init.title : <span className="italic text-slate-400">(untitled)</span>}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onLoad(init.id)}
            className="text-brand-600 hover:text-brand-800 text-sm font-medium px-3 py-1 rounded hover:bg-brand-50 transition-colors"
          >
            {t('home.open')}
          </button>
          {isArchived ? (
            <button
              type="button"
              onClick={() => onUnarchive(init.id)}
              className="text-gray-500 hover:text-brand-600 text-sm px-2 py-1 rounded hover:bg-brand-50 transition-colors"
            >
              {t('backup.unarchive')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm(t('backup.archive_confirm'))) onArchive(init.id)
              }}
              className="text-gray-400 hover:text-amber-600 text-sm px-2 py-1 rounded hover:bg-amber-50 transition-colors"
            >
              {t('backup.archive')}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(init.id)}
            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            {t('home.delete')}
          </button>
        </div>
      </div>
      <InitiativeStats initiative={init} t={t} isArchived={!!isArchived} />
    </li>
  )
}
