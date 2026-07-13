export type FacetId = 'dance' | 'mind' | 'stimulate' | 'change'

/** Order for tabs, home preview, and guided walkthrough */
export const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']
export type ActionStatus = 'todo' | 'in-progress' | 'done'
export type ActionPriority = 'high' | 'medium' | 'low'
export type HypothesisOutcome = 'yes' | 'partial' | 'no'

export interface ActionHypothesis {
  if: string
  then: string
  because: string
  outcome?: HypothesisOutcome
}

export interface Action {
  id: string
  text: string
  owner: string
  dueDate: string
  status: ActionStatus
  facet: FacetId
  priority: ActionPriority
  hypothesis?: ActionHypothesis
}

export interface StakeholderProfile {
  id: string
  name: string
  /** Top 3 motivator names (free text), may be shorter if user left some blank */
  motivators: string[]
  /** Mendelow matrix: 1 (low) – 5 (high) */
  influence?: number
  interest?: number
}

export interface AssessmentEntry {
  facet: FacetId
  /** 1 (low) – 5 (high) readiness score */
  score: number
  note?: string
}

export interface Assessment {
  id: string
  takenAt: number
  /** e.g. "Baseline", "Week 4", user-editable */
  label: string
  entries: AssessmentEntry[]
}

export interface Milestone {
  id: string
  title: string
  /** ISO date (YYYY-MM-DD), same format as Action.dueDate */
  date: string
  reached: boolean
}

export interface Initiative {
  id: string
  title: string
  goal: string
  context: string
  stakeholders: string
  relatedSprints: string
  facetNotes: Record<FacetId, string>
  actions: Action[]
  stakeholderProfiles: StakeholderProfile[]
  assessments?: Assessment[]
  milestones?: Milestone[]
  createdAt: number
  updatedAt: number
  completedAt?: number
}
