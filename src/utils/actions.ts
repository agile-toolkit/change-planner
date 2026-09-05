import type { Action, RaciAssignment } from '../types'

/** An action is overdue if it isn't done, has a due date, and that date is before `today` (YYYY-MM-DD). */
export function isOverdue(action: Action, today: string): boolean {
  return action.status !== 'done' && !!action.dueDate && action.dueDate < today
}

export function hasRaciAssigned(raci: RaciAssignment | undefined): boolean {
  if (!raci) return false
  return !!raci.responsible || !!raci.accountable || (raci.consulted?.length ?? 0) > 0 || (raci.informed?.length ?? 0) > 0
}

export type RaciLetter = 'R' | 'A' | 'C' | 'I'

/** Which of the four RACI role letters are set, in R/A/C/I order, for a compact badge cluster. */
export function raciRoleLetters(raci: RaciAssignment | undefined): RaciLetter[] {
  if (!raci) return []
  const letters: RaciLetter[] = []
  if (raci.responsible) letters.push('R')
  if (raci.accountable) letters.push('A')
  if ((raci.consulted?.length ?? 0) > 0) letters.push('C')
  if ((raci.informed?.length ?? 0) > 0) letters.push('I')
  return letters
}
