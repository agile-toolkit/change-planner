import { useTranslation } from 'react-i18next'
import type { Initiative, Action, FacetId } from '../types'

interface Props {
  initiative: Initiative
  onUpdate: (action: Action) => void
}

const FACET_DOT: Record<FacetId, string> = {
  dance: 'bg-blue-500',
  mind: 'bg-green-500',
  stimulate: 'bg-orange-500',
  change: 'bg-purple-500',
}

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function getWeekMonday(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  const day = d.getUTCDay() // 0=Sun, 1=Mon...6=Sat
  const offset = day === 0 ? -6 : 1 - day // shift to Monday
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

function todayMonday(): string {
  return getWeekMonday(new Date().toISOString().slice(0, 10))
}

function formatWeekOf(mondayStr: string, locale: string): string {
  const d = new Date(mondayStr + 'T00:00:00Z')
  return d.toLocaleDateString(locale === 'be' ? 'ru' : locale, { month: 'short', day: 'numeric' })
}

interface WeekGroup {
  monday: string
  actions: Action[]
}

export default function RoadmapView({ initiative, onUpdate }: Props) {
  const { t, i18n } = useTranslation()

  const dated = initiative.actions.filter(a => !!a.dueDate)
  const undated = initiative.actions.filter(a => !a.dueDate)

  const weekMap = new Map<string, Action[]>()
  for (const action of dated) {
    const key = getWeekMonday(action.dueDate)
    if (!weekMap.has(key)) weekMap.set(key, [])
    weekMap.get(key)!.push(action)
  }

  const groups: WeekGroup[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monday, actions]) => ({ monday, actions }))

  const thisMonday = todayMonday()

  const toggleDone = (action: Action) => {
    onUpdate({ ...action, status: action.status === 'done' ? 'todo' : 'done' })
  }

  if (dated.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        {t('roadmap.empty')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map(({ monday, actions }) => {
        const isPast = monday < thisMonday
        const isCurrent = monday === thisMonday
        return (
          <div
            key={monday}
            className={`rounded-xl border bg-white dark:bg-gray-900 overflow-hidden ${
              isCurrent
                ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700'
                : isPast
                ? 'border-red-200 dark:border-red-800'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div
              className={`px-4 py-2 text-sm font-semibold ${
                isCurrent
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : isPast
                  ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t('roadmap.week_of', { date: formatWeekOf(monday, i18n.language) })}
            </div>
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {actions.map(action => (
                <li key={action.id} className="flex items-center gap-3 px-4 py-2.5">
                  <input
                    type="checkbox"
                    checked={action.status === 'done'}
                    onChange={() => toggleDone(action)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-600 cursor-pointer flex-shrink-0"
                    aria-label={action.status === 'done' ? t('actions.mark_todo') : t('actions.mark_done')}
                  />
                  <span
                    className={`flex-1 text-sm ${action.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
                  >
                    {action.text || '—'}
                  </span>
                  {action.owner && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {action.owner}
                    </span>
                  )}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${PRIORITY_BADGE[action.priority ?? 'low']}`}
                  >
                    {t(`actions.priority_${action.priority ?? 'low'}`)}
                  </span>
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FACET_DOT[action.facet]}`}
                    title={t(`facets.${action.facet}.label`)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {undated.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-500 dark:text-gray-400">
            {t('roadmap.no_date')}
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {undated.map(action => (
              <li key={action.id} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={action.status === 'done'}
                  onChange={() => toggleDone(action)}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-600 cursor-pointer flex-shrink-0"
                  aria-label={action.status === 'done' ? t('actions.mark_todo') : t('actions.mark_done')}
                />
                <span
                  className={`flex-1 text-sm ${action.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}
                >
                  {action.text || '—'}
                </span>
                {action.owner && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {action.owner}
                  </span>
                )}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${PRIORITY_BADGE[action.priority ?? 'low']}`}
                >
                  {t(`actions.priority_${action.priority ?? 'low'}`)}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${FACET_DOT[action.facet]}`}
                  title={t(`facets.${action.facet}.label`)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
