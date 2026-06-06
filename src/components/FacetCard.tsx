import { useTranslation } from 'react-i18next'
import type { FacetId, StakeholderProfile } from '../types'
import StakeholderProfilePanel from './StakeholderProfilePanel'
import StakeholderMap from './StakeholderMap'

const FACET_STYLES: Record<FacetId, { bg: string; border: string; header: string; badge: string }> = {
  dance:     { bg: 'bg-blue-50 dark:bg-blue-950',   border: 'border-blue-200 dark:border-blue-800',   header: 'text-blue-900 dark:text-blue-100',   badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  mind:      { bg: 'bg-green-50 dark:bg-green-950',  border: 'border-green-200 dark:border-green-800',  header: 'text-green-900 dark:text-green-100',  badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
  stimulate: { bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800', header: 'text-orange-900 dark:text-orange-100', badge: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
  change:    { bg: 'bg-purple-50 dark:bg-purple-950', border: 'border-purple-200 dark:border-purple-800', header: 'text-purple-900 dark:text-purple-100', badge: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
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
        className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-gray-300 dark:focus:ring-gray-600"
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
