import { useTranslation } from 'react-i18next'
import type { Initiative } from '../types'

interface TeamCharter {
  teamName: string
  values: string[]
  agreements: { id: string; text: string; votes: number }[]
}

interface Props {
  initiative: Initiative
  onChange: (patch: Partial<Initiative>) => void
}

function loadTeamCharter(): TeamCharter | null {
  try {
    const raw = localStorage.getItem('team-identity-charter')
    if (!raw) return null
    const parsed = JSON.parse(raw) as TeamCharter
    if (!parsed.teamName) return null
    return parsed
  } catch {
    return null
  }
}

function buildAutoFillText(charter: TeamCharter, t: (k: string, opts?: Record<string, string>) => string): string {
  const values = charter.values.length > 0 ? charter.values.join(', ') : '—'
  const agreements = charter.agreements.length > 0
    ? charter.agreements.map(a => a.text).join('; ')
    : '—'
  return [
    t('canvas.autofill_team', { teamName: charter.teamName }),
    t('canvas.autofill_values', { values }),
    t('canvas.autofill_agreements', { agreements }),
  ].join('\n')
}

export default function InitiativeCanvas({ initiative, onChange }: Props) {
  const { t } = useTranslation()
  const charter = loadTeamCharter()
  const showAutoFill = charter !== null && !initiative.stakeholders.trim()

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('canvas.section_heading')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">{t('canvas.title_label')}</label>
          <input
            className="input text-lg font-semibold"
            placeholder={t('canvas.title_placeholder')}
            value={initiative.title}
            onChange={e => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t('canvas.goal_label')}</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder={t('canvas.goal_placeholder')}
            value={initiative.goal}
            onChange={e => onChange({ goal: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t('canvas.stakeholders_label')}</label>
          {showAutoFill && (
            <button
              type="button"
              className="mb-1 text-xs text-teal-600 hover:text-teal-700 underline underline-offset-2"
              onClick={() => onChange({ stakeholders: buildAutoFillText(charter, t) })}
            >
              {t('canvas.autofill_button')}
            </button>
          )}
          <textarea
            className="input resize-none"
            rows={2}
            placeholder={t('canvas.stakeholders_placeholder')}
            value={initiative.stakeholders}
            onChange={e => onChange({ stakeholders: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">{t('canvas.context_label')}</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder={t('canvas.context_placeholder')}
            value={initiative.context}
            onChange={e => onChange({ context: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">{t('canvas.related_sprints_label')}</label>
          <input
            className="input"
            placeholder={t('canvas.related_sprints_placeholder')}
            value={initiative.relatedSprints ?? ''}
            onChange={e => onChange({ relatedSprints: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
