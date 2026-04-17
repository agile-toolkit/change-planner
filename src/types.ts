export type FacetId = 'dance' | 'people' | 'network' | 'environment';

export interface ActionItem {
  id: string;
  facetId: FacetId;
  text: string;
  owner: string;
  dueDate: string;
  done: boolean;
}

export interface FacetData {
  notes: string;
}

export interface Initiative {
  id: string;
  title: string;
  goal: string;
  context: string;
  stakeholders: string;
  facets: Record<FacetId, FacetData>;
  actions: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export type View = 'home' | 'canvas' | 'facet' | 'actions' | 'progress';
