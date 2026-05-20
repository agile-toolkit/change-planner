import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Action, ActionHypothesis, ActionPriority, FacetId, HypothesisOutcome } from '../types'

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

  const toggleHypothesis = (id: string) => {
    setExpandedHypotheses(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
  }

  const handleOutcome = (action: Action, outcome: HypothesisOutcome) => {
    onUpdate({
      ...action,
      hypothesis: { ...action.hypothesis!, outcome },
    })
  }

  const doneCount = actions.filter(a => a.status === 'done').length
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = (action: Action) =>
    action.status === 'todo' && !!action.dueDate && action.dueDate < today
  const sorted = sortByPriority(actions)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-gray-900">{t('actions.title')}</h2>
          {actions.length > 0 && (
            <span className="text-xs text-gray-400">{t('actions.done_count', { done: doneCount, total: actions.length })}</span>
          )}
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary text-sm">
          + {t('actions.add')}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
          <input
            autoFocus
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
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  facet === f
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-600 hover:bg-white'
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
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  priority === p
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'border-gray-200 text-gray-600 hover:bg-white'
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
            <div className="border border-brand-200 rounded-lg p-3 space-y-2 bg-white">
              <p className="text-xs font-medium text-brand-700">{t('actions.hypothesis_title')}</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('actions.hypothesis_if')}</label>
                <input
                  className="input text-sm"
                  placeholder={t('actions.hypothesis_if_placeholder')}
                  value={hypIf}
                  onChange={e => setHypIf(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('actions.hypothesis_then')}</label>
                <input
                  className="input text-sm"
                  placeholder={t('actions.hypothesis_then_placeholder')}
                  value={hypThen}
                  onChange={e => setHypThen(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('actions.hypothesis_because')}</label>
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
            <button onClick={() => { setShowForm(false); setShowHypothesisForm(false) }} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {actions.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">{t('actions.empty')}</p>
      )}

      <div className="space-y-2">
        {sorted.map(action => {
          const hyp = action.hypothesis
          const expanded = expandedHypotheses.has(action.id)
          const hasHyp = hyp && (hyp.if || hyp.then || hyp.because)
          return (
            <div
              key={action.id}
              className={`rounded-xl border transition-colors ${
                action.status === 'done'
                  ? 'bg-gray-50 border-gray-100'
                  : isOverdue(action)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
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
                  <p className={`text-sm ${action.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {action.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[action.priority ?? 'low']}`}>
                      {t(`actions.priority_${action.priority ?? 'low'}`)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${FACET_COLORS[action.facet]}`}>
                      {t(`facets.${action.facet}.label`)}
                    </span>
                    {action.owner && <span className="text-xs text-gray-400">{action.owner}</span>}
                    {action.dueDate && (
                      <span className={`text-xs ${isOverdue(action) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        📅 {action.dueDate}
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
                        className="text-xs text-brand-600 hover:underline"
                      >
                        🧪 {expanded ? t('actions.hypothesis_hide') : t('actions.hypothesis_show')}
                      </button>
                    )}
                  </div>
                </div>
                <button onClick={() => onDelete(action.id)} aria-label={t('actions.delete')} className="text-gray-200 hover:text-red-400 transition-colors text-xs flex-shrink-0">
                  ✕
                </button>
              </div>

              {hasHyp && expanded && (
                <div className="mx-3 mb-3 p-3 bg-brand-50 rounded-lg border border-brand-100 space-y-1.5 text-xs text-gray-700">
                  {hyp!.if && (
                    <p><span className="font-semibold text-brand-700">{t('actions.hypothesis_if')}:</span> {hyp!.if}</p>
                  )}
                  {hyp!.then && (
                    <p><span className="font-semibold text-brand-700">{t('actions.hypothesis_then')}:</span> {hyp!.then}</p>
                  )}
                  {hyp!.because && (
                    <p><span className="font-semibold text-brand-700">{t('actions.hypothesis_because')}:</span> {hyp!.because}</p>
                  )}

                  {action.status === 'done' && (
                    <div className="pt-1.5 border-t border-brand-200">
                      <p className="text-xs text-gray-500 mb-1.5">{t('actions.hypothesis_outcome_prompt')}</p>
                      <div className="flex gap-2">
                        {(['yes', 'partial', 'no'] as HypothesisOutcome[]).map(o => (
                          <button
                            key={o}
                            onClick={() => handleOutcome(action, o)}
                            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                              hyp!.outcome === o
                                ? OUTCOME_STYLES[o]
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
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
