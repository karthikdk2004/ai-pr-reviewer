import { useState, useEffect, useRef } from 'react'
import {
  GitMerge, User, GitBranch, FileCode2, Plus, Clock,
  Shield, Code, Gauge, CheckCircle, Copy, Check, ExternalLink, Zap,
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

function AnimatedCounter({ value, decimals = 0, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    startTime.current = performance.now()
    const target = typeof value === 'number' ? value : 0

    const animate = (now) => {
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(eased * target)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>
}

function ScoreRing({ score }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const pct = score / 10
  const dash = circ * pct
  const color = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444'
  const glowColor = score >= 8 ? 'rgba(34,197,94,0.15)' : score >= 5 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'

  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full animate-glow-pulse"
        style={{ background: glowColor, filter: 'blur(16px)' }}
      />
      <svg width="112" height="112" className="-rotate-90 relative">
        {/* Track */}
        <circle cx="56" cy="56" r={r} fill="none" stroke="#1e1e24" strokeWidth="7" />
        {/* Fill */}
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="7"
          strokeDasharray={animated ? `${dash} ${circ}` : `0 ${circ}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">
          <AnimatedCounter value={score} decimals={1} duration={1200} />
        </span>
        <span className="text-xs text-zinc-500 font-medium">/10</span>
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

  const totalIssues = (review.security_issues?.length || 0) + (review.quality_issues?.length || 0) + (review.performance_issues?.length || 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-slide-up">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <a
            href={review.pr_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-white font-bold text-xl hover:text-accent transition-colors truncate group"
          >
            <span className="gradient-text truncate">{review.pr_title}</span>
            <ExternalLink size={14} className="text-zinc-500 group-hover:text-accent shrink-0 transition-colors" />
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
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        {review.author_avatar && (
          <img
            src={review.author_avatar}
            alt={review.pr_author}
            className="w-6 h-6 rounded-full ring-2 ring-bg-border"
          />
        )}
        <span className="flex items-center gap-1.5"><User size={13} /> {review.pr_author}</span>
        <span className="text-zinc-600">·</span>
        <span className="flex items-center gap-1.5 font-mono text-xs">
          <GitBranch size={13} className="text-accent/60" /> {review.head_branch} → {review.base_branch}
        </span>
        <span className="text-zinc-600">·</span>
        <span className="flex items-center gap-1.5">
          <FileCode2 size={13} /> {review.files_changed} files
        </span>
        <span className="text-emerald-400 font-mono text-xs">+{review.additions}</span>
        <span className="text-red-400 font-mono text-xs">-{review.deletions}</span>
        {review.review_time_seconds && (
          <span className="flex items-center gap-1.5 ml-auto text-zinc-500 bg-bg-elevated px-2.5 py-1 rounded-full text-xs border border-bg-border">
            <Zap size={11} className="text-accent" />
            Analyzed in {review.review_time_seconds}s
          </span>
        )}
      </div>

      {/* Verdict banner */}
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${verdict.className} transition-all duration-300`}>
        <span className={`w-2.5 h-2.5 rounded-full ${verdict.dot} status-pulse`} />
        <span className="font-bold text-base">{verdict.label}</span>
        <span className="text-sm opacity-70 ml-1">— {review.repo}</span>
        <span className="ml-auto text-xs opacity-50 font-mono">
          {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Score + metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-5 flex flex-col items-center justify-center col-span-1">
          <ScoreRing score={review.overall_score || 0} />
          <p className="text-zinc-400 text-xs mt-3 font-semibold uppercase tracking-wider">Overall Score</p>
        </div>

        {[
          { icon: Shield, label: 'Security', count: review.security_issues?.length ?? 0, color: 'text-red-400', bgColor: 'bg-red-500/8', tab: 'security' },
          { icon: Code, label: 'Quality', count: review.quality_issues?.length ?? 0, color: 'text-blue-400', bgColor: 'bg-blue-500/8', tab: 'quality' },
          { icon: Gauge, label: 'Performance', count: review.performance_issues?.length ?? 0, color: 'text-orange-400', bgColor: 'bg-orange-500/8', tab: 'performance' },
          { icon: CheckCircle, label: 'Positives', count: review.positive_aspects?.length ?? 0, color: 'text-emerald-400', bgColor: 'bg-emerald-500/8', tab: 'all' },
        ].map(({ icon: Icon, label, count, color, bgColor, tab }, idx) => (
          <button
            key={label}
            onClick={() => setActiveTab(tab)}
            className={`card p-4 text-left hover:border-accent/30 transition-all duration-300 ${activeTab === tab ? 'border-accent/30 bg-accent/5' : ''}`}
            style={{ animationDelay: `${(idx + 1) * 100}ms` }}
          >
            <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">
              <AnimatedCounter value={count} duration={800 + idx * 100} />
            </p>
            <p className="text-zinc-500 text-xs mt-1 font-medium">{label} {label !== 'Positives' ? 'Issues' : ''}</p>
          </button>
        ))}
      </div>

      {/* Issues tabs */}
      <div>
        <div className="flex gap-1 mb-4 bg-bg-card/80 rounded-lg p-1 w-fit border border-bg-border backdrop-blur">
          {['all', 'security', 'quality', 'performance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-zinc-400 hover:text-white hover:bg-bg-elevated'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredIssues.length === 0 ? (
          <div className="card p-10 text-center text-zinc-500">
            <CheckCircle size={36} className="mx-auto mb-3 text-emerald-400/30" />
            <p className="text-sm font-medium">No issues found in this category.</p>
            <p className="text-xs text-zinc-600 mt-1">The code looks clean here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue, i) => (
              <div key={i} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
                <IssueCard issue={issue} />
              </div>
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
