import { describe, it, expect } from 'vitest'
import { TEMPLATES } from './templates'
import { FACET_IDS } from '../types'

describe('TEMPLATES', () => {
  it('has at least one template', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)
  })

  it('has unique ids', () => {
    const ids = TEMPLATES.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('defines facet notes for every facet id', () => {
    for (const template of TEMPLATES) {
      for (const facet of FACET_IDS) {
        expect(template.data.facetNotes[facet]).toBeTruthy()
      }
    }
  })

  it('has non-empty title, goal, context, and stakeholders for every template', () => {
    for (const template of TEMPLATES) {
      expect(template.data.title).toBeTruthy()
      expect(template.data.goal).toBeTruthy()
      expect(template.data.context).toBeTruthy()
      expect(template.data.stakeholders).toBeTruthy()
      expect(template.emoji).toBeTruthy()
    }
  })
})
