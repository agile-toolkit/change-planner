import { useTranslation } from 'react-i18next'
import type { Initiative } from '../types'

interface Props {
  initiative: Initiative
  onChange: (patch: Partial<Initiative>) => void
}

export default function InitiativeCanvas({ initiative, onChange }: Props) {
  const { t } = useTranslation()

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
      </div>
    </div>
  )
}
