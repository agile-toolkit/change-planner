import { useTranslation } from 'react-i18next';
import type { Initiative } from '../types';

interface Props {
  initiatives: Initiative[];
  onNew: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const FACET_KEYS = ['dance', 'people', 'network', 'environment'] as const;

export default function HomeScreen({ initiatives, onNew, onLoad, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="text-5xl mb-4">🌍</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('home.headline')}</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
          {t('home.intro')}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={onNew}
            className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors shadow-sm"
          >
            {t('home.newInitiative')}
          </button>
        </div>
      </div>

      {/* 4 Facets overview */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">{t('home.framework')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FACET_KEYS.map(key => (
            <div key={key} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="text-3xl mb-2">{t(`home.facets.${key}.icon`)}</div>
              <h3 className="font-semibold text-slate-800 mb-1">{t(`home.facets.${key}.name`)}</h3>
              <p className="text-slate-600 text-sm">{t(`home.facets.${key}.desc`)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-slate-500 text-sm leading-relaxed">{t('home.frameworkText')}</p>
      </div>

      {/* Saved initiatives */}
      {initiatives.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-3">{t('home.loadInitiative')}</h2>
          <div className="space-y-2">
            {initiatives.map(init => (
              <div
                key={init.id}
                className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {init.title || <span className="italic text-slate-400">(untitled)</span>}
                  </span>
                  <span className="text-slate-400 text-xs ml-3">
                    {new Date(init.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoad(init.id)}
                    className="text-brand-600 hover:text-brand-800 text-sm font-medium px-3 py-1 rounded hover:bg-brand-50 transition-colors"
                  >
                    {t('home.continue')}
                  </button>
                  <button
                    onClick={() => onDelete(init.id)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {t('home.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
