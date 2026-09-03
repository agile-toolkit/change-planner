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
