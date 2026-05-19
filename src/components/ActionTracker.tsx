import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Action, FacetId } from '../types'

const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

const FACET_COLORS: Record<FacetId, string> = {
  dance: 'bg-blue-100 text-blue-700',
  mind: 'bg-green-100 text-green-700',
  stimulate: 'bg-orange-100 text-orange-700',
  change: 'bg-purple-100 text-purple-700',
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
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (!text.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      text: text.trim(),
      owner: owner.trim(),
      dueDate: due,
      status: 'todo',
      facet,
    })
    setText('')
    setOwner('')
    setDue('')
    setShowForm(false)
  }

  const doneCount = actions.filter(a => a.status === 'done').length
  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = (action: Action) =>
    action.status === 'todo' && !!action.dueDate && action.dueDate < today

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
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!text.trim()} className="btn-primary text-sm">
              Add
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      )}

      {actions.length === 0 && !showForm && (
        <p className="text-sm text-gray-400 text-center py-4">{t('actions.empty')}</p>
      )}

      <div className="space-y-2">
        {actions.map(action => (
          <div
            key={action.id}
            className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
              action.status === 'done'
                ? 'bg-gray-50 border-gray-100'
                : isOverdue(action)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-gray-200'
            }`}
          >
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
              </div>
            </div>
            <button onClick={() => onDelete(action.id)} aria-label={t('actions.delete')} className="text-gray-200 hover:text-red-400 transition-colors text-xs flex-shrink-0">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
