import { useState, useEffect } from 'react'
import { GitPullRequest, ArrowRight, Shield, Code, Gauge, CheckCircle2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_PRS = [
  { label: 'facebook/react #31373', url: 'https://github.com/facebook/react/pull/31373' },
  { label: 'vercel/next.js #65798', url: 'https://github.com/vercel/next.js/pull/65798' },
  { label: 'microsoft/vscode #210000', url: 'https://github.com/microsoft/vscode/pull/210000' },
]

const PIPELINE_NODES = [
  { id: 'fetch', label: 'Fetch PR', icon: GitPullRequest },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'quality', label: 'Quality', icon: Code },
  { id: 'performance', label: 'Performance', icon: Gauge },
  { id: 'summary', label: 'Summary', icon: Zap },
]

const PIPELINE_MESSAGES = [
  'Fetching PR data from GitHub...',
  'Running security analysis...',
  'Analyzing code quality...',
  'Checking performance patterns...',
  'Generating summary...',
]

function PipelineLoader({ activeNode, elapsed }) {
  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeNode}
            className="text-text-secondary text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {PIPELINE_MESSAGES[Math.min(activeNode, 4)]}
          </motion.p>
        </AnimatePresence>
        <span className="text-text-tertiary text-xs font-mono">{elapsed}s</span>
      </div>

      <div className="flex items-center gap-0">
        {PIPELINE_NODES.map((node, idx) => {
          const Icon = node.icon
          const isActive = idx === activeNode
          const isDone = idx < activeNode

          return (
            <div key={node.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300
                    ${isDone ? 'bg-accent-muted border-accent/30 text-accent' : ''}
                    ${isActive ? 'bg-accent-muted border-accent text-accent' : ''}
                    ${!isActive && !isDone ? 'bg-bg-elevated border-border text-text-tertiary' : ''}
                  `}
                >
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle2 size={16} />
                    </motion.div>
                  ) : (
                    <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
                  )}
                </div>
                <span className={`text-[11px] font-medium ${
                  isActive || isDone ? 'text-text-secondary' : 'text-text-tertiary'
                }`}>
                  {node.label}
                </span>
              </div>

              {idx < PIPELINE_NODES.length - 1 && (
                <div className="w-full h-px bg-border mx-0 mb-5 relative overflow-hidden">
                  {isDone && (
                    <motion.div
                      className="absolute inset-0 bg-accent/40"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function PRInput({ onAnalyze, isLoading, loadingNode }) {
  const [url, setUrl] = useState('')
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isLoading) { setElapsed(0); return }
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isLoading])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) onAnalyze(url.trim())
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-4">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Header — simple, no gimmicks */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Review a Pull Request
          </h1>
          <p className="text-text-secondary text-sm">
            Paste a public GitHub PR URL to get an AI-powered code review.
          </p>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <GitPullRequest
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/pull/123"
              className="input-field pl-9 text-sm"
              disabled={isLoading}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="btn-primary w-full justify-center py-2.5 text-sm"
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <motion.span
                  className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                />
                Analyzing...
              </>
            ) : (
              <>
                Analyze PR
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </form>

        {/* Example PRs — just text links, no fancy buttons */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-text-tertiary text-xs mb-2">Or try an example:</p>
              <div className="flex gap-3">
                {EXAMPLE_PRS.map((pr) => (
                  <button
                    key={pr.url}
                    onClick={() => { setUrl(pr.url); onAnalyze(pr.url) }}
                    className="text-xs text-text-secondary hover:text-accent transition-colors font-mono"
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pipeline */}
        <AnimatePresence>
          {isLoading && <PipelineLoader activeNode={loadingNode} elapsed={elapsed} />}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
