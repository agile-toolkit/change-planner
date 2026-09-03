import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, Assessment, AssessmentEntry } from '../types'
import { FACET_IDS } from '../types'
import { CloseIcon } from './icons'

interface Props {
  initiative: Initiative
  onChange: (patch: Partial<Initiative>) => void
}

const FACET_COLOR: Record<FacetId, string> = {
  dance: '#2563eb',
  mind: '#16a34a',
  stimulate: '#ea580c',
  change: '#7c3aed',
}

const W = 440
const H = 220
const CX = W / 2
const CY = H / 2
const R = 76

function axisPoint(index: number, total: number, value: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const radius = (value / 5) * R
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) }
}

/** 'start'/'end' for side axes so labels grow away from the plot instead of overflowing the viewBox. */
function labelAnchor(angle: number): 'start' | 'middle' | 'end' {
  const cos = Math.cos(angle)
  if (cos > 0.3) return 'start'
  if (cos < -0.3) return 'end'
  return 'middle'
}

function polygonPoints(scores: number[]): string {
  return scores.map((v, i) => {
    const p = axisPoint(i, scores.length, v)
    return `${p.x},${p.y}`
  }).join(' ')
}

function scoreFor(entries: AssessmentEntry[], facet: FacetId): number {
  return entries.find(e => e.facet === facet)?.score ?? 0
}

const emptyScores = (): Record<FacetId, number> => ({ dance: 3, mind: 3, stimulate: 3, change: 3 })
const emptyNotes = (): Record<FacetId, string> => ({ dance: '', mind: '', stimulate: '', change: '' })

export default function AssessmentView({ initiative, onChange }: Props) {
  const { t } = useTranslation()
  const assessments = initiative.assessments ?? []
  const [showForm, setShowForm] = useState(assessments.length === 0)
  const [label, setLabel] = useState('')
  const [scores, setScores] = useState(emptyScores)
  const [notes, setNotes] = useState(emptyNotes)

  const sorted = [...assessments].sort((a, b) => a.takenAt - b.takenAt)
  const baseline = sorted[0]
  const latest = sorted[sorted.length - 1]
  const hasSpread = sorted.length > 1 && baseline.id !== latest.id
  const historyDesc = [...sorted].reverse()
  const defaultLabel = t('assess.default_label', { n: assessments.length + 1 })

  const resetForm = () => {
    setLabel('')
    setScores(emptyScores())
    setNotes(emptyNotes())
  }

  const handleSubmit = () => {
    const entries: AssessmentEntry[] = FACET_IDS.map(facet => ({
      facet,
      score: scores[facet],
      ...(notes[facet].trim() ? { note: notes[facet].trim() } : {}),
    }))
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      takenAt: Date.now(),
      label: label.trim() || defaultLabel,
      entries,
    }
    onChange({ assessments: [...assessments, assessment] })
    resetForm()
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm(t('assess.delete_confirm'))) return
    onChange({ assessments: assessments.filter(a => a.id !== id) })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          {t('assess.radar_title')}
        </h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
            {t('assess.empty')}
          </p>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
              aria-label={t('assess.radar_title')}
            >
              {[1, 2, 3, 4, 5].map(level => (
                <polygon
                  key={level}
                  points={polygonPoints(FACET_IDS.map(() => level))}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}
              {FACET_IDS.map((facet, i) => {
                const angle = (Math.PI * 2 * i) / FACET_IDS.length - Math.PI / 2
                const p = axisPoint(i, FACET_IDS.length, 5)
                const labelPos = axisPoint(i, FACET_IDS.length, 5.3)
                return (
                  <g key={facet}>
                    <line x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={1} />
                    <text x={labelPos.x} y={labelPos.y} fontSize="8" fill="#6b7280" textAnchor={labelAnchor(angle)}>
                      {t(`facets.${facet}.label`)}
                    </text>
                  </g>
                )
              })}
              {hasSpread && (
                <polygon
                  points={polygonPoints(FACET_IDS.map(f => scoreFor(baseline.entries, f)))}
                  fill="#9ca3af26"
                  stroke="#9ca3af"
                  strokeWidth={2}
                />
              )}
              <polygon
                points={polygonPoints(FACET_IDS.map(f => scoreFor(latest.entries, f)))}
                fill="#2563eb26"
                stroke="#2563eb"
                strokeWidth={2}
              />
            </svg>
            {hasSpread && (
              <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#9ca3af' }} />
                  {t('assess.baseline')}: {baseline.label}
                </span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: '#2563eb' }} />
                  {t('assess.current')}: {latest.label}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        {!showForm ? (
          <button type="button" onClick={() => setShowForm(true)} className="btn-secondary text-sm">
            + {t('assess.take')}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="label">{t('assess.label')}</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder={defaultLabel}
                className="input"
              />
            </div>
            {FACET_IDS.map(facet => (
              <div key={facet}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t(`facets.${facet}.label`)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: FACET_COLOR[facet] }}>
                    {scores[facet]}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={scores[facet]}
                  onChange={e => setScores(s => ({ ...s, [facet]: Number(e.target.value) }))}
                  className="w-full"
                  aria-label={t('assess.score_label', { facet: t(`facets.${facet}.label`) })}
                />
                <input
                  type="text"
                  value={notes[facet]}
                  onChange={e => setNotes(n => ({ ...n, [facet]: e.target.value }))}
                  placeholder={t('assess.note_placeholder')}
                  className="input mt-1 text-sm"
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleSubmit} className="btn-primary text-sm">
                {t('assess.submit')}
              </button>
              <button type="button" onClick={() => { resetForm(); setShowForm(false) }} className="btn-ghost text-sm">
                {t('assess.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {sorted.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-300">
            {t('assess.history')}
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {historyDesc.map(a => (
              <li key={a.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{a.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(a.takenAt).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-xs"
                    >
                      <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.entries.map(e => (
                    <span
                      key={e.facet}
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${FACET_COLOR[e.facet]}1a`, color: FACET_COLOR[e.facet] }}
                      title={e.note}
                    >
                      {t(`facets.${e.facet}.label`)}: {e.score}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
