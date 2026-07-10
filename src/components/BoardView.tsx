import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, Action, ActionStatus, ActionPriority, FacetId } from '../types'

interface Props {
  initiative: Initiative
  onUpdate: (action: Action) => void
}

const STATUS_ORDER: ActionStatus[] = ['todo', 'in-progress', 'done']
const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

const FACET_DOT: Record<FacetId, string> = {
  dance: 'bg-blue-500',
  mind: 'bg-green-500',
  stimulate: 'bg-orange-500',
  change: 'bg-purple-500',
}

const PRIORITY_BADGE: Record<ActionPriority, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function nextStatus(status: ActionStatus): ActionStatus {
  return STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length]
}

export default function BoardView({ initiative, onUpdate }: Props) {
  const { t } = useTranslation()
  const [collapsedLanes, setCollapsedLanes] = useState<Set<FacetId>>(new Set())
  const [dragOverColumn, setDragOverColumn] = useState<ActionStatus | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const toggleLane = (facet: FacetId) => {
    setCollapsedLanes(prev => {
      const next = new Set(prev)
      if (next.has(facet)) next.delete(facet)
      else next.add(facet)
      return next
    })
  }

  const moveTo = (action: Action, status: ActionStatus) => {
    if (action.status !== status) onUpdate({ ...action, status })
  }

  const handleDrop = (e: React.DragEvent, status: ActionStatus) => {
    e.preventDefault()
    setDragOverColumn(null)
    const id = e.dataTransfer.getData('text/plain')
    const action = initiative.actions.find(a => a.id === id)
    if (action) moveTo(action, status)
  }

  if (initiative.actions.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        {t('board.empty')}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATUS_ORDER.map(status => {
        const columnActions = initiative.actions.filter(a => a.status === status)
        return (
          <div
            key={status}
            onDragOver={e => { e.preventDefault(); setDragOverColumn(status) }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={e => handleDrop(e, status)}
            className={`rounded-xl border bg-white dark:bg-gray-900 flex flex-col transition-colors ${
              dragOverColumn === status
                ? 'border-brand-400 dark:border-brand-600 ring-2 ring-brand-200 dark:ring-brand-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span>{t(`board.col_${status.replace('-', '_')}`)}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">{columnActions.length}</span>
            </div>
            <div className="p-2 space-y-3 flex-1">
              {columnActions.length === 0 && (
                <p className="text-xs text-gray-300 dark:text-gray-600 text-center py-4">{t('board.empty')}</p>
              )}
              {FACET_IDS.map(facet => {
                const laneActions = columnActions.filter(a => a.facet === facet)
                if (laneActions.length === 0) return null
                const collapsed = collapsedLanes.has(facet)
                return (
                  <div key={facet} className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => toggleLane(facet)}
                      aria-expanded={!collapsed}
                      className="w-full flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${FACET_DOT[facet]}`} />
                      <span className="flex-1 text-left">{t(`facets.${facet}.label`)}</span>
                      <span className="tabular-nums">{laneActions.length}</span>
                      <span>{collapsed ? '▸' : '▾'}</span>
                    </button>
                    {!collapsed && (
                      <div className="p-1.5 space-y-1.5">
                        {laneActions.map(action => (
                          <div
                            key={action.id}
                            draggable
                            onDragStart={e => e.dataTransfer.setData('text/plain', action.id)}
                            onClick={() => moveTo(action, nextStatus(action.status))}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                moveTo(action, nextStatus(action.status))
                              }
                            }}
                            className={`rounded-lg border px-2.5 py-2 cursor-pointer hover:shadow-sm transition-shadow bg-white dark:bg-gray-900 ${
                              action.status !== 'done' && action.dueDate && action.dueDate < today
                                ? 'border-red-200 dark:border-red-800'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <p className={`text-sm ${action.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                              {action.text}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[action.priority ?? 'low']}`}>
                                {t(`actions.priority_${action.priority ?? 'low'}`)}
                              </span>
                              {action.owner && <span className="text-xs text-gray-400 dark:text-gray-500">{action.owner}</span>}
                              {action.dueDate && (
                                <span className={`text-xs ${action.status !== 'done' && action.dueDate < today ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                                  📅 {action.dueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
