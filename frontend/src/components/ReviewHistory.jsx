import { Trash2, ExternalLink, GitPullRequest, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const VERDICT_BADGE = {
  APPROVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  REQUEST_CHANGES: 'bg-red-500/15 text-red-400 border-red-500/30',
  COMMENT: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

function ScoreDot({ score }) {
  const color = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400'
  return <span className={`font-bold font-mono ${color}`}>{score?.toFixed(1)}</span>
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.25 },
  },
}

export default function ReviewHistory({ reviews, onSelectReview, onDeleteReview }) {
  if (!reviews.length) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-72 text-zinc-500"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-bg-border flex items-center justify-center mb-4">
          <GitPullRequest size={28} className="text-zinc-600" />
        </div>
        <p className="text-sm font-medium text-zinc-400">No reviews yet</p>
        <p className="text-xs text-zinc-600 mt-1">Analyze a PR to get started</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="max-w-5xl mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-xl">Review History</h2>
        </div>
        <span className="text-zinc-500 text-sm bg-bg-elevated px-3 py-1 rounded-full border border-bg-border font-medium">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bg-border text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-5 py-3.5 font-semibold">PR Title</th>
              <th className="text-left px-5 py-3.5 font-semibold">Author</th>
              <th className="text-left px-5 py-3.5 font-semibold">Verdict</th>
              <th className="text-left px-5 py-3.5 font-semibold">Score</th>
              <th className="text-left px-5 py-3.5 font-semibold">Files</th>
              <th className="text-left px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            <AnimatePresence>
              {reviews.map((review, idx) => (
                <motion.tr
                  key={review.id}
                  custom={idx}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="hover:bg-accent/[0.03] transition-colors duration-200 group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onSelectReview(review)}
                      className="flex items-center gap-2.5 text-white hover:text-accent transition-colors text-sm font-medium text-left max-w-xs truncate group/title"
                    >
                      <GitPullRequest size={14} className="shrink-0 text-zinc-500 group-hover/title:text-accent transition-colors" />
                      <span className="truncate">{review.pr_title || 'Untitled PR'}</span>
                    </button>
                    {review.repo && (
                      <span className="text-xs text-zinc-600 pl-6 font-mono">{review.repo}</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {review.author_avatar && (
                        <img src={review.author_avatar} alt="" className="w-5 h-5 rounded-full ring-1 ring-bg-border" />
                      )}
                      <span className="text-zinc-300 text-sm">{review.pr_author || '—'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        VERDICT_BADGE[review.verdict] || VERDICT_BADGE.COMMENT
                      }`}
                    >
                      {review.verdict?.replace('_', ' ') || 'COMMENT'}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <ScoreDot score={review.overall_score} />
                    <span className="text-zinc-600 text-xs">/10</span>
                  </td>

                  <td className="px-5 py-4 text-zinc-400 text-sm font-mono">
                    {review.files_changed ?? '—'}
                  </td>

                  <td className="px-5 py-4 text-zinc-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-zinc-600" />
                      {fmtDate(review.created_at)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <a
                        href={review.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-bg-border rounded-md text-zinc-500 hover:text-white transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={13} />
                      </a>
                      {onDeleteReview && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onDeleteReview(review.id) }}
                          className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
