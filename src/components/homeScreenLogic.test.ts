import { describe, it, expect, beforeEach } from 'vitest'
import type { Initiative, Action } from '../types'
import {
  loadBoardItems, boardItemToAction, sortInitiatives, digestActions, filterInitiatives,
  type ImprovementItem,
} from './homeScreenLogic'

beforeEach(() => {
  localStorage.clear()
})

function makeAction(overrides: Partial<Action> = {}): Action {
  return { id: 'a1', text: 'Action', owner: '', dueDate: '', status: 'todo', facet: 'dance', priority: 'medium', ...overrides }
}

function makeInitiative(overrides: Partial<Initiative> = {}): Initiative {
  return {
    id: 'i1', title: 'Init', goal: '', context: '', stakeholders: '', relatedSprints: '',
    facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    actions: [], stakeholderProfiles: [], createdAt: 0, updatedAt: 0,
    ...overrides,
  }
}

describe('loadBoardItems', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadBoardItems()).toEqual([])
  })

  it('returns an empty array for corrupted JSON', () => {
    localStorage.setItem('improvement-board-items', '{not json')
    expect(loadBoardItems()).toEqual([])
  })

  it('parses stored items', () => {
    const items: ImprovementItem[] = [{ id: 'b1', title: 'Fix flaky test', description: '', category: 'technical', status: 'identified', owner: 'Alice' }]
    localStorage.setItem('improvement-board-items', JSON.stringify(items))
    expect(loadBoardItems()).toEqual(items)
  })
})

describe('boardItemToAction', () => {
  it('maps category to facet and combines title/description', () => {
    const item: ImprovementItem = { id: 'b1', title: 'Fix flaky test', description: 'CI is red 1/5 runs', category: 'technical', status: 'identified', owner: 'Alice' }
    const action = boardItemToAction(item)
    expect(action.text).toBe('Fix flaky test: CI is red 1/5 runs')
    expect(action.facet).toBe('change')
    expect(action.owner).toBe('Alice')
    expect(action.status).toBe('todo')
    expect(action.priority).toBe('medium')
  })

  it('uses just the title when there is no description', () => {
    const item: ImprovementItem = { id: 'b1', title: 'Fix flaky test', description: '', category: 'people', status: 'identified', owner: '' }
    expect(boardItemToAction(item).text).toBe('Fix flaky test')
    expect(boardItemToAction(item).facet).toBe('mind')
  })
})

describe('filterInitiatives', () => {
  const alpha = makeInitiative({ id: 'a', title: 'Alpha Rollout', goal: 'Ship the new billing flow' })
  const beta = makeInitiative({ id: 'b', title: 'Beta Migration', goal: 'Move to the new stack' })
  const gamma = makeInitiative({
    id: 'g', title: 'Gamma', goal: '',
    stakeholderProfiles: [{ id: 's1', name: 'Grace Hopper', motivators: [] }],
  })
  const list = [alpha, beta, gamma]

  it('returns the full list for a blank query', () => {
    expect(filterInitiatives(list, '')).toEqual(list)
    expect(filterInitiatives(list, '   ')).toEqual(list)
  })

  it('matches by title, case-insensitively', () => {
    expect(filterInitiatives(list, 'alpha')).toEqual([alpha])
    expect(filterInitiatives(list, 'ALPHA')).toEqual([alpha])
  })

  it('matches by goal text', () => {
    expect(filterInitiatives(list, 'billing')).toEqual([alpha])
  })

  it('matches by stakeholder name', () => {
    expect(filterInitiatives(list, 'grace')).toEqual([gamma])
  })

  it('returns an empty array when nothing matches', () => {
    expect(filterInitiatives(list, 'nonexistent')).toEqual([])
  })

  it('does not match against unrelated fields like context', () => {
    const withContext = makeInitiative({ id: 'c', title: 'Unrelated', context: 'mentions billing here too' })
    expect(filterInitiatives([withContext], 'billing')).toEqual([])
  })
})

describe('sortInitiatives', () => {
  const a = makeInitiative({ id: 'a', title: 'Beta', updatedAt: 100, actions: [makeAction(), makeAction({ id: 'a2', status: 'done' })] })
  const b = makeInitiative({ id: 'b', title: 'Alpha', updatedAt: 200, actions: [makeAction(), makeAction({ id: 'b2' })] })

  it('sorts by latest updatedAt descending', () => {
    expect(sortInitiatives([a, b], 'latest').map(i => i.id)).toEqual(['b', 'a'])
  })

  it('sorts by open action count descending', () => {
    expect(sortInitiatives([a, b], 'actions').map(i => i.id)).toEqual(['b', 'a'])
  })

  it('sorts alphabetically by title', () => {
    expect(sortInitiatives([a, b], 'alpha').map(i => i.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input array', () => {
    const input = [a, b]
    sortInitiatives(input, 'alpha')
    expect(input).toEqual([a, b])
  })
})

describe('digestActions', () => {
  it('excludes actions from completed initiatives', () => {
    const init = makeInitiative({ completedAt: 123, actions: [makeAction({ dueDate: '2026-09-01' })] })
    expect(digestActions([init])).toEqual([])
  })

  it('excludes done actions and actions with no due date', () => {
    const init = makeInitiative({ actions: [makeAction({ status: 'done', dueDate: '2026-09-01' }), makeAction({ id: 'a3', dueDate: '' })] })
    expect(digestActions([init])).toEqual([])
  })

  it('excludes actions due more than a week out', () => {
    const farOut = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    const init = makeInitiative({ actions: [makeAction({ dueDate: farOut })] })
    expect(digestActions([init])).toEqual([])
  })

  it('includes overdue and due-this-week actions, sorted by date, flagging overdue', () => {
    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const init = makeInitiative({
      title: 'My Initiative',
      actions: [makeAction({ id: 'a1', dueDate: today }), makeAction({ id: 'a2', dueDate: yesterday })],
    })
    const rows = digestActions([init])
    expect(rows.map(r => r.action.id)).toEqual(['a2', 'a1'])
    expect(rows[0].overdue).toBe(true)
    expect(rows[1].overdue).toBe(false)
    expect(rows[0].initiativeTitle).toBe('My Initiative')
  })
})
