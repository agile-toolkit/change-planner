# BRIEF

Derived per [`agent-state.NO-BRIEF.md`](https://github.com/agile-toolkit/.github/blob/main/agent-state.NO-BRIEF.md). There was **no prior** `BRIEF.md`. Sources: `README.md`, `src/i18n/en.json` / `ru.json`, `src/`. Generated **2026-04-19**.

## Product scope (from `README.md`)

- Interactive **change management planning** aligned with Jurgen Appelo’s *How to Change the World* framing.
- Plan initiatives across **four facets** with **guided prompts** and **action tracking**.
- Stack: React 18, TypeScript, Vite, Tailwind, react-i18next (EN/RU).
- Deploy: GitHub Pages via Actions on `main`.

## Build

- `npm run build` — **passes** (verified **2026-04-19**).

## TODO / FIXME in `src/`

- None (`TODO` / `FIXME` / `XXX` not found under `src/`).

## i18n — likely orphaned keys (no literal `'key'` in `src/`)

These keys exist under `src/i18n/en.json` but no `t('…')` uses the **exact** dotted path (verify dynamic use before deleting):

- `common.next`
- `canvas.save`, `canvas.load`
- `actions.placeholder_due`, `actions.facet_label`, `actions.mark_done`, `actions.mark_todo`, `actions.delete`

**Action:** Either wire them in the initiative / canvas / action UI or remove from locale files to avoid drift.

## Hardcoded user-visible strings

- `src/components/ActionTracker.tsx` (approx. line with progress text): English fragment **` done`** appears next to translated counts (`…/{…} done`). Should use i18n.

## Classification (NO-BRIEF)

- **Status:** `in-progress` — build green; README scope broadly covered, but orphaned keys and at least one hardcoded UI string remain.
- **First next task:** Wire or remove the orphaned `actions.*` / `canvas.save` / `canvas.load` / `common.next` keys; replace hardcoded ` done` in `ActionTracker.tsx` with a new i18n key under `actions.*` or `common.*`.
