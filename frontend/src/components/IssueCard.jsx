import { Shield, Code, Gauge, FileCode, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

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

const BORDER_COLORS = {
  critical: 'border-l-red-500 hover:shadow-[inset_3px_0_0_0_#ef4444]',
  high: 'border-l-orange-500 hover:shadow-[inset_3px_0_0_0_#f97316]',
  medium: 'border-l-yellow-500 hover:shadow-[inset_3px_0_0_0_#eab308]',
  low: 'border-l-blue-500 hover:shadow-[inset_3px_0_0_0_#3b82f6]',
}

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  const sev = (issue.severity || 'low').toLowerCase()
  const cat = (issue.category || 'quality').toLowerCase()
  const sevConfig = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.low
  const CategoryIcon = CATEGORY_ICONS[cat] || Code
  const borderClass = BORDER_COLORS[sev] || BORDER_COLORS.low

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight)
    }
  }, [expanded, issue])

  return (
    <div
      className={`
        card border-l-2 transition-all duration-300 overflow-hidden
        ${borderClass}
      `}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3 group"
      >
        <CategoryIcon size={16} className="text-zinc-400 group-hover:text-zinc-300 mt-0.5 shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`severity-badge ${sevConfig.className}`}>
              {sevConfig.label}
            </span>
            <span className="text-white text-sm font-medium group-hover:text-zinc-100 transition-colors">{issue.title}</span>
          </div>
          {issue.file && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
              <FileCode size={11} />
              {issue.file}
              {issue.line && <span className="text-zinc-600">:{issue.line}</span>}
            </div>
          )}
        </div>
        <div className={`shrink-0 mt-0.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className="text-zinc-500" />
        </div>
      </button>

      {/* Smooth expand/collapse */}
      <div
        style={{
          maxHeight: expanded ? `${contentHeight}px` : '0px',
          opacity: expanded ? 1 : 0,
          transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
        }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="px-4 pb-4 pt-0 space-y-3 border-t border-bg-border">
          <p className="text-zinc-300 text-sm leading-relaxed pt-3">{issue.description}</p>

          {issue.suggestion && (
            <div className="bg-accent/5 border border-accent/15 rounded-lg p-3.5 flex gap-2.5 group/suggestion hover:bg-accent/8 transition-colors duration-200">
              <Lightbulb size={14} className="text-accent shrink-0 mt-0.5 group-hover/suggestion:animate-pulse" />
              <p className="text-zinc-300 text-sm leading-relaxed">{issue.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
