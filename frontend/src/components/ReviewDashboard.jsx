import { useState, useEffect, useRef } from 'react'
import {
  User, GitBranch, FileCode2, Plus, Clock,
  Shield, Code, Gauge, CheckCircle, Copy, Check, ExternalLink, Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import IssueCard from './IssueCard'
import SummaryPanel from './SummaryPanel'

const VERDICT = {
  APPROVE: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  REQUEST_CHANGES: { label: 'Changes Requested', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-400' },
  COMMENT: { label: 'Comment', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
}

function Counter({ value, decimals = 0, duration = 800 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const target = typeof value === 'number' ? value : 0
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      setVal((1 - Math.pow(1 - p, 3)) * target)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return <>{decimals > 0 ? val.toFixed(decimals) : Math.round(val)}</>
}

function ScoreRing({ score }) {
  const r = 38, circ = 2 * Math.PI * r
  const dash = circ * (score / 10)
  const color = score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      className="relative flex items-center justify-center w-28 h-28"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#191a1f" strokeWidth="6" />
        <motion.circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ filter: `drop-shadow(0 0 4px ${color}40)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary">
          <Counter value={score} decimals={1} duration={1200} />
        </span>
        <span className="text-[10px] text-text-tertiary font-medium">/10</span>
      </div>
    </motion.div>
  )
}

function copyReview(r) {
  const lines = [`# PR Review: ${r.pr_title}`, `Score: ${r.overall_score}/10 | Verdict: ${r.verdict}`, '', '## Summary', r.summary, '']
  const add = (t, arr) => { if (arr?.length) { lines.push(`## ${t}`); arr.forEach(i => lines.push(`- [${i.severity?.toUpperCase()}] ${i.title}: ${i.description}`)); lines.push('') } }
  add('Security', r.security_issues); add('Quality', r.quality_issues); add('Performance', r.performance_issues)
  navigator.clipboard.writeText(lines.join('\n'))
}

const SEV = { critical: 0, high: 1, medium: 2, low: 3 }
const sortIssues = (arr) => [...arr].sort((a, b) => (SEV[a.severity?.toLowerCase()] ?? 4) - (SEV[b.severity?.toLowerCase()] ?? 4))

export default function ReviewDashboard({ review, onNewReview }) {
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('all')

  const v = VERDICT[review.verdict] || VERDICT.COMMENT
  const issueMap = {
    all: [...sortIssues(review.security_issues || []), ...sortIssues(review.quality_issues || []), ...sortIssues(review.performance_issues || [])],
    security: sortIssues(review.security_issues || []),
    quality: sortIssues(review.quality_issues || []),
    performance: sortIssues(review.performance_issues || []),
    positives: (review.positive_aspects || []).map((text, i) => ({ title: text, severity: 'positive', category: 'positive', id: `pos-${i}` })),
  }
  const list = issueMap[tab]
  const total = issueMap.all.length

  const handleCopy = () => { copyReview(review); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const metrics = [
    { icon: Shield, label: 'Security', count: review.security_issues?.length ?? 0, key: 'security', accent: 'text-red-400', bg: 'bg-red-500/8' },
    { icon: Code, label: 'Quality', count: review.quality_issues?.length ?? 0, key: 'quality', accent: 'text-blue-400', bg: 'bg-blue-500/8' },
    { icon: Gauge, label: 'Performance', count: review.performance_issues?.length ?? 0, key: 'performance', accent: 'text-orange-400', bg: 'bg-orange-500/8' },
    { icon: CheckCircle, label: 'Positives', count: review.positive_aspects?.length ?? 0, key: 'positives', accent: 'text-emerald-400', bg: 'bg-emerald-500/8' },
  ]

  return (
    <motion.div
      className="max-w-4xl mx-auto pb-12 space-y-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${v.color} ${v.bg} ${v.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${v.dot} status-dot-active`} />
              {v.label}
            </div>
            {review.review_time_seconds && (
              <span className="text-[11px] text-text-tertiary font-mono flex items-center gap-1">
                <Zap size={10} /> {review.review_time_seconds}s
              </span>
            )}
          </div>
          <a
            href={review.pr_url} target="_blank" rel="noreferrer"
            className="text-text-primary font-semibold text-lg hover:text-accent transition-colors inline-flex items-center gap-2 group"
          >
            {review.pr_title}
            <ExternalLink size={13} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <div className="flex items-center gap-2 mt-1 text-[12px] text-text-tertiary flex-wrap">
            {review.author_avatar && <img src={review.author_avatar} alt="" className="w-4 h-4 rounded-full" />}
            <span className="text-text-secondary">{review.pr_author}</span>
            <span className="opacity-30">·</span>
            <span className="font-mono">{review.repo}</span>
            <span className="opacity-30">·</span>
            <GitBranch size={11} />
            <span className="font-mono">{review.head_branch}</span>
            <span className="opacity-30">→</span>
            <span className="font-mono">{review.base_branch}</span>
            <span className="opacity-30">·</span>
            <span>{review.files_changed} files</span>
            <span className="text-emerald-400/80">+{review.additions}</span>
            <span className="text-red-400/80">-{review.deletions}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          <motion.button onClick={handleCopy} className="btn-secondary text-xs" whileTap={{ scale: 0.95 }}>
            {copied ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Copy size={12} /> Copy</>}
          </motion.button>
          <motion.button onClick={onNewReview} className="btn-primary text-xs py-2 px-3" whileTap={{ scale: 0.95 }}>
            <Plus size={13} /> New
          </motion.button>
        </div>
      </div>

      {/* Score + Metrics */}
      <div className="grid grid-cols-5 gap-3">
        <motion.div
          className="card p-4 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <ScoreRing score={review.overall_score || 0} />
          <p className="text-text-tertiary text-[10px] mt-1.5 font-medium uppercase tracking-wider">Score</p>
        </motion.div>

        {metrics.map(({ icon: Icon, label, count, key, accent, bg }, idx) => (
          <motion.button
            key={label}
            onClick={() => setTab(key)}
            className={`card card-interactive p-4 text-left ${tab === key ? 'border-accent/25' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.06 }}
            whileHover={{ y: -2 }}
          >
            <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center mb-2.5`}>
              <Icon size={14} className={accent} />
            </div>
            <p className="text-xl font-bold text-text-primary"><Counter value={count} duration={600 + idx * 100} /></p>
            <p className="text-text-tertiary text-[11px] mt-0.5 font-medium">{label}</p>
          </motion.button>
        ))}
      </div>

      {/* Tab bar + Issues */}
      <div>
        <div className="flex gap-0 border-b border-border-default mb-4">
          {['all', 'security', 'quality', 'performance', 'positives'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[13px] font-medium capitalize transition-colors relative ${
                tab === t ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {t === 'all' ? `All (${total})` : t.charAt(0).toUpperCase() + t.slice(1)}
              {tab === t && (
                <motion.div
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent rounded-full"
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'positives' ? (
              <div className="space-y-2">
                {list.map((item, i) => (
                  <motion.div
                    key={i}
                    className="card px-4 py-3.5 flex items-start gap-3 border-l-2 border-l-emerald-500/60"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                  >
                    <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-text-secondary text-[13px] leading-relaxed">{item.title}</span>
                  </motion.div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400/30" />
                <p className="text-text-secondary text-sm">No issues found</p>
                <p className="text-text-tertiary text-xs mt-0.5">This category looks clean.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {list.map((issue, i) => (
                  <motion.div
                    key={`${tab}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
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
