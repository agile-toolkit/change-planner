import { useTranslation } from 'react-i18next';
import type { Initiative, FacetId } from '../types';

interface Props {
  initiative: Initiative;
  facetIds: FacetId[];
}

const FACET_COLORS: Record<FacetId, { bar: string; bg: string }> = {
  dance: { bar: 'bg-blue-500', bg: 'bg-blue-100' },
  people: { bar: 'bg-purple-500', bg: 'bg-purple-100' },
  network: { bar: 'bg-green-500', bg: 'bg-green-100' },
  environment: { bar: 'bg-orange-500', bg: 'bg-orange-100' },
};

export default function ProgressView({ initiative, facetIds }: Props) {
  const { t } = useTranslation();

  const totalActions = initiative.actions.length;
  const doneActions = initiative.actions.filter(a => a.done).length;
  const overallPct = totalActions === 0 ? 0 : Math.round((doneActions / totalActions) * 100);

  const canvasComplete =
    initiative.title.trim() &&
    initiative.goal.trim() &&
    initiative.context.trim() &&
    initiative.stakeholders.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t('progress.title')}</h2>
        <button
          onClick={() => window.print()}
          className="no-print bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {t('progress.exportPrint')}
        </button>
      </div>

      {/* Initiative title */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">{initiative.title || '(untitled)'}</h3>
        {initiative.goal && <p className="text-slate-600 mt-1 text-sm">{initiative.goal}</p>}
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">{t('progress.overall')}</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-brand-600 min-w-[3rem] text-right">{overallPct}%</span>
        </div>
        <p className="text-slate-500 text-sm mt-2">
          {doneActions} {t('progress.actionsDone')} / {totalActions - doneActions} {t('progress.actionsOpen')}
        </p>
      </div>

      {/* Facet breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">{t('progress.facetProgress')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {facetIds.map(fid => {
            const facetActions = initiative.actions.filter(a => a.facetId === fid);
            const facetDone = facetActions.filter(a => a.done).length;
            const facetPct = facetActions.length === 0 ? 0 : Math.round((facetDone / facetActions.length) * 100);
            const hasNotes = initiative.facets[fid].notes.trim().length > 0;
            const colors = FACET_COLORS[fid];

            return (
              <div key={fid} className={`${colors.bg} rounded-xl p-4 border border-slate-200`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{t(`facets.${fid}.icon`)}</span>
                  <span className="font-semibold text-slate-800 text-sm">{t(`facets.${fid}.name`)}</span>
                </div>
                <div className="bg-white/60 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-2 ${colors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${facetPct}%` }}
                  />
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>
                    {facetActions.length === 0
                      ? t('progress.noActions')
                      : `${facetDone}/${facetActions.length} ${t('progress.completionRate')}`}
                  </span>
                  <span className={hasNotes ? 'text-green-600' : 'text-slate-400'}>
                    {hasNotes ? t('progress.notesAdded') : t('progress.noNotes')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Canvas summary (print-friendly) */}
      {(initiative.context || initiative.stakeholders) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Summary</h3>
          {initiative.context && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-500 mb-1">{t('canvas.context')}</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{initiative.context}</p>
            </div>
          )}
          {initiative.stakeholders && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">{t('canvas.stakeholders')}</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{initiative.stakeholders}</p>
            </div>
          )}
        </div>
      )}

      {/* Canvas completeness indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`inline-block w-3 h-3 rounded-full ${canvasComplete ? 'bg-green-500' : 'bg-amber-400'}`} />
        <span className="text-slate-600">
          {canvasComplete ? 'Initiative canvas complete' : 'Initiative canvas incomplete — fill in all canvas fields'}
        </span>
      </div>
    </div>
  );
}
