import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FACET_IDS, type Initiative } from '../types'

interface Props {
  initiatives: Initiative[]
  onNew: () => void
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
  onLoad,
  onDelete,
  onArchive,
  onUnarchive,
  onExportBackup,
  onImportBackup,
}: Props) {
  const { t } = useTranslation()
  const [showArchived, setShowArchived] = useState(false)

  const active = initiatives.filter(i => !i.completedAt)
  const archived = initiatives.filter(i => !!i.completedAt)

  return (
    <div className="space-y-8">
      <div className="text-center py-8 max-w-2xl mx-auto">
        <div className="text-5xl mb-4" aria-hidden>
          🌍
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('home.headline')}</h1>
        <p className="text-slate-600 text-lg leading-relaxed">{t('home.subheadline')}</p>
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={onNew} className="btn-primary text-lg px-6 py-3">
            {t('home.cta')}
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">{t('home.saved_title')}</h2>
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
    <li className={`bg-white border rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-sm ${isArchived ? 'border-gray-100 opacity-70' : 'border-slate-200'}`}>
      <div className="min-w-0">
        <span className="font-medium text-slate-800">
          {init.title.trim() ? init.title : <span className="italic text-slate-400">(untitled)</span>}
        </span>
        <span className="text-slate-400 text-xs ml-3">
          {isArchived && init.completedAt
            ? t('backup.archived_on', { date: new Date(init.completedAt).toLocaleDateString() })
            : new Date(init.updatedAt).toLocaleDateString()}
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
    </li>
  )
}
