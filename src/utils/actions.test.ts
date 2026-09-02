import { describe, it, expect } from 'vitest'
import { isOverdue } from './actions'
import type { Action } from '../types'

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
