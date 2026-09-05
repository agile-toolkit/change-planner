import type { Action, Milestone } from '../types'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toIcsDate(isoDate: string): string {
  return isoDate.replace(/-/g, '')
}

// All-day ICS events use an exclusive DTEND (the day after), per RFC 5545.
function addOneDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const next = new Date(Date.UTC(y, m - 1, d + 1))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

// RFC 5545 TEXT escaping: backslash, comma, semicolon, and newlines.
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function nowStamp(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
}

function buildEvent(uid: string, date: string, summary: string, description: string): string {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@change-planner.agile-toolkit`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART;VALUE=DATE:${toIcsDate(date)}`,
    `DTEND;VALUE=DATE:${toIcsDate(addOneDay(date))}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    ...(description ? [`DESCRIPTION:${escapeIcsText(description)}`] : []),
    'END:VEVENT',
  ].join('\r\n')
}

// Minimal RFC 5545 VCALENDAR: one all-day VEVENT per open action with a
// due date, plus one per milestone (issue #58). Actions with no dueDate
// or already status 'done' are skipped — a calendar export is for
// pending work, not a history log. Milestones are included regardless
// of their `reached` flag, since they're fixed dates on the roadmap
// either way.
export function buildIcs(actions: Action[], milestones: Milestone[], initiativeTitle: string): string {
  const events: string[] = []

  for (const action of actions) {
    if (!action.dueDate || action.status === 'done') continue
    const description = action.owner ? `Owner: ${action.owner}` : ''
    events.push(buildEvent(action.id, action.dueDate, action.text, description))
  }

  for (const milestone of milestones) {
    events.push(buildEvent(milestone.id, milestone.date, `🏁 ${milestone.title}`, `Milestone for ${initiativeTitle}`))
  }

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Change Planner//agile-toolkit//EN',
    'CALSCALE:GREGORIAN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}

export function downloadIcs(actions: Action[], milestones: Milestone[], initiativeTitle: string): void {
  const ics = buildIcs(actions, milestones, initiativeTitle)
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const slug = (initiativeTitle || 'initiative').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'initiative'
  a.download = `${slug}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
