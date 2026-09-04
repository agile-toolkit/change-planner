# Changelog

## Unreleased
- **ci**: CI Node bumped 20 → 22 and `engines` declared. `jsdom@30` requires
  Node `^22.22.2 || ^24.15.0 || >=26`, so the test step could never have passed
  on the pinned Node 20 — invisible until this release started running the
  tests in CI at all. Builds were unaffected (vite and tsc do not load jsdom).
- **feat**: synced the shared `icons.tsx` (now 64 icons) and replaced the
  remaining decorative emoji with SVG icons: share-button `🔗`→`LinkIcon`
  (App.tsx); home hero `🌍`→`GlobeIcon`, blank-template `📄`→`DocumentIcon`,
  empty-state `📋`→`ClipboardIcon`, board-item owner `👤`→`PersonIcon`
  (HomeScreen.tsx); tip `💡`→`TipIcon` (LearnView.tsx,
  StakeholderProfilePanel.tsx); export-menu `📋`/`🖼️`→`ClipboardIcon`/
  `ImageIcon` (ExportButton.tsx); filter `⚡`→`BoltIcon`, due-date
  `📅`→`CalendarIcon`, hypothesis `🧪`→`FlaskIcon` (ActionTracker.tsx);
  due-date `📅`→`CalendarIcon` (BoardView.tsx). `HandshakeIcon` was retired
  from the shared set (unused here) in favor of `TeamIcon`.
- **refactor**: `InitiativeTemplate.emoji: string` is now
  `icon: ComponentType<{className?: string}>`, matching the Dashboard's
  `apps.ts` pattern — `🔄 🚀 🌐 🔧 🤖 🎯` become `RefreshIcon RocketIcon
  GlobeIcon WrenchIcon RobotIcon TargetIcon` (data/templates.ts,
  HomeScreen.tsx template-picker render, templates.test.ts).
- **i18n**: `mind_profiles.open_mm` and `mind_profiles.prefill_from_mm` no
  longer end with a decorative "→" baked into every locale string (en/es/
  be/ru); the arrow now renders as `ArrowRightIcon` next to the text in
  StakeholderProfilePanel.tsx so it isn't duplicated on translation.
  Left `RoadmapView.tsx`/`SharedView.tsx`'s paired `✓`/`◆` and `✓`/`○`
  status markers, and the `💃`/`🧠`/`🕸️`/`🌱` facet glyphs (FacetPlanner.tsx,
  HomeScreen.tsx) as-is — motivator-card and matched-pair content, not
  standalone decoration. Part of the suite-wide emoji→SVG sweep.


## 0.3.0 — Validate cross-app payloads, error boundary (2026-09-03)

- **fix**: `readMmLastSession` and `readPendingSalaryChange` cast another repo's
  payload without checking it. `mmLastSessionTopMotivators` then called
  `session.ranked.slice(0, 3)` — a session written before `ranked` existed threw
  inside a click handler, where an ErrorBoundary cannot help, and the button
  simply died. Both readers now validate the fields anything downstream
  dereferences and return `null` or a fully-defaulted object.
- **fix**: `?prefill=` and `&description=` were written to state unbounded.
  Anyone can hand a user a link, and localStorage is a ~5 MB budget shared by
  all eleven apps on this origin; both are now capped.
- **feat**: `ErrorBoundary` at the root, with a scoped "clear this app's saved
  data" recovery path.
- **ci**: `npm test` now runs before `npm run build` in `deploy.yml`.

## 0.2.9 — Facilitator Mode persists across suite apps (2026-09-03)

- **fix**: `useFacilitatorMode`'s storage key changed from
  `'change-planner:facilitatorMode'` to the shared
  `'agile-toolkit:facilitatorMode'` — user-requested so Facilitator Mode
  survives navigating to another suite app in the same tab instead of
  resetting. sessionStorage is already shared per-origin-per-tab; this
  was previously app-prefixed specifically to keep it isolated, which
  turned out to be the wrong default for a cross-app presentation
  session.

## 0.2.8 — Replace decorative ✕/✓ emoji with SVG icons (2026-09-03)

- **feat**: replaced 11 decorative `✕`/`✓` text glyphs (action/milestone/
  stakeholder delete, template/import-board modal close, export/retro
  copy-confirmation, facet-notes-filled indicator) with `CloseIcon`/
  `CheckIcon` from the new shared `icons.tsx`, both rendering via
  `currentColor` so every button keeps the color it already had. Left
  `RoadmapView.tsx`/`SharedView.tsx`'s paired `✓`/`◆` and `✓`/`○` status
  markers (milestone-reached, action-done) as plain text — they're a
  matched binary pair, not a standalone decorative icon, and converting
  only one side would look inconsistent. Part of a suite-wide
  emoji→SVG sweep the user asked for.

## 0.2.7 — Facilitator Mode (2026-09-03)

- **feat**: added Facilitator (projector) Mode — a presentation toggle for
  in-room initiative reviews, bigger UI via one CSS rule (everything
  sized in `rem` scales automatically) plus hiding the nav pills and
  language picker while active. Toggled from a new header button next to
  the theme toggle, session-scoped via `sessionStorage`. Adopted from the
  shared design-system pattern (`useFacilitatorMode.ts` +
  `FacilitatorToggle.tsx`), originally built for Team Identity.

## 0.2.6 — Add AI Adoption template (2026-09-03)

- **feature**: new "AI Adoption" initiative template (`src/data/templates.ts`,
  🤖), matching the 4-facet Appelo framework the other 5 templates
  already use. Content synthesized from current research on AI
  rollout failure modes and change-management practice rather than
  invented: MIT's 2025 "GenAI Divide" study (95% of enterprise AI
  pilots show no P&L impact, mostly because generic tools never
  integrate into real workflows), Prosci ADKAR/Kotter framing for the
  human side of the rollout, and reporting on employee AI-fear drivers
  (fear is about how leadership will use AI, not the technology
  itself) and governance-checklist practice (ownership, approval
  checkpoints, phased rollout). Dance covers auditing existing
  "shadow AI" use and real workflow-integration points; Mind covers
  job-security fear and early-adopter champions; Stimulate covers
  low-stakes pilots and leadership transparency; Change covers
  ownership/policy/training before scaling past a pilot team.

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
