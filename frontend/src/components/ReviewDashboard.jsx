import { useState } from 'react'
import {
  GitMerge, User, GitBranch, FileCode2, Plus, Clock,
  Shield, Code, Gauge, CheckCircle, Copy, Check, ExternalLink,
} from 'lucide-react'
import IssueCard from './IssueCard'
import SummaryPanel from './SummaryPanel'

const VERDICT_CONFIG = {
  APPROVE: {
    label: 'Approved',
    className: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    dot: 'bg-emerald-400',
  },
  REQUEST_CHANGES: {
    label: 'Changes Requested',
    className: 'bg-red-500/10 border-red-500/30 text-red-400',
    dot: 'bg-red-400',
  },
  COMMENT: {
    label: 'Comment',
    className: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    dot: 'bg-amber-400',
  },
}

function ScoreRing({ score }) {
  const pct = score / 10
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  const color = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1e1e24" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score.toFixed(1)}</span>
        <span className="text-xs text-zinc-500">/10</span>
      </div>
    </div>
  )
}

function copyReview(review) {
  const lines = [
    `# PR Review: ${review.pr_title}`,
    `Author: ${review.pr_author}  |  Score: ${review.overall_score}/10  |  Verdict: ${review.verdict}`,
    '',
    '## Summary',
    review.summary,
    '',
  ]
  if (review.security_issues?.length) {
    lines.push('## Security Issues')
    review.security_issues.forEach(i => {
      lines.push(`- [${i.severity?.toUpperCase()}] ${i.title}: ${i.description}`)
    })
    lines.push('')
  }
  if (review.quality_issues?.length) {
    lines.push('## Quality Issues')
    review.quality_issues.forEach(i => {
      lines.push(`- [${i.severity?.toUpperCase()}] ${i.title}: ${i.description}`)
    })
    lines.push('')
  }
  if (review.performance_issues?.length) {
    lines.push('## Performance Issues')
    review.performance_issues.forEach(i => {
      lines.push(`- [${i.severity?.toUpperCase()}] ${i.title}: ${i.description}`)
    })
  }
  navigator.clipboard.writeText(lines.join('\n'))
}

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const sortBySeverity = (issues) =>
  [...issues].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity?.toLowerCase()] ?? 4) -
      (SEVERITY_ORDER[b.severity?.toLowerCase()] ?? 4)
  )

export default function ReviewDashboard({ review, onNewReview }) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  const verdict = VERDICT_CONFIG[review.verdict] || VERDICT_CONFIG.COMMENT

  const allIssues = [
    ...sortBySeverity(review.security_issues || []),
    ...sortBySeverity(review.quality_issues || []),
    ...sortBySeverity(review.performance_issues || []),
  ]

  const filteredIssues =
    activeTab === 'all' ? allIssues
    : activeTab === 'security' ? sortBySeverity(review.security_issues || [])
    : activeTab === 'quality' ? sortBySeverity(review.quality_issues || [])
    : sortBySeverity(review.performance_issues || [])

  const handleCopy = () => {
    copyReview(review)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-slide-up">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href={review.pr_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-white font-bold text-xl hover:text-accent transition-colors truncate"
          >
            {review.pr_title}
            <ExternalLink size={14} className="text-zinc-500 shrink-0" />
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleCopy} className="btn-secondary text-sm py-2 px-3">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy Review'}
          </button>
          <button onClick={onNewReview} className="btn-primary text-sm py-2 px-3">
            <Plus size={14} />
            New Review
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
        {review.author_avatar && (
          <img
            src={review.author_avatar}
            alt={review.pr_author}
            className="w-5 h-5 rounded-full"
          />
        )}
        <span className="flex items-center gap-1"><User size={13} /> {review.pr_author}</span>
        <span className="flex items-center gap-1 font-mono">
          <GitBranch size={13} /> {review.head_branch} → {review.base_branch}
        </span>
        <span className="flex items-center gap-1">
          <FileCode2 size={13} /> {review.files_changed} files
        </span>
        <span className="text-emerald-400">+{review.additions}</span>
        <span className="text-red-400">-{review.deletions}</span>
        {review.review_time_seconds && (
          <span className="flex items-center gap-1 ml-auto text-zinc-600">
            <Clock size={13} /> {review.review_time_seconds}s
          </span>
        )}
      </div>

      {/* Verdict banner */}
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border ${verdict.className}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${verdict.dot}`} />
        <span className="font-bold text-base">{verdict.label}</span>
        <span className="text-sm opacity-70 ml-1">— {review.repo}</span>
      </div>

      {/* Score + metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-5 flex flex-col items-center justify-center col-span-1">
          <ScoreRing score={review.overall_score || 0} />
          <p className="text-zinc-400 text-xs mt-2 font-medium">Overall Score</p>
        </div>

        {[
          { icon: Shield, label: 'Security', count: review.security_issues?.length ?? 0, color: 'text-red-400', tab: 'security' },
          { icon: Code, label: 'Quality', count: review.quality_issues?.length ?? 0, color: 'text-blue-400', tab: 'quality' },
          { icon: Gauge, label: 'Performance', count: review.performance_issues?.length ?? 0, color: 'text-orange-400', tab: 'performance' },
          { icon: CheckCircle, label: 'Positives', count: review.positive_aspects?.length ?? 0, color: 'text-emerald-400', tab: 'all' },
        ].map(({ icon: Icon, label, count, color, tab }) => (
          <button
            key={label}
            onClick={() => setActiveTab(tab)}
            className={`card p-4 text-left hover:border-accent/30 transition-colors ${activeTab === tab ? 'border-accent/30 bg-accent/5' : ''}`}
          >
            <Icon size={20} className={`${color} mb-2`} />
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-zinc-500 text-xs mt-1">{label} {label !== 'Positives' ? 'Issues' : ''}</p>
          </button>
        ))}
      </div>

      {/* Issues tabs */}
      <div>
        <div className="flex gap-1 mb-4 bg-bg-card rounded-lg p-1 w-fit border border-bg-border">
          {['all', 'security', 'quality', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-accent text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="card p-8 text-center text-zinc-500">
            <CheckCircle size={32} className="mx-auto mb-3 text-emerald-400/40" />
            <p className="text-sm">No issues found in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <SummaryPanel
        summary={review.summary}
        positiveAspects={review.positive_aspects || []}
      />
    </div>
  )
}
