# Changelog

## Unreleased

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
