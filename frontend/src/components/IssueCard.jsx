import { Shield, Code, Gauge, FileCode, Lightbulb, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CAT_ICONS = { security: Shield, quality: Code, performance: Gauge }
const SEV = {
  critical: { label: 'Critical', cls: 'severity-critical' },
  high: { label: 'High', cls: 'severity-high' },
  medium: { label: 'Medium', cls: 'severity-medium' },
  low: { label: 'Low', cls: 'severity-low' },
}

export default function IssueCard({ issue }) {
  const [open, setOpen] = useState(false)

  const sev = SEV[(issue.severity || 'low').toLowerCase()] || SEV.low
  const Icon = CAT_ICONS[(issue.category || 'quality').toLowerCase()] || Code

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-bg-hover/50 transition-colors"
      >
        <Icon size={14} className="text-text-tertiary shrink-0" />
        <span className={`severity-badge ${sev.cls} shrink-0`}>{sev.label}</span>
        <span className="text-text-primary text-sm truncate">{issue.title}</span>
        {issue.file && (
          <span className="ml-auto text-text-tertiary text-[11px] font-mono shrink-0 hidden sm:block">
            <FileCode size={10} className="inline mr-1" />
            {issue.file}{issue.line && `:${issue.line}`}
          </span>
        )}
        <motion.div
          className="shrink-0 ml-2"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <ChevronRight size={12} className="text-text-tertiary" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
              <p className="text-text-secondary text-sm leading-relaxed">
                {issue.description}
              </p>
              {issue.suggestion && (
                <div className="flex gap-2.5 bg-accent-muted rounded-lg p-3">
                  <Lightbulb size={13} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-text-secondary text-sm leading-relaxed">{issue.suggestion}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
