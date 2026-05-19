import { Shield, Code, Gauge, FileCode, Lightbulb, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = { security: Shield, quality: Code, performance: Gauge }
const SEVS = {
  critical: { label: 'Critical', cls: 'sev-critical' },
  high: { label: 'High', cls: 'sev-high' },
  medium: { label: 'Medium', cls: 'sev-medium' },
  low: { label: 'Low', cls: 'sev-low' },
}

const BORDER = {
  critical: 'border-l-red-500/60',
  high: 'border-l-orange-500/60',
  medium: 'border-l-amber-500/60',
  low: 'border-l-blue-500/50',
}

export default function IssueCard({ issue }) {
  const [open, setOpen] = useState(false)
  const sev = (issue.severity || 'low').toLowerCase()
  const cat = (issue.category || 'quality').toLowerCase()
  const sevCfg = SEVS[sev] || SEVS.low
  const Icon = ICONS[cat] || Code
  const borderCls = BORDER[sev] || BORDER.low

  return (
    <motion.div
      className={`card overflow-hidden border-l-2 ${borderCls}`}
      whileHover={{ borderColor: 'rgba(99,102,241,0.12)' }}
      layout
      transition={{ layout: { duration: 0.2 } }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-bg-hover/40 transition-colors duration-150"
      >
        <Icon size={14} className="text-text-tertiary shrink-0" />
        <span className={`sev-badge ${sevCfg.cls} shrink-0`}>{sevCfg.label}</span>
        <span className="text-text-primary text-[13px] font-medium truncate flex-1">{issue.title}</span>
        {issue.file && (
          <span className="text-text-tertiary text-[11px] font-mono shrink-0 hidden md:flex items-center gap-1">
            <FileCode size={10} />
            {issue.file}{issue.line && <span className="text-text-tertiary/50">:{issue.line}</span>}
          </span>
        )}
        <motion.div
          className="shrink-0 ml-1"
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={13} className="text-text-tertiary" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border-default">
              <motion.p
                className="text-text-secondary text-[13px] leading-relaxed"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.2 }}
              >
                {issue.description}
              </motion.p>

              {issue.suggestion && (
                <motion.div
                  className="flex gap-2.5 rounded-lg p-3 bg-accent-soft border border-accent/10"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.2 }}
                >
                  <Lightbulb size={13} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-text-secondary text-[13px] leading-relaxed">{issue.suggestion}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
