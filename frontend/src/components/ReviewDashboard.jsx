import { useState, useEffect, useRef } from 'react'
import {
  User, GitBranch, FileCode2, Plus,
  Shield, Code, Gauge, CheckCircle, Copy, Check, ExternalLink, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import IssueCard from './IssueCard'
import SummaryPanel from './SummaryPanel'

const VERDICT_CONFIG = {
  APPROVE: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  REQUEST_CHANGES: { label: 'Changes Requested', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  COMMENT: { label: 'Comment', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
}

function AnimatedCounter({ value, decimals = 0, duration = 600 }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const target = typeof value === 'number' ? value : 0
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setDisplay((1 - Math.pow(1 - p, 3)) * target)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}</>
}

function ScoreRing({ score }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = circ * (score / 10)
  const color = score >= 8 ? '#22c55e' : score >= 5 ? '#eab308' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg width="96" height="96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#1c1c22" strokeWidth="6" />
        <motion.circle
          cx="48" cy="48" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-text-primary">
          <AnimatedCounter value={score} decimals={1} duration={1000} />
        </span>
        <span className="text-[10px] text-text-tertiary">/10</span>
      </div>
    </div>
  )
}

function copyReview(review) {
  const lines = [
    `# PR Review: ${review.pr_title}`,
    `Author: ${review.pr_author} | Score: ${review.overall_score}/10 | Verdict: ${review.verdict}`,
    '', '## Summary', review.summary, '',
  ]
  const addIssues = (title, issues) => {
    if (issues?.length) {
      lines.push(`## ${title}`)
      issues.forEach(i => lines.push(`- [${i.severity?.toUpperCase()}] ${i.title}: ${i.description}`))
      lines.push('')
    }
  }
  addIssues('Security Issues', review.security_issues)
  addIssues('Quality Issues', review.quality_issues)
  addIssues('Performance Issues', review.performance_issues)
  navigator.clipboard.writeText(lines.join('\n'))
}

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }
const sortBySev = (arr) => [...arr].sort((a, b) => (SEV_ORDER[a.severity?.toLowerCase()] ?? 4) - (SEV_ORDER[b.severity?.toLowerCase()] ?? 4))

export default function ReviewDashboard({ review, onNewReview }) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('all')

  const v = VERDICT_CONFIG[review.verdict] || VERDICT_CONFIG.COMMENT
  const issues = {
    all: [...sortBySev(review.security_issues || []), ...sortBySev(review.quality_issues || []), ...sortBySev(review.performance_issues || [])],
    security: sortBySev(review.security_issues || []),
    quality: sortBySev(review.quality_issues || []),
    performance: sortBySev(review.performance_issues || []),
  }
  const filtered = issues[tab]
  const total = issues.all.length

  const handleCopy = () => { copyReview(review); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <motion.div
      className="max-w-4xl mx-auto pb-12 space-y-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <a
            href={review.pr_url}
            target="_blank"
            rel="noreferrer"
            className="text-text-primary font-semibold text-lg hover:text-accent transition-colors inline-flex items-center gap-2 group"
          >
            {review.pr_title}
            <ExternalLink size={13} className="text-text-tertiary group-hover:text-accent" />
          </a>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-text-tertiary flex-wrap">
            {review.author_avatar && (
              <img src={review.author_avatar} alt="" className="w-4 h-4 rounded-full" />
            )}
            <span>{review.pr_author}</span>
            <span>·</span>
            <span className="font-mono">{review.head_branch} → {review.base_branch}</span>
            <span>·</span>
            <span>{review.files_changed} files</span>
            <span className="text-emerald-400">+{review.additions}</span>
            <span className="text-red-400">-{review.deletions}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleCopy} className="btn-secondary text-xs">
            {copied ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <button onClick={onNewReview} className="btn-primary text-xs py-2">
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* Verdict + Score */}
      <div className="flex items-center gap-6">
        <div className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${v.color} ${v.bg} ${v.border}`}>
          {v.label}
        </div>
        {review.review_time_seconds && (
          <span className="text-xs text-text-tertiary font-mono">
            {review.review_time_seconds}s
          </span>
        )}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-5 gap-3">
        <div className="card p-4 flex flex-col items-center justify-center">
          <ScoreRing score={review.overall_score || 0} />
          <p className="text-text-tertiary text-[10px] mt-2 font-medium uppercase tracking-wider">Score</p>
        </div>
        {[
          { icon: Shield, label: 'Security', count: review.security_issues?.length ?? 0, key: 'security' },
          { icon: Code, label: 'Quality', count: review.quality_issues?.length ?? 0, key: 'quality' },
          { icon: Gauge, label: 'Performance', count: review.performance_issues?.length ?? 0, key: 'performance' },
          { icon: CheckCircle, label: 'Positives', count: review.positive_aspects?.length ?? 0, key: 'all' },
        ].map(({ icon: Icon, label, count, key }) => (
          <button
            key={label}
            onClick={() => setTab(key)}
            className={`card p-4 text-left transition-colors ${tab === key ? 'border-accent/30' : ''}`}
          >
            <Icon size={14} className="text-text-tertiary mb-2" />
            <p className="text-xl font-semibold text-text-primary"><AnimatedCounter value={count} /></p>
            <p className="text-text-tertiary text-[11px] mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Tabs + Issues */}
      <div>
        <div className="flex gap-px mb-4 border-b border-border">
          {['all', 'security', 'quality', 'performance'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium capitalize transition-colors relative ${
                tab === t ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {t === 'all' ? `All (${total})` : t}
              {tab === t && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                  layoutId="tab-underline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-text-tertiary text-sm">
                No issues found in this category.
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((issue, i) => (
                  <motion.div
                    key={`${tab}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <IssueCard issue={issue} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Summary */}
      <SummaryPanel summary={review.summary} positiveAspects={review.positive_aspects || []} />
    </motion.div>
  )
}
