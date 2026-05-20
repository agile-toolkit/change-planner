import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId, StakeholderProfile } from '../types'
import StakeholderProfilePanel from './StakeholderProfilePanel'
import StakeholderMap from './StakeholderMap'

/** Short labels for facet tabs (facets.*.label are often long) */
const FACET_TAB_EMOJI: Record<FacetId, string> = {
  dance: '💃',
  mind: '🧠',
  stimulate: '🕸️',
  change: '🌱',
}

const FACET_STYLES: Record<
  FacetId,
  { bg: string; border: string; header: string; active: string; ring: string }
> = {
  dance: {
    bg: 'bg-blue-50 border-blue-200 text-blue-800',
    border: 'border-blue-200',
    header: 'text-blue-900',
    active: 'bg-blue-600 text-white border-blue-600',
    ring: 'focus:ring-blue-400',
  },
  mind: {
    bg: 'bg-green-50 border-green-200 text-green-800',
    border: 'border-green-200',
    header: 'text-green-900',
    active: 'bg-green-600 text-white border-green-600',
    ring: 'focus:ring-green-400',
  },
  stimulate: {
    bg: 'bg-orange-50 border-orange-200 text-orange-800',
    border: 'border-orange-200',
    header: 'text-orange-900',
    active: 'bg-orange-600 text-white border-orange-600',
    ring: 'focus:ring-orange-400',
  },
  change: {
    bg: 'bg-purple-50 border-purple-200 text-purple-800',
    border: 'border-purple-200',
    header: 'text-purple-900',
    active: 'bg-purple-600 text-white border-purple-600',
    ring: 'focus:ring-purple-400',
  },
}

interface Props {
  initiative: Initiative
  activeFacet: FacetId
  facetIds: FacetId[]
  onChange: (patch: Partial<Initiative>) => void
  onFacetChange: (f: FacetId) => void
}

export default function FacetPlanner({
  initiative,
  activeFacet,
  facetIds,
  onChange,
  onFacetChange,
}: Props) {
  const { t } = useTranslation()
  const [showExplainer, setShowExplainer] = useState(false)
  const styles = FACET_STYLES[activeFacet]
  const prompts = t(`facets.${activeFacet}.prompts`, { returnObjects: true }) as string[]
  const notes = initiative.facetNotes[activeFacet]
  const currentIdx = facetIds.indexOf(activeFacet)
  const nextFacet = currentIdx < facetIds.length - 1 ? facetIds[currentIdx + 1] : null

  function updateNotes(next: string) {
    onChange({
      facetNotes: { ...initiative.facetNotes, [activeFacet]: next },
    })
  }

  function updateProfiles(profiles: StakeholderProfile[]) {
    onChange({ stakeholderProfiles: profiles })
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t('facets.guided_title')}</h2>

      <div className="flex flex-wrap gap-2">
        {facetIds.map(fid => {
          const tabStyles = FACET_STYLES[fid]
          return (
          <button
            key={fid}
            type="button"
            onClick={() => onFacetChange(fid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors text-sm ${
              fid === activeFacet
                ? tabStyles.active
                : `${tabStyles.bg} hover:opacity-90 border ${tabStyles.border}`
            }`}
          >
            <span aria-hidden>{FACET_TAB_EMOJI[fid]}</span>
            <span className="max-w-[10rem] truncate sm:max-w-none">{t(`facets.${fid}.label`)}</span>
            {initiative.facetNotes[fid].trim() ? <span className="text-xs opacity-70">✓</span> : null}
          </button>
          )
        })}
      </div>

      <div className={`rounded-xl border-2 p-5 ${styles.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0" aria-hidden>
              {FACET_TAB_EMOJI[activeFacet]}
            </span>
            <h3 className={`text-xl font-bold truncate ${styles.header}`}>{t(`facets.${activeFacet}.label`)}</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowExplainer(v => !v)}
            className="text-xs underline opacity-70 hover:opacity-100 transition-opacity shrink-0"
          >
            {showExplainer ? t('facets.why_toggle_hide') : t('facets.why_toggle_show')}
          </button>
        </div>

        {showExplainer ? (
          <p className={`mt-3 text-sm leading-relaxed ${styles.header} opacity-90`}>
            {t(`facets.${activeFacet}.description`)}
          </p>
        ) : null}

        <div className="mt-4">
          <h4 className={`text-sm font-semibold mb-2 opacity-80 ${styles.header}`}>
            {t('facets.prompts_heading')}
          </h4>
          <ul className="space-y-1">
            {prompts.map((p, i) => (
              <li key={i} className={`text-sm flex items-start gap-2 ${styles.header} opacity-85`}>
                <span className="opacity-50 mt-0.5">›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <label className={`block text-sm font-semibold mb-1 opacity-80 ${styles.header}`}>
            {t('facets.notes')}
          </label>
          <textarea
            value={notes}
            placeholder={t('facets.notes_placeholder')}
            rows={5}
            onChange={e => updateNotes(e.target.value)}
            className={`w-full bg-white/70 border border-current/20 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 ${styles.ring} focus:border-transparent resize-y placeholder-slate-400`}
          />
        </div>

        {activeFacet === 'mind' && (
          <>
            <StakeholderProfilePanel
              profiles={initiative.stakeholderProfiles ?? []}
              onChange={updateProfiles}
            />
            <StakeholderMap profiles={initiative.stakeholderProfiles ?? []} />
          </>
        )}

        {nextFacet && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onFacetChange(nextFacet)}
              className="btn-primary text-sm"
            >
              {t('common.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
