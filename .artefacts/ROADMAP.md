# Change Planner — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1: Home screen discovery** — serves #5. Surface what needs attention and find things across a growing initiative list. [#53](https://github.com/agile-toolkit/change-planner/issues/53) (cross-initiative "This Week" due/overdue digest), [#57](https://github.com/agile-toolkit/change-planner/issues/57) (text search across initiatives by title/goal/stakeholder).
2. **E2: Export & sharing enhancements** — serves #4. Extend "get data out of the browser" beyond PNG/Markdown/JSON/URL-share. [#54](https://github.com/agile-toolkit/change-planner/issues/54) (print-optimized `@media print` view), [#58](https://github.com/agile-toolkit/change-planner/issues/58) (export action due dates as an `.ics` calendar file).
3. **E3: RACI responsibility tagging** — serves #2. Adds a `raci` field to actions, linking to stakeholder profiles, so action ownership tracking gets more precise. [#55](https://github.com/agile-toolkit/change-planner/issues/55).
4. **E4: Automated test coverage** — foundational; no test runner exists in the repo today. Vitest coverage for core utilities (`sharing.ts` encode/decode, `sortInitiatives`, `isOverdue`, `boardItemToAction`) protects criteria #2–#4 from regressions as new epics land. [#56](https://github.com/agile-toolkit/change-planner/issues/56).

## Polish backlog
- [#59](https://github.com/agile-toolkit/change-planner/issues/59) — hardcoded English placeholder in `FacetCard.tsx` notes textarea; 1-line fix, use existing `facets.notes_placeholder` i18n key.

## Shipped
- ~~Initiative canvas: guided facet walkthrough + free-form workspace across all 4 Appelo facets~~
- ~~Action tracker: priority levels, due dates with overdue flagging, filter/search, keyboard accessibility, If/Then/Because hypothesis format~~
- ~~Action Kanban board (drag-and-drop, per-facet swim lanes) and week-grouped roadmap timeline with milestone markers~~
- ~~Change readiness assessment: per-facet 1–5 survey, SVG radar chart (baseline vs. latest), history~~
- ~~Data portability: PNG/Markdown export, JSON backup + re-import, URL-based read-only sharing~~
- ~~Home screen: health summary (open/overdue counts, facet coverage, last-updated), sort, duplicate, archive~~
- ~~Quick-start initiative templates for common Agile change scenarios~~
- ~~Cross-app integrations: Moving Motivators results, Team Identity charter auto-fill, Improvement Board import, Scrum Facilitator retro copy, suite dashboard card~~
- ~~i18n (EN/ES/BE/RU) and light/dark theme across all components~~
