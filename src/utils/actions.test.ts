import { describe, it, expect } from 'vitest'
import { isOverdue, hasRaciAssigned, raciRoleLetters } from './actions'
import type { Action, RaciAssignment } from '../types'

function makeAction(overrides: Partial<Action> = {}): Action {
  return { id: 'a1', text: 'Do the thing', owner: '', dueDate: '', status: 'todo', facet: 'dance', priority: 'medium', ...overrides }
}

describe('isOverdue', () => {
  it('is false for a done action even with a past due date', () => {
    expect(isOverdue(makeAction({ status: 'done', dueDate: '2026-01-01' }), '2026-09-02')).toBe(false)
  })

  it('is false for an action with no due date', () => {
    expect(isOverdue(makeAction({ dueDate: '' }), '2026-09-02')).toBe(false)
  })

  it('is true for a not-done action with a due date before today', () => {
    expect(isOverdue(makeAction({ status: 'in-progress', dueDate: '2026-08-01' }), '2026-09-02')).toBe(true)
  })

  it('is false when the due date is today or in the future', () => {
    expect(isOverdue(makeAction({ dueDate: '2026-09-02' }), '2026-09-02')).toBe(false)
    expect(isOverdue(makeAction({ dueDate: '2026-09-03' }), '2026-09-02')).toBe(false)
  })
})

describe('hasRaciAssigned', () => {
  it('is false for undefined', () => {
    expect(hasRaciAssigned(undefined)).toBe(false)
  })

  it('is false for an empty object', () => {
    expect(hasRaciAssigned({})).toBe(false)
  })

  it('is false for empty consulted/informed arrays', () => {
    expect(hasRaciAssigned({ consulted: [], informed: [] })).toBe(false)
  })

  it('is true when responsible is set', () => {
    expect(hasRaciAssigned({ responsible: 'Alice' })).toBe(true)
  })

  it('is true when accountable is set', () => {
    expect(hasRaciAssigned({ accountable: 'Bob' })).toBe(true)
  })

  it('is true when consulted has at least one entry', () => {
    expect(hasRaciAssigned({ consulted: ['Carol'] })).toBe(true)
  })

  it('is true when informed has at least one entry', () => {
    expect(hasRaciAssigned({ informed: ['Dave'] })).toBe(true)
  })
})

describe('raciRoleLetters', () => {
  it('returns an empty array for undefined', () => {
    expect(raciRoleLetters(undefined)).toEqual([])
  })

  it('returns an empty array when nothing is set', () => {
    expect(raciRoleLetters({})).toEqual([])
  })

  it('returns letters in R/A/C/I order regardless of which are set', () => {
    const raci: RaciAssignment = { informed: ['Dave'], responsible: 'Alice', consulted: ['Carol'] }
    expect(raciRoleLetters(raci)).toEqual(['R', 'C', 'I'])
  })

  it('returns all four letters when every role is set', () => {
    const raci: RaciAssignment = { responsible: 'Alice', accountable: 'Bob', consulted: ['Carol'], informed: ['Dave'] }
    expect(raciRoleLetters(raci)).toEqual(['R', 'A', 'C', 'I'])
  })
})
