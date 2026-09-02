import type { Initiative } from './types'

export const STORAGE_KEY = 'change-planner-initiatives'
export const BACKUP_VERSION = 1

export function newInitiative(): Initiative {
  return {
    id: crypto.randomUUID(),
    title: '',
    goal: '',
    context: '',
    stakeholders: '',
    relatedSprints: '',
    facetNotes: { dance: '', mind: '', stimulate: '', change: '' },
    actions: [],
    stakeholderProfiles: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function loadInitiatives(): Initiative[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function save(initiatives: Initiative[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initiatives))
}
