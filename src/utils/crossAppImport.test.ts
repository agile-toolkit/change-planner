import { describe, it, expect, beforeEach } from 'vitest'
import {
  parseMmSnapshotParam,
  parsePrefillParams,
  readPendingSalaryChange,
  clearPendingSalaryChange,
  pendingSalaryChangeToInitiative,
  readMmLastSession,
  mmLastSessionTopMotivators,
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
