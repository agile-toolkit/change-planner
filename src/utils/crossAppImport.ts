import type { FacetId, MotivatorContext } from '../types'

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
  /** Only set by `parseMmSnapshotParam` — feeds the read-only "Motivator context" panel. */
  motivatorContext?: MotivatorContext
}

const EMPTY_FACET_NOTES: Record<FacetId, string> = { dance: '', mind: '', stimulate: '', change: '' }

/**
 * Shape checks for payloads that cross an app boundary.
 *
 * Everything below this line is written by a *different* repo on a shared
 * origin. TECH-NOTES.md records eight bugs from treating those payloads as
 * trusted — including one in this very file, where a check against
 * `'increase' | 'decrease'` was silently always false because Moving
 * Motivators' union is actually `'positive' | 'negative' | 'neutral'`, and the
 * test written alongside it used the same wrong literals as fixture data.
 * Validating here means a mismatch degrades to "nothing to import" instead of
 * an empty note nobody notices or a throw in a click handler.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(v => typeof v === 'string')
}

export function capitalize(id: string): string {
  return id.length > 0 ? id.charAt(0).toUpperCase() + id.slice(1) : id
}

/** Moving Motivators "Export to Change Planner": ?mm_snapshot=<base64 JSON> */
export function parseMmSnapshotParam(search: string): ImportedInitiativeData | null {
  const raw = new URLSearchParams(search).get('mm_snapshot')
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(atob(raw)))
    // `ranked` is the only field every consumer below dereferences without a
    // fallback (top3/impacted here, motivatorContextTopEntries downstream).
    // Reject the whole payload rather than let a shape change from the other
    // repo throw inside this try — same posture as readMmLastSession below.
    if (!isRecord(parsed) || !isStringArray(parsed.ranked) || parsed.ranked.length === 0) {
      return null
    }
    const ranked = parsed.ranked
    const changes = isRecord(parsed.changes) ? (parsed.changes as Record<string, string>) : {}
    const date = typeof parsed.date === 'string' ? parsed.date : ''
    const change = typeof parsed.change === 'string' ? parsed.change.trim() : ''

    const impacted = ranked
      .filter(id => changes[id] === 'positive' || changes[id] === 'negative')
      .map(id => `${capitalize(id)} (${changes[id]})`)
    const top3 = ranked.slice(0, 3).map(capitalize).join(', ')
    const mindNote = [
      `Top motivators at stake (via Moving Motivators, ${date}): ${top3}.`,
      impacted.length > 0 ? `This change affects: ${impacted.join(', ')}.` : '',
    ].filter(Boolean).join('\n')
    return {
      title: change ? change.slice(0, 80) : 'Imported from Moving Motivators',
      goal: '',
      context: change,
      stakeholders: '',
      facetNotes: { ...EMPTY_FACET_NOTES, mind: mindNote },
      motivatorContext: { ranked, changes, change, date },
    }
  } catch {
    return null
  }
}

export type NormalizedMotivatorImpact = 'positive' | 'negative' | 'neutral'

export interface MotivatorContextEntry {
  id: string
  /** 1-based, position in `context.ranked` */
  rank: number
  impact: NormalizedMotivatorImpact
}

const MOTIVATOR_CONTEXT_PANEL_LIMIT = 5

/**
 * Top N ranked motivators for the read-only "Motivator context" panel, with
 * `changes[id]` normalized to the three values the UI actually styles for —
 * anything else Moving Motivators might one day send (or a hand-crafted
 * `?mm_snapshot=` link might forge) renders as neutral rather than being
 * passed through as an arbitrary string into a CSS class or label.
 */
export function motivatorContextTopEntries(
  context: MotivatorContext,
  limit = MOTIVATOR_CONTEXT_PANEL_LIMIT
): MotivatorContextEntry[] {
  return context.ranked.slice(0, limit).map((id, i) => {
    const raw = context.changes[id]
    const impact: NormalizedMotivatorImpact = raw === 'positive' || raw === 'negative' ? raw : 'neutral'
    return { id, rank: i + 1, impact }
  })
}

/**
 * Improvement Board (and other senders following the same convention):
 * `?prefill=<title>&description=<text>`
 *
 * Capped because a URL is the least trustworthy input this app has: anyone can
 * hand a user a link, the values land in state that gets persisted, and
 * localStorage is a ~5 MB budget shared by all eleven apps on this origin.
 */
const MAX_TITLE = 200
const MAX_TEXT = 5000

export function parsePrefillParams(search: string): ImportedInitiativeData | null {
  const params = new URLSearchParams(search)
  const title = params.get('prefill')
  if (!title) return null
  return {
    title: title.slice(0, MAX_TITLE),
    goal: '',
    context: (params.get('description') ?? '').slice(0, MAX_TEXT),
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
    const parsed: unknown = JSON.parse(raw)
    // Checked, not cast: `pendingSalaryChangeToInitiative` calls
    // Object.entries(factorDeltas) and createdAt.slice(0, 10) on whatever comes
    // back, and Salary Formula is free to change this payload without telling
    // us. Anything short of the full shape is treated as "nothing pending".
    if (!isRecord(parsed)) return null
    const { title, type, scenarioName, factorDeltas, currency, createdAt } = parsed
    if (typeof title !== 'string' || typeof createdAt !== 'string') return null
    return {
      title,
      type: typeof type === 'string' ? type : '',
      scenarioName: typeof scenarioName === 'string' ? scenarioName : '',
      factorDeltas: isRecord(factorDeltas) ? (factorDeltas as Record<string, string>) : {},
      currency: typeof currency === 'string' ? currency : '',
      createdAt,
    }
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
    const parsed: unknown = JSON.parse(raw)
    // `ranked` is the only field anything downstream dereferences, and it is
    // the one Moving Motivators has already changed shape on once. Without
    // this check a session written by an older version threw inside a click
    // handler — where an ErrorBoundary cannot help — and the button just died.
    if (!isRecord(parsed) || !isStringArray(parsed.ranked) || parsed.ranked.length === 0) {
      return null
    }
    return {
      date: typeof parsed.date === 'string' ? parsed.date : '',
      ranked: parsed.ranked,
      change: typeof parsed.change === 'string' ? parsed.change : '',
      changes: isRecord(parsed.changes) ? (parsed.changes as Record<string, string>) : {},
    }
  } catch {
    return null
  }
}

export function mmLastSessionTopMotivators(session: MmLastSession): string[] {
  return session.ranked.slice(0, 3).map(capitalize)
}
