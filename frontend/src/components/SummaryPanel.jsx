import { CheckCircle, MessageSquare, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function SummaryPanel({ summary, positiveAspects = [] }) {
  return (
    <div className="space-y-4">
      {/* Summary text */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <MessageSquare size={14} className="text-accent" />
          </div>
          <h3 className="text-white font-semibold">Review Summary</h3>
        </div>
        <p className="text-zinc-300 text-sm leading-[1.8] whitespace-pre-wrap">
          {summary || 'No summary available.'}
        </p>
      </motion.div>

      {/* Positive aspects */}
      {positiveAspects.length > 0 && (
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Sparkles size={14} className="text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold">Positive Aspects</h3>
            <span className="ml-auto text-xs text-zinc-500 bg-emerald-500/8 border border-emerald-500/15 px-2.5 py-0.5 rounded-full font-medium">
              {positiveAspects.length} found
            </span>
          </div>
          <motion.ul
            className="space-y-2.5"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {positiveAspects.map((aspect, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2.5 text-sm text-zinc-300"
                variants={listItemVariants}
              >
                <CheckCircle size={14} className="text-emerald-400/80 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{aspect}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </div>
  )
}
