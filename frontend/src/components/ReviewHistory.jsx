import { Trash2, ExternalLink, GitPullRequest, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const VERDICT_COLOR = {
  APPROVE: 'text-emerald-400',
  REQUEST_CHANGES: 'text-red-400',
  COMMENT: 'text-amber-400',
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function ReviewHistory({ reviews, onSelectReview, onDeleteReview }) {
  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
        <p className="text-sm">No reviews yet</p>
        <p className="text-xs mt-1">Analyze a PR to get started.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-text-primary font-semibold text-lg">Reviews</h2>
        <span className="text-text-tertiary text-xs">{reviews.length} total</span>
      </div>

      <div className="space-y-1">
        {reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.04 }}
          >
            <button
              onClick={() => onSelectReview(review)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-bg-hover/50 transition-colors flex items-center gap-4 group"
            >
              <GitPullRequest size={14} className="text-text-tertiary shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-sm truncate group-hover:text-accent transition-colors">
                  {review.pr_title || 'Untitled PR'}
                </p>
                <p className="text-text-tertiary text-[11px] font-mono mt-0.5">
                  {review.repo} · {review.pr_author}
                </p>
              </div>

              <span className={`text-xs font-medium ${VERDICT_COLOR[review.verdict] || 'text-text-tertiary'}`}>
                {review.verdict?.replace('_', ' ')}
              </span>

              <span className="text-text-primary text-sm font-mono w-10 text-right">
                {review.overall_score?.toFixed(1)}
              </span>

              <span className="text-text-tertiary text-xs w-16 text-right">
                {fmtDate(review.created_at)}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={review.pr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded text-text-tertiary hover:text-text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={12} />
                </a>
                {onDeleteReview && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteReview(review.id) }}
                    className="p-1 rounded text-text-tertiary hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
