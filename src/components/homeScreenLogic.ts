import type { FacetId, Initiative, Action, ActionPriority } from '../types'

/** Minimal shape of an ImprovementItem from the Improvement Board app */
export interface ImprovementItem {
  id: string
  title: string
  description: string
  category: 'process' | 'technical' | 'people' | 'product' | 'other'
  status: 'identified' | 'in_progress' | 'done'
  owner: string
}

export const CATEGORY_TO_FACET: Record<ImprovementItem['category'], FacetId> = {
  people: 'mind',
  process: 'dance',
  product: 'change',
  technical: 'change',
  other: 'stimulate',
}

export function loadBoardItems(): ImprovementItem[] {
  try {
    const raw = localStorage.getItem('improvement-board-items')
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function boardItemToAction(item: ImprovementItem): Action {
  return {
    id: crypto.randomUUID(),
    text: item.description ? `${item.title}: ${item.description}` : item.title,
    owner: item.owner ?? '',
    dueDate: '',
    status: 'todo',
    facet: CATEGORY_TO_FACET[item.category] ?? 'dance',
    priority: 'medium' as ActionPriority,
  }
}

export type SortKey = 'latest' | 'actions' | 'alpha'

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(diff / 86400000)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

export interface DigestRow {
  action: Action
  initiativeId: string
  initiativeTitle: string
  overdue: boolean
}

/** Flattens open actions due this week (or overdue) across all non-archived initiatives, sorted by due date. */
export function digestActions(initiatives: Initiative[]): DigestRow[] {
  const today = new Date().toISOString().slice(0, 10)
  const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const rows: DigestRow[] = []
  for (const init of initiatives) {
    if (init.completedAt) continue
    for (const action of init.actions) {
      if (action.status === 'done' || !action.dueDate || action.dueDate > weekOut) continue
      rows.push({ action, initiativeId: init.id, initiativeTitle: init.title, overdue: action.dueDate < today })
    }
  }
  return rows.sort((a, b) => a.action.dueDate.localeCompare(b.action.dueDate))
}

export function sortInitiatives(list: Initiative[], key: SortKey): Initiative[] {
  const copy = [...list]
  if (key === 'latest') return copy.sort((a, b) => b.updatedAt - a.updatedAt)
  if (key === 'actions') {
    return copy.sort((a, b) => {
      const aOpen = a.actions.filter(x => x.status !== 'done').length
      const bOpen = b.actions.filter(x => x.status !== 'done').length
      return bOpen - aOpen
    })
  }
  return copy.sort((a, b) => a.title.localeCompare(b.title))
}
