import { useTranslation } from 'react-i18next'
import type { Initiative } from '../types'
import { FACET_IDS } from '../types'

interface Props {
  initiative: Initiative
  onImport: (initiative: Initiative) => void
  onClose: () => void
}

export default function SharedView({ initiative, onImport, onClose }: Props) {
  const { t } = useTranslation()

  const openActions = initiative.actions.filter(a => a.status === 'todo')
  const doneActions = initiative.actions.filter(a => a.status === 'done')
  const facetLabel: Record<string, string> = {
    dance: t('facets.dance.label'),
    mind: t('facets.mind.label'),
    stimulate: t('facets.stimulate.label'),
    change: t('facets.change.label'),
  }
  const facetDot: Record<string, string> = {
    dance: 'bg-blue-500',
    mind: 'bg-green-500',
    stimulate: 'bg-orange-500',
    change: 'bg-purple-500',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-1">
              {t('share.view_title')}
            </p>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {initiative.title || t('export.untitled')}
            </h1>
            {initiative.goal && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{initiative.goal}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-4 mt-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Read-only note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            {t('share.read_only_note')}
          </p>

          {/* Context */}
          {initiative.context && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('canvas.context_label')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {initiative.context}
              </p>
            </div>
          )}

          {/* Stakeholders */}
          {initiative.stakeholders && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t('canvas.stakeholders_label')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {initiative.stakeholders}
              </p>
            </div>
          )}

          {/* Facet notes */}
          {FACET_IDS.some(f => initiative.facetNotes[f]) && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('export.facets_heading')}
              </h2>
              <div className="space-y-2">
                {FACET_IDS.filter(f => initiative.facetNotes[f]).map(f => (
                  <div key={f} className="flex gap-2">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${facetDot[f]}`} />
                    <div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {facetLabel[f]}
                      </span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {initiative.facetNotes[f]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {initiative.actions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t('export.actions_heading')}
              </h2>
              <ul className="space-y-1">
                {[...openActions, ...doneActions].map(action => (
                  <li key={action.id} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 flex-shrink-0 ${action.status === 'done' ? 'text-green-500' : 'text-gray-400'}`}>
                      {action.status === 'done' ? '✓' : '○'}
                    </span>
                    <span className={action.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}>
                      {action.text}
                      {action.owner && <span className="ml-1 text-gray-400 dark:text-gray-500">({action.owner})</span>}
                      {action.dueDate && (
                        <span className="ml-1 text-gray-400 dark:text-gray-500">· {action.dueDate}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn-secondary">
            {t('import_board.cancel')}
          </button>
          <button
            type="button"
            onClick={() => onImport(initiative)}
            className="btn-primary"
          >
            {t('share.import')}
          </button>
        </div>
      </div>
    </div>
  )
}
