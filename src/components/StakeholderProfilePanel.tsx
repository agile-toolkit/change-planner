import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StakeholderProfile } from '../types'
import { readMmLastSession, mmLastSessionTopMotivators } from '../utils/crossAppImport'
import { CloseIcon } from './icons'

const MM_URL = 'https://agile-toolkit.github.io/moving-motivators/'

interface Props {
  profiles: StakeholderProfile[]
  onChange: (profiles: StakeholderProfile[]) => void
}

function ScoreButtons({
  label,
  value,
  onSelect,
}: {
  label: string
  value: number | undefined
  onSelect: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-green-700/80 dark:text-green-400/80 w-14 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`w-5 h-5 rounded text-xs font-medium transition-colors ${
              value === n
                ? 'bg-green-600 text-white'
                : 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StakeholderProfilePanel({ profiles, onChange }: Props) {
  const { t } = useTranslation()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [m1, setM1] = useState('')
  const [m2, setM2] = useState('')
  const [m3, setM3] = useState('')
  const [influence, setInfluence] = useState<number | undefined>()
  const [interest, setInterest] = useState<number | undefined>()
  const mmSession = readMmLastSession()

  function handlePrefillFromMm() {
    if (!mmSession) return
    const [top1, top2, top3] = mmLastSessionTopMotivators(mmSession)
    setM1(top1 ?? '')
    setM2(top2 ?? '')
    setM3(top3 ?? '')
  }

  function handleAdd() {
    if (!name.trim()) return
    const filled = [m1.trim(), m2.trim(), m3.trim()].filter(Boolean)
    const profile: StakeholderProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      motivators: filled,
      influence,
      interest,
    }
    onChange([...profiles, profile])
    setAdding(false)
    setName('')
    setM1('')
    setM2('')
    setM3('')
    setInfluence(undefined)
    setInterest(undefined)
  }

  function handleCancel() {
    setAdding(false)
    setName('')
    setM1('')
    setM2('')
    setM3('')
    setInfluence(undefined)
    setInterest(undefined)
  }

  function handleDelete(id: string) {
    onChange(profiles.filter(p => p.id !== id))
  }

  function updateScore(id: string, field: 'influence' | 'interest', value: number) {
    onChange(profiles.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  return (
    <div className="mt-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/60 dark:bg-green-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
          {t('mind_profiles.section_title')}
        </h4>
        <a
          href={MM_URL}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-green-700 dark:text-green-400 underline hover:opacity-80"
        >
          {t('mind_profiles.open_mm')}
        </a>
      </div>

      {profiles.length === 0 && !adding && (
        <p className="text-xs text-green-700/70 dark:text-green-400/70 mb-3 leading-relaxed">
          {t('mind_profiles.open_mm_hint')}
        </p>
      )}

      {profiles.map(p => (
        <div key={p.id} className="mb-3 rounded-lg border border-green-100 dark:border-green-800 bg-white dark:bg-gray-900 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">{p.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              aria-label={t('mind_profiles.delete')}
              className="ml-2 text-xs text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          {p.motivators.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {p.motivators.map((m, i) => (
                <span
                  key={i}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    i === 0 ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  #{i + 1} {m}
                </span>
              ))}
            </div>
          )}
          {p.motivators[0] && (
            <p className="text-xs italic text-green-700/80 dark:text-green-400/80 mb-2">
              💡 {t('mind_profiles.suggested_action', { name: p.name, motivator: p.motivators[0] })}
            </p>
          )}
          <div className="space-y-1 pt-1 border-t border-green-50 dark:border-green-900">
            <ScoreButtons
              label={t('stakeholders.influence')}
              value={p.influence}
              onSelect={v => updateScore(p.id, 'influence', v)}
            />
            <ScoreButtons
              label={t('stakeholders.interest')}
              value={p.interest}
              onSelect={v => updateScore(p.id, 'interest', v)}
            />
          </div>
        </div>
      ))}

      {adding ? (
        <div className="rounded-lg border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 p-3 space-y-2">
          <input
            type="text"
            placeholder={t('mind_profiles.name_placeholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 dark:placeholder:text-gray-500"
          />
          {mmSession && (
            <button
              type="button"
              onClick={handlePrefillFromMm}
              className="text-xs text-green-700 dark:text-green-400 underline hover:opacity-80"
            >
              {t('mind_profiles.prefill_from_mm', { date: mmSession.date })}
            </button>
          )}
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={t('mind_profiles.motivator1_placeholder')}
              value={m1}
              onChange={e => setM1(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 dark:placeholder:text-gray-500"
            />
            <input
              type="text"
              placeholder={t('mind_profiles.motivator2_placeholder')}
              value={m2}
              onChange={e => setM2(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 dark:placeholder:text-gray-500"
            />
            <input
              type="text"
              placeholder={t('mind_profiles.motivator3_placeholder')}
              value={m3}
              onChange={e => setM3(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-1.5 pt-1">
            <ScoreButtons
              label={t('stakeholders.influence')}
              value={influence}
              onSelect={setInfluence}
            />
            <ScoreButtons
              label={t('stakeholders.interest')}
              value={interest}
              onSelect={setInterest}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!name.trim()}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {t('mind_profiles.save')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('mind_profiles.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1 text-xs text-green-700 hover:underline hover:text-green-800"
        >
          + {t('mind_profiles.add_button')}
        </button>
      )}
    </div>
  )
}
