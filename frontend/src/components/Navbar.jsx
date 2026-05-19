import { GitBranch, Github, Zap } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-14 border-b border-bg-border bg-bg-card/60 backdrop-blur-lg flex items-center px-6 shrink-0">
      <div className="flex items-center gap-2 text-accent font-bold text-lg">
        <GitBranch size={20} />
        <span className="gradient-text">PR Reviewer</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/8 border border-emerald-500/15 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-pulse" />
          Agent Online
        </div>

        <a
          href="https://github.com/karthikdk2004/ai-pr-reviewer"
          target="_blank"
          rel="noreferrer"
          className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-bg-elevated"
          aria-label="GitHub Repository"
        >
          <Github size={18} />
        </a>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Zap size={12} className="text-accent" />
          <span className="font-mono">Groq · llama-3.3-70b</span>
        </div>
      </div>
    </header>
  )
}
