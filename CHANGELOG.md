# Changelog

## Unreleased

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
