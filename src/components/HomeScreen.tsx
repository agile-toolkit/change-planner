import { useTranslation } from 'react-i18next'
import { FACET_IDS, type Initiative } from '../types'

interface Props {
  initiatives: Initiative[]
  onNew: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export default function HomeScreen({ initiatives, onNew, onLoad, onDelete }: Props) {
  const { t } = useTranslation()

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

      {initiatives.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">{t('home.saved_title')}</h2>
          <ul className="space-y-2">
            {initiatives.map(init => (
              <li
                key={init.id}
                className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-sm"
              >
                <div className="min-w-0">
                  <span className="font-medium text-slate-800">
                    {init.title.trim() ? init.title : <span className="italic text-slate-400">(untitled)</span>}
                  </span>
                  <span className="text-slate-400 text-xs ml-3">
                    {new Date(init.updatedAt).toLocaleDateString()}
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
                  <button
                    type="button"
                    onClick={() => onDelete(init.id)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {t('home.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
