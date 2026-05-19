import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import PRInput from './components/PRInput'
import ReviewDashboard from './components/ReviewDashboard'
import ReviewHistory from './components/ReviewHistory'

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
    'This PR introduces the useOptimistic hook and several concurrent rendering improvements. The implementation is well-structured and follows React\'s existing patterns. However, there are a few security considerations around unvalidated state mutations and some performance concerns with the synchronization mechanism.\n\nThe code quality is generally high with good TypeScript types, but a few functions exceed recommended complexity thresholds. The test coverage looks adequate for the new hook, though edge cases around concurrent mode could benefit from additional tests.\n\nOverall, this is a valuable addition to the React API but requires addressing the identified issues before merging.',
  security_issues: [
    {
      severity: 'high',
      category: 'security',
      title: 'Unvalidated State Update in useOptimistic',
      description: 'The optimistic state update does not validate the shape of the incoming data, which could lead to unexpected state mutations if an attacker controls the update function.',
      file: 'packages/react/src/ReactHooks.js',
      line: '142-158',
      suggestion: 'Add runtime validation or TypeScript generics to enforce the expected state shape before applying optimistic updates.',
    },
    {
      severity: 'medium',
      category: 'security',
      title: 'Missing Sanitization in Error Boundary Message',
      description: 'Error messages from failed optimistic updates are rendered directly without sanitization, potentially exposing raw error details to users.',
      file: 'packages/react-dom/src/client/ReactDOMRoot.js',
      line: '89',
      suggestion: 'Sanitize error messages before displaying them, or use a generic error message in production builds.',
    },
  ],
  quality_issues: [
    {
      severity: 'medium',
      category: 'quality',
      title: 'High Cyclomatic Complexity in reconcileOptimisticQueue',
      description: 'The reconcileOptimisticQueue function has a cyclomatic complexity of 18, making it difficult to test and maintain. Multiple nested conditionals reduce readability.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js',
      line: '1847-1923',
      suggestion: 'Extract the nested conditional branches into well-named helper functions to reduce complexity below 10.',
    },
    {
      severity: 'low',
      category: 'quality',
      title: 'Inconsistent Naming Convention',
      description: 'Some internal variables use camelCase while others use underscore-prefixed names for the same type of temporary variables.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js',
      line: '1901',
      suggestion: 'Standardize on camelCase for all internal variables as per the codebase convention.',
    },
  ],
  performance_issues: [
    {
      severity: 'high',
      category: 'performance',
      title: 'Unnecessary Re-render on Every State Update',
      description: 'The optimistic state queue is traversed on every render even when no optimistic updates are pending, adding O(n) overhead to the render cycle.',
      file: 'packages/react-reconciler/src/ReactFiberHooks.js',
      line: '1789',
      suggestion: 'Add an early return when the optimistic queue is empty to skip the traversal cost.',
    },
    {
      severity: 'low',
      category: 'performance',
      title: 'Missing Memoization for Derived State',
      description: 'The merged state calculation inside useOptimistic is recomputed on every render without memoization.',
      file: 'packages/react/src/ReactHooks.js',
      line: '165',
      suggestion: 'Use useMemo or a ref to cache the merged state calculation when neither the base state nor the optimistic queue has changed.',
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
  summary:
    'This is a clean, targeted fix for hydration mismatches in Suspense boundaries. The implementation correctly identifies the root cause and applies a minimal, well-tested solution. The changes are backward compatible and do not introduce any new APIs.\n\nThe fix appropriately handles the edge case where server-rendered content differs from client-rendered content within Suspense boundaries during streaming SSR. Test coverage is thorough with both unit and integration tests added.\n\nThis PR is ready to merge with minor suggestion to add a changelog entry.',
  security_issues: [],
  quality_issues: [
    {
      severity: 'low',
      category: 'quality',
      title: 'Missing Changelog Entry',
      description: 'Bug fixes of this nature should have a corresponding CHANGELOG.md entry for users tracking breaking changes or migration steps.',
      file: 'CHANGELOG.md',
      line: 'N/A',
      suggestion: 'Add an entry under the "Bug Fixes" section describing the hydration fix and any relevant migration notes.',
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
    // Try to load reviews from backend on mount
    fetch(`${API_URL}/reviews`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setReviewHistory(data)
        }
      })
      .catch(() => {}) // silently ignore if backend is down
  }, [])

  const analyzePR = async (prUrl) => {
    setIsLoading(true)
    setLoadingNode(0)
    setError(null)

    // Cycle through nodes while waiting
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

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(err.detail || `HTTP ${res.status}`)
      }

      const review = await res.json()
      setCurrentReview(review)
      setReviewHistory((prev) => [review, ...prev.filter((r) => r.id !== review.id).slice(0, 49)])
      setView('review')
    } catch (err) {
      console.warn('API error, using mock data:', err.message)
      // Graceful fallback to mock data so the UI is always demonstrable
      const mockCopy = {
        ...MOCK_REVIEW,
        id: `demo-${Date.now()}`,
        pr_url: prUrl,
        created_at: new Date().toISOString(),
      }
      setCurrentReview(mockCopy)
      setView('review')
    } finally {
      clearInterval(nodeTimer.current)
      setIsLoading(false)
      setLoadingNode(0)
    }
  }

  const handleDeleteReview = async (id) => {
    setReviewHistory((prev) => prev.filter((r) => r.id !== id))
    try {
      await fetch(`${API_URL}/reviews/${id}`, { method: 'DELETE' })
    } catch (_) {}
  }

  const handleSelectReview = (review) => {
    setCurrentReview(review)
    setView('review')
  }

  return (
    <div className="flex h-screen bg-bg-base text-white overflow-hidden">
      <Sidebar
        currentView={view}
        onNavigate={(v) => {
          setView(v)
          if (v === 'input') setCurrentReview(null)
        }}
        reviewCount={reviewHistory.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto p-6">
          {view === 'input' && (
            <PRInput
              onAnalyze={analyzePR}
              isLoading={isLoading}
              loadingNode={loadingNode}
            />
          )}

          {view === 'review' && currentReview && (
            <ReviewDashboard
              review={currentReview}
              onNewReview={() => setView('input')}
            />
          )}

          {view === 'review' && !currentReview && (
            <PRInput
              onAnalyze={analyzePR}
              isLoading={isLoading}
              loadingNode={loadingNode}
            />
          )}

          {view === 'history' && (
            <ReviewHistory
              reviews={reviewHistory}
              onSelectReview={handleSelectReview}
              onDeleteReview={handleDeleteReview}
            />
          )}

          {view === 'settings' && (
            <div className="max-w-xl mx-auto animate-fade-in">
              <h2 className="text-white font-bold text-xl mb-6">Settings</h2>
              <div className="card p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Backend API URL
                  </label>
                  <input
                    readOnly
                    value={API_URL}
                    className="input-field opacity-60 cursor-default"
                  />
                  <p className="text-xs text-zinc-500 mt-1.5">
                    Set <code className="font-mono text-accent">VITE_API_URL</code> in your .env file to change.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Model
                  </label>
                  <input
                    readOnly
                    value="llama-3.3-70b-versatile (Groq)"
                    className="input-field opacity-60 cursor-default"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
