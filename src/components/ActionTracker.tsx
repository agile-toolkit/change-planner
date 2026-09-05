import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Action, ActionHypothesis, ActionPriority, ActionStatus, FacetId, HypothesisOutcome } from '../types'
import { isOverdue as isActionOverdue } from '../utils/actions'
import { CloseIcon, BoltIcon, CalendarIcon, FlaskIcon } from './icons'

const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

const FACET_COLORS: Record<FacetId, string> = {
  dance: 'bg-blue-100 text-blue-700',
  mind: 'bg-green-100 text-green-700',
  stimulate: 'bg-orange-100 text-orange-700',
  change: 'bg-purple-100 text-purple-700',
}

const PRIORITY_COLORS: Record<ActionPriority, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

const PRIORITY_ORDER: ActionPriority[] = ['high', 'medium', 'low']

const OUTCOME_STYLES: Record<HypothesisOutcome, string> = {
  yes: 'bg-green-100 text-green-700 border-green-300',
  partial: 'bg-amber-100 text-amber-700 border-amber-300',
  no: 'bg-red-100 text-red-700 border-red-300',
}

function sortByPriority(actions: Action[]): Action[] {
  return [...actions].sort((a, b) => {
    const pa = PRIORITY_ORDER.indexOf(a.priority ?? 'low')
    const pb = PRIORITY_ORDER.indexOf(b.priority ?? 'low')
    if (pa !== pb) return pa - pb
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })
}

interface Props {
  actions: Action[]
  onAdd: (action: Action) => void
  onUpdate: (action: Action) => void
  onDelete: (id: string) => void
}

export default function ActionTracker({ actions, onAdd, onUpdate, onDelete }: Props) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState('')
  const [facet, setFacet] = useState<FacetId>('dance')
  const [priority, setPriority] = useState<ActionPriority>('medium')
  const [showForm, setShowForm] = useState(false)
  const [showHypothesisForm, setShowHypothesisForm] = useState(false)
  const [hypIf, setHypIf] = useState('')
  const [hypThen, setHypThen] = useState('')
  const [hypBecause, setHypBecause] = useState('')
  const [expandedHypotheses, setExpandedHypotheses] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [filterFacets, setFilterFacets] = useState<Set<FacetId>>(new Set())
  const [filterPriorities, setFilterPriorities] = useState<Set<ActionPriority>>(new Set())
  const [filterStatuses, setFilterStatuses] = useState<Set<ActionStatus>>(new Set())
  const addButtonRef = useRef<HTMLButtonElement>(null)
  const textInputRef = useRef<HTMLInputElement>(null)

  // N key opens the add form when focus is not inside an input/textarea
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setShowForm(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus the text input when form opens
  useEffect(() => {
    if (showForm) {
      textInputRef.current?.focus()
    }
  }, [showForm])

  const toggleHypothesis = (id: string) => {
    setExpandedHypotheses(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Hypothesis details are conditionally rendered (unmounted when
  // collapsed), so a print stylesheet alone can't reveal them — expand
  // every action with a hypothesis for the duration of printing, then
  // restore whatever the user had open (issue #54). Reads current
  // actions/expandedHypotheses via refs rather than effect deps, so the
  // listeners stay registered across renders (a beforeprint-triggered
  // state update must not tear down the afterprint handler before it fires).
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const expandedBeforePrintRef = useRef<Set<string> | null>(null)

  useEffect(() => {
    const handleBeforePrint = () => {
      setExpandedHypotheses(prev => {
        expandedBeforePrintRef.current = prev
        return new Set(actionsRef.current.filter(a => a.hypothesis).map(a => a.id))
      })
    }
    const handleAfterPrint = () => {
      if (expandedBeforePrintRef.current) {
        setExpandedHypotheses(expandedBeforePrintRef.current)
        expandedBeforePrintRef.current = null
      }
    }
    window.addEventListener('beforeprint', handleBeforePrint)
    window.addEventListener('afterprint', handleAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint)
      window.removeEventListener('afterprint', handleAfterPrint)
    }
  }, [])

  const handleAdd = () => {
    if (!text.trim()) return
    const hypothesis: ActionHypothesis | undefined =
      showHypothesisForm && (hypIf.trim() || hypThen.trim() || hypBecause.trim())
        ? { if: hypIf.trim(), then: hypThen.trim(), because: hypBecause.trim() }
        : undefined
    onAdd({
      id: crypto.randomUUID(),
      text: text.trim(),
      owner: owner.trim(),
      dueDate: due,
      status: 'todo',
      facet,
      priority,
      hypothesis,
    })
    setText('')
    setOwner('')
    setDue('')
    setPriority('medium')
    setShowForm(false)
    setShowHypothesisForm(false)
    setHypIf('')
    setHypThen('')
    setHypBecause('')
    // Return focus to the Add Action button after form closes
    setTimeout(() => addButtonRef.current?.focus(), 0)
  }

  const handleOutcome = (action: Action, outcome: HypothesisOutcome) => {
    onUpdate({
      ...action,
      hypothesis: { ...action.hypothesis!, outcome },
    })
  }

  const doneCount = actions.filter(a => a.status === 'done').length
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = (action: Action) => isActionOverdue(action, today)

  const toggleChip = <T extends string>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set)
    if (next.has(val)) next.delete(val)
    else next.add(val)
    return next
  }

  const activeFilterCount =
    (filterText.trim() ? 1 : 0) +
    filterFacets.size +
    filterPriorities.size +
    filterStatuses.size

  const clearFilters = () => {
    setFilterText('')
    setFilterFacets(new Set())
    setFilterPriorities(new Set())
    setFilterStatuses(new Set())
  }

  const sorted = sortByPriority(actions)
  const filtered = sorted.filter(a => {
    if (filterFacets.size > 0 && !filterFacets.has(a.facet)) return false
    if (filterPriorities.size > 0 && !filterPriorities.has(a.priority ?? 'low')) return false
    if (filterStatuses.size > 0 && !filterStatuses.has(a.status)) return false
    if (filterText.trim()) {
      const q = filterText.trim().toLowerCase()
      if (!a.text.toLowerCase().includes(q) && !a.owner.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('actions.title')}</h2>
          {actions.length > 0 && (
            <span className="text-xs text-gray-400">{t('actions.done_count', { done: doneCount, total: actions.length })}</span>
          )}
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {actions.length > 0 && (
            <button
              onClick={() => setShowFilters(v => !v)}
              aria-expanded={showFilters}
              aria-label={t('actions.filter_label')}
              className={`relative btn-ghost text-sm inline-flex items-center gap-1 ${showFilters ? 'bg-brand-50 dark:bg-brand-900 text-brand-700 dark:text-brand-300' : ''}`}
            >
              <BoltIcon className="w-3.5 h-3.5" /> {t('actions.filter_label')}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          <button ref={addButtonRef} onClick={() => setShowForm(v => !v)} aria-label={`${t('actions.add')} (N)`} className="btn-primary text-sm">
            + {t('actions.add')}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-4 space-y-3 print:hidden">
          <input
            className="input text-sm"
            placeholder={t('actions.filter_search')}
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            aria-label={t('actions.filter_search')}
          />
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('actions.filter_facet')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {FACET_IDS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilterFacets(s => toggleChip(s, f))}
                  aria-pressed={filterFacets.has(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    filterFacets.has(f)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`facets.${f}.label`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('actions.filter_priority')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITY_ORDER.map(p => (
                <button
                  key={p}
                  onClick={() => setFilterPriorities(s => toggleChip(s, p))}
                  aria-pressed={filterPriorities.has(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    filterPriorities.has(p)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`actions.priority_${p}`)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t('actions.filter_status')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {(['todo', 'done'] as ActionStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatuses(prev => toggleChip(prev, s))}
                  aria-pressed={filterStatuses.has(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    filterStatuses.has(s)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                >
                  {t(`actions.filter_${s}`)}
                </button>
              ))}
            </div>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-brand-600 hover:underline">
              {t('actions.filter_clear')}
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
          <input
            ref={textInputRef}
            className="input"
            placeholder={t('actions.placeholder_text')}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder={t('actions.placeholder_owner')}
              value={owner}
              onChange={e => setOwner(e.target.value)}
            />
            <input
              type="date"
              className="input"
              aria-label={t('actions.placeholder_due')}
              value={due}
              onChange={e => setDue(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap" role="group" aria-label={t('actions.facet_label')}>
            {FACET_IDS.map(f => (
              <button
                key={f}
                onClick={() => setFacet(f)}
                aria-pressed={facet === f}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  facet === f
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                {t(`facets.${f}.label`)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap" role="group" aria-label={t('actions.priority_label')}>
            {PRIORITY_ORDER.map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                aria-pressed={priority === p}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  priority === p
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                }`}
              >
                {t(`actions.priority_${p}`)}
              </button>
            ))}
          </div>

          {!showHypothesisForm ? (
            <button
              onClick={() => setShowHypothesisForm(true)}
              className="text-xs text-brand-600 hover:underline"
            >
              + {t('actions.hypothesis_add')}
            </button>
          ) : (
            <div className="border border-brand-200 dark:border-brand-700 rounded-lg p-3 space-y-2 bg-white dark:bg-gray-800">
              <p className="text-xs font-medium text-brand-700 dark:text-brand-400">{t('actions.hypothesis_title')}</p>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('actions.hypothesis_if')}</label>
                <input
                  className="input text-sm"
                  placeholder={t('actions.hypothesis_if_placeholder')}
                  value={hypIf}
                  onChange={e => setHypIf(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('actions.hypothesis_then')}</label>
                <input
                  className="input text-sm"
                  placeholder={t('actions.hypothesis_then_placeholder')}
                  value={hypThen}
                  onChange={e => setHypThen(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('actions.hypothesis_because')}</label>
                <input
                  className="input text-sm"
                  placeholder={t('actions.hypothesis_because_placeholder')}
                  value={hypBecause}
                  onChange={e => setHypBecause(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowHypothesisForm(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t('actions.hypothesis_remove')}
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!text.trim()} className="btn-primary text-sm">
              Add
            </button>
            <button onClick={() => { setShowForm(false); setShowHypothesisForm(false) }} className="btn-ghost">{t('common.cancel')}</button>
          </div>
        </div>
      )}

      {actions.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('actions.empty')}</p>
      )}

      {actions.length > 0 && filtered.length === 0 && activeFilterCount > 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">{t('actions.filter_no_results')}</p>
      )}

      <div className="space-y-2">
        {filtered.map(action => {
          const hyp = action.hypothesis
          const expanded = expandedHypotheses.has(action.id)
          const hasHyp = hyp && (hyp.if || hyp.then || hyp.because)
          return (
            <div
              key={action.id}
              className={`rounded-xl border transition-colors print-avoid-break ${
                action.status === 'done'
                  ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  : isOverdue(action)
                    ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={action.status === 'done'}
                  onChange={() => onUpdate({ ...action, status: action.status === 'done' ? 'todo' : 'done' })}
                  aria-label={action.status === 'done' ? t('actions.mark_todo') : t('actions.mark_done')}
                  className="mt-0.5 accent-brand-600 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${action.status === 'done' ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
                    {action.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[action.priority ?? 'low']}`}>
                      {t(`actions.priority_${action.priority ?? 'low'}`)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${FACET_COLORS[action.facet]}`}>
                      {t(`facets.${action.facet}.label`)}
                    </span>
                    {action.status !== 'done' && (
                      <button
                        type="button"
                        onClick={() => onUpdate({ ...action, status: action.status === 'in-progress' ? 'todo' : 'in-progress' })}
                        aria-pressed={action.status === 'in-progress'}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium border transition-colors ${
                          action.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700'
                            : 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {t('actions.status_in_progress')}
                      </button>
                    )}
                    {action.owner && <span className="text-xs text-gray-400 dark:text-gray-500">{action.owner}</span>}
                    {action.dueDate && (
                      <span className={`text-xs inline-flex items-center gap-1 ${isOverdue(action) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        <CalendarIcon className="w-3 h-3" /> {action.dueDate}
                      </span>
                    )}
                    {isOverdue(action) && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        {t('actions.overdue')}
                      </span>
                    )}
                    {hasHyp && (
                      <button
                        onClick={() => toggleHypothesis(action.id)}
                        aria-expanded={expanded}
                        aria-controls={`hypothesis-${action.id}`}
                        className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 print:hidden"
                      >
                        <FlaskIcon className="w-3 h-3" /> {expanded ? t('actions.hypothesis_hide') : t('actions.hypothesis_show')}
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => onDelete(action.id)} aria-label={t('actions.delete')} className="text-gray-400 dark:text-gray-500 hover:text-red-400 transition-colors text-xs flex-shrink-0 print:hidden">
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {hasHyp && expanded && (
                <div id={`hypothesis-${action.id}`} className="mx-3 mb-3 p-3 bg-brand-50 dark:bg-gray-800 rounded-lg border border-brand-100 dark:border-gray-700 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  {hyp!.if && (
                    <p><span className="font-semibold text-brand-700 dark:text-brand-400">{t('actions.hypothesis_if')}:</span> {hyp!.if}</p>
                  )}
                  {hyp!.then && (
                    <p><span className="font-semibold text-brand-700 dark:text-brand-400">{t('actions.hypothesis_then')}:</span> {hyp!.then}</p>
                  )}
                  {hyp!.because && (
                    <p><span className="font-semibold text-brand-700 dark:text-brand-400">{t('actions.hypothesis_because')}:</span> {hyp!.because}</p>
                  )}

                  {action.status === 'done' && (
                    <div className="pt-1.5 border-t border-brand-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t('actions.hypothesis_outcome_prompt')}</p>
                      <div className="flex gap-2">
                        {(['yes', 'partial', 'no'] as HypothesisOutcome[]).map(o => (
                          <button
                            key={o}
                            onClick={() => handleOutcome(action, o)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              hyp!.outcome === o
                                ? OUTCOME_STYLES[o]
                                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {t(`actions.hypothesis_outcome_${o}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {action.status !== 'done' && hyp!.outcome && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${OUTCOME_STYLES[hyp!.outcome]}`}>
                      {t(`actions.hypothesis_outcome_${hyp!.outcome}`)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
