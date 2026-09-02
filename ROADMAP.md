# Change Planner — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1 remainder: Home screen discovery** — serves #5. [#57](https://github.com/agile-toolkit/change-planner/issues/57) (text search across initiatives by title/goal/stakeholder).
2. **E2: Export & sharing enhancements** — serves #4. Extend "get data out of the browser" beyond PNG/Markdown/JSON/URL-share. [#54](https://github.com/agile-toolkit/change-planner/issues/54) (print-optimized `@media print` view), [#58](https://github.com/agile-toolkit/change-planner/issues/58) (export action due dates as an `.ics` calendar file).
3. **E3: RACI responsibility tagging** — serves #2. Adds a `raci` field to actions, linking to stakeholder profiles, so action ownership tracking gets more precise. [#55](https://github.com/agile-toolkit/change-planner/issues/55).
4. **E4: Automated test coverage** — foundational; no test runner exists in the repo today. Vitest coverage for core utilities (`sharing.ts` encode/decode, `sortInitiatives`, `isOverdue`, `boardItemToAction`) protects criteria #2–#4 from regressions as new epics land. [#56](https://github.com/agile-toolkit/change-planner/issues/56).

## Recently shipped
**E1 (partial): cross-initiative "This Week" digest** (2026-09-02) — see `## Shipped`. [#53](https://github.com/agile-toolkit/change-planner/issues/53) shipped; #57 (search) remains queued above as the rest of E1.

## Polish backlog
- No small polish items queued — [#59](https://github.com/agile-toolkit/change-planner/issues/59) (hardcoded English placeholder in `FacetCard.tsx`) was fixed this run.

## Repo cleanup (2026-09-02)
Closed 21 stale issues (#3–#8, #12–#17, #19–#21, #31, #32, #39, #40, #50, #51) confirmed already implemented against current source — no functional change, repo housekeeping only. #8's Phase 1 (related-sprints field, copy-to-retro) was already fully shipped; its Phase 2 (deep-links into Scrum Facilitator/Sprint Metrics) is explicitly conditional in the issue's own text on those apps adding URL-based session state, which neither currently has — closed with a note that a fresh issue should be filed once that lands.

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

**v0.2.0 — [E1 (partial): cross-initiative "This Week" digest](https://github.com/agile-toolkit/change-planner/issues/53)** (2026-09-02):
- ~~Collapsible Home Screen panel surfacing open actions due within 7 days or overdue, across all non-archived initiatives, sorted by due date~~
- ~~Fix: hardcoded English placeholder in `FacetCard.tsx` notes textarea (#59)~~
