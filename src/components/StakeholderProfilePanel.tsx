import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { StakeholderProfile } from '../types'

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
      <span className="text-xs text-green-700/80 w-14 shrink-0">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            className={`w-5 h-5 rounded text-xs font-medium transition-colors ${
              value === n
                ? 'bg-green-600 text-white'
                : 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
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
    <div className="mt-4 rounded-xl border border-green-200 bg-green-50/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-green-800">
          {t('mind_profiles.section_title')}
        </h4>
        <a
          href={MM_URL}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-green-700 underline hover:opacity-80"
        >
          {t('mind_profiles.open_mm')}
        </a>
      </div>

      {profiles.length === 0 && !adding && (
        <p className="text-xs text-green-700/70 mb-3 leading-relaxed">
          {t('mind_profiles.open_mm_hint')}
        </p>
      )}

      {profiles.map(p => (
        <div key={p.id} className="mb-3 rounded-lg border border-green-100 bg-white p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-green-900">{p.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(p.id)}
              aria-label={t('mind_profiles.delete')}
              className="ml-2 text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              ✕
            </button>
          </div>
          {p.motivators.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {p.motivators.map((m, i) => (
                <span
                  key={i}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    i === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{i + 1} {m}
                </span>
              ))}
            </div>
          )}
          {p.motivators[0] && (
            <p className="text-xs italic text-green-700/80 mb-2">
              💡 {t('mind_profiles.suggested_action', { name: p.name, motivator: p.motivators[0] })}
            </p>
          )}
          <div className="space-y-1 pt-1 border-t border-green-50">
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
        <div className="rounded-lg border border-green-200 bg-white p-3 space-y-2">
          <input
            type="text"
            placeholder={t('mind_profiles.name_placeholder')}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder={t('mind_profiles.motivator1_placeholder')}
              value={m1}
              onChange={e => setM1(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <input
              type="text"
              placeholder={t('mind_profiles.motivator2_placeholder')}
              value={m2}
              onChange={e => setM2(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <input
              type="text"
              placeholder={t('mind_profiles.motivator3_placeholder')}
              value={m3}
              onChange={e => setM3(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
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
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
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
