import { useTranslation } from 'react-i18next'
import type { FacetId, StakeholderProfile } from '../types'
import StakeholderProfilePanel from './StakeholderProfilePanel'
import StakeholderMap from './StakeholderMap'

const FACET_STYLES: Record<FacetId, { bg: string; border: string; header: string; badge: string }> = {
  dance:     { bg: 'bg-blue-50',   border: 'border-blue-200',   header: 'text-blue-900',   badge: 'bg-blue-100 text-blue-700' },
  mind:      { bg: 'bg-green-50',  border: 'border-green-200',  header: 'text-green-900',  badge: 'bg-green-100 text-green-700' },
  stimulate: { bg: 'bg-orange-50', border: 'border-orange-200', header: 'text-orange-900', badge: 'bg-orange-100 text-orange-700' },
  change:    { bg: 'bg-purple-50', border: 'border-purple-200', header: 'text-purple-900', badge: 'bg-purple-100 text-purple-700' },
}

interface Props {
  facetId: FacetId
  notes: string
  actionCount: number
  onNotesChange: (notes: string) => void
  stakeholderProfiles?: StakeholderProfile[]
  onProfilesChange?: (profiles: StakeholderProfile[]) => void
}

export default function FacetCard({ facetId, notes, actionCount, onNotesChange, stakeholderProfiles, onProfilesChange }: Props) {
  const { t } = useTranslation()
  const styles = FACET_STYLES[facetId]
  const prompts = t(`facets.${facetId}.prompts`, { returnObjects: true }) as string[]

  return (
    <div className={`rounded-2xl border p-5 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className={`font-semibold text-base ${styles.header}`}>
          {t(`facets.${facetId}.label`)}
        </h3>
        {actionCount > 0 && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
            {actionCount} action{actionCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className={`text-xs mb-3 leading-relaxed ${styles.header} opacity-70`}>
        {t(`facets.${facetId}.description`)}
      </p>

      {/* Prompts */}
      <div className="space-y-1 mb-3">
        {prompts.map((prompt, i) => (
          <div key={i} className={`text-xs flex gap-2 ${styles.header} opacity-60`}>
            <span>→</span>
            <span>{prompt}</span>
          </div>
        ))}
      </div>

      <textarea
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-300"
        rows={3}
        placeholder="Add your notes, insights, and plans for this facet..."
        value={notes}
        onChange={e => onNotesChange(e.target.value)}
      />

      {facetId === 'mind' && stakeholderProfiles !== undefined && onProfilesChange && (
        <>
          <StakeholderProfilePanel profiles={stakeholderProfiles} onChange={onProfilesChange} />
          <StakeholderMap profiles={stakeholderProfiles} />
        </>
      )}
    </div>
  )
}
