import { GitBranch, Github } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-12 border-b border-border-default bg-bg-surface/80 backdrop-blur-sm flex items-center px-5 shrink-0">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-dot-active" />
          <span className="font-mono">Groq · llama-3.3-70b</span>
        </div>
        <div className="w-px h-4 bg-border-default" />
        <a
          href="https://github.com/karthikdk2004/ai-pr-reviewer"
          target="_blank"
          rel="noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Github size={15} />
        </a>
      </div>
    </header>
  )
}
