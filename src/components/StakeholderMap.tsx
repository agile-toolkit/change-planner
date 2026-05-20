import { useTranslation } from 'react-i18next'
import type { StakeholderProfile } from '../types'

interface Props {
  profiles: StakeholderProfile[]
}

const W = 280
const H = 220
const PAD = 36

/** Map a 1–5 score to SVG coordinate (within the plot area). */
function toX(interest: number) {
  return PAD + ((interest - 1) / 4) * (W - PAD * 2)
}
function toY(influence: number) {
  // y=0 is top, so high influence → low y
  return PAD + ((5 - influence) / 4) * (H - PAD * 2)
}

const MIDX = toX(3)
const MIDY = toY(3)

const DOT_COLORS = [
  '#0d9488', // teal
  '#2563eb', // blue
  '#d97706', // amber
  '#7c3aed', // violet
  '#dc2626', // red
  '#059669', // emerald
  '#9333ea', // purple
  '#ea580c', // orange
]

export default function StakeholderMap({ profiles }: Props) {
  const { t } = useTranslation()

  const mapped = profiles.filter(p => p.influence != null && p.interest != null)
  if (mapped.length < 2) return null

  return (
    <div className="mt-4 rounded-xl border border-green-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-green-800 mb-3">
        {t('stakeholders.map_title')}
      </h4>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ maxWidth: W, display: 'block', margin: '0 auto' }}
        aria-label={t('stakeholders.map_title')}
      >
        {/* Quadrant fills */}
        <rect x={PAD} y={PAD} width={MIDX - PAD} height={MIDY - PAD} fill="#f0fdf4" />
        <rect x={MIDX} y={PAD} width={W - PAD - MIDX} height={MIDY - PAD} fill="#eff6ff" />
        <rect x={PAD} y={MIDY} width={MIDX - PAD} height={H - PAD - MIDY} fill="#fefce8" />
        <rect x={MIDX} y={MIDY} width={W - PAD - MIDX} height={H - PAD - MIDY} fill="#f9fafb" />

        {/* Dividing lines */}
        <line x1={MIDX} y1={PAD} x2={MIDX} y2={H - PAD} stroke="#d1d5db" strokeWidth="1" />
        <line x1={PAD} y1={MIDY} x2={W - PAD} y2={MIDY} stroke="#d1d5db" strokeWidth="1" />

        {/* Border */}
        <rect x={PAD} y={PAD} width={W - PAD * 2} height={H - PAD * 2}
          fill="none" stroke="#e5e7eb" strokeWidth="1" />

        {/* Quadrant labels */}
        <text x={PAD + 4} y={PAD + 11} fontSize="7" fill="#15803d" fontWeight="600">
          {t('stakeholders.quadrant_satisfy')}
        </text>
        <text x={MIDX + 4} y={PAD + 11} fontSize="7" fill="#1d4ed8" fontWeight="600">
          {t('stakeholders.quadrant_manage')}
        </text>
        <text x={PAD + 4} y={MIDY + 11} fontSize="7" fill="#854d0e" fontWeight="600">
          {t('stakeholders.quadrant_monitor')}
        </text>
        <text x={MIDX + 4} y={MIDY + 11} fontSize="7" fill="#6b7280" fontWeight="600">
          {t('stakeholders.quadrant_inform')}
        </text>

        {/* Axis labels */}
        <text x={W / 2} y={H - 2} fontSize="8" fill="#6b7280" textAnchor="middle">
          {t('stakeholders.interest')} →
        </text>
        <text
          x={10}
          y={H / 2}
          fontSize="8"
          fill="#6b7280"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${H / 2})`}
        >
          {t('stakeholders.influence')} →
        </text>

        {/* Stakeholder dots */}
        {mapped.map((p, i) => {
          const cx = toX(p.interest!)
          const cy = toY(p.influence!)
          const color = DOT_COLORS[i % DOT_COLORS.length]
          return (
            <g key={p.id}>
              <circle cx={cx} cy={cy} r={5} fill={color} opacity={0.85} />
              <text
                x={cx}
                y={cy - 7}
                fontSize="7"
                fill={color}
                textAnchor="middle"
                style={{ fontWeight: 600 }}
              >
                {p.name.length > 12 ? p.name.slice(0, 11) + '…' : p.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
