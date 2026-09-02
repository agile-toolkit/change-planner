import { describe, it, expect } from 'vitest'
import { encodeInitiative, decodeInitiative } from './sharing'
import type { Initiative } from '../types'

function makeInitiative(overrides: Partial<Initiative> = {}): Initiative {
  return {
    id: 'i1',
    title: 'Test Initiative',
    goal: 'Ship the thing',
    context: 'Some context',
    stakeholders: 'Alice, Bob',
    relatedSprints: '',
    facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    actions: [],
    stakeholderProfiles: [],
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  }
}

describe('encodeInitiative / decodeInitiative', () => {
  it('round-trips an initiative', () => {
    const initiative = makeInitiative()
    const encoded = encodeInitiative(initiative)
    expect(decodeInitiative(encoded)).toEqual(initiative)
  })

  it('produces a URL-safe string with no +, /, or = characters', () => {
    const encoded = encodeInitiative(makeInitiative({ title: 'Special chars: ?&=/+ 日本語' }))
    expect(encoded).not.toMatch(/[+/=]/)
  })

  it('round-trips unicode content', () => {
    const initiative = makeInitiative({ title: 'Héllo Wörld 日本語', context: 'émigré café' })
    const encoded = encodeInitiative(initiative)
    expect(decodeInitiative(encoded)).toEqual(initiative)
  })

  it('returns null for corrupted input', () => {
    expect(decodeInitiative('not-valid-base64!!!')).toBeNull()
  })

  it('returns null for a valid base64 string that is not JSON', () => {
    const notJson = btoa('plain text, not json').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    expect(decodeInitiative(notJson)).toBeNull()
  })

  it('round-trips regardless of the encoded length\'s padding remainder', () => {
    // Base64 re-padding depends on (encoded length % 4); vary title length by
    // one character at a time so every remainder (0, 2, 3) gets exercised.
    for (let n = 0; n < 8; n++) {
      const initiative = makeInitiative({ title: 'x'.repeat(n) })
      const encoded = encodeInitiative(initiative)
      expect(decodeInitiative(encoded)).toEqual(initiative)
    }
  })
})
