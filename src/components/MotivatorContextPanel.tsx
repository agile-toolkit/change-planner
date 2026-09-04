import { useTranslation } from 'react-i18next'
import type { MotivatorContext } from '../types'
import { motivatorContextTopEntries, capitalize } from '../utils/crossAppImport'
import { LinkIcon, TrendUpIcon, TrendDownIcon } from './icons'

interface Props {
  context: MotivatorContext
}

const IMPACT_BADGE: Record<string, string> = {
  positive:
    'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  negative:
    'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  neutral:
    'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
}

/**
 * Read-only display of a Moving Motivators snapshot imported via
 * `?mm_snapshot=` (see `utils/crossAppImport.ts`). Shown on the `mind`
 * facet card — this is stakeholder/motivation territory already — for as
 * long as the initiative carries `motivatorContext`. Nothing here is
 * editable; corrections belong in Moving Motivators, re-exported.
 */
export default function MotivatorContextPanel({ context }: Props) {
  const { t } = useTranslation()
  const entries = motivatorContextTopEntries(context)
  if (entries.length === 0) return null

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 p-4">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5" /> {t('motivator_context.section_title')}
        </h4>
        {context.date && (
          <span className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
            {t('motivator_context.subtitle', { date: context.date })}
          </span>
        )}
      </div>

      {context.change && (
        <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-3 leading-relaxed">
          <span className="font-medium">{t('motivator_context.change_label')}:</span> "{context.change}"
        </p>
      )}

      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800/70 dark:text-emerald-300/70 mb-1.5">
        {t('motivator_context.ranked_title')}
      </p>
      <div className="flex flex-wrap gap-1.5" role="list">
        {entries.map(entry => (
          <span
            key={entry.id}
            role="listitem"
            title={
              entry.impact === 'positive'
                ? t('motivator_context.positive')
                : entry.impact === 'negative'
                  ? t('motivator_context.negative')
                  : undefined
            }
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${IMPACT_BADGE[entry.impact]}`}
          >
            <span className="text-gray-400 dark:text-gray-600 font-normal">#{entry.rank}</span>
            {capitalize(entry.id)}
            {entry.impact === 'positive' && <TrendUpIcon className="w-3 h-3" />}
            {entry.impact === 'negative' && <TrendDownIcon className="w-3 h-3" />}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-emerald-700/60 dark:text-emerald-400/60 leading-relaxed">
        {t('motivator_context.hint')}
      </p>
    </div>
  )
}
