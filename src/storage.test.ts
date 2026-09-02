import { describe, it, expect, beforeEach } from 'vitest'
import { STORAGE_KEY, newInitiative, loadInitiatives, save } from './storage'

beforeEach(() => {
  localStorage.clear()
})

describe('newInitiative', () => {
  it('creates a blank initiative with all 4 facet notes and a unique id', () => {
    const a = newInitiative()
    const b = newInitiative()
    expect(a.id).not.toBe(b.id)
    expect(a.title).toBe('')
    expect(a.actions).toEqual([])
    expect(a.stakeholderProfiles).toEqual([])
    expect(a.facetNotes).toEqual({ dance: '', mind: '', stimulate: '', change: '' })
  })
})

describe('loadInitiatives / save', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadInitiatives()).toEqual([])
  })

  it('returns an empty array when the stored value is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadInitiatives()).toEqual([])
  })

  it('round-trips initiatives through save/loadInitiatives', () => {
    const initiative = newInitiative()
    save([initiative])
    expect(loadInitiatives()).toEqual([initiative])
  })
})
