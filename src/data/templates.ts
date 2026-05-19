import type { FacetId } from '../types'

export interface InitiativeTemplate {
  id: string
  emoji: string
  data: {
    title: string
    goal: string
    context: string
    stakeholders: string
    facetNotes: Record<FacetId, string>
  }
}

export const TEMPLATES: InitiativeTemplate[] = [
  {
    id: 'agile-adoption',
    emoji: '🔄',
    data: {
      title: 'Agile Adoption',
      goal: 'Run reliable 2-week Sprints with stable velocity and improved predictability within 3 months.',
      context:
        'The team works in an ad-hoc, project-based model with unclear priorities and no regular retrospectives.',
      stakeholders: 'Scrum Master, Product Owner, Development team, Line manager',
      facetNotes: {
        dance: 'Map the current workflow: where do blockers accumulate? Which ceremonies already happen informally?',
        mind: 'Identify team members who are excited vs. skeptical. Address fears about estimation and "being tracked."',
        stimulate: 'Share early Sprint review demos with adjacent teams. Invite observers to retrospectives.',
        change: 'Introduce a shared Sprint board (physical or digital). Block Sprint planning and retro on calendars.',
      },
    },
  },
  {
    id: 'continuous-delivery',
    emoji: '🚀',
    data: {
      title: 'Continuous Delivery Pipeline',
      goal: 'Reduce deployment lead time from weeks to hours, with automated tests covering 70%+ of the codebase.',
      context:
        'Releases are manual, infrequent, and risky. Deployments require a dedicated window and often cause incidents.',
      stakeholders: 'Engineering leads, QA team, DevOps/Ops, Product Manager, CTO',
      facetNotes: {
        dance: 'Map the current deployment steps end-to-end. Identify the longest feedback loops and manual gates.',
        mind: 'Engineers fear losing control of releases. Ops fears instability. Build safety around small, reversible changes.',
        stimulate:
          'Celebrate each pipeline milestone (first green build, first auto-deploy to staging). Share metrics broadly.',
        change:
          'Introduce feature flags to decouple deploy from release. Enforce branch protection and required CI checks.',
      },
    },
  },
  {
    id: 'remote-culture',
    emoji: '🌐',
    data: {
      title: 'Remote-First Culture',
      goal: 'Achieve equal collaboration quality for remote and in-office team members within 6 months.',
      context:
        'The team is hybrid. Remote members feel like second-class citizens in meetings and informal communication.',
      stakeholders: 'Team members (remote & office), Team leads, HR, IT/tooling team',
      facetNotes: {
        dance: 'Audit meeting formats: which are camera-off? Which exclude async participants? Identify info silos.',
        mind: 'Office workers may not feel the pain. Build empathy by swapping roles for a week.',
        stimulate: 'Launch a virtual water-cooler channel. Share "remote win" stories. Recognise async contributors.',
        change:
          'Adopt camera-on norms, async-first decisions, and written docs as default. Upgrade remote audio/video setup.',
      },
    },
  },
  {
    id: 'devops-transformation',
    emoji: '🔧',
    data: {
      title: 'DevOps Transformation',
      goal: 'Shared ownership of production; mean time to recovery under 1 hour within 6 months.',
      context:
        'Dev and Ops teams work in silos. Ops owns production; Dev throws work "over the wall." Incident response is reactive.',
      stakeholders: 'Dev team, Ops/SRE team, Engineering Manager, Product Owner',
      facetNotes: {
        dance: 'Map Dev-to-Ops handoff points. Identify where blame and friction accumulate in post-mortems.',
        mind: 'Dev fears on-call. Ops fears losing control. Reframe shared ownership as better tooling, not more burden.',
        stimulate:
          'Run joint chaos engineering game days. Cross-post incident learnings in a blameless post-mortem channel.',
        change:
          'Implement on-call rotation including developers. Provide runbooks and alert ownership from day one of a feature.',
      },
    },
  },
  {
    id: 'okr-rollout',
    emoji: '🎯',
    data: {
      title: 'OKR Rollout',
      goal: 'All teams have 3 aligned OKRs per quarter, reviewed bi-weekly, within one planning cycle.',
      context:
        'Goals are set annually and rarely revisited. Teams lack clarity on priorities and connection to company strategy.',
      stakeholders: 'CEO, Team leads, HR/People Ops, Individual contributors',
      facetNotes: {
        dance:
          'Audit existing goal-setting: how are targets cascaded today? Where does alignment break down between levels?',
        mind: 'People fear OKRs becoming a performance review tool. Clarify that OKRs are directional, not a rating system.',
        stimulate:
          'Share early OKR wins in all-hands. Invite teams to present their OKRs and get peer feedback in OKR review sessions.',
        change:
          'Block quarterly planning and bi-weekly OKR check-ins. Create a shared OKR tracker visible to the whole company.',
      },
    },
  },
]
