import type { FacetId } from '../types'

/**
 * Reads and normalizes the payloads other suite apps hand off to Change
 * Planner, either as a URL query param (one-shot, consumed on load) or as a
 * shared-origin localStorage key (ambient, offered via a dismissible banner
 * so it isn't silently re-imported on every visit).
 */

export interface ImportedInitiativeData {
  title: string
  goal: string
  context: string
  stakeholders: string
  facetNotes: Record<FacetId, string>
}

const EMPTY_FACET_NOTES: Record<FacetId, string> = { dance: '', mind: '', stimulate: '', change: '' }

function capitalize(id: string): string {
  return id.length > 0 ? id.charAt(0).toUpperCase() + id.slice(1) : id
}

interface MmSnapshot {
  ranked: string[]
  changes: Record<string, string>
  change: string
  date: string
}

/** Moving Motivators "Export to Change Planner": ?mm_snapshot=<base64 JSON> */
export function parseMmSnapshotParam(search: string): ImportedInitiativeData | null {
  const raw = new URLSearchParams(search).get('mm_snapshot')
  if (!raw) return null
  try {
    const snapshot = JSON.parse(decodeURIComponent(atob(raw))) as MmSnapshot
    const impacted = snapshot.ranked
      .filter(id => snapshot.changes[id] === 'increase' || snapshot.changes[id] === 'decrease')
      .map(id => `${capitalize(id)} (${snapshot.changes[id]})`)
    const top3 = snapshot.ranked.slice(0, 3).map(capitalize).join(', ')
    const mindNote = [
      `Top motivators at stake (via Moving Motivators, ${snapshot.date}): ${top3}.`,
      impacted.length > 0 ? `This change affects: ${impacted.join(', ')}.` : '',
    ].filter(Boolean).join('\n')
    const change = (snapshot.change || '').trim()
    return {
      title: change ? change.slice(0, 80) : 'Imported from Moving Motivators',
      goal: '',
      context: change,
      stakeholders: '',
      facetNotes: { ...EMPTY_FACET_NOTES, mind: mindNote },
    }
  } catch {
    return null
  }
}

/** Improvement Board (and other senders following the same convention): ?prefill=<title>&description=<text> */
export function parsePrefillParams(search: string): ImportedInitiativeData | null {
  const params = new URLSearchParams(search)
  const title = params.get('prefill')
  if (!title) return null
  return {
    title,
    goal: '',
    context: params.get('description') ?? '',
    stakeholders: '',
    facetNotes: EMPTY_FACET_NOTES,
  }
}

export interface PendingSalaryChange {
  title: string
  type: string
  scenarioName: string
  factorDeltas: Record<string, string>
  currency: string
  createdAt: string
}

const SALARY_PENDING_KEY = 'salary-formula:pendingChangeRecord'

export function readPendingSalaryChange(): PendingSalaryChange | null {
  const raw = localStorage.getItem(SALARY_PENDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingSalaryChange
  } catch {
    return null
  }
}

export function clearPendingSalaryChange(): void {
  localStorage.removeItem(SALARY_PENDING_KEY)
}

export function pendingSalaryChangeToInitiative(record: PendingSalaryChange): ImportedInitiativeData {
  const deltas = Object.entries(record.factorDeltas)
    .map(([factor, delta]) => `${factor}: ${delta}`)
    .join(', ')
  return {
    title: record.title,
    goal: '',
    context: `Salary Formula scenario "${record.scenarioName}" (${record.currency}), logged ${record.createdAt.slice(0, 10)}.`,
    stakeholders: '',
    facetNotes: { ...EMPTY_FACET_NOTES, change: deltas ? `Factor changes: ${deltas}` : '' },
  }
}

export interface MmLastSession {
  date: string
  ranked: string[]
  change: string
  changes: Record<string, string>
}

const MM_LAST_SESSION_KEY = 'moving-motivators:lastSession'

export function readMmLastSession(): MmLastSession | null {
  const raw = localStorage.getItem(MM_LAST_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as MmLastSession
  } catch {
    return null
  }
}

export function mmLastSessionTopMotivators(session: MmLastSession): string[] {
  return session.ranked.slice(0, 3).map(capitalize)
}
