import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Initiative, FacetId } from '../types';

interface Props {
  initiative: Initiative;
  activeFacet: FacetId;
  facetIds: FacetId[];
  onChange: (patch: Partial<Initiative>) => void;
  onFacetChange: (f: FacetId) => void;
  onNext: () => void;
}

const FACET_COLORS: Record<FacetId, string> = {
  dance: 'bg-blue-50 border-blue-200 text-blue-800',
  people: 'bg-purple-50 border-purple-200 text-purple-800',
  network: 'bg-green-50 border-green-200 text-green-800',
  environment: 'bg-orange-50 border-orange-200 text-orange-800',
};

const FACET_ACTIVE: Record<FacetId, string> = {
  dance: 'bg-blue-600 text-white border-blue-600',
  people: 'bg-purple-600 text-white border-purple-600',
  network: 'bg-green-600 text-white border-green-600',
  environment: 'bg-orange-500 text-white border-orange-500',
};

const FACET_RING: Record<FacetId, string> = {
  dance: 'focus:ring-blue-400',
  people: 'focus:ring-purple-400',
  network: 'focus:ring-green-400',
  environment: 'focus:ring-orange-400',
};

export default function FacetPlanner({ initiative, activeFacet, facetIds, onChange, onFacetChange, onNext }: Props) {
  const { t } = useTranslation();
  const [showExplainer, setShowExplainer] = useState(false);

  const facetData = initiative.facets[activeFacet];
  const prompts: string[] = t(`facets.${activeFacet}.prompts`, { returnObjects: true }) as string[];

  function updateNotes(notes: string) {
    onChange({
      facets: {
        ...initiative.facets,
        [activeFacet]: { ...facetData, notes },
      },
    });
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-slate-800">{t('facets.title')}</h2>

      {/* Facet tabs */}
      <div className="flex flex-wrap gap-2">
        {facetIds.map(fid => (
          <button
            key={fid}
            onClick={() => onFacetChange(fid)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition-colors text-sm ${
              fid === activeFacet
                ? FACET_ACTIVE[fid]
                : `${FACET_COLORS[fid]} hover:opacity-80`
            }`}
          >
            <span>{t(`facets.${fid}.icon`)}</span>
            <span>{t(`facets.${fid}.name`)}</span>
            {initiative.facets[fid].notes.trim() && <span className="text-xs opacity-70">✓</span>}
          </button>
        ))}
      </div>

      {/* Active facet card */}
      <div className={`rounded-xl border-2 p-5 ${FACET_COLORS[activeFacet]}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{t(`facets.${activeFacet}.icon`)}</span>
            <h3 className="text-xl font-bold">{t(`facets.${activeFacet}.name`)}</h3>
          </div>
          <button
            onClick={() => setShowExplainer(v => !v)}
            className="text-xs underline opacity-70 hover:opacity-100 transition-opacity mt-1"
          >
            {showExplainer ? '▲ hide' : '▼ why?'}
          </button>
        </div>

        {showExplainer && (
          <p className="mt-3 text-sm leading-relaxed opacity-90">
            {t(`facets.${activeFacet}.explainer`)}
          </p>
        )}

        {/* Guiding prompts */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 opacity-80">{t('facets.prompts')}</h4>
          <ul className="space-y-1">
            {prompts.map((p, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="opacity-50 mt-0.5">›</span>
                <span className="opacity-80">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1 opacity-80">{t('facets.notes')}</label>
          <textarea
            value={facetData.notes}
            placeholder={t('facets.notesPlaceholder')}
            rows={5}
            onChange={e => updateNotes(e.target.value)}
            className={`w-full bg-white/70 border border-current/20 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 ${FACET_RING[activeFacet]} focus:border-transparent resize-y placeholder-slate-400`}
          />
        </div>
      </div>

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
