import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Initiative } from '../types';

interface Props {
  initiative: Initiative;
  onChange: (patch: Partial<Initiative>) => void;
  onNext: () => void;
}

export default function InitiativeCanvas({ initiative, onChange, onNext }: Props) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onChange({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">{t('canvas.title')}</h2>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <Field
          label={t('canvas.initiativeTitle')}
          value={initiative.title}
          placeholder={t('canvas.initiativeTitlePlaceholder')}
          onChange={v => onChange({ title: v })}
        />
        <TextareaField
          label={t('canvas.goal')}
          value={initiative.goal}
          placeholder={t('canvas.goalPlaceholder')}
          onChange={v => onChange({ goal: v })}
          rows={3}
        />
        <TextareaField
          label={t('canvas.context')}
          value={initiative.context}
          placeholder={t('canvas.contextPlaceholder')}
          onChange={v => onChange({ context: v })}
          rows={4}
        />
        <TextareaField
          label={t('canvas.stakeholders')}
          value={initiative.stakeholders}
          placeholder={t('canvas.stakeholdersPlaceholder')}
          onChange={v => onChange({ stakeholders: v })}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          {saved ? t('canvas.saved') : t('canvas.save')}
        </button>
        <button
          onClick={onNext}
          className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg transition-colors font-medium"
        >
          {t('common.next')} →
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
      />
    </div>
  );
}

function TextareaField({ label, value, placeholder, onChange, rows }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void; rows: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-y"
      />
    </div>
  );
}
