import { useState } from 'react'
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
  onChange?: (patch: Partial<Initiative>) => void
}

export default function ProgressView({ initiative }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const totalActions = initiative.actions.length
  const doneActions = initiative.actions.filter(a => a.status === 'done').length
  const facetsWithActions = FACET_IDS.filter(f => initiative.actions.some(a => a.facet === f)).length

  function buildRetroMarkdown(): string {
    const lines: string[] = []
    lines.push(`## ${t('progress.retro_heading')}: ${initiative.title || t('progress.retro_untitled')}`)
    if (initiative.goal) lines.push(`**${t('canvas.goal_label')}:** ${initiative.goal}`)
    if (initiative.relatedSprints) lines.push(`**${t('canvas.related_sprints_label')}:** ${initiative.relatedSprints}`)
    lines.push('')
    lines.push(`### ${t('progress.retro_facets')}`)
    for (const facet of FACET_IDS) {
      const notes = initiative.facetNotes[facet]?.trim()
      lines.push(`**${t(`facets.${facet}.label`)}:** ${notes || '—'}`)
    }
    const openActions = initiative.actions.filter(a => a.status !== 'done')
    if (openActions.length > 0) {
      lines.push('')
      lines.push(`### ${t('progress.retro_open_actions')}`)
      for (const action of openActions) {
        const parts = [`- [ ] ${action.text}`]
        if (action.owner) parts.push(`(${t('actions.placeholder_owner')}: ${action.owner})`)
        if (action.dueDate) parts.push(`[${t('actions.placeholder_due')}: ${action.dueDate}]`)
        lines.push(parts.join(' '))
      }
    }
    return lines.join('\n')
  }

  const handleCopy = () => {
    const md = buildRetroMarkdown()
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('progress.title')}</h2>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title={t('progress.copy_retro_hint')}
        >
          {copied ? `✓ ${t('progress.copied')}` : t('progress.copy_retro')}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-600 tabular-nums">
            {totalActions > 0 ? `${Math.round((doneActions / totalActions) * 100)}%` : '—'}
          </div>
          <div className="text-xs text-gray-400">{t('progress.overall')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 tabular-nums">
            {doneActions}/{totalActions}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{t('progress.actions_done')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 tabular-nums">
            {facetsWithActions}/4
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{t('progress.facets_with_actions')}</div>
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
                <span className="text-gray-600 dark:text-gray-400">{t(`facets.${facet}.label`)}</span>
                <span className="text-gray-400 dark:text-gray-500">
                  {facetActions.length > 0
                    ? `${facetDone}/${facetActions.length}`
                    : hasNotes ? t('progress.notes_only') : '—'}
                </span>
              </div>
              {facetActions.length > 0 && (
                <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all ${FACET_COLORS[facet]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
