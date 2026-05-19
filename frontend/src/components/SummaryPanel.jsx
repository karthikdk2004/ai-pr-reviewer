import { CheckCircle, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SummaryPanel({ summary, positiveAspects = [] }) {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageSquare size={14} className="text-text-tertiary" />
          Summary
        </h3>
        <p className="text-text-secondary text-sm leading-[1.7] whitespace-pre-wrap">
          {summary || 'No summary available.'}
        </p>
      </div>

      {positiveAspects.length > 0 && (
        <div className="card p-5">
          <h3 className="text-text-primary text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle size={14} className="text-emerald-400" />
            What looks good
          </h3>
          <ul className="space-y-2">
            {positiveAspects.map((aspect, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2 text-sm text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-emerald-400/60 mt-1.5 shrink-0">·</span>
                <span className="leading-relaxed">{aspect}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
