import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Initiative, View, FacetId } from './types';
import HomeScreen from './components/HomeScreen';
import InitiativeCanvas from './components/InitiativeCanvas';
import FacetPlanner from './components/FacetPlanner';
import ActionTracker from './components/ActionTracker';
import ProgressView from './components/ProgressView';

const STORAGE_KEY = 'change-planner-initiatives';
const CURRENT_KEY = 'change-planner-current';

const FACET_IDS: FacetId[] = ['dance', 'people', 'network', 'environment'];

function makeEmptyInitiative(): Initiative {
  return {
    id: crypto.randomUUID(),
    title: '',
    goal: '',
    context: '',
    stakeholders: '',
    facets: {
      dance: { notes: '' },
      people: { notes: '' },
      network: { notes: '' },
      environment: { notes: '' },
    },
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadAll(): Initiative[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(list: Initiative[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function App() {
  const { i18n } = useTranslation();
  const [view, setView] = useState<View>('home');
  const [activeFacet, setActiveFacet] = useState<FacetId>('dance');
  const [initiatives, setInitiatives] = useState<Initiative[]>(loadAll);
  const [current, setCurrent] = useState<Initiative>(() => {
    const id = localStorage.getItem(CURRENT_KEY);
    const all = loadAll();
    return all.find(i => i.id === id) ?? makeEmptyInitiative();
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, current.id);
  }, [current.id]);

  function updateCurrent(patch: Partial<Initiative>) {
    const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
    setCurrent(updated);
    setInitiatives(prev => {
      const idx = prev.findIndex(i => i.id === updated.id);
      const next = idx >= 0
        ? prev.map(i => i.id === updated.id ? updated : i)
        : [...prev, updated];
      saveAll(next);
      return next;
    });
  }

  function newInitiative() {
    const init = makeEmptyInitiative();
    setCurrent(init);
    setView('canvas');
  }

  function loadInitiative(id: string) {
    const found = initiatives.find(i => i.id === id);
    if (found) { setCurrent(found); setView('canvas'); }
  }

  function deleteInitiative(id: string) {
    setInitiatives(prev => {
      const next = prev.filter(i => i.id !== id);
      saveAll(next);
      return next;
    });
    if (current.id === id) { setCurrent(makeEmptyInitiative()); }
  }

  function toggleLang() {
    i18n.changeLanguage(i18n.language.startsWith('ru') ? 'en' : 'ru');
  }

  const navTabs: { key: View; label: string }[] = [
    { key: 'canvas', label: 'nav.canvas' },
    { key: 'facet', label: 'nav.facets' },
    { key: 'actions', label: 'nav.actions' },
    { key: 'progress', label: 'nav.progress' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-600 text-white shadow-md no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setView('home')}
            className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            Change Planner
          </button>
          <button
            onClick={toggleLang}
            className="text-sm bg-brand-700 hover:bg-brand-500 px-3 py-1 rounded transition-colors"
          >
            {i18n.language.startsWith('ru') ? 'EN' : 'RU'}
          </button>
        </div>
        {view !== 'home' && (
          <div className="max-w-4xl mx-auto px-4 pb-1 flex gap-1">
            {navTabs.map(tab => (
              <TabBtn
                key={tab.key}
                active={view === tab.key || (view === 'facet' && tab.key === 'facet')}
                onClick={() => setView(tab.key)}
                labelKey={tab.label}
              />
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {view === 'home' && (
          <HomeScreen
            initiatives={initiatives}
            onNew={newInitiative}
            onLoad={loadInitiative}
            onDelete={deleteInitiative}
          />
        )}
        {view === 'canvas' && (
          <InitiativeCanvas
            initiative={current}
            onChange={updateCurrent}
            onNext={() => setView('facet')}
          />
        )}
        {view === 'facet' && (
          <FacetPlanner
            initiative={current}
            activeFacet={activeFacet}
            facetIds={FACET_IDS}
            onChange={updateCurrent}
            onFacetChange={setActiveFacet}
            onNext={() => setView('actions')}
          />
        )}
        {view === 'actions' && (
          <ActionTracker
            initiative={current}
            facetIds={FACET_IDS}
            onChange={updateCurrent}
            onNext={() => setView('progress')}
          />
        )}
        {view === 'progress' && (
          <ProgressView
            initiative={current}
            facetIds={FACET_IDS}
          />
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, labelKey }: { active: boolean; onClick: () => void; labelKey: string }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm rounded-t transition-colors ${
        active
          ? 'bg-white text-brand-700 font-semibold'
          : 'text-blue-100 hover:text-white hover:bg-brand-500'
      }`}
    >
      {t(labelKey)}
    </button>
  );
}
