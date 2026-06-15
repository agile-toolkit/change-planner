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
- [x] Light/dark theme — sun/moon ThemeToggle in AppHeader, `[data-theme="dark"]` Tailwind selector, anti-flash script in index.html, full `dark:` coverage across all components

## localStorage keys

| Key | Type | Description |
|-----|------|-------------|
| `change-planner-initiatives` | `Initiative[]` | All initiatives (active + archived). Dashboard reads this key. |

## Backlog

- [x] [#3] Feature: add ES and BE locale translations (language picker 4-way) — implemented
- [x] [#4] Integration: link Moving Motivators results to Mind-the-People facet — implemented
- [x] [#5] Feature: export initiative as PDF / shareable image (html2canvas + Markdown clipboard) — implemented
- [x] [#6] Feature: JSON backup — export and re-import initiative data (localStorage portability) — implemented
- [x] [#7] Feature: quick-start initiative templates for common Agile change scenarios — implemented
- [x] [#8] Integration: link Change Planner to Scrum Facilitator ceremonies and Sprint Metrics (Phase 1 implemented)
- [x] [#12] Feature: initiative completed / archived status (adds `completedAt` to Initiative; aligns with dashboard reader) — implemented
- [x] [#13] Feature: overdue action item visual indicator (red highlight when `dueDate < today` and status `todo`) — implemented
- [x] [#14] Integration: import Improvement Board items as change actions (reads `improvement-board-items` localStorage) — implemented
- [x] [#15] Integration: auto-fill stakeholder context from Team Identity charter (reads `team-identity-charter` localStorage, pre-fills stakeholders textarea in InitiativeCanvas)
- [x] [#16] Feature: action item priority levels (High/Medium/Low) — adds `priority` field to Action type, color-coded badges in ActionTracker, default sort by priority
- [x] [#17] Feature: per-facet action completion progress visualization in ProgressView (done/total per facet, global %, pure CSS or SVG) — implemented
- [x] [#19] Feature: experiment hypothesis format for action items (If/Then/Because + outcome field on Action type, collapsible section in ActionTracker) — implemented
- [x] [#20] Feature: stakeholder influence/interest map visualization (2x2 quadrant SVG in Mind facet; extends StakeholderProfile with influence/interest 1–5 scores) — implemented
- [x] [#21] Feature: home screen initiative health summary and sort (open-action count, facet-coverage dots, relative last-updated, sort control) — implemented
- [x] [#31] Unify header: AppHeader component + LanguagePicker — implemented
- [x] [#32] Feature: light/dark theme support (ThemeToggle + dark: Tailwind variants) — implemented
- [x] [#38] Feature: URL-based initiative sharing (base64 hash) — encode initiative to URL hash; read-only shared view; import button
- [x] [#39] Feature: action roadmap timeline view — 4th workspace tab grouping actions by ISO week, overdue/current week tints
- [ ] [#40] Integration: Change Planner card on suite dashboard — reads `change-planner-initiatives`, shows active count, top initiative health
- [ ] [#41] Feature: keyboard accessibility for Action Tracker (ARIA, keyboard navigation, focus management) — aria-pressed on priority/facet buttons, aria-expanded on hypothesis toggle, N-key shortcut to open add form, focus management after add
- [ ] [#42] Feature: action filter and search in Action Tracker — collapsible filter bar with facet/priority/status toggle chips and text search; active filter count badge; no new dependencies
- [ ] [#43] Feature: duplicate / clone initiative — one-click clone from home screen card menu; resets action statuses to todo, clears completedAt; navigates to new initiative

## Tech notes

- Verify dynamic `t()` patterns before deleting any `actions.*` key.
- Dashboard reader (`agile-toolkit.github.io/src/readers.ts`) references `completedAt` field — implement issue #12 to align.

## Agent Log

### 2026-06-15 — feat: action roadmap timeline view (issue #39)
- Done: created `src/components/RoadmapView.tsx` (~120 LOC); groups actions by week-Monday key (getWeekMonday), sorts ascending, past weeks get red tint, current week gets blue ring, undated actions in "No date" section at bottom, empty state when no dated actions, done/todo checkbox toggle per action; added "Roadmap" as 3rd CanvasTab in `App.tsx` alongside Workspace and Guided; wired `RoadmapView` render in canvasTab ternary; `roadmap.tab/week_of/no_date/empty` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining: #40 (dashboard card), #41 (keyboard a11y), #42 (action filter), #43 (clone initiative)
- Next task: implement #40 (Change Planner card on suite dashboard — reads `change-planner-initiatives`, shows active count, top initiative health in agile-toolkit.github.io) or #41 (keyboard a11y for Action Tracker — aria-pressed on priority/facet buttons, aria-expanded on hypothesis toggle, N-key shortcut, focus management after add) or #42 (action filter — collapsible filter bar with facet/priority/status toggle chips and text search) whichever is next approved; check issues for human feedback first

### 2026-06-15 — feat: URL-based initiative sharing (issue #38)
- Done: auto-approved #38, #39, #40 (7-day threshold reached). Implemented #38: `src/utils/sharing.ts` with `encodeInitiative`/`decodeInitiative` (base64url, no deps); `SharedView.tsx` read-only overlay with facet notes + actions checklist + "Import to my planner" button; App.tsx detects `#share=` hash on load and shows overlay; Share button in workspace tab bar writes encoded URL to clipboard and shows "Copied!" tooltip for 2s; `share.*` i18n keys in all 4 locales (EN/ES/BE/RU)
- Remaining: #39 (roadmap timeline view), #40 (dashboard card), #41 (keyboard a11y), #42 (action filter), #43 (clone initiative)
- Next task: implement #39 (action roadmap timeline view — 4th workspace tab, group actions by ISO week, RoadmapView.tsx ~80 LOC, overdue/current week tints, undated section, `roadmap.*` i18n keys in 4 locales)

### 2026-06-12 — research: keyboard a11y, action filter, and initiative duplication
- Done: checked all open issues — #38–#40 still `needs-review` (4 days old, not yet at 7-day auto-approve threshold); confirmed #41 and #42 (created by stale prior run today) are already in project board Backlog; created #43 (Feature: duplicate/clone initiative — one-click clone from home screen, resets action statuses, navigates to new initiative); added #41–#43 to BRIEF backlog
- Remaining: awaiting human review on #38–#43
- Next task: check issues for human feedback; #38–#40 reach 7-day threshold on 2026-06-15 and qualify for auto-approve; if any of #38–#43 approved earlier, implement first in Suite order (#38 → #39 → #40 → #41 → #42 → #43)

### 2026-06-08 — research: URL sharing, roadmap view, and dashboard card
- Done: checked all open issues — #3–#32 all carry `approved` label, all implemented, awaiting human close. Created 3 new research issues: #38 (URL-based initiative sharing via base64 hash), #39 (action roadmap timeline view grouped by ISO week), #40 (Change Planner dashboard card in agile-toolkit.github.io). All added to project board at Backlog.
- Remaining: awaiting human review on #38, #39, #40
- Next task: check issues for human feedback; if any of #38–#40 approved, implement first one

### 2026-06-06 — feat: light/dark theme (issue #32)
- Done: wired `ThemeToggle` into `AppHeader` children slot in `App.tsx`; added `dark:` Tailwind variants across all 13 source files — `index.css` (shared classes: `.card`, `.btn-secondary`, `.btn-ghost`, `.label`, `.input`, `body`), `App.tsx`, `AppHeader.tsx`, `LanguagePicker.tsx`, `ActionTracker.tsx`, `FacetCard.tsx`, `FacetPlanner.tsx`, `ProgressView.tsx`, `InitiativeCanvas.tsx`, `StakeholderProfilePanel.tsx`, `StakeholderMap.tsx`, `ExportButton.tsx`, `HomeScreen.tsx`, `LearnView.tsx`; anti-flash script and `tailwind.config.js` selector mode (`[data-theme="dark"]`) were already in place from design-system v2 commit; build passes
- Remaining backlog: none known (issue #32 closes)
- Next task: check issues for human feedback

### 2026-05-30 — feat: AppHeader unification (issue #31)
- Done: copied `AppHeader.tsx` and `LanguagePicker.tsx` from design system into `src/components/`; replaced inline `<header>` block in `App.tsx` with `<AppHeader title={t('app.title')} onTitleClick={...} navItems=[Learn]>`; removed four-button inline language switcher; removed unused `i18n` from `useTranslation` destructuring; build passes
- Remaining backlog: #32 (light/dark theme)
- Next task: implement #32 (light/dark theme: tailwind darkMode class, anti-flash script in index.html, ThemeToggle.tsx from design-system, dark: variants on all Tailwind color classes)

### 2026-05-27 — feat: Improvement Board import (issue #14)
- Done: added `ImprovementItem` inline type and `boardItemToAction()` helper in `HomeScreen.tsx`; category→facet mapping (`people→mind`, `process→dance`, `product/technical→change`, `other→stimulate`); "Import from Improvement Board" button on home screen hero area (3rd CTA alongside "New Initiative" and "Start from template"); `openImportBoard()` reads `improvement-board-items` from localStorage, filters out `done` items, opens modal; modal shows checkboxes per item with title, category badge, target-facet hint, description preview, and owner; "Select all / Deselect all" controls; footer shows selected count; "Import N items" creates a new initiative (titled "From Improvement Board") with the mapped actions and navigates to it; `import_board.*` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #31 (AppHeader unification), #32 (light/dark theme)
- Next task: implement #31 (AppHeader unification: copy AppHeader.tsx + LanguagePicker.tsx from agile-toolkit.github.io/design-system/components/ into src/components/, replace inline header block in App.tsx)

### 2026-05-24 — feat: per-facet progress visualization polish (issue #17)
- Done: fixed 3 hardcoded English strings in `ProgressView.tsx` — `'Notes only'` → `t('progress.notes_only')`, `'Empty'` → `'—'` (dash per spec), `'actions'` word removed (numbers speak for themselves); zero-action facets no longer render an empty bar; overall % shows `'—'` instead of `0%` when no actions exist; `progress.notes_only` key added to all 4 locale files (EN/ES/BE/RU)
- Remaining backlog: #14 (Improvement Board import), #31 (AppHeader unification), #32 (light/dark theme)
- Next task: implement #14 (Improvement Board import: reads `improvement-board-items` localStorage, maps category→facet, creates Action[] via import modal in ActionTracker or InitiativeCanvas)

### 2026-05-20 — feat: stakeholder influence/interest map (issue #20)
- Done: added `influence?: number` and `interest?: number` (1–5 scale) to `StakeholderProfile` in `types.ts`; created `StakeholderMap.tsx` — pure SVG 2×2 Mendelow matrix (Interest × Influence axes, midpoint at 3), renders only when ≥2 profiles have both scores set, 4 quadrant labels (Manage Closely / Keep Satisfied / Keep Informed / Monitor), colored dots per stakeholder with truncated name labels; added 1–5 `ScoreButtons` component inside `StakeholderProfilePanel.tsx` for both new-profile form and inline editing on existing profiles; map rendered below `StakeholderProfilePanel` in both `FacetCard.tsx` (workspace) and `FacetPlanner.tsx` (guided walkthrough); `stakeholders.influence|interest|map_title|quadrant_manage|satisfy|inform|monitor` i18n keys added to all 4 locales (EN/ES/BE/RU); backward-compatible optional fields, no migration needed; installed `html2canvas` (was missing from node_modules); build passes
- Remaining backlog: #17 (per-facet progress visualization), #14 (Improvement Board import)
- Next task: check issues for human feedback; implement #17 (per-facet action completion progress bars in ProgressView — done/total per facet, global %, pure CSS) if approved; implement #14 (Improvement Board import) if approved

### 2026-05-20 — feat: home screen initiative health summary and sort (issue #21)
- Done: added `relativeTime()` helper and `sortInitiatives()` function to `HomeScreen.tsx`; each initiative card now shows a compact stats row with relative last-updated time, open-action count, overdue-action count (red badge), and 4 facet-coverage dots (blue/green/orange/purple filled when facet has notes or actions, grey otherwise); sort control (Latest / Most open / A–Z) in the initiative list header; all using existing `Initiative` type data — no new deps, no schema changes; `home.open_actions|overdue_actions|facet_coverage|sort_latest|sort_actions|sort_alpha` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #17 (per-facet progress visualization), #20 (stakeholder map), #14 (Improvement Board import)
- Next task: check issues for human feedback; implement #20 (stakeholder influence/interest map — 2x2 quadrant SVG in Mind facet, StakeholderProfile extended with influence/interest 1–5 scores) if approved; implement #17 (per-facet progress visualization in ProgressView) if approved

### 2026-05-20 — feat: experiment hypothesis format for action items (issue #19)
- Done: added `ActionHypothesis` interface and `HypothesisOutcome` type to `types.ts`; added optional `hypothesis` field to `Action`; collapsible "Add hypothesis" toggle in add form (hidden by default) with If/Then/Because inputs; on action rows, a 🧪 "Hypothesis" toggle shows/hides the hypothesis block; when action is marked done, an outcome prompt "Did this happen?" appears with Yes/Partially/No buttons stored in `hypothesis.outcome`; `actions.hypothesis_*` i18n keys added to all 4 locales (EN/ES/BE/RU); backward-compatible optional field, no migration needed; build passes
- Also fixed pre-existing build error: installed `html2canvas` package (was missing from node_modules despite being in code)
- Remaining backlog: #17 (per-facet progress visualization), #20 (stakeholder map), #21 (home screen health), #14 (Improvement Board import)
- Next task: check issues for human feedback; implement #20 (stakeholder influence/interest map — 2x2 quadrant SVG in Mind facet, extends StakeholderProfile with influence/interest 1–5 scores) or #21 (home screen initiative health summary) if approved

### 2026-05-19 — feat: action item priority levels (issue #16)
- Done: added `ActionPriority = 'high' | 'medium' | 'low'` type to `types.ts`; added `priority` field to `Action` interface; added priority selector button group in `ActionTracker.tsx` add form (default Medium); color-coded badges (red=High, amber=Medium, gray=Low) shown on every action row; `sortByPriority()` sorts actions High→Medium→Low, then by `dueDate` ascending within each tier; `?? 'low'` fallback handles legacy localStorage data; `actions.priority_label|high|medium|low` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #17 (per-facet progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health), #14 (Improvement Board import)
- Next task: check issues for human feedback; implement #17 (per-facet action completion progress visualization in ProgressView — done/total per facet, global %, pure CSS progress bars)

### 2026-05-19 — feat: Team Identity charter auto-fill (issue #15)
- Done: added `loadTeamCharter()` helper in `InitiativeCanvas.tsx` that reads `team-identity-charter` from localStorage; when `stakeholders` is empty and a valid charter exists, a subtle underline link "Auto-fill from Team Identity charter" appears above the textarea; clicking it populates the field with a 3-line formatted block (Team / Values / Agreements); one-time import — user can edit freely after; `canvas.autofill_button|team|values|agreements` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #16 (action priority), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health)
- Next task: check issues for human feedback; implement #16 (action priority: add `priority` field to Action type in types.ts, color-coded High/Medium/Low badges in ActionTracker.tsx, default sort by priority descending)

### 2026-05-19 — feat: quick-start initiative templates (issue #7)
- Done: created `src/data/templates.ts` with 5 typed `InitiativeTemplate` objects (Agile Adoption, Continuous Delivery, Remote-First Culture, DevOps Transformation, OKR Rollout); added `onNewFromTemplate` prop and "Start from template" secondary button to `HomeScreen.tsx`; template picker modal shows blank + 5 template cards with emoji, i18n name/desc; clicking a template merges template data into a fresh initiative via `handleNewFromTemplate` in `App.tsx`; `templates.*` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #14 (Improvement Board import), #15 (Team Identity auto-fill), #16 (action priority), #17 (progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health)
- Next task: check issues for human feedback; implement first approved item among #14–#21

### 2026-05-19 — feat: overdue action item visual indicator (issue #13)
- Done: added `isOverdue` helper in `ActionTracker.tsx` comparing `action.dueDate < today` when `status === 'todo'`; overdue rows get `bg-red-50 border-red-200` background; due date text turns `text-red-500 font-medium`; a red "Overdue" badge renders inline; done actions unaffected; `actions.overdue` i18n key added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #7 (quick-start templates), #14 (Improvement Board import), #15 (Team Identity auto-fill), #16 (action priority), #17 (progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health)
- Next task: implement #7 (quick-start initiative templates — create `src/data/templates.ts` with 3–5 typed `Partial<Initiative>` objects for common Agile change scenarios; add "Start from template" modal on home screen NewInitiative flow)

### 2026-05-18 — feat: JSON backup (issue #6) + initiative archive/completedAt (issue #12)
- Done: added `completedAt?: number` to `Initiative` type; Export backup button downloads all initiatives as `{"version":1,"initiatives":[...]}` JSON via Blob+URL.createObjectURL; Import backup button reads JSON file via FileReader, merges by id (no duplicates), shows success toast with count; Archive button in workspace tab bar sets `completedAt`, redirects to home; Unarchive button reverses it; HomeScreen splits initiatives into Active / Archived sections (archived collapsed by default); archived banner shown in workspace; `backup.*` i18n keys added to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #7 (templates), #13 (overdue indicator), #15 (Team Identity auto-fill), #16 (action priority), #17 (progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health), #14 (Improvement Board import), #8 (Scrum/Sprint deep-link Phase 2)
- Next task: implement #13 (overdue action item visual indicator — red highlight when `dueDate < today` and `status === 'todo'`; no new deps, ~15 LOC in ActionTracker.tsx); then implement #7 (quick-start templates)

### 2026-05-18 — feat: export initiative as PNG and Markdown clipboard (issue #5)
- Done: installed html2canvas; created `ExportButton.tsx` with two export options — PNG capture via html2canvas (2× scale, downloads as `<slug>.png`) and structured Markdown clipboard copy (title, goal, context, stakeholders, facet notes, all action items with done/todo checkboxes); added "Export" button to workspace tab bar (top-right); added `export.*` i18n keys to all 4 locales (EN/ES/BE/RU); workspace container has a `ref` for html2canvas capture; dynamic import keeps html2canvas out of initial bundle
- Remaining backlog: #6 (JSON backup), #7 (templates), #12 (archive/completedAt), #13 (overdue indicator), #15 (Team Identity auto-fill), #16 (action priority), #17 (progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health)
- Next task: implement #6 (JSON backup — export all initiatives as JSON file + import from file; Blob+URL.createObjectURL download, FileReader import; no new deps); then #12 (completedAt field)

### 2026-05-16 — research: experiment format, stakeholder map, home screen UX
- Done: scanned all open issues — #3/#4/#8 confirmed `approved` + `In Review` on project board (all implemented, awaiting human close); #5–7, #12–17 still `needs-review`, no new human feedback
- Created issue #19 (Feature: experiment hypothesis format — If/Then/Because + outcome on Action type, turning Action Tracker into a PDCA experiment log aligned with Appelo framework)
- Created issue #20 (Feature: stakeholder influence/interest map — 2x2 quadrant SVG visualization; extends StakeholderProfile with influence/interest 1–5 scores in Mind facet)
- Created issue #21 (Feature: home screen initiative health summary — open-action count, facet-coverage dots, relative last-updated, sort control per initiative card)
- All three added to project board at Backlog status
- Next task: check issues for human feedback; implement first approved item among #5 (export/share), #6 (JSON backup), #7 (templates), #12 (archive/completedAt), #13 (overdue indicator), #14 (Improvement Board import), #15 (Team Identity auto-fill), #16 (action priority), #17 (progress visualization), #19 (experiment hypothesis), #20 (stakeholder map), #21 (home screen health)

### 2026-05-13 — research: Team Identity integration, action priority, and progress visualization
- Done: scanned all open issues — #3/#4/#8 still `approved` + `In Review` (implemented, awaiting human close); #5–7 and #12–14 still `needs-review`, no new human feedback
- Created issue #15 (Integration: auto-fill stakeholder context from Team Identity charter — reads `team-identity-charter` localStorage, one-click pre-fill for stakeholders textarea)
- Created issue #16 (Feature: action item priority levels High/Medium/Low — adds `priority` field to Action type, color-coded badges, default sort by priority)
- Created issue #17 (Feature: per-facet action completion progress visualization — done/total per facet + global % in ProgressView, pure CSS progress bars)
- Next task: check issues for human feedback; implement first approved item

### 2026-05-09 — research: initiative lifecycle, action UX, and cross-app integration
- Done: checked issues #5/6/7 — still `needs-review`, no human feedback; updated project status for #3, #4, #8 to `In Review` (all were implemented in prior runs but project board not updated)
- Created issue #12 (initiative completed/archived status — adds `completedAt` field that dashboard reader already expects; active/archived split on home screen)
- Created issue #13 (overdue action item visual indicator — red highlight on `todo` actions past `dueDate`, zero dependencies)
- Created issue #14 (Integration: import Improvement Board items as change actions — reads `improvement-board-items` localStorage, maps `category → facet`, creates `Action[]`)
- Added `## localStorage keys` section to BRIEF.md
- Next task: check issues for human feedback (#5 export/share, #6 JSON backup, #7 templates, #12 archive, #13 overdue, #14 Improvement Board import); implement first approved item

### 2026-04-30 — feat: Scrum Facilitator integration (Phase 1) — issue #8
- Done: added `relatedSprints` optional field to `Initiative` type and `InitiativeCanvas` (full i18n in EN/ES/BE/RU); added "Copy to Retro context" button in `ProgressView` that builds a structured Markdown block (initiative title, goal, related sprints, per-facet notes, open action items) and copies to clipboard via `navigator.clipboard`; button shows "Copied!" for 2 s feedback; all 4 locales updated; build passes
- Phase 2 (deep-link to Scrum Facilitator / Sprint Metrics via URL state) remains — conditional on sibling apps shipping URL-based session state
- Remaining backlog: #5 (PDF/image export), #6 (JSON backup), #7 (quick-start templates)
- Next task: check needs-review issues for human feedback (#5 export/share, #6 JSON backup, #7 templates); then implement next approved backlog item

### 2026-04-30 — feat: Moving Motivators integration in Mind-the-People facet
- Done: added `StakeholderProfile` type to `types.ts`; created `StakeholderProfilePanel` component (name + top-3 motivator inputs, suggested action prompt, deep-link to Moving Motivators app); rendered panel in both workspace `FacetCard` (mind facet) and guided `FacetPlanner` (mind tab); added `stakeholderProfiles` field to Initiative with backward-compatible `?? []` fallback; added `mind_profiles.*` i18n keys to all 4 locales (EN/ES/BE/RU); build passes
- Remaining backlog: #5 (PDF/image export), #6 (JSON backup), #7 (quick-start templates), #8 (Scrum/Sprint integration — also approved)
- Next task: implement issue #8 — link Change Planner to Scrum Facilitator ceremonies and Sprint Metrics (read spec from issue body; Phase 1 clipboard copy of initiative summary for retro; Phase 2 deep-links)

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
