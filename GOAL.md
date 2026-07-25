# Change Planner — Goal

## Problem
Teams driving organizational or team-level change (Scrum Masters, Agile coaches, change leads) typically plan change initiatives in slide decks or documents that don't track whether planned actions actually happen, how stakeholder readiness shifts over time, or how a change effort compares against the change-management theory it's supposedly following. Change Planner gives change leads a structured, single-page tool — built on Jurgen Appelo's "How to Change the World" 4-facet model (Dance with the System, Mind the People, Stimulate the Network, Change the Environment) — to plan an initiative facet by facet, track concrete actions to completion, and measure readiness before and after.

## Audience
Scrum Masters, Agile coaches, and change leads inside the Agile Toolkit suite, running one or more concurrent change initiatives solo or presenting them to stakeholders. Browser-only, no account or backend — all state lives in the browser's localStorage. English, Spanish, Belarusian, and Russian speaking users.

## Success criteria
1. A user can create an initiative and fill in guided prompts + notes across all 4 Appelo facets, either via free-form workspace tabs or a guided step-by-step walkthrough.
2. A user can track concrete change actions (owner, due date, priority, facet, status) through a list view, a Kanban board, and a week-grouped roadmap timeline, and see overdue items flagged automatically.
3. A user can run a per-facet readiness assessment (1–5 survey) at two or more points in time and see a radar-chart comparison of baseline vs. latest.
4. A user can get an initiative's data out of the browser — as a PNG/Markdown export, a JSON backup, or a shareable read-only URL — without losing anything if the browser storage is cleared.
5. A user can manage multiple initiatives from a home screen showing health at a glance (open/overdue counts, facet coverage, last-updated), and archive/duplicate/find initiatives as the list grows.

## Non-goals
- No multi-user collaboration, accounts, or server-side storage — this is a single-browser, single-user planning tool.
- No prescriptive workflow engine or approval chains — it's a structured notebook, not a project-management system of record.
- No analytics/reporting across teams or organizations — insights are scoped to one initiative or one browser's initiative list at a time.
- No native mobile app — responsive web only, deployed as a static site to GitHub Pages.
