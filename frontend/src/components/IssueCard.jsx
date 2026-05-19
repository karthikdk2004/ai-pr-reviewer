import { Shield, Code, Gauge, FileCode, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

const CATEGORY_ICONS = {
  security: Shield,
  quality: Code,
  performance: Gauge,
}

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', className: 'severity-critical' },
  high: { label: 'High', className: 'severity-high' },
  medium: { label: 'Medium', className: 'severity-medium' },
  low: { label: 'Low', className: 'severity-low' },
}

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)

  const sev = (issue.severity || 'low').toLowerCase()
  const cat = (issue.category || 'quality').toLowerCase()
  const sevConfig = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.low
  const CategoryIcon = CATEGORY_ICONS[cat] || Code

  return (
    <div
      className={`
        card border-l-2 transition-all duration-200
        ${sev === 'critical' ? 'border-l-red-500' : ''}
        ${sev === 'high' ? 'border-l-orange-500' : ''}
        ${sev === 'medium' ? 'border-l-yellow-500' : ''}
        ${sev === 'low' ? 'border-l-blue-500' : ''}
      `}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <CategoryIcon size={16} className="text-zinc-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`severity-badge ${sevConfig.className}`}>
              {sevConfig.label}
            </span>
            <span className="text-white text-sm font-medium">{issue.title}</span>
          </div>
          {issue.file && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <FileCode size={11} />
              {issue.file}
              {issue.line && <span className="text-zinc-600">:{issue.line}</span>}
            </div>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-zinc-500 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={14} className="text-zinc-500 shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-bg-border animate-fade-in">
          <p className="text-zinc-300 text-sm leading-relaxed">{issue.description}</p>

          {issue.suggestion && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex gap-2.5">
              <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
              <p className="text-zinc-300 text-sm leading-relaxed">{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
