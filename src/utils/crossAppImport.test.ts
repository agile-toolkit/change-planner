import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseMmSnapshotParam,
  parsePrefillParams,
  readPendingSalaryChange,
  clearPendingSalaryChange,
  pendingSalaryChangeToInitiative,
  readMmLastSession,
  mmLastSessionTopMotivators,
  motivatorContextTopEntries,
  capitalize,
} from './crossAppImport'

function encodeSnapshot(snapshot: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(snapshot)))
}

describe('parseMmSnapshotParam', () => {
  it('returns null when mm_snapshot is absent', () => {
    expect(parseMmSnapshotParam('')).toBeNull()
    expect(parseMmSnapshotParam('?other=1')).toBeNull()
  })

  it('returns null on malformed payload instead of throwing', () => {
    expect(parseMmSnapshotParam('?mm_snapshot=not-valid-base64!!!')).toBeNull()
  })

  it('decodes a Moving Motivators snapshot into initiative data', () => {
    // Real ImpactLevel values (moving-motivators/src/types.ts): 'positive' | 'negative' | 'neutral'.
    const snapshot = {
      ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
      changes: { curiosity: 'positive', mastery: 'neutral', freedom: 'negative', honor: 'neutral' },
      change: 'Move to a new open-plan office',
      date: '2026-09-01',
    }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result).not.toBeNull()
    expect(result!.title).toBe('Move to a new open-plan office')
    expect(result!.context).toBe('Move to a new open-plan office')
    expect(result!.facetNotes.mind).toContain('Curiosity, Mastery, Freedom')
    expect(result!.facetNotes.mind).toContain('Curiosity (positive)')
    expect(result!.facetNotes.mind).toContain('Freedom (negative)')
    expect(result!.facetNotes.dance).toBe('')
  })

  it('falls back to a generic title when the change text is empty', () => {
    const snapshot = { ranked: ['curiosity'], changes: {}, change: '', date: '2026-09-01' }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result!.title).toBe('Imported from Moving Motivators')
  })

  it('carries the structured motivatorContext for the read-only sidebar panel', () => {
    const snapshot = {
      ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
      changes: { curiosity: 'positive', mastery: 'neutral', freedom: 'negative', honor: 'neutral' },
      change: 'Move to a new open-plan office',
      date: '2026-09-01',
    }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result!.motivatorContext).toEqual({
      ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
      changes: { curiosity: 'positive', mastery: 'neutral', freedom: 'negative', honor: 'neutral' },
      change: 'Move to a new open-plan office',
      date: '2026-09-01',
    })
  })

  it('trims the change text carried into motivatorContext, same as the title/context', () => {
    const snapshot = { ranked: ['curiosity'], changes: {}, change: '  Reorg the team  ', date: '2026-09-01' }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result!.motivatorContext!.change).toBe('Reorg the team')
  })
})

// ── Boundary hardening ───────────────────────────────────────────────────────
//
// mm_snapshot is a URL param: anyone can hand a user a crafted link, and
// Moving Motivators is free to change its payload shape without telling us
// (TECH-NOTES.md already records one such break). These assert malformed
// shapes degrade to "nothing to import" rather than throwing.
describe('parseMmSnapshotParam rejects payloads it cannot use', () => {
  it('rejects a payload with no ranked field', () => {
    const snapshot = { changes: {}, change: 'reorg', date: '2026-09-01' }
    expect(parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)).toBeNull()
  })

  it('rejects a ranked value that is not an array', () => {
    const snapshot = { ranked: 'curiosity', changes: {}, change: '', date: '' }
    expect(parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)).toBeNull()
  })

  it('rejects an empty ranking', () => {
    const snapshot = { ranked: [], changes: {}, change: '', date: '' }
    expect(parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)).toBeNull()
  })

  it('rejects a ranked array holding non-strings', () => {
    const snapshot = { ranked: [{ id: 'curiosity' }], changes: {}, change: '', date: '' }
    expect(parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)).toBeNull()
  })

  it('rejects a bare array payload', () => {
    expect(parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(['curiosity', 'mastery'])}`)).toBeNull()
  })

  it('defaults a missing/malformed changes map to empty instead of rejecting the whole payload', () => {
    const snapshot = { ranked: ['curiosity', 'mastery'], change: 'reorg', date: '2026-09-01' }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result).not.toBeNull()
    expect(result!.motivatorContext!.changes).toEqual({})
    expect(result!.facetNotes.mind).not.toContain('affects')
  })

  it('defaults a missing date to empty string', () => {
    const snapshot = { ranked: ['curiosity'], changes: {}, change: '' }
    const result = parseMmSnapshotParam(`?mm_snapshot=${encodeSnapshot(snapshot)}`)
    expect(result!.motivatorContext!.date).toBe('')
  })
})

describe('motivatorContextTopEntries', () => {
  it('ranks entries in snapshot order, 1-based', () => {
    const context = {
      ranked: ['curiosity', 'mastery', 'freedom'],
      changes: {},
      change: '',
      date: '2026-09-01',
    }
    expect(motivatorContextTopEntries(context)).toEqual([
      { id: 'curiosity', rank: 1, impact: 'neutral' },
      { id: 'mastery', rank: 2, impact: 'neutral' },
      { id: 'freedom', rank: 3, impact: 'neutral' },
    ])
  })

  it('carries positive/negative impact through, untouched motivators default to neutral', () => {
    const context = {
      ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
      changes: { curiosity: 'positive', freedom: 'negative' },
      change: '',
      date: '',
    }
    const entries = motivatorContextTopEntries(context)
    expect(entries.find(e => e.id === 'curiosity')!.impact).toBe('positive')
    expect(entries.find(e => e.id === 'freedom')!.impact).toBe('negative')
    expect(entries.find(e => e.id === 'mastery')!.impact).toBe('neutral')
    expect(entries.find(e => e.id === 'honor')!.impact).toBe('neutral')
  })

  it('normalizes an unrecognized impact string to neutral rather than passing it through', () => {
    // Defends the exact bug class TECH-NOTES.md records: a sibling app (or a
    // hand-crafted link) sending literals other than the real ImpactLevel
    // union must not leak into a CSS class or label unnormalized.
    const context = {
      ranked: ['curiosity'],
      changes: { curiosity: 'increase' },
      change: '',
      date: '',
    }
    expect(motivatorContextTopEntries(context)).toEqual([{ id: 'curiosity', rank: 1, impact: 'neutral' }])
  })

  it('defaults the panel limit to 5, keeping ranking positions from the full list', () => {
    const context = {
      ranked: ['curiosity', 'honor', 'acceptance', 'mastery', 'power', 'freedom', 'relatedness'],
      changes: {},
      change: '',
      date: '',
    }
    const entries = motivatorContextTopEntries(context)
    expect(entries).toHaveLength(5)
    expect(entries[4]).toEqual({ id: 'power', rank: 5, impact: 'neutral' })
  })

  it('respects an explicit limit', () => {
    const context = { ranked: ['curiosity', 'honor', 'acceptance'], changes: {}, change: '', date: '' }
    expect(motivatorContextTopEntries(context, 2)).toHaveLength(2)
  })

  it('returns an empty list for an empty ranking, matching the panel\'s "nothing to show" case', () => {
    const context = { ranked: [], changes: {}, change: '', date: '' }
    expect(motivatorContextTopEntries(context)).toEqual([])
  })
})

describe('capitalize', () => {
  it('uppercases the first character, leaves the rest untouched', () => {
    expect(capitalize('curiosity')).toBe('Curiosity')
  })

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('')
  })
})

describe('parsePrefillParams', () => {
  it('returns null when prefill is absent', () => {
    expect(parsePrefillParams('?utm_source=improvement-board')).toBeNull()
  })

  it('reads prefill and description', () => {
    const result = parsePrefillParams('?prefill=Reduce+build+times&description=CI+is+too+slow&utm_source=improvement-board')
    expect(result).toEqual({
      title: 'Reduce build times',
      goal: '',
      context: 'CI is too slow',
      stakeholders: '',
      facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    })
  })

  it('defaults context to empty string when description is missing', () => {
    const result = parsePrefillParams('?prefill=Some+title')
    expect(result!.context).toBe('')
  })
})

describe('pending salary change (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing is pending', () => {
    expect(readPendingSalaryChange()).toBeNull()
  })

  it('reads and clears the pending record', () => {
    const record = {
      title: 'Salary formula updated: Q3 revision',
      type: 'formula_revision',
      scenarioName: 'Q3 revision',
      factorDeltas: { seniority: '+0.10', location: '-0.05' },
      currency: 'USD',
      createdAt: '2026-09-01T00:00:00.000Z',
    }
    localStorage.setItem('salary-formula:pendingChangeRecord', JSON.stringify(record))
    expect(readPendingSalaryChange()).toEqual(record)
    clearPendingSalaryChange()
    expect(readPendingSalaryChange()).toBeNull()
  })

  it('converts a pending record into initiative data', () => {
    const record = {
      title: 'Salary formula updated: Q3 revision',
      type: 'formula_revision',
      scenarioName: 'Q3 revision',
      factorDeltas: { seniority: '+0.10' },
      currency: 'USD',
      createdAt: '2026-09-01T00:00:00.000Z',
    }
    const data = pendingSalaryChangeToInitiative(record)
    expect(data.title).toBe('Salary formula updated: Q3 revision')
    expect(data.context).toContain('Q3 revision')
    expect(data.context).toContain('USD')
    expect(data.facetNotes.change).toBe('Factor changes: seniority: +0.10')
  })
})

describe('Moving Motivators last session (localStorage)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no session was saved', () => {
    expect(readMmLastSession()).toBeNull()
  })

  it('reads the last session and extracts top 3 motivators, capitalized', () => {
    const session = {
      date: '2026-09-01',
      ranked: ['curiosity', 'mastery', 'freedom', 'honor'],
      change: 'Move to a new open-plan office',
      changes: { curiosity: 'positive', mastery: 'neutral', freedom: 'negative', honor: 'neutral' },
    }
    localStorage.setItem('moving-motivators:lastSession', JSON.stringify(session))
    const read = readMmLastSession()
    expect(read).toEqual(session)
    expect(mmLastSessionTopMotivators(read!)).toEqual(['Curiosity', 'Mastery', 'Freedom'])
  })
})

// ── Boundary hardening ───────────────────────────────────────────────────────
//
// Every payload below is written by a different repo on a shared origin.
// TECH-NOTES.md records eight shipped bugs from trusting them, one of them in
// this very file. These cases assert the boundary degrades to "nothing to
// import" rather than throwing or inventing data.

describe('readMmLastSession rejects payloads it cannot use', () => {
  beforeEach(() => localStorage.clear())

  const write = (v: unknown) =>
    localStorage.setItem('moving-motivators:lastSession', JSON.stringify(v))

  it('rejects a session with no ranked array', () => {
    // The shape Moving Motivators wrote before `ranked` existed.
    write({ date: '2026-01-01', change: 'reorg' })
    expect(readMmLastSession()).toBeNull()
  })

  it('rejects a ranked value that is not an array', () => {
    write({ ranked: 'curiosity', date: '2026-01-01' })
    expect(readMmLastSession()).toBeNull()
  })

  it('rejects an empty ranking', () => {
    write({ ranked: [], date: '2026-01-01' })
    expect(readMmLastSession()).toBeNull()
  })

  it('rejects a ranked array holding non-strings', () => {
    write({ ranked: [{ id: 'curiosity' }], date: '2026-01-01' })
    expect(readMmLastSession()).toBeNull()
  })

  it('rejects a bare array', () => {
    write(['curiosity', 'mastery'])
    expect(readMmLastSession()).toBeNull()
  })

  it('rejects unparseable JSON', () => {
    localStorage.setItem('moving-motivators:lastSession', 'not json')
    expect(readMmLastSession()).toBeNull()
  })

  it('fills in the optional fields so downstream code never sees undefined', () => {
    write({ ranked: ['curiosity', 'mastery', 'freedom', 'power'] })
    const session = readMmLastSession()!
    expect(session.date).toBe('')
    expect(session.change).toBe('')
    expect(session.changes).toEqual({})
    // The dereference that used to throw when `ranked` was missing.
    expect(mmLastSessionTopMotivators(session)).toEqual(['Curiosity', 'Mastery', 'Freedom'])
  })

  it('accepts a full, real session', () => {
    write({
      date: '2026-09-03',
      ranked: ['curiosity', 'mastery', 'freedom'],
      change: 'Moving to a new squad',
      // Moving Motivators' real ImpactLevel union, not the 'increase'/'decrease'
      // this file once checked for and never matched.
      changes: { curiosity: 'positive', mastery: 'negative', freedom: 'neutral' },
    })
    const session = readMmLastSession()!
    expect(session.changes.curiosity).toBe('positive')
    expect(mmLastSessionTopMotivators(session)).toEqual(['Curiosity', 'Mastery', 'Freedom'])
  })
})

describe('readPendingSalaryChange rejects payloads it cannot use', () => {
  beforeEach(() => localStorage.clear())

  const write = (v: unknown) =>
    localStorage.setItem('salary-formula:pendingChangeRecord', JSON.stringify(v))

  it('rejects a record with no title', () => {
    write({ createdAt: '2026-09-03T00:00:00Z' })
    expect(readPendingSalaryChange()).toBeNull()
  })

  it('rejects a record with no createdAt, which is sliced downstream', () => {
    write({ title: 'Raise band B' })
    expect(readPendingSalaryChange()).toBeNull()
  })

  it('rejects a bare array', () => {
    write([{ title: 'Raise band B', createdAt: '2026-09-03' }])
    expect(readPendingSalaryChange()).toBeNull()
  })

  it('defaults the optional fields so the initiative builder cannot throw', () => {
    write({ title: 'Raise band B', createdAt: '2026-09-03T10:00:00Z' })
    const record = readPendingSalaryChange()!
    expect(record.factorDeltas).toEqual({})
    expect(record.currency).toBe('')
    const initiative = pendingSalaryChangeToInitiative(record)
    expect(initiative.title).toBe('Raise band B')
    expect(initiative.context).toContain('2026-09-03')
  })
})

describe('parsePrefillParams caps what a link can inject', () => {
  it('truncates an oversized title and description', () => {
    // localStorage is a ~5 MB budget shared by all eleven apps on this origin,
    // and anyone can hand a user a link.
    const search = `?prefill=${'a'.repeat(5000)}&description=${'b'.repeat(50000)}`
    const result = parsePrefillParams(search)!
    expect(result.title.length).toBe(200)
    expect(result.context.length).toBe(5000)
  })
})
