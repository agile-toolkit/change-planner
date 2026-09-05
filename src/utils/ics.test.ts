import { describe, it, expect } from 'vitest'
import { buildIcs } from './ics'
import type { Action, Milestone } from '../types'

function makeAction(overrides: Partial<Action> = {}): Action {
  return { id: 'a1', text: 'Do the thing', owner: '', dueDate: '', status: 'todo', facet: 'dance', priority: 'medium', ...overrides }
}

function makeMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return { id: 'm1', title: 'Launch', date: '2026-06-15', reached: false, ...overrides }
}

describe('buildIcs', () => {
  it('produces a valid VCALENDAR wrapper with no events', () => {
    const ics = buildIcs([], [], 'My Initiative')
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('VERSION:2.0')
    expect(ics).toContain('END:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('includes an action with a due date and status !== done', () => {
    const action = makeAction({ dueDate: '2026-05-01', text: 'Ship the feature' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('SUMMARY:Ship the feature')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260501')
    expect(ics).toContain('DTEND;VALUE=DATE:20260502')
  })

  it('skips actions with no due date', () => {
    const action = makeAction({ dueDate: '' })
    expect(buildIcs([action], [], 'My Initiative')).not.toContain('BEGIN:VEVENT')
  })

  it('skips actions with status done', () => {
    const action = makeAction({ dueDate: '2026-05-01', status: 'done' })
    expect(buildIcs([action], [], 'My Initiative')).not.toContain('BEGIN:VEVENT')
  })

  it('includes the owner in the description when set', () => {
    const action = makeAction({ dueDate: '2026-05-01', owner: 'Alice' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).toContain('DESCRIPTION:Owner: Alice')
  })

  it('omits DESCRIPTION when there is no owner', () => {
    const action = makeAction({ dueDate: '2026-05-01', owner: '' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).not.toContain('DESCRIPTION:')
  })

  it('includes milestones as all-day events regardless of reached status', () => {
    const reached = makeMilestone({ id: 'm1', reached: true })
    const pending = makeMilestone({ id: 'm2', reached: false, date: '2026-07-01' })
    const ics = buildIcs([], [reached, pending], 'My Initiative')
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length
    expect(eventCount).toBe(2)
    expect(ics).toContain('SUMMARY:🏁 Launch')
  })

  it('escapes commas, semicolons, and backslashes in text fields', () => {
    const action = makeAction({ dueDate: '2026-05-01', text: 'Fix bug; improve, perf\\stuff' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).toContain('SUMMARY:Fix bug\\; improve\\, perf\\\\stuff')
  })

  it('handles a month/year rollover when computing the exclusive end date', () => {
    const action = makeAction({ dueDate: '2026-12-31' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).toContain('DTSTART;VALUE=DATE:20261231')
    expect(ics).toContain('DTEND;VALUE=DATE:20270101')
  })

  it('uses CRLF line endings per RFC 5545', () => {
    const ics = buildIcs([], [], 'My Initiative')
    expect(ics).toContain('\r\n')
    expect(ics.split('\r\n').length).toBeGreaterThan(1)
  })

  it('gives each event a unique UID scoped to this app', () => {
    const action = makeAction({ id: 'unique-id-1', dueDate: '2026-05-01' })
    const ics = buildIcs([action], [], 'My Initiative')
    expect(ics).toContain('UID:unique-id-1@change-planner.agile-toolkit')
  })
})
