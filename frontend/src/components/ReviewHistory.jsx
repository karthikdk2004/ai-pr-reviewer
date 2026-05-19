import { Trash2, ExternalLink, GitPullRequest, Clock } from 'lucide-react'

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

export default function ReviewHistory({ reviews, onSelectReview, onDeleteReview }) {
  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-zinc-500 animate-fade-in">
        <GitPullRequest size={40} className="mb-3 opacity-30" />
        <p className="text-sm">No reviews yet. Analyze a PR to get started.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-xl">Review History</h2>
        <span className="text-zinc-500 text-sm">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bg-border text-xs text-zinc-500 uppercase tracking-wider">
              <th className="text-left px-5 py-3 font-medium">PR Title</th>
              <th className="text-left px-5 py-3 font-medium">Author</th>
              <th className="text-left px-5 py-3 font-medium">Verdict</th>
              <th className="text-left px-5 py-3 font-medium">Score</th>
              <th className="text-left px-5 py-3 font-medium">Files</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {reviews.map((review) => (
              <tr
                key={review.id}
                className="hover:bg-bg-elevated/50 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => onSelectReview(review)}
                    className="flex items-center gap-2 text-white hover:text-accent transition-colors text-sm font-medium text-left max-w-xs truncate"
                  >
                    <GitPullRequest size={14} className="shrink-0 text-zinc-500" />
                    <span className="truncate">{review.pr_title || 'Untitled PR'}</span>
                  </button>
                  {review.repo && (
                    <span className="text-xs text-zinc-600 pl-5 font-mono">{review.repo}</span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {review.author_avatar && (
                      <img src={review.author_avatar} alt="" className="w-5 h-5 rounded-full" />
                    )}
                    <span className="text-zinc-300 text-sm">{review.pr_author || '—'}</span>
                  </div>
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      VERDICT_BADGE[review.verdict] || VERDICT_BADGE.COMMENT
                    }`}
                  >
                    {review.verdict?.replace('_', ' ') || 'COMMENT'}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <ScoreDot score={review.overall_score} />
                  <span className="text-zinc-600 text-xs">/10</span>
                </td>

                <td className="px-5 py-3.5 text-zinc-400 text-sm font-mono">
                  {review.files_changed ?? '—'}
                </td>

                <td className="px-5 py-3.5 text-zinc-500 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {fmtDate(review.created_at)}
                  </div>
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={review.pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 hover:bg-bg-border rounded-md text-zinc-500 hover:text-white transition-colors"
                    >
                      <ExternalLink size={13} />
                    </a>
                    {onDeleteReview && (
                      <button
                        onClick={() => onDeleteReview(review.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
