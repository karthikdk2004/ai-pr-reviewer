import { GitBranch, Github } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-12 border-b border-border bg-bg-surface flex items-center px-5 shrink-0">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-text-tertiary font-mono">
          llama-3.3-70b · Groq
        </span>
        <a
          href="https://github.com/karthikdk2004/ai-pr-reviewer"
          target="_blank"
          rel="noreferrer"
          className="text-text-tertiary hover:text-text-primary transition-colors"
        >
          <Github size={16} />
        </a>
      </div>
    </header>
  )
}
