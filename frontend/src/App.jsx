import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import PRInput from './components/PRInput'
import ReviewDashboard from './components/ReviewDashboard'
import ReviewHistory from './components/ReviewHistory'
import {
  GitBranch, Shield, Code, Gauge, Zap,
  Server, ExternalLink, Github, CheckCircle,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_REVIEW = {
  id: 'demo-1',
  pr_url: 'https://github.com/facebook/react/pull/31373',
  pr_title: 'Add useOptimistic hook and concurrent features',
  pr_author: 'acdlite',
  author_avatar: 'https://avatars.githubusercontent.com/u/3624098?v=4',
  repo: 'facebook/react',
  base_branch: 'main',
  head_branch: 'feature/use-optimistic',
  files_changed: 12,
  additions: 487,
  deletions: 63,
  verdict: 'REQUEST_CHANGES',
  overall_score: 6.8,
  summary:
    'This PR introduces the useOptimistic hook and several concurrent rendering improvements. The implementation is well-structured and follows React\'s existing patterns. However, there are a few security considerations around unvalidated state mutations and some performance concerns with the synchronization mechanism.\n\nThe code quality is generally high with good TypeScript types, but a few functions exceed recommended complexity thresholds. The test coverage looks adequate for the new hook, though edge cases around concurrent mode could benefit from additional tests.',
  security_issues: [
    {
      severity: 'high', category: 'security',
      title: 'Unvalidated State Update in useOptimistic',
      description: 'The optimistic state update does not validate the shape of the incoming data, which could lead to unexpected state mutations if an attacker controls the update function.',
      file: 'packages/react/src/ReactHooks.js', line: '142-158',
      suggestion: 'Add runtime validation or TypeScript generics to enforce the expected state shape before applying optimistic updates.',
    },
    {
      severity: 'medium', category: 'security',
      title: 'Missing Sanitization in Error Boundary Message',
      description: 'Error messages from failed optimistic updates are rendered directly without sanitization.',
      file: 'packages/react-dom/src/client/ReactDOMRoot.js', line: '89',
      suggestion: 'Sanitize error messages before displaying them, or use a generic error message in production builds.',
    },
  ],
  quality_issues: [
    {
      severity: 'medium', category: 'quality',
      title: 'High Cyclomatic Complexity in reconcileOptimisticQueue',
      description: 'The reconcileOptimisticQueue function has a cyclomatic complexity of 18, making it difficult to test and maintain.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js', line: '1847-1923',
      suggestion: 'Extract the nested conditional branches into well-named helper functions to reduce complexity below 10.',
    },
    {
      severity: 'low', category: 'quality',
      title: 'Inconsistent Naming Convention',
      description: 'Some internal variables use camelCase while others use underscore-prefixed names for the same type of temporary variables.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js', line: '1901',
      suggestion: 'Standardize on camelCase for all internal variables as per the codebase convention.',
    },
  ],
  performance_issues: [
    {
      severity: 'high', category: 'performance',
      title: 'Unnecessary Re-render on Every State Update',
      description: 'The optimistic state queue is traversed on every render even when no optimistic updates are pending, adding O(n) overhead.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js', line: '1789',
      suggestion: 'Add an early return when the optimistic queue is empty to skip the traversal cost.',
    },
    {
      severity: 'low', category: 'performance',
      title: 'Missing Memoization for Derived State',
      description: 'The merged state calculation inside useOptimistic is recomputed on every render without memoization.',
      file: 'packages/react/src/ReactHooks.js', line: '165',
      suggestion: 'Use useMemo or a ref to cache the merged state calculation.',
    },
  ],
  positive_aspects: [
    'Excellent TypeScript type definitions for the new hook API',
    'Comprehensive test suite covering the happy path scenarios',
    'Good use of existing React patterns and internal APIs',
    'Clear and informative JSDoc comments on public API',
    'Proper cleanup of optimistic state on component unmount',
  ],
  review_time_seconds: 8.3,
  created_at: new Date().toISOString(),
}

const MOCK_REVIEW_2 = {
  id: 'demo-2',
  pr_url: 'https://github.com/vercel/next.js/pull/65798',
  pr_title: 'fix: resolve hydration mismatch in Suspense boundaries',
  pr_author: 'timneutkens',
  author_avatar: 'https://avatars.githubusercontent.com/u/6324199?v=4',
  repo: 'vercel/next.js',
  base_branch: 'canary',
  head_branch: 'fix/hydration-suspense',
  files_changed: 5,
  additions: 89,
  deletions: 34,
  verdict: 'APPROVE',
  overall_score: 8.9,
  summary: 'This is a clean, targeted fix for hydration mismatches in Suspense boundaries. The implementation correctly identifies the root cause and applies a minimal, well-tested solution.',
  security_issues: [],
  quality_issues: [
    {
      severity: 'low', category: 'quality',
      title: 'Missing Changelog Entry',
      description: 'Bug fixes of this nature should have a corresponding CHANGELOG.md entry.',
      file: 'CHANGELOG.md', line: 'N/A',
      suggestion: 'Add an entry under the "Bug Fixes" section.',
    },
  ],
  performance_issues: [],
  positive_aspects: [
    'Minimal, targeted fix with no unnecessary changes',
    'Comprehensive test cases including regression tests',
    'Clear commit message explaining the root cause',
    'Backward compatible — no public API changes',
  ],
  review_time_seconds: 4.1,
  created_at: new Date(Date.now() - 86400000).toISOString(),
}

// ── Settings ─────────────────────────────────────────────────────────────────
const PIPELINE = [
  { label: 'fetch_node', desc: 'GitHub API → PR metadata + diff', icon: GitBranch },
  { label: 'security_node', desc: 'Groq LLM → security issues', icon: Shield },
  { label: 'quality_node', desc: 'Groq LLM → quality issues', icon: Code },
  { label: 'performance_node', desc: 'Groq LLM → performance issues', icon: Gauge },
  { label: 'summary_node', desc: 'Groq LLM → verdict + score', icon: Zap },
]

function SettingsPage() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.ok ? r.json() : null)
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  const STATUS = [
    { label: 'Backend API', ok: !!health, desc: health ? 'Healthy' : 'Unreachable' },
    { label: 'Groq API Key', ok: health?.groq_configured, desc: health?.groq_configured ? 'Configured' : 'Missing' },
    { label: 'GitHub Token', ok: health?.github_token, desc: health?.github_token ? 'Set' : 'Optional' },
  ]

  const TECH = ['LangGraph', 'Groq', 'llama-3.3-70b', 'FastAPI', 'React 18', 'Framer Motion', 'Vite', 'Tailwind CSS']

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-5 pb-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h2 className="text-text-primary font-semibold text-lg">Settings</h2>

      {/* Status */}
      <div className="card p-5">
        <h3 className="text-text-primary text-[13px] font-semibold mb-4">System Status</h3>
        <div className="space-y-3">
          {STATUS.map(({ label, ok, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${ok ? 'bg-emerald-400 status-dot-active' : 'bg-text-tertiary'}`} />
              <span className="text-text-primary text-sm flex-1">{label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                ok ? 'text-emerald-400 bg-emerald-500/10' : 'text-text-tertiary bg-bg-elevated'
              }`}>
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="card p-5">
        <h3 className="text-text-primary text-[13px] font-semibold mb-4">Configuration</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'API Endpoint', value: API_URL },
            { label: 'LLM Model', value: 'llama-3.3-70b-versatile' },
            { label: 'Provider', value: 'Groq (ultra-fast inference)' },
            { label: 'Orchestrator', value: 'LangGraph state machine' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <span className="text-text-secondary">{label}</span>
              <span className="text-text-tertiary font-mono text-xs bg-bg-elevated px-2 py-0.5 rounded">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Architecture */}
      <div className="card p-5">
        <h3 className="text-text-primary text-[13px] font-semibold mb-4">Pipeline Architecture</h3>
        <div className="space-y-0">
          {PIPELINE.map((node, i) => {
            const Icon = node.icon
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <div className="flex items-center gap-3 py-2.5 group">
                  <span className="text-[10px] text-text-tertiary font-mono w-3 shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-md bg-accent-soft border border-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary text-[13px] font-mono">{node.label}</span>
                    <span className="text-text-tertiary text-xs ml-3">{node.desc}</span>
                  </div>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="ml-[22px] w-px h-2.5 bg-border-default" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="card p-5">
        <h3 className="text-text-primary text-[13px] font-semibold mb-4">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {TECH.map((t, i) => (
            <motion.span
              key={t}
              className="tech-badge cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ borderColor: 'rgba(99,102,241,0.2)' }}
            >
              {t}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="card p-5">
        <h3 className="text-text-primary text-[13px] font-semibold mb-4">Links</h3>
        <div className="space-y-1">
          {[
            { href: 'https://github.com/karthikdk2004/ai-pr-reviewer', icon: Github, label: 'Source Code', desc: 'GitHub' },
            { href: 'https://ai-pr-reviewer-eta.vercel.app', icon: Server, label: 'Live Demo', desc: 'Vercel' },
          ].map(({ href, icon: LinkIcon, label, desc }) => (
            <a
              key={href}
              href={href} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg hover:bg-bg-hover/40 transition-colors group"
            >
              <LinkIcon size={14} className="text-text-tertiary group-hover:text-text-secondary transition-colors" />
              <div className="flex-1">
                <span className="text-text-primary text-sm group-hover:text-accent transition-colors">{label}</span>
                <span className="text-text-tertiary text-xs ml-2">{desc}</span>
              </div>
              <ExternalLink size={11} className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-bg-base">
          <div className="card p-8 max-w-md text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield size={20} className="text-red-400" />
            </div>
            <h2 className="text-text-primary text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-text-tertiary text-sm mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()} className="btn-primary text-sm">
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('input')
  const [currentReview, setCurrentReview] = useState(null)
  const [reviewHistory, setReviewHistory] = useState([MOCK_REVIEW, MOCK_REVIEW_2])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingNode, setLoadingNode] = useState(0)
  const [error, setError] = useState(null)
  const nodeTimer = useRef(null)

  useEffect(() => {
    fetch(`${API_URL}/reviews`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.length) setReviewHistory(data) })
      .catch(() => {})
  }, [])

  const analyzePR = async (prUrl) => {
    setIsLoading(true)
    setLoadingNode(0)

    let node = 0
    nodeTimer.current = setInterval(() => {
      node = Math.min(node + 1, 4)
      setLoadingNode(node)
    }, 2200)

    try {
      const res = await fetch(`${API_URL}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pr_url: prUrl }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`)
      const review = await res.json()
      setCurrentReview(review)
      setReviewHistory(prev => [review, ...prev.filter(r => r.id !== review.id).slice(0, 49)])
      setView('review')
    } catch (err) {
      console.warn('API error:', err.message)
      setError(err.message || 'Failed to analyze PR. Please check the URL and try again.')
      setTimeout(() => setError(null), 6000)
    } finally {
      clearInterval(nodeTimer.current)
      setIsLoading(false)
      setLoadingNode(0)
    }
  }

  return (
    <ErrorBoundary>
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden relative">
      <Sidebar
        currentView={view}
        onNavigate={(v) => { setView(v); if (v === 'input') setCurrentReview(null) }}
        reviewCount={reviewHistory.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6 pt-16 md:pt-6">
          <AnimatePresence>
            {error && (
              <motion.div
                className="fixed top-4 right-4 z-50 max-w-sm"
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="card border-red-500/30 bg-bg-surface/95 backdrop-blur-sm p-4 shadow-lg shadow-red-500/5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
                      <Shield size={12} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-primary text-sm font-medium mb-0.5">Analysis Failed</p>
                      <p className="text-text-tertiary text-xs leading-relaxed">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-text-tertiary hover:text-text-primary transition-colors text-xs shrink-0 mt-0.5">✕</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {view === 'input' && <PRInput onAnalyze={analyzePR} isLoading={isLoading} loadingNode={loadingNode} />}
          {view === 'review' && currentReview && <ReviewDashboard review={currentReview} onNewReview={() => setView('input')} />}
          {view === 'review' && !currentReview && <PRInput onAnalyze={analyzePR} isLoading={isLoading} loadingNode={loadingNode} />}
          {view === 'history' && <ReviewHistory reviews={reviewHistory} onSelectReview={(r) => { setCurrentReview(r); setView('review') }} onDeleteReview={(id) => { setReviewHistory(prev => prev.filter(r => r.id !== id)); fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' }).catch(() => {}) }} />}
          {view === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}
