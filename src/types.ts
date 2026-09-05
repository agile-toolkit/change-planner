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

// Values are free-text names — same convention as Action.owner — rather
// than StakeholderProfile ids, so RACI can be assigned to a stakeholder
// who hasn't been profiled yet (issue #55).
export interface RaciAssignment {
  responsible?: string
  accountable?: string
  consulted?: string[]
  informed?: string[]
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
  raci?: RaciAssignment
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

/**
 * Read-only snapshot handed off by Moving Motivators' "Assess in Change
 * Planner" button (`?mm_snapshot=<base64 JSON>`, decoded in
 * `utils/crossAppImport.ts`). Kept on the initiative so the "Motivator
 * context" panel can keep showing it after the one-shot URL param is
 * consumed and stripped. `changes[id]` is Moving Motivators' free-form
 * `ImpactLevel` string ('positive' | 'negative' | 'neutral' in the real
 * union) — not narrowed here since a sibling app is free to change it
 * without telling us; consumers normalize unknown values to neutral.
 */
export interface MotivatorContext {
  /** Motivator ids in rank order, best (rank 1) first */
  ranked: string[]
  changes: Record<string, string>
  /** Free-text description of the change being assessed, may be empty */
  change: string
  /** ISO date (YYYY-MM-DD) the snapshot was taken */
  date: string
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
  motivatorContext?: MotivatorContext
  createdAt: number
  updatedAt: number
  completedAt?: number
}
