import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Initiative, FacetId } from '../types'

const FACET_IDS: FacetId[] = ['dance', 'mind', 'stimulate', 'change']

interface Props {
  initiative: Initiative
  workspaceRef: React.RefObject<HTMLDivElement | null>
}

export default function ExportButton({ initiative, workspaceRef }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function buildMarkdown(): string {
    const lines: string[] = []
    lines.push(`# ${initiative.title || t('export.untitled')}`)
    lines.push('')
    if (initiative.goal) {
      lines.push(`**${t('canvas.goal_label')}:** ${initiative.goal}`)
    }
    if (initiative.context) {
      lines.push(`**${t('canvas.context_label')}:** ${initiative.context}`)
    }
    if (initiative.stakeholders) {
      lines.push(`**${t('canvas.stakeholders_label')}:** ${initiative.stakeholders}`)
    }
    if (initiative.relatedSprints) {
      lines.push(`**${t('canvas.related_sprints_label')}:** ${initiative.relatedSprints}`)
    }
    lines.push('')
    lines.push(`## ${t('export.facets_heading')}`)
    for (const facet of FACET_IDS) {
      const notes = initiative.facetNotes[facet]?.trim()
      lines.push(`**${t(`facets.${facet}.label`)}:** ${notes || '—'}`)
    }
    if (initiative.actions.length > 0) {
      lines.push('')
      lines.push(`## ${t('export.actions_heading')}`)
      for (const action of initiative.actions) {
        const check = action.status === 'done' ? 'x' : ' '
        const parts = [`- [${check}] ${action.text}`]
        if (action.owner) parts.push(`(${action.owner})`)
        if (action.dueDate) parts.push(`[${action.dueDate}]`)
        lines.push(parts.join(' '))
      }
    }
    return lines.join('\n')
  }

  const handleCopyMarkdown = () => {
    const md = buildMarkdown()
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true)
      setOpen(false)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportPng = async () => {
    if (!workspaceRef.current) return
    setExporting(true)
    setOpen(false)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(workspaceRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      const slug = (initiative.title || 'initiative').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'initiative'
      link.download = `${slug}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        disabled={exporting}
        className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        title={t('export.button_hint')}
      >
        {exporting ? t('export.exporting') : copied ? `✓ ${t('export.copied')}` : t('export.button')}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[200px] py-1">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span>📋</span>
              <span>{t('export.copy_markdown')}</span>
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <span>🖼️</span>
              <span>{t('export.export_png')}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
