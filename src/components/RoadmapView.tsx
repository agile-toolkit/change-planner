import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, Action, FacetId, Milestone } from '../types'

interface Props {
  initiative: Initiative
  onUpdate: (action: Action) => void
  onUpdateMilestones: (milestones: Milestone[]) => void
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

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString(locale === 'be' ? 'ru' : locale, { month: 'short', day: 'numeric' })
}

interface WeekGroup {
  monday: string
  actions: Action[]
}

interface TimelineEntry {
  monday: string
  milestones: Milestone[]
  group: WeekGroup | null
}

function milestoneStyle(m: Milestone, today: string) {
  if (m.reached)
    return 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500'
  if (m.date < today)
    return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
  return 'bg-brand-50 border-brand-100 text-brand-700 dark:bg-gray-900 dark:border-brand-400/40 dark:text-brand-400'
}

export default function RoadmapView({ initiative, onUpdate, onUpdateMilestones }: Props) {
  const { t, i18n } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  const milestones = initiative.milestones ?? []
  const dated = initiative.actions.filter(a => !!a.dueDate)
  const undated = initiative.actions.filter(a => !a.dueDate)

  const weekMap = new Map<string, Action[]>()
  for (const action of dated) {
    const key = getWeekMonday(action.dueDate)
    if (!weekMap.has(key)) weekMap.set(key, [])
    weekMap.get(key)!.push(action)
  }

  const sortedGroups: WeekGroup[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monday, actions]) => ({ monday, actions }))

  const sortedMilestones = [...milestones].sort((a, b) => a.date.localeCompare(b.date))

  // Merge weeks and milestone-weeks into a unified sorted timeline
  const allMondays = new Set<string>()
  for (const g of sortedGroups) allMondays.add(g.monday)
  for (const m of sortedMilestones) allMondays.add(getWeekMonday(m.date))

  const timeline: TimelineEntry[] = Array.from(allMondays)
    .sort()
    .map(monday => ({
      monday,
      milestones: sortedMilestones.filter(m => getWeekMonday(m.date) === monday),
      group: sortedGroups.find(g => g.monday === monday) ?? null,
    }))

  const thisMonday = todayMonday()
  const today = new Date().toISOString().slice(0, 10)

  const toggleDone = (action: Action) => {
    onUpdate({ ...action, status: action.status === 'done' ? 'todo' : 'done' })
  }

  const toggleReached = (id: string) => {
    onUpdateMilestones(milestones.map(m => m.id === id ? { ...m, reached: !m.reached } : m))
  }

  const deleteMilestone = (id: string) => {
    onUpdateMilestones(milestones.filter(m => m.id !== id))
  }

  const addMilestone = () => {
    if (!newTitle.trim() || !newDate) return
    const ms: Milestone = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      date: newDate,
      reached: false,
    }
    onUpdateMilestones([...milestones, ms])
    setNewTitle('')
    setNewDate('')
    setShowForm(false)
  }

  if (dated.length === 0 && milestones.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowForm(v => !v)} className="btn-secondary text-sm">
            + {t('roadmap.add_milestone')}
          </button>
        </div>
        {showForm && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-wrap gap-3 items-end">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={t('roadmap.milestone')}
              className="flex-1 min-w-[160px] input text-sm"
              onKeyDown={e => { if (e.key === 'Enter') addMilestone() }}
              autoFocus
            />
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input text-sm w-auto" />
            <button type="button" onClick={addMilestone} disabled={!newTitle.trim() || !newDate} className="btn-primary text-sm">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
          </div>
        )}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
          {t('roadmap.empty')}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Milestone management header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setShowForm(v => !v)} className="btn-secondary text-sm">
          + {t('roadmap.add_milestone')}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-wrap gap-3 items-end">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder={t('roadmap.milestone')}
            className="flex-1 min-w-[160px] input text-sm"
            onKeyDown={e => { if (e.key === 'Enter') addMilestone() }}
            autoFocus
          />
          <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input text-sm w-auto" />
          <button type="button" onClick={addMilestone} disabled={!newTitle.trim() || !newDate} className="btn-primary text-sm">Save</button>
          <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
        </div>
      )}

      {/* Milestone list */}
      {milestones.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
            {t('roadmap.milestone')}
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {sortedMilestones.map(m => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`flex-shrink-0 ${m.reached ? 'text-gray-400 dark:text-gray-500' : m.date < today ? 'text-amber-500' : 'text-brand-500'}`}>
                  {m.reached ? '✓' : '◆'}
                </span>
                <span className={`flex-1 text-sm ${m.reached ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                  {m.title}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatDate(m.date, i18n.language)}
                </span>
                <button
                  type="button"
                  onClick={() => toggleReached(m.id)}
                  className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 transition-colors ${
                    m.reached
                      ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
                      : 'bg-brand-50 border-brand-100 text-brand-600 hover:bg-brand-100 dark:bg-gray-800 dark:border-gray-700 dark:text-brand-400'
                  }`}
                >
                  {m.reached ? t('roadmap.milestone_reached') : t('roadmap.milestone_not_reached')}
                </button>
                <button
                  type="button"
                  onClick={() => deleteMilestone(m.id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-xs flex-shrink-0"
                  aria-label={t('actions.delete')}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Merged timeline: milestone markers + week groups */}
      {timeline.map(({ monday, milestones: weekMilestones, group }) => {
        const isPast = monday < thisMonday
        const isCurrent = monday === thisMonday
        return (
          <div key={monday} className="space-y-2">
            {/* Milestone markers before this week's actions */}
            {weekMilestones.map(m => (
              <div
                key={m.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${milestoneStyle(m, today)}`}
              >
                <span className="text-base flex-shrink-0">{m.reached ? '✓' : '◆'}</span>
                <span className={`flex-1 text-sm font-semibold ${m.reached ? 'line-through opacity-60' : ''}`}>
                  {m.title}
                </span>
                <span className="text-xs opacity-70 flex-shrink-0">
                  {formatDate(m.date, i18n.language)}
                </span>
              </div>
            ))}

            {/* Action week block */}
            {group && (
              <div
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
                  {group.actions.map(action => (
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
