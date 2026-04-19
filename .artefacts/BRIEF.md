# Change Planner — Brief

## Overview

Interactive change-management planning (Jurgen Appelo “How to Change the World” style): facets, initiative canvas, action tracker. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Initiative canvas and guided facet / progress views (`InitiativeCanvas.tsx`, `ProgressView`, `ActionTracker.tsx`)
- [x] Canvas actions — new, clear confirm, section labels wired
- [x] Core `actions.title`, `actions.add`, placeholders for text/owner, empty state
- [ ] Orphan locale keys — `common.next`, `canvas.save`, `canvas.load`, `actions.placeholder_due`, `actions.facet_label`, `actions.mark_done`, `actions.mark_todo`, `actions.delete` (no literal `t('…')` in `src/`)
- [ ] Hardcoded English — trailing ` done` next to counts in `src/components/ActionTracker.tsx`

## Backlog

## Tech notes

- Verify dynamic `t()` patterns before deleting any `actions.*` key.

## Agent Log

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Template migration; listed i18n orphans + hardcoded fragment.
- Next task: Wire or remove listed keys in `src/i18n/en.json`+`ru.json`; replace ` done` in `ActionTracker.tsx` with `t()`.
