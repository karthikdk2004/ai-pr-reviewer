import { useState, useEffect } from 'react'
import { GitPullRequest, ArrowRight, Zap, Shield, Code, Gauge } from 'lucide-react'

const EXAMPLE_PRS = [
  { label: 'facebook/react #31373', url: 'https://github.com/facebook/react/pull/31373' },
  { label: 'vercel/next.js #65798', url: 'https://github.com/vercel/next.js/pull/65798' },
  { label: 'microsoft/vscode #210000', url: 'https://github.com/microsoft/vscode/pull/210000' },
]

const PIPELINE_NODES = [
  { id: 'fetch', label: 'Fetch PR', icon: GitPullRequest, message: 'Fetching PR data from GitHub...' },
  { id: 'security', label: 'Security', icon: Shield, message: 'Scanning for security vulnerabilities...' },
  { id: 'quality', label: 'Quality', icon: Code, message: 'Checking code quality...' },
  { id: 'performance', label: 'Performance', icon: Gauge, message: 'Analyzing performance issues...' },
  { id: 'summary', label: 'Summary', icon: Zap, message: 'Generating review summary...' },
]

function PipelineLoader({ activeNode, elapsed }) {
  return (
    <div className="mt-10 animate-fade-in">
      <p className="text-center text-zinc-400 text-sm mb-2">
        {PIPELINE_NODES[Math.min(activeNode, 4)]?.message}
      </p>
      <p className="text-center text-zinc-600 text-xs mb-8 font-mono">
        {elapsed}s elapsed
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
                  flex flex-col items-center gap-2 transition-all duration-500
                  ${isActive ? 'animate-node-enter' : ''}
                `}
              >
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500
                    ${isActive ? 'bg-accent/20 border-accent text-accent animate-pulse-glow' : ''}
                    ${isDone ? 'bg-accent/10 border-accent/40 text-accent/60' : ''}
                    ${!isActive && !isDone ? 'bg-bg-elevated border-bg-border text-zinc-600' : ''}
                  `}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    isActive ? 'text-accent' : isDone ? 'text-zinc-500' : 'text-zinc-700'
                  }`}
                >
                  {node.label}
                </span>
              </div>

              {idx < PIPELINE_NODES.length - 1 && (
                <div
                  className={`w-10 h-px mx-1 mb-5 transition-colors duration-500 ${
                    idx < activeNode ? 'bg-accent/40' : 'bg-bg-border'
                  }`}
                />
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
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Zap size={12} />
            Powered by LangGraph + Groq
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            AI Code Review
          </h1>
          <p className="text-zinc-400 text-lg">
            Paste any public GitHub PR URL to get an instant AI review
          </p>
        </div>

        {/* Input card */}
        <div className="card p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <GitPullRequest
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
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
              className="btn-primary w-full justify-center py-3 text-base"
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
            <div className="mt-5 pt-5 border-t border-bg-border">
              <p className="text-xs text-zinc-600 mb-3 uppercase tracking-wider font-medium">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PRS.map((pr) => (
                  <button
                    key={pr.url}
                    onClick={() => { setUrl(pr.url); onAnalyze(pr.url) }}
                    className="text-xs bg-bg-elevated hover:bg-bg-border border border-bg-border hover:border-accent/30 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-150 font-mono"
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
              { icon: Shield, label: 'Security Scan', desc: 'Detect vulnerabilities' },
              { icon: Code, label: 'Code Quality', desc: 'Best practices check' },
              { icon: Gauge, label: 'Performance', desc: 'Identify bottlenecks' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="card-elevated p-4 text-center">
                <Icon size={20} className="text-accent mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">{label}</p>
                <p className="text-zinc-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
