import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId } from '../types'

const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

const FACET_COLORS: Record<FacetId, string> = {
  dance: 'bg-blue-500',
  mind: 'bg-green-500',
  stimulate: 'bg-orange-500',
  change: 'bg-purple-500',
}

interface Props {
  initiative: Initiative
}

export default function ProgressView({ initiative }: Props) {
  const { t } = useTranslation()
  const totalActions = initiative.actions.length
  const doneActions = initiative.actions.filter(a => a.status === 'done').length
  const facetsWithActions = FACET_IDS.filter(f => initiative.actions.some(a => a.facet === f)).length

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-4">{t('progress.title')}</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-600 tabular-nums">
            {totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0}%
          </div>
          <div className="text-xs text-gray-400">{t('progress.overall')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 tabular-nums">
            {doneActions}/{totalActions}
          </div>
          <div className="text-xs text-gray-400">{t('progress.actions_done')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 tabular-nums">
            {facetsWithActions}/4
          </div>
          <div className="text-xs text-gray-400">{t('progress.facets_with_actions')}</div>
        </div>
      </div>

      {/* Per-facet breakdown */}
      <div className="space-y-3">
        {FACET_IDS.map(facet => {
          const facetActions = initiative.actions.filter(a => a.facet === facet)
          const facetDone = facetActions.filter(a => a.status === 'done').length
          const pct = facetActions.length > 0 ? (facetDone / facetActions.length) * 100 : 0
          const hasNotes = initiative.facetNotes[facet]?.trim().length > 0

          return (
            <div key={facet}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">{t(`facets.${facet}.label`)}</span>
                <span className="text-gray-400">
                  {facetActions.length > 0
                    ? `${facetDone}/${facetActions.length} actions`
                    : hasNotes ? 'Notes only' : 'Empty'}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all ${FACET_COLORS[facet]}`}
                  style={{ width: `${Math.max(pct, hasNotes && facetActions.length === 0 ? 15 : 0)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
