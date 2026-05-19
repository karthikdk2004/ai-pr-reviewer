import { Shield, Code, Gauge, FileCode, Lightbulb, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
}

export default function IssueCard({ issue }) {
  const [expanded, setExpanded] = useState(false)

  const sev = (issue.severity || 'low').toLowerCase()
  const cat = (issue.category || 'quality').toLowerCase()
  const sevConfig = SEVERITY_CONFIG[sev] || SEVERITY_CONFIG.low
  const CategoryIcon = CATEGORY_ICONS[cat] || Code
  const borderClass = BORDER_COLORS[sev] || BORDER_COLORS.low

  return (
    <motion.div
      className={`card border-l-2 overflow-hidden ${borderClass}`}
      layout
      whileHover={{ borderColor: 'rgba(99, 102, 241, 0.15)' }}
      transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
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
        <motion.div
          className="shrink-0 mt-0.5"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ChevronDown size={14} className="text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-3 border-t border-bg-border">
              <motion.p
                className="text-zinc-300 text-sm leading-relaxed pt-3"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                {issue.description}
              </motion.p>

              {issue.suggestion && (
                <motion.div
                  className="bg-accent/5 border border-accent/15 rounded-lg p-3.5 flex gap-2.5 group/suggestion hover:bg-accent/8 transition-colors duration-200"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <Lightbulb size={14} className="text-accent shrink-0 mt-0.5" />
                  <p className="text-zinc-300 text-sm leading-relaxed">{issue.suggestion}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
