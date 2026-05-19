import { GitBranch, Github, Zap } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-14 border-b border-bg-border bg-bg-card/80 backdrop-blur flex items-center px-6 shrink-0">
      <div className="flex items-center gap-2 text-accent font-bold text-lg">
        <GitBranch size={20} />
        <span>PR Reviewer</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Agent Online
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="GitHub"
        >
          <Github size={18} />
        </a>

        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Zap size={12} className="text-accent" />
          <span>Groq · llama-3.3-70b</span>
        </div>
      </div>
    </header>
  )
}
