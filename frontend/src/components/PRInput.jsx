import { useState, useEffect } from 'react'
import { GitPullRequest, ArrowRight, Zap, Shield, Code, Gauge, CheckCircle2, Sparkles } from 'lucide-react'

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
    <div className="mt-10 animate-fade-in">
      <p className="text-center text-zinc-300 text-sm mb-1.5 font-medium">
        {PIPELINE_NODES[Math.min(activeNode, 4)]?.message}
      </p>
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
              <div
                className={`
                  flex flex-col items-center gap-2.5 transition-all duration-500
                  ${isActive ? 'animate-node-enter' : ''}
                `}
              >
                {/* Node circle */}
                <div className="relative">
                  {/* Ripple rings for active node */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-xl border-2 border-accent/40 animate-ripple" />
                      <div className="absolute inset-0 rounded-xl border-2 border-accent/20 animate-ripple delay-300" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}
                  <div
                    className={`
                      w-13 h-13 rounded-xl flex items-center justify-center border-2 transition-all duration-500 relative
                      ${isActive ? 'bg-accent/20 border-accent text-accent shadow-[0_0_20px_rgba(99,102,241,0.3)]' : ''}
                      ${isDone ? 'bg-accent/10 border-accent/50 text-accent' : ''}
                      ${!isActive && !isDone ? 'bg-bg-elevated border-bg-border text-zinc-600' : ''}
                    `}
                    style={{ width: '3.25rem', height: '3.25rem' }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={18} className="text-accent" />
                    ) : (
                      <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isActive ? 'text-accent' : isDone ? 'text-accent/60' : 'text-zinc-600'
                  }`}
                >
                  {node.label}
                </span>
              </div>

              {/* Connecting beam */}
              {idx < PIPELINE_NODES.length - 1 && (
                <div className="relative w-12 h-0.5 mx-1.5 mb-6">
                  <div className="absolute inset-0 bg-bg-border rounded-full" />
                  {isDone && (
                    <div className="absolute inset-0 pipeline-beam-done rounded-full" />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 pipeline-beam rounded-full h-0.5" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 hero-mesh">
      {/* Floating particles */}
      <div className="particle w-2 h-2 bg-accent/30 top-[15%] left-[12%] animate-float" />
      <div className="particle w-1.5 h-1.5 bg-purple-500/25 top-[25%] right-[18%] animate-float-delayed" />
      <div className="particle w-1 h-1 bg-blue-500/20 top-[60%] left-[8%] animate-float-slow" />
      <div className="particle w-2.5 h-2.5 bg-indigo-400/15 bottom-[20%] right-[10%] animate-float" />
      <div className="particle w-1.5 h-1.5 bg-accent/20 top-[45%] right-[30%] animate-float-delayed" />
      <div className="particle w-1 h-1 bg-violet-400/25 bottom-[35%] left-[25%] animate-float-slow" />

      <div className="w-full max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 text-accent text-xs font-semibold px-4 py-2 rounded-full mb-6 shimmer-badge">
            <Sparkles size={12} className="animate-pulse" />
            Powered by LangGraph + Groq
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight gradient-text leading-tight">
            AI Code Review
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
            Paste any public GitHub PR URL to get an instant,
            AI-powered code review
          </p>
        </div>

        {/* Input card */}
        <div className="glass-strong rounded-2xl p-6 shadow-2xl shadow-accent/5">
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

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-primary w-full justify-center py-3.5 text-base rounded-xl"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze PR
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Example PRs */}
          {!isLoading && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest font-medium">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PRS.map((pr) => (
                  <button
                    key={pr.url}
                    onClick={() => { setUrl(pr.url); onAnalyze(pr.url) }}
                    className="text-xs bg-bg-elevated/60 hover:bg-accent/10 border border-bg-border hover:border-accent/30 text-zinc-400 hover:text-accent px-3 py-1.5 rounded-lg transition-all duration-200 font-mono"
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pipeline animation */}
        {isLoading && (
          <PipelineLoader activeNode={loadingNode} elapsed={elapsed} />
        )}

        {/* Features */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Shield, label: 'Security Scan', desc: 'Detect vulnerabilities & secrets', color: 'text-red-400', glow: 'group-hover:shadow-red-500/5' },
              { icon: Code, label: 'Code Quality', desc: 'Best practices & SOLID', color: 'text-blue-400', glow: 'group-hover:shadow-blue-500/5' },
              { icon: Gauge, label: 'Performance', desc: 'Bottlenecks & N+1 queries', color: 'text-orange-400', glow: 'group-hover:shadow-orange-500/5' },
            ].map(({ icon: Icon, label, desc, color, glow }) => (
              <div key={label} className={`card-elevated p-5 text-center group cursor-default ${glow} group-hover:shadow-lg`}>
                <div className={`w-10 h-10 rounded-lg ${color} bg-current/10 flex items-center justify-center mx-auto mb-3`}
                  style={{ background: 'rgba(99, 102, 241, 0.06)' }}
                >
                  <Icon size={20} className={color} />
                </div>
                <p className="text-white text-sm font-semibold mb-1">{label}</p>
                <p className="text-zinc-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
