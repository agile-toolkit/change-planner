import { useTranslation } from 'react-i18next'
import type { FacetId } from '../types'

const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']
const TIPS = ['tip1', 'tip2', 'tip3', 'tip4', 'tip5'] as const

export default function LearnView() {
  const { t } = useTranslation()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('learn.title')}</h1>

      <div className="card">
        <p className="text-sm text-gray-600 leading-relaxed">{t('learn.intro')}</p>
      </div>

      {/* Facet overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FACET_IDS.map(facet => (
          <div key={facet} className="card">
            <h3 className="font-semibold text-gray-900 mb-2">{t(`facets.${facet}.label`)}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{t(`facets.${facet}.description`)}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-2">{t('learn.why_title')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{t('learn.why_body')}</p>
      </div>

      <div className="card bg-brand-50 border-brand-100">
        <h2 className="font-semibold text-brand-900 mb-3">{t('learn.tips_title')}</h2>
        <ul className="space-y-2">
          {TIPS.map(tip => (
            <li key={tip} className="flex gap-2 text-sm text-brand-800">
              <span className="text-brand-500 font-bold">💡</span>
              {t(`learn.${tip}`)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
