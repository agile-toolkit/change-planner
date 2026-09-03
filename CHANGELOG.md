# Changelog

## Unreleased

## 0.2.5 — Fix wrong impact literals in the Moving Motivators import (2026-09-03)

- **fix (own bug)**: 0.2.4's `parseMmSnapshotParam` checked
  `snapshot.changes[id] === 'increase' || 'decrease'` to build the
  "this change affects" note. Moving Motivators' real `ImpactLevel`
  values are `'positive' | 'negative' | 'neutral'` — the check never
  matched real data, so the affected-motivators line was always empty
  even when the underlying data had real positive/negative impacts.
  Caught while fixing an unrelated bug in Moving Motivators itself
  (the same wrong assumption almost made it into a second repo). Fixed
  the check and the tests that had copied the same wrong values,
  which is why this passed review the first time.

## 0.2.4 — Wire up cross-app data intake: Moving Motivators, Improvement Board, Salary Formula (2026-09-03)

- **fix (broken integration)**: three "Open in Change Planner" style
  handoffs from other suite apps built real payloads (a URL param or a
  shared-origin `localStorage` write) that Change Planner never read —
  the link worked, the data silently didn't. Fixed as receiver for all
  three, found by a suite-wide cross-app link audit:
  - Moving Motivators' "Export to Change Planner" button (`?mm_snapshot=`)
    now creates a pre-filled initiative with the change description and a
    motivator-impact summary in the Mind facet notes.
  - Improvement Board's (and any future sender's) `?prefill=`/`description=`
    convention now creates a pre-filled initiative on load.
  - Salary Formula's `salary-formula:pendingChangeRecord` localStorage
    write now surfaces as a dismissible "pending change" banner on the
    Home screen, imported on demand rather than silently auto-created.
  - Added the reverse direction too: the Stakeholder Motivator Profiles
    panel (which already links out to Moving Motivators) can now prefill
    the top-3-motivator fields from `moving-motivators:lastSession` if a
    session was run, instead of requiring manual re-entry.
- New `src/utils/crossAppImport.ts` centralizes all four payload shapes
  with tests; see `~/meta/TECH-NOTES.md` for the audit that found these.

## 0.2.3 — Normalize LanguagePicker dark shades (2026-09-02)

- **fix (consistency)**: `LanguagePicker.tsx` already had dark-mode
  classes, but on slightly different shades than the design-system's
  canonical copy. Normalized to match exactly, part of a suite-wide
  sweep that found the same component had drifted into 3 different
  shade combinations across repos (and was missing dark mode entirely
  in 5 others).

## 0.2.2 — i18n hardcoded Save/Cancel; fix low-contrast delete icon (2026-09-02)

- **fix**: `RoadmapView.tsx`'s two Save/Cancel button pairs and
  `ActionTracker.tsx`'s Cancel button hardcoded English text despite the
  app supporting ES/BE/RU everywhere else. Added `common.save`/
  `common.cancel` i18n keys and wired them in.
- **fix**: `ActionTracker.tsx`'s action-delete button used
  `text-gray-200` with no dark-mode variant, below WCAG AA contrast.
  Bumped to `gray-400`/`gray-500`.
- Found via a suite-wide UX/scope audit.

## 0.2.1 — E4: automated tests; remove Management 3.0 ref; fix invisible brand colors (2026-09-02)

- **content**: removed "Management 3.0" branding from `README.md`'s suite
  tagline and from all 4 i18n locale files' Home subheadline and Learn intro
  strings, keeping the Jurgen Appelo / "How to Change the World" / 4-facet
  framework attribution intact.
- **fix**: `brand-200`/`brand-300`/`brand-800`/`brand-900` were referenced
  across `ActionTracker.tsx`, `BoardView.tsx`, and `HomeScreen.tsx` but
  never defined in `tailwind.config.js`. Completed the `brand` scale with
  Tailwind's own `fuchsia` values.
- **fix**: `decodeInitiative` (`src/utils/sharing.ts`) re-padded a base64url
  string using a formula that only produced correct padding when the
  encoded length was ≡3 mod 4 — for the other three remainders it added
  the wrong number of `=` characters, silently breaking the "share via
  URL" feature for most initiative content lengths. Found while writing
  its round-trip test; replaced with the standard
  `(4 - len % 4) % 4` padding formula.
- **test** ([#56](https://github.com/agile-toolkit/change-planner/issues/56)):
  extracted pure logic out of components so it's testable without
  mounting the tree — `App.tsx`'s persistence into `src/storage.ts`,
  `HomeScreen.tsx`'s sort/digest/board-import logic into
  `src/components/homeScreenLogic.ts`, `ActionTracker.tsx`'s `isOverdue`
  into `src/utils/actions.ts`. Added `vitest` + `jsdom` (this repo's first
  automated test coverage) and 31 tests covering those plus
  `sharing.ts` and `data/templates.ts`. `npm test` now passes cleanly.

## 0.2.0 — E1 (partial): cross-initiative "This Week" digest (2026-09-02)

- **feat**: collapsible "This Week" panel on the Home Screen, above the
  initiative list. Surfaces open actions (not `done`) with a due date that's
  overdue or within the next 7 days, across all non-archived initiatives,
  sorted ascending by due date. Each row shows the action text, owner,
  parent initiative, and an overdue/due-soon tag, and opens that initiative
  on click. Hidden entirely when there's nothing due. `home.digest_title`/
  `digest_overdue`/`digest_due_soon` in EN/ES/BE/RU.
- **fix**: hardcoded English placeholder in `FacetCard.tsx`'s notes
  textarea now uses the existing `facets.notes_placeholder` i18n key (#59).
- **chore**: closed 21 stale issues confirmed already implemented — no
  functional change, repo housekeeping only.
- **docs**: refresh `GOAL.md` from the suite-wide `GOALS.md` platform
  thesis and rebuild `ROADMAP.md` around it; document the digest in
  `README.md`.
- Docs only: added `.artefacts/GOAL.md` and `.artefacts/ROADMAP.md`, expanded `README.md` (dev commands, localStorage keys, tech notes). No behavior change — documents existing functionality that previously only lived in `.artefacts/BRIEF.md`.
- docs: move GOAL.md and ROADMAP.md from .artefacts/ to the repo root.
