export type FacetId = 'dance' | 'mind' | 'stimulate' | 'change'

/** Order for tabs, home preview, and guided walkthrough */
export const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']
export type ActionStatus = 'todo' | 'done'

export interface Action {
  id: string
  text: string
  owner: string
  dueDate: string
  status: ActionStatus
  facet: FacetId
}

export interface Initiative {
  id: string
  title: string
  goal: string
  context: string
  stakeholders: string
  facetNotes: Record<FacetId, string>
  actions: Action[]
  createdAt: number
  updatedAt: number
}
