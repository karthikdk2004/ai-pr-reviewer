import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import PRInput from './components/PRInput'
import ReviewDashboard from './components/ReviewDashboard'
import ReviewHistory from './components/ReviewHistory'
import {
  GitBranch, Shield, Code, Gauge, Zap,
  Server, ExternalLink, Github,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h2 className="text-text-primary font-semibold text-lg">Settings</h2>

      {/* Status */}
      <div className="card p-4">
        <h3 className="text-text-primary text-sm font-medium mb-3">Status</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          {[
            { label: 'Backend', ok: !!health },
            { label: 'Groq API', ok: health?.groq_configured },
            { label: 'GitHub Token', ok: health?.github_token },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-text-tertiary'}`} />
              <span className="text-text-secondary text-xs">{label}</span>
              <span className={`text-xs ml-auto ${ok ? 'text-emerald-400' : 'text-text-tertiary'}`}>
                {ok ? 'Connected' : 'Not set'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Config */}
      <div className="card p-4">
        <h3 className="text-text-primary text-sm font-medium mb-3">Configuration</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">API URL</span>
            <span className="text-text-tertiary font-mono text-xs">{API_URL}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Model</span>
            <span className="text-text-tertiary font-mono text-xs">llama-3.3-70b-versatile</span>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card p-4">
        <h3 className="text-text-primary text-sm font-medium mb-3">Pipeline</h3>
        <div className="space-y-0">
          {PIPELINE.map((node, i) => {
            const Icon = node.icon
            return (
              <div key={node.label}>
                <div className="flex items-center gap-3 py-2">
                  <Icon size={13} className="text-text-tertiary shrink-0" />
                  <span className="text-text-primary text-sm font-mono">{node.label}</span>
                  <span className="text-text-tertiary text-xs ml-auto">{node.desc}</span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="ml-1.5 w-px h-3 bg-border" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Links */}
      <div className="card p-4">
        <h3 className="text-text-primary text-sm font-medium mb-3">Links</h3>
        <div className="space-y-2">
          <a href="https://github.com/karthikdk2004/ai-pr-reviewer" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <Github size={13} /> Source Code <ExternalLink size={10} className="ml-auto text-text-tertiary" />
          </a>
          <a href="https://ai-pr-reviewer-eta.vercel.app" target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <Server size={13} /> Live Demo <ExternalLink size={10} className="ml-auto text-text-tertiary" />
          </a>
        </div>
      </div>
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('input')
  const [currentReview, setCurrentReview] = useState(null)
  const [reviewHistory, setReviewHistory] = useState([MOCK_REVIEW, MOCK_REVIEW_2])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingNode, setLoadingNode] = useState(0)
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
      console.warn('API error, using demo data:', err.message)
      setCurrentReview({ ...MOCK_REVIEW, id: `demo-${Date.now()}`, pr_url: prUrl, created_at: new Date().toISOString() })
      setView('review')
    } finally {
      clearInterval(nodeTimer.current)
      setIsLoading(false)
      setLoadingNode(0)
    }
  }

  return (
    <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={(v) => { setView(v); if (v === 'input') setCurrentReview(null) }}
        reviewCount={reviewHistory.length}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">
          {view === 'input' && <PRInput onAnalyze={analyzePR} isLoading={isLoading} loadingNode={loadingNode} />}
          {view === 'review' && currentReview && <ReviewDashboard review={currentReview} onNewReview={() => setView('input')} />}
          {view === 'review' && !currentReview && <PRInput onAnalyze={analyzePR} isLoading={isLoading} loadingNode={loadingNode} />}
          {view === 'history' && <ReviewHistory reviews={reviewHistory} onSelectReview={(r) => { setCurrentReview(r); setView('review') }} onDeleteReview={(id) => { setReviewHistory(prev => prev.filter(r => r.id !== id)); fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' }).catch(() => {}) }} />}
          {view === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  )
}
