# Change Planner — Roadmap

Derived from GOAL.md. Rebuilt when GOAL changes or an epic ships.

## Current epic
None — idle. See `## Next epics` below.

## Next epics
1. **E1 remainder: Home screen discovery** — serves #5. [#57](https://github.com/agile-toolkit/change-planner/issues/57) (text search across initiatives by title/goal/stakeholder).
2. **E2: Export & sharing enhancements** — serves #4. Extend "get data out of the browser" beyond PNG/Markdown/JSON/URL-share. [#54](https://github.com/agile-toolkit/change-planner/issues/54) (print-optimized `@media print` view), [#58](https://github.com/agile-toolkit/change-planner/issues/58) (export action due dates as an `.ics` calendar file).
3. **E3: RACI responsibility tagging** — serves #2. Adds a `raci` field to actions, linking to stakeholder profiles, so action ownership tracking gets more precise. [#55](https://github.com/agile-toolkit/change-planner/issues/55).

## Recently shipped
**Add glass effect to the header** (2026-09-04) — see `## Shipped`. `AppHeader.tsx`'s background changed to a translucent blur, matching the Dashboard's own nav — user-reported inconsistency.

**Sync icons; CI Node bump** (2026-09-04) — see `## Shipped`. Synced the shared `icons.tsx` (64 icons) and replaced the remaining decorative emoji across `App.tsx`/`HomeScreen.tsx`/`LearnView.tsx`/`StakeholderProfilePanel.tsx`/`ExportButton.tsx`/`ActionTracker.tsx` and more. CI Node bumped 20 → 22 for `jsdom@30`.

**Facilitator Mode persists across suite apps** (2026-09-03) — see `## Shipped`. `useFacilitatorMode`'s storage key changed to the shared `agile-toolkit:facilitatorMode` so the mode survives switching to another suite app in the same tab, per direct user request.

**Replace decorative ✕/✓ emoji with SVG icons** (2026-09-03) — see `## Shipped`. Part of a suite-wide emoji→SVG sweep the user asked for; this app had the most occurrences (11 kept, plus 3 paired status markers deliberately left as text).

**Facilitator Mode** (2026-09-03) — see `## Shipped`. A user asked for the presentation/projector mode already built for Team Identity to be adopted suite-wide; this is repo 10 of an 11-repo rollout, adopting the pattern now shared in `design-system/`.

**Add AI Adoption template** (2026-09-03) — see `## Shipped`. A 6th initiative template, alongside Agile Adoption/Continuous Delivery/Remote-First Culture/DevOps Transformation/OKR Rollout. Content grounded in current research (MIT's GenAI Divide pilot-failure study, ADKAR/Kotter change framing, employee AI-fear and governance-checklist reporting) rather than invented.

**Wire up cross-app data intake** (2026-09-03, fixed same day) — see `## Shipped`. A suite-wide audit found Moving Motivators, Improvement Board, and Salary Formula all sent real data to Change Planner (URL params or a shared localStorage key) that nothing here ever read. Now consumed: `?mm_snapshot=`, `?prefill=`/`description=`, and `salary-formula:pendingChangeRecord` (via a dismissible Home-screen banner); Stakeholder Motivator Profiles can also pull top motivators back from Moving Motivators' last session. The initial `?mm_snapshot=` parse used the wrong `ImpactLevel` literals (`increase`/`decrease` instead of the real `positive`/`negative`) — the affected-motivators note was silently always empty; fixed in 0.2.5.

**Normalize LanguagePicker dark shades** (2026-09-02) — see `## Shipped`. `LanguagePicker.tsx` had dark-mode classes on slightly different shades than the design-system's canonical copy. Normalized to match exactly.

**i18n hardcoded Save/Cancel; fix low-contrast delete icon** (2026-09-02) — see `## Shipped`. A suite-wide UX audit found `RoadmapView.tsx`/`ActionTracker.tsx` had hardcoded-English Save/Cancel buttons and a near-invisible delete icon. Fixed both.

**E4: Automated test coverage; Management 3.0 removal; invisible brand colors** (2026-09-02) — see `## Shipped`. [#56](https://github.com/agile-toolkit/change-planner/issues/56) shipped: `vitest` + `jsdom` with coverage for `sharing.ts` encode/decode, `sortInitiatives`, `isOverdue`, `boardItemToAction`, `digestActions`, `loadBoardItems`, `newInitiative`/`loadInitiatives`/`save`, and `TEMPLATES` invariants (31 tests). Writing the sharing round-trip test caught a real bug: `decodeInitiative`'s base64 re-padding formula only produced correct padding when the encoded length was ≡3 mod 4, silently corrupting shared-initiative URLs for most content lengths — fixed.

**E1 (partial): cross-initiative "This Week" digest** (2026-09-02) — see `## Shipped`. [#53](https://github.com/agile-toolkit/change-planner/issues/53) shipped; #57 (search) remains queued above as the rest of E1.

## Polish backlog
- No small polish items queued — [#59](https://github.com/agile-toolkit/change-planner/issues/59) (hardcoded English placeholder in `FacetCard.tsx`) was fixed this run.

## Repo cleanup (2026-09-02)
Closed 21 stale issues (#3–#8, #12–#17, #19–#21, #31, #32, #39, #40, #50, #51) confirmed already implemented against current source — no functional change, repo housekeeping only. #8's Phase 1 (related-sprints field, copy-to-retro) was already fully shipped; its Phase 2 (deep-links into Scrum Facilitator/Sprint Metrics) is explicitly conditional in the issue's own text on those apps adding URL-based session state, which neither currently has — closed with a note that a fresh issue should be filed once that lands.

## Shipped
- ~~Add glass/backdrop-blur effect to the header, matching the Dashboard's own nav~~
- ~~Sync the shared `icons.tsx` and replace remaining decorative emoji across the app~~
- ~~Unify Facilitator Mode's storage key to the shared `agile-toolkit:facilitatorMode` so it persists across suite apps~~
- ~~Replace decorative ✕/✓ text-glyph buttons with shared SVG icons~~
- ~~Facilitator Mode — bigger UI + hidden nav/language picker for in-room presentation, adopted from the shared design-system pattern~~
- ~~AI Adoption initiative template, grounded in current AI-rollout/change-management research~~
- ~~Cross-app data intake: read Moving Motivators' `?mm_snapshot=`, the `?prefill=`/`description=` convention, and Salary Formula's pending-change localStorage key; Stakeholder Motivator Profiles can pull top motivators from Moving Motivators' last session~~
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

**v0.2.1 — [E4: Automated test coverage](https://github.com/agile-toolkit/change-planner/issues/56); Management 3.0 removal; invisible brand colors** (2026-09-02):
- ~~Removed "Management 3.0" branding from README.md and all 4 i18n locale files, keeping the Jurgen Appelo / "How to Change the World" / 4-facet-framework attribution~~
- ~~Completed the `brand` Tailwind color scale (200/300/800/900 were missing but referenced across `ActionTracker.tsx`/`BoardView.tsx`/`HomeScreen.tsx`)~~
- ~~Extracted pure logic into `src/storage.ts`, `src/components/homeScreenLogic.ts`, and `src/utils/actions.ts`; added `vitest` + `jsdom` and 31 tests~~
- ~~Fixed a real bug in `decodeInitiative`'s base64 padding, found while writing its test~~

**v0.2.2 — i18n hardcoded Save/Cancel; fix low-contrast delete icon** (2026-09-02):
- ~~Added `common.save`/`common.cancel` i18n keys; wired into
  `RoadmapView.tsx`'s two Save/Cancel pairs and `ActionTracker.tsx`'s
  Cancel button~~
- ~~Fixed `ActionTracker.tsx`'s action-delete button contrast~~

**v0.2.3 — Normalize LanguagePicker dark shades** (2026-09-02):
- ~~Synced `LanguagePicker.tsx`'s dark-mode shades exactly with the
  design-system's canonical copy~~
