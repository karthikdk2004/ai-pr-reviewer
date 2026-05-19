import { Trash2, ExternalLink, GitPullRequest, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const VCOL = {
  APPROVE: 'text-emerald-400',
  REQUEST_CHANGES: 'text-red-400',
  COMMENT: 'text-amber-400',
}

const SCORE_COL = (s) => s >= 8 ? 'text-emerald-400' : s >= 5 ? 'text-amber-400' : 'text-red-400'

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ReviewHistory({ reviews, onSelectReview, onDeleteReview }) {
  if (!reviews.length) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-default flex items-center justify-center mb-3">
          <GitPullRequest size={20} className="text-text-tertiary" />
        </div>
        <p className="text-text-secondary text-sm">No reviews yet</p>
        <p className="text-text-tertiary text-xs mt-1">Analyze a PR to get started.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-text-primary font-semibold text-lg">Review History</h2>
        <span className="text-text-tertiary text-xs bg-bg-elevated px-2.5 py-1 rounded-md border border-border-default font-medium">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card overflow-hidden divide-y divide-border-default">
        <AnimatePresence>
          {reviews.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.25 }}
              layout
            >
              <button
                onClick={() => onSelectReview(r)}
                className="w-full text-left px-5 py-4 hover:bg-bg-hover/40 transition-colors flex items-center gap-4 group"
              >
                <GitPullRequest size={14} className="text-text-tertiary shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate group-hover:text-accent transition-colors">
                    {r.pr_title || 'Untitled PR'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-text-tertiary">
                    {r.author_avatar && <img src={r.author_avatar} alt="" className="w-3.5 h-3.5 rounded-full" />}
                    <span>{r.repo}</span>
                    <span className="opacity-30">·</span>
                    <span>{r.pr_author}</span>
                  </div>
                </div>

                <span className={`text-[11px] font-semibold uppercase tracking-wide ${VCOL[r.verdict] || 'text-text-tertiary'}`}>
                  {r.verdict?.replace('_', ' ')}
                </span>

                <span className={`text-sm font-bold font-mono w-10 text-right ${SCORE_COL(r.overall_score)}`}>
                  {r.overall_score?.toFixed(1)}
                </span>

                <span className="text-text-tertiary text-[11px] w-20 text-right">
                  {fmtDate(r.created_at)}
                </span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                  <a
                    href={r.pr_url} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-md text-text-tertiary hover:text-text-primary hover:bg-bg-elevated transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </a>
                  {onDeleteReview && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteReview(r.id) }}
                      className="p-1.5 rounded-md text-text-tertiary hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
