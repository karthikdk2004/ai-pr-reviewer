import { CheckCircle, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SummaryPanel({ summary, positiveAspects = [] }) {
  return (
    <div className="space-y-4">
      <motion.div
        className="card p-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-md bg-accent-soft flex items-center justify-center">
            <MessageSquare size={12} className="text-accent" />
          </div>
          <h3 className="text-text-primary text-sm font-semibold">Review Summary</h3>
        </div>
        <p className="text-text-secondary text-[13px] leading-[1.75] whitespace-pre-wrap">
          {summary || 'No summary available.'}
        </p>
      </motion.div>

      {positiveAspects.length > 0 && (
        <motion.div
          className="card p-5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle size={12} className="text-emerald-400" />
            </div>
            <h3 className="text-text-primary text-sm font-semibold">What's Good</h3>
            <span className="ml-auto text-[11px] text-text-tertiary">{positiveAspects.length} items</span>
          </div>
          <ul className="space-y-2">
            {positiveAspects.map((aspect, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2.5 text-[13px] text-text-secondary"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05, duration: 0.25 }}
              >
                <CheckCircle size={12} className="text-emerald-400/50 shrink-0 mt-1" />
                <span className="leading-relaxed">{aspect}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
