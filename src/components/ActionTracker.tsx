import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Initiative, FacetId, ActionItem } from '../types';

interface Props {
  initiative: Initiative;
  facetIds: FacetId[];
  onChange: (patch: Partial<Initiative>) => void;
  onNext: () => void;
}

const FACET_BADGE: Record<FacetId, string> = {
  dance: 'bg-blue-100 text-blue-700',
  people: 'bg-purple-100 text-purple-700',
  network: 'bg-green-100 text-green-700',
  environment: 'bg-orange-100 text-orange-700',
};

export default function ActionTracker({ initiative, facetIds, onChange, onNext }: Props) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FacetId | 'all'>('all');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ text: '', owner: '', dueDate: '', facetId: 'dance' as FacetId });

  const visible = filter === 'all'
    ? initiative.actions
    : initiative.actions.filter(a => a.facetId === filter);

  function addAction() {
    if (!form.text.trim()) return;
    const action: ActionItem = {
      id: crypto.randomUUID(),
      text: form.text.trim(),
      owner: form.owner.trim(),
      dueDate: form.dueDate,
      facetId: form.facetId,
      done: false,
    };
    onChange({ actions: [...initiative.actions, action] });
    setForm({ text: '', owner: '', dueDate: '', facetId: 'dance' });
    setAdding(false);
  }

  function toggleDone(id: string) {
    onChange({
      actions: initiative.actions.map(a =>
        a.id === id ? { ...a, done: !a.done } : a
      ),
    });
  }

  function deleteAction(id: string) {
    onChange({ actions: initiative.actions.filter(a => a.id !== id) });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t('actions.title')}</h2>

      {/* Add form toggle */}
      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + {t('actions.newAction')}
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('actions.actionText')}</label>
              <input
                type="text"
                autoFocus
                value={form.text}
                placeholder={t('actions.actionTextPlaceholder')}
                onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('actions.owner')}</label>
              <input
                type="text"
                value={form.owner}
                placeholder={t('actions.ownerPlaceholder')}
                onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('actions.dueDate')}</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">{t('actions.facet')}</label>
              <select
                value={form.facetId}
                onChange={e => setForm(f => ({ ...f, facetId: e.target.value as FacetId }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {facetIds.map(fid => (
                  <option key={fid} value={fid}>{t(`facets.${fid}.icon`)} {t(`facets.${fid}.name`)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addAction}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('actions.add')}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('actions.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')} label={t('actions.all')} />
        {facetIds.map(fid => (
          <FilterBtn
            key={fid}
            active={filter === fid}
            onClick={() => setFilter(fid)}
            label={`${t(`facets.${fid}.icon`)} ${t(`facets.${fid}.name`)}`}
          />
        ))}
      </div>

      {/* Action list */}
      {visible.length === 0 ? (
        <p className="text-slate-400 text-sm italic">{t('actions.noActions')}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(action => (
            <ActionRow
              key={action.id}
              action={action}
              badge={FACET_BADGE[action.facetId]}
              facetName={t(`facets.${action.facetId}.name`)}
              onToggle={() => toggleDone(action.id)}
              onDelete={() => deleteAction(action.id)}
              t={t}
            />
          ))}
        </div>
      )}

      <div className="flex justify-end">
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

function FilterBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function ActionRow({ action, badge, facetName, onToggle, onDelete, t }: {
  action: ActionItem; badge: string; facetName: string;
  onToggle: () => void; onDelete: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className={`bg-white border rounded-lg px-4 py-3 flex items-start gap-3 shadow-sm ${action.done ? 'opacity-60' : 'border-slate-200'}`}>
      <input
        type="checkbox"
        checked={action.done}
        onChange={onToggle}
        className="mt-1 w-4 h-4 rounded accent-brand-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${action.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {action.text}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{facetName}</span>
          {action.owner && (
            <span className="text-xs text-slate-500">👤 {action.owner}</span>
          )}
          {action.dueDate && (
            <span className="text-xs text-slate-500">📅 {action.dueDate}</span>
          )}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none"
        title={t('actions.delete')}
      >
        ×
      </button>
    </div>
  );
}
