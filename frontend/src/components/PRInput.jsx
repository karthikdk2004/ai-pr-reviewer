import { useState, useEffect } from 'react'
import { GitPullRequest, ArrowRight, Shield, Code, Gauge, CheckCircle2, Zap, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLES = [
  { label: 'facebook/react #31373', url: 'https://github.com/facebook/react/pull/31373' },
  { label: 'vercel/next.js #65798', url: 'https://github.com/vercel/next.js/pull/65798' },
  { label: 'microsoft/vscode #210000', url: 'https://github.com/microsoft/vscode/pull/210000' },
]

const NODES = [
  { id: 'fetch', label: 'Fetch', icon: GitPullRequest, msg: 'Pulling PR data from GitHub...' },
  { id: 'security', label: 'Security', icon: Shield, msg: 'Scanning for vulnerabilities...' },
  { id: 'quality', label: 'Quality', icon: Code, msg: 'Reviewing code patterns...' },
  { id: 'perf', label: 'Performance', icon: Gauge, msg: 'Checking for bottlenecks...' },
  { id: 'summary', label: 'Summary', icon: Zap, msg: 'Generating review...' },
]

function PipelineLoader({ activeNode, elapsed }) {
  return (
    <motion.div
      className="mt-10 max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
    >
      {/* Message */}
      <div className="flex items-center justify-between mb-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={activeNode}
            className="text-[13px] text-text-secondary"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
          >
            {NODES[Math.min(activeNode, 4)]?.msg}
          </motion.p>
        </AnimatePresence>
        <span className="text-xs text-text-tertiary font-mono tabular-nums">{elapsed}s</span>
      </div>

      {/* Progress nodes */}
      <div className="flex items-center">
        {NODES.map((node, idx) => {
          const Icon = node.icon
          const active = idx === activeNode
          const done = idx < activeNode

          return (
            <div key={node.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <motion.div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center border transition-colors duration-300
                    ${done ? 'bg-accent/10 border-accent/25 text-accent' : ''}
                    ${active ? 'bg-accent/15 border-accent/40 text-accent' : ''}
                    ${!active && !done ? 'bg-bg-elevated border-border-default text-text-tertiary' : ''}
                  `}
                  animate={active ? { scale: [1, 1.06, 1] } : {}}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {done ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <CheckCircle2 size={15} />
                    </motion.div>
                  ) : (
                    <Icon size={15} />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${active || done ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                  {node.label}
                </span>
              </div>

              {idx < NODES.length - 1 && (
                <div className="w-full h-px mb-5 relative overflow-hidden rounded-full bg-border-default">
                  {done && (
                    <motion.div
                      className="absolute inset-0 bg-accent/30"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  )}
                  {active && (
                    <motion.div
                      className="absolute h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
                        width: '40%',
                      }}
                      animate={{ x: ['-40%', '250%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
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
  const [focused, setFocused] = useState(false)

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
    <div className="flex flex-col items-center justify-center min-h-full py-16 px-4 hero-glow">
      <motion.div
        className="w-full max-w-xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Tag */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-accent bg-accent-soft border border-accent/15 px-3 py-1 rounded-full">
            <Sparkles size={11} />
            5-agent LangGraph pipeline
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3 tracking-tight">
            AI-Powered Code Review
          </h1>
          <p className="text-text-secondary text-[15px] max-w-sm mx-auto">
            Analyze any GitHub pull request for security, quality, and performance issues.
          </p>
        </motion.div>

        {/* Input card */}
        <motion.div
          className="card p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <GitPullRequest
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focused ? 'text-accent' : 'text-text-tertiary'
                }`}
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="input-field pl-10"
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-primary w-full justify-center"
              whileTap={{ scale: 0.985 }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Pull Request
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Examples */}
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className="mt-4 pt-4 border-t border-border-default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[11px] text-text-tertiary mb-2.5 uppercase tracking-wider font-medium">
                  Quick start
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((pr, i) => (
                    <motion.button
                      key={pr.url}
                      onClick={() => { setUrl(pr.url); onAnalyze(pr.url) }}
                      className="text-[12px] text-text-tertiary hover:text-accent bg-bg-elevated hover:bg-accent-soft border border-border-default hover:border-accent/20 px-3 py-1.5 rounded-lg transition-all duration-200 font-mono"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      whileHover={{ y: -1 }}
                    >
                      {pr.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pipeline */}
        <AnimatePresence>
          {isLoading && <PipelineLoader activeNode={loadingNode} elapsed={elapsed} />}
        </AnimatePresence>

        {/* Feature highlights */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              className="grid grid-cols-3 gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {[
                { icon: Shield, label: 'Security', desc: 'Vulnerabilities & secrets', color: 'text-red-400' },
                { icon: Code, label: 'Quality', desc: 'Patterns & best practices', color: 'text-blue-400' },
                { icon: Gauge, label: 'Performance', desc: 'Bottlenecks & optimization', color: 'text-amber-400' },
              ].map(({ icon: Icon, label, desc, color }) => (
                <motion.div
                  key={label}
                  className="rounded-xl border border-border-default bg-bg-surface/50 p-4 text-center"
                  whileHover={{ borderColor: 'rgba(99,102,241,0.15)', y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={18} className={`${color} mx-auto mb-2 opacity-80`} />
                  <p className="text-text-primary text-[13px] font-medium">{label}</p>
                  <p className="text-text-tertiary text-[11px] mt-0.5">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
