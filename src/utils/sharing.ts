import type { Initiative } from '../types'

export function encodeInitiative(initiative: Initiative): string {
  const json = JSON.stringify(initiative)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function decodeInitiative(hash: string): Initiative | null {
  try {
    const base64 = hash.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = decodeURIComponent(escape(atob(padded)))
    return JSON.parse(json) as Initiative
  } catch {
    return null
  }
}
