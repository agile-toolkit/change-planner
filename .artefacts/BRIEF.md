# Change Planner — Brief

## Overview

Interactive change-management planning (Jurgen Appelo “How to Change the World” style): facets, initiative canvas, action tracker. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Initiative canvas and guided facet / progress views (`InitiativeCanvas.tsx`, `ProgressView`, `ActionTracker.tsx`)
- [x] Canvas actions — new, clear confirm, section labels wired
- [x] Core `actions.title`, `actions.add`, placeholders for text/owner, empty state
- [x] Orphan locale keys wired/removed — `common.next` → FacetPlanner Next button; `canvas.save` + `canvas.load` removed (auto-save, home-screen load); `actions.placeholder_due|facet_label|mark_done|mark_todo|delete` wired as `aria-label` attributes
- [x] Hardcoded English — trailing ` done` replaced with `t('actions.done_count')` interpolation

## Backlog

- [ ] [#3] Feature: add ES and BE locale translations (language picker 4-way)
- [ ] [#4] Integration: link Moving Motivators results to Mind-the-People facet
- [ ] [#5] Feature: export initiative as PDF / shareable image (html2canvas + Markdown clipboard)

## Tech notes

- Verify dynamic `t()` patterns before deleting any `actions.*` key.

## Agent Log

### 2026-04-24 — research: market + integration + UX opportunities
- Done: created issue #3 (ES/BE locale translations — suite spec requires 4 locales, only EN+RU exist), issue #4 (Moving Motivators → Mind-the-People facet integration — link stakeholder motivator profiles), issue #5 (export initiative as PDF/image + clipboard Markdown)
- Waiting for human review on all three
- Next task: check needs-review issues for human feedback (#3 ES/BE locales, #4 Moving Motivators integration, #5 export/share)

### 2026-04-22 — feat: wire orphan i18n keys and fix hardcoded done string
- Done: wired `common.next` as Next button in FacetPlanner; removed unused `canvas.save` + `canvas.load`; wired `actions.placeholder_due|facet_label|mark_done|mark_todo|delete` as aria-labels in ActionTracker; replaced `{doneCount}/{total} done` with `t('actions.done_count', {done, total})`; added `actions.done_count` interpolation key to en.json + ru.json
- Remaining features: none — all BRIEF features now implemented
- Next task: check needs-review issues for human feedback; run research cycle for market/integration/UX improvements

### 2026-04-19 — docs: BRIEF template (AGENT_AUTONOMOUS)

- Done: Template migration; listed i18n orphans + hardcoded fragment.
- Next task: Wire or remove listed keys in `src/i18n/en.json`+`ru.json`; replace ` done` in `ActionTracker.tsx` with `t()`.
