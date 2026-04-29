# Change Planner — Brief

## Overview

Interactive change-management planning (Jurgen Appelo “How to Change the World” style): facets, initiative canvas, action tracker. React 18, Vite, Tailwind, react-i18next. Deploy: GitHub Pages.

## Features

- [x] Initiative canvas and guided facet / progress views (`InitiativeCanvas.tsx`, `ProgressView`, `ActionTracker.tsx`)
- [x] Canvas actions — new, clear confirm, section labels wired
- [x] Core `actions.title`, `actions.add`, placeholders for text/owner, empty state
- [x] Orphan locale keys wired/removed — `common.next` → FacetPlanner Next button; `canvas.save` + `canvas.load` removed (auto-save, home-screen load); `actions.placeholder_due|facet_label|mark_done|mark_todo|delete` wired as `aria-label` attributes
- [x] Hardcoded English — trailing ` done` replaced with `t('actions.done_count')` interpolation
- [x] ES and BE locale translations — full `es.json` and `be.json`; 4-way language picker (EN/ES/BE/RU) in header

## Backlog

- [x] [#3] Feature: add ES and BE locale translations (language picker 4-way) — implemented
- [ ] [#4] Integration: link Moving Motivators results to Mind-the-People facet
- [ ] [#5] Feature: export initiative as PDF / shareable image (html2canvas + Markdown clipboard)
- [ ] [#6] Feature: JSON backup — export and re-import initiative data (localStorage portability)
- [ ] [#7] Feature: quick-start initiative templates for common Agile change scenarios
- [ ] [#8] Integration: link Change Planner to Scrum Facilitator ceremonies and Sprint Metrics

## Tech notes

- Verify dynamic `t()` patterns before deleting any `actions.*` key.

## Agent Log

### 2026-04-29 — feat: ES and BE locale translations + 4-way language picker
- Done: created `es.json` (Spanish) and `be.json` (Belarusian) with full translations of all keys; registered both locales in `src/i18n/index.ts`; replaced EN↔RU toggle button in `App.tsx` header with a 4-button picker (EN/ES/BE/RU); build passes
- Remaining backlog: #4 (Moving Motivators integration), #5 (PDF/image export), #6 (JSON backup), #7 (quick-start templates), #8 (Scrum/Sprint integration) — issues #4 and #8 still carry `approved` label
- Next task: implement issue #4 — link Moving Motivators results to Mind-the-People facet (read from localStorage key `moving-motivators-results`, surface motivator profile in FacetPlanner mind panel)

### 2026-04-26 — research: data portability, templates, and cross-app integration
- Done: checked issues #3–#5 — all still `needs-review`, no human feedback yet; created issue #6 (JSON export/import for localStorage backup — zero new deps, ~60 LOC), issue #7 (quick-start templates to reduce cold-start friction — typed Partial<Initiative> objects in src/data/templates.ts), issue #8 (Scrum Facilitator + Sprint Metrics integration — Phase 1 copy-to-retro clipboard, Phase 2 deep links once sibling apps ship URL state)
- Waiting for human review on all six open issues
- Next task: check needs-review issues for human feedback (#3 ES/BE locales, #4 Moving Motivators integration, #5 export/share, #6 JSON backup, #7 templates, #8 Scrum/Sprint integration)

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
