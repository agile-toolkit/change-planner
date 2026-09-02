import type { Action } from '../types'

/** An action is overdue if it isn't done, has a due date, and that date is before `today` (YYYY-MM-DD). */
export function isOverdue(action: Action, today: string): boolean {
  return action.status !== 'done' && !!action.dueDate && action.dueDate < today
}
