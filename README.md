# Change Planner

An interactive change management planning tool based on Jurgen Appelo's "How to Change the World" framework — plan change initiatives across all 4 facets (Dance with the System, Mind the People, Stimulate the Network, Change the Environment) with guided prompts, action tracking, a Kanban board, a roadmap timeline, and readiness assessments. All data lives in browser localStorage — no account, no backend.

Part of the [Agile Tools](https://github.com/bthos) suite built on Jurgen Appelo's change-management framework and ICAgile source materials.

See `GOAL.md` for why this exists and `ROADMAP.md` for what's shipped and what's next.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · react-i18next (EN/ES/BE/RU)

## Dev commands
```bash
npm install
npm run dev      # start Vite dev server
npm run build    # tsc typecheck + production build
npm run preview  # preview the production build locally
npm test         # run the vitest suite
```

## Deploy
GitHub Pages via GitHub Actions on push to `main`.

## localStorage keys

| Key | Shape | Purpose |
|-----|-------|---------|
| `change-planner-initiatives` | `Initiative[]` | All initiatives (active + archived). Read by the suite dashboard (`agile-toolkit.github.io`) for the Change Planner card. |
| `theme` | `'light' \| 'dark'` | Selected UI theme, applied via `[data-theme]` before first paint. |
| `change-planner:facilitatorMode` (`sessionStorage`) | `'1' \| '0'` | Facilitator (projector) mode toggle — per-tab, not persisted across sessions. See `src/components/useFacilitatorMode.ts`. |

Change Planner also *reads* (never writes) a few keys owned by sibling apps for one-way integrations: `improvement-board-items` (Improvement Board → import as actions), `team-identity-charter` (Team Identity → auto-fill initiative stakeholders), `salary-formula:pendingChangeRecord` (Salary Formula → dismissible Home-screen import banner), and `moving-motivators:lastSession` (Moving Motivators → prefill top motivators in Stakeholder Motivator Profiles). It also consumes two one-shot URL query params on load, stripped immediately after: `?mm_snapshot=` (Moving Motivators' "Export to Change Planner") and `?prefill=`/`description=` (Improvement Board and any future sender following the same convention). See `src/utils/crossAppImport.ts` for all four payload shapes.

## Tech notes
- **State:** a single `initiatives: Initiative[]` array in `App.tsx`'s React state, persisted to `localStorage` on every change (no external state library, no undo stack).
- **i18n:** `react-i18next` with 4 locale files under `src/i18n/` (`en.json`, `es.json`, `be.json`, `ru.json`). All 4 must stay in sync — a new user-facing string means a new key in all 4 files, not just `en.json`.
- **Theme:** `ThemeToggle.tsx` toggles a `data-theme` attribute (Tailwind `darkMode: 'selector'`), persisted under the `theme` localStorage key. An inline anti-flash script in `index.html` applies the stored theme before React mounts, to avoid a light-mode flash on dark-theme reloads.
- **Facets:** the 4 Appelo facets are a fixed `FacetId` union (`'dance' | 'mind' | 'stimulate' | 'change'`) duplicated as a local `FACET_IDS` const array in several components (`ActionTracker.tsx`, `ExportButton.tsx`, `LearnView.tsx`) rather than a single shared source — keep them in sync when adding a facet.
- **Sharing:** `src/utils/sharing.ts` encodes an initiative to a base64url URL hash (`#share=...`) with no server round-trip; `SharedView.tsx` renders it read-only and offers a one-click import into the viewer's own localStorage.
- **Tests:** `vitest` + `jsdom`. Pure logic lives in dedicated modules so it's testable without mounting the component tree: `src/storage.ts` (`App.tsx`'s persistence), `src/components/homeScreenLogic.ts` (`HomeScreen.tsx`'s sorting/digest/Improvement-Board-import logic), `src/utils/actions.ts` (`isOverdue`, used by `ActionTracker.tsx`); `src/utils/sharing.ts` and `src/data/templates.ts` are tested directly.
- **Cross-app integrations:** one-way localStorage reads from Improvement Board (`improvement-board-items`) and Team Identity (`team-identity-charter`); a "Copy to Retro context" button in `ProgressView.tsx` builds a Markdown block for pasting into Scrum Facilitator; the suite dashboard (`agile-toolkit.github.io`) reads `change-planner-initiatives` directly for its dashboard card.
- **PNG/export:** `html2canvas` is dynamically imported (not in the initial bundle) so the export path only costs bytes when used.
- **"This Week" digest:** `HomeScreen.tsx`'s `digestActions()` is a pure derived view over `Initiative[]` — no new localStorage key. It flattens non-done actions with a `dueDate` due within 7 days (or overdue) across all non-archived initiatives, sorted ascending by date, and hides the panel entirely when empty. Deviates slightly from actions with `status === 'todo'` only: `in-progress` actions are included too, matching the existing `isOverdue` convention in `ActionTracker.tsx` (`status !== 'done'`) rather than excluding actions someone has already started.

## Source materials
See `.artefacts/BRIEF.md` for the full feature checklist and run-by-run agent narrative log.
