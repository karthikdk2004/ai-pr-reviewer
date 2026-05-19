import { useState, useEffect } from 'react'
import { GitPullRequest, ArrowRight, Zap, Shield, Code, Gauge, CheckCircle2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EXAMPLE_PRS = [
  { label: 'facebook/react #31373', url: 'https://github.com/facebook/react/pull/31373' },
  { label: 'vercel/next.js #65798', url: 'https://github.com/vercel/next.js/pull/65798' },
  { label: 'microsoft/vscode #210000', url: 'https://github.com/microsoft/vscode/pull/210000' },
]

const PIPELINE_NODES = [
  { id: 'fetch', label: 'Fetch PR', icon: GitPullRequest, message: 'Fetching PR data from GitHub API...' },
  { id: 'security', label: 'Security', icon: Shield, message: 'Scanning for security vulnerabilities...' },
  { id: 'quality', label: 'Quality', icon: Code, message: 'Analyzing code quality patterns...' },
  { id: 'performance', label: 'Performance', icon: Gauge, message: 'Detecting performance bottlenecks...' },
  { id: 'summary', label: 'Summary', icon: Zap, message: 'Generating comprehensive review...' },
]

function PipelineLoader({ activeNode, elapsed }) {
  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={activeNode}
          className="text-center text-zinc-300 text-sm mb-1.5 font-medium"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3 }}
        >
          {PIPELINE_NODES[Math.min(activeNode, 4)]?.message}
        </motion.p>
      </AnimatePresence>
      <p className="text-center text-accent/60 text-xs mb-8 font-mono tracking-wider">
        {elapsed}.0s elapsed
      </p>

      <div className="flex items-center justify-center gap-0">
        {PIPELINE_NODES.map((node, idx) => {
          const Icon = node.icon
          const isActive = idx === activeNode
          const isDone = idx < activeNode

          return (
            <div key={node.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2.5">
                {/* Node circle */}
                <div className="relative">
                  {/* Ripple rings for active node */}
                  <AnimatePresence>
                    {isActive && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-accent/40"
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-accent/20"
                          initial={{ scale: 1, opacity: 0.4 }}
                          animate={{ scale: 2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                        />
                      </>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className={`
                      w-13 h-13 rounded-xl flex items-center justify-center border-2 relative
                      ${isActive ? 'bg-accent/20 border-accent text-accent' : ''}
                      ${isDone ? 'bg-accent/10 border-accent/50 text-accent' : ''}
                      ${!isActive && !isDone ? 'bg-bg-elevated border-bg-border text-zinc-600' : ''}
                    `}
                    style={{ width: '3.25rem', height: '3.25rem' }}
                    animate={isActive ? {
                      boxShadow: ['0 0 8px rgba(99,102,241,0.2)', '0 0 24px rgba(99,102,241,0.4)', '0 0 8px rgba(99,102,241,0.2)'],
                    } : isDone ? {
                      boxShadow: '0 0 0px rgba(99,102,241,0)',
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.div
                          key="done"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <CheckCircle2 size={18} className="text-accent" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="icon"
                          animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <Icon size={18} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <motion.span
                  className={`text-xs font-semibold ${
                    isActive ? 'text-accent' : isDone ? 'text-accent/60' : 'text-zinc-600'
                  }`}
                  animate={{ opacity: isActive || isDone ? 1 : 0.5 }}
                >
                  {node.label}
                </motion.span>
              </div>

              {/* Connecting beam */}
              {idx < PIPELINE_NODES.length - 1 && (
                <div className="relative w-12 h-0.5 mx-1.5 mb-6 overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-bg-border rounded-full" />
                  {isDone && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-accent/40"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ originX: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent)',
                        width: '50%',
                      }}
                      animate={{ x: ['-50%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
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

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' },
  }),
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 hero-mesh">
      {/* Floating particles */}
      <motion.div className="particle w-2 h-2 bg-accent/30 top-[15%] left-[12%]" animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="particle w-1.5 h-1.5 bg-purple-500/25 top-[25%] right-[18%]" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
      <motion.div className="particle w-1 h-1 bg-blue-500/20 top-[60%] left-[8%]" animate={{ y: [0, -12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }} />
      <motion.div className="particle w-2.5 h-2.5 bg-indigo-400/15 bottom-[20%] right-[10%]" animate={{ y: [0, -16, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
      <motion.div className="particle w-1.5 h-1.5 bg-accent/20 top-[45%] right-[30%]" animate={{ y: [0, -8, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }} />
      <motion.div className="particle w-1 h-1 bg-violet-400/25 bottom-[35%] left-[25%]" animate={{ y: [0, -11, 0] }} transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 text-accent text-xs font-semibold px-4 py-2 rounded-full mb-6 shimmer-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Sparkles size={12} className="animate-pulse" />
            Powered by LangGraph + Groq
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight gradient-text leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          >
            AI Code Review
          </motion.h1>
          <motion.p
            className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Paste any public GitHub PR URL to get an instant,
            AI-powered code review
          </motion.p>
        </div>

        {/* Input card */}
        <motion.div
          className="glass-strong rounded-2xl p-6 shadow-2xl shadow-accent/5"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ boxShadow: '0 8px 40px -8px rgba(99, 102, 241, 0.12)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <GitPullRequest
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-accent transition-colors duration-200"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                className="input-field pl-10"
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-primary w-full justify-center py-3.5 text-base rounded-xl"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <motion.span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze PR
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Example PRs */}
          <AnimatePresence>
            {!isLoading && (
              <motion.div
                className="mt-5 pt-5 border-t border-white/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest font-medium">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_PRS.map((pr, i) => (
                    <motion.button
                      key={pr.url}
                      onClick={() => { setUrl(pr.url); onAnalyze(pr.url) }}
                      className="text-xs bg-bg-elevated/60 hover:bg-accent/10 border border-bg-border hover:border-accent/30 text-zinc-400 hover:text-accent px-3 py-1.5 rounded-lg transition-all duration-200 font-mono"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {pr.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Pipeline animation */}
        <AnimatePresence>
          {isLoading && (
            <PipelineLoader activeNode={loadingNode} elapsed={elapsed} />
          )}
        </AnimatePresence>

        {/* Features */}
        <AnimatePresence>
          {!isLoading && (
            <motion.div
              className="grid grid-cols-3 gap-4 mt-8"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              {[
                { icon: Shield, label: 'Security Scan', desc: 'Detect vulnerabilities & secrets', color: 'text-red-400' },
                { icon: Code, label: 'Code Quality', desc: 'Best practices & SOLID', color: 'text-blue-400' },
                { icon: Gauge, label: 'Performance', desc: 'Bottlenecks & N+1 queries', color: 'text-orange-400' },
              ].map(({ icon: Icon, label, desc, color }, i) => (
                <motion.div
                  key={label}
                  className="card-elevated p-5 text-center group cursor-default"
                  custom={i}
                  variants={featureVariants}
                  whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.2)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(99, 102, 241, 0.06)' }}
                  >
                    <Icon size={20} className={color} />
                  </div>
                  <p className="text-white text-sm font-semibold mb-1">{label}</p>
                  <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
