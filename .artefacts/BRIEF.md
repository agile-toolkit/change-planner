# BRIEF — Change Planner

## What this app does
An interactive change management planning tool based on Jurgen Appelo's "How to Change the World" framework (Management 3.0). Guides change agents through the 4 core facets of change: Dance with the System, Mind the People, Stimulate the Network, and Change the Environment. Users create structured change initiatives with actionable steps mapped to each facet.

## Target users
Change agents, Agile coaches, managers, and team leads planning organizational or team-level change initiatives. Works for individual planning and team workshops.

## Core features (MVP)
- Change initiative canvas: title, goal, context, stakeholders
- 4-facet planner: guided prompts and action items for each facet
  - Dance with the System (iterations, feedback loops)
  - Mind the People (intrinsic motivators, resistors)
  - Stimulate the Network (connectors, communities of practice)
  - Change the Environment (constraints, incentives, context)
- Action item tracker with owner and due date
- Progress view: facet completion indicators
- Export as printable PDF summary

## Educational layer
- "How to Change the World" framework overview panel
- Per-facet explainer: theory, examples, common pitfalls
- Motivators crossover: links to Moving Motivators app for people analysis
- Reference to source material throughout

## Tech stack
React 18 + TypeScript + Vite + Tailwind CSS. No backend (localStorage). GitHub Pages deployment.

## Source materials in `.artefacts/`
- `How to Change the World v1.01 - A4.pdf` — Jurgen Appelo's complete framework guide

## i18n
English + Russian (react-i18next).

## Agentic pipeline roles
- `/vadavik` — spec & requirements validation
- `/lojma` — UX/UI design (canvas layout, 4-facet cards, action tracker)
- `/laznik` — architecture (canvas state model, PDF export)
- `@cmok` — implementation
- `@bahnik` — QA (canvas save/restore, PDF export fidelity, mobile layout)
- `@piarun` — documentation
- `@zlydni` — git commits & GitHub Pages deploy
