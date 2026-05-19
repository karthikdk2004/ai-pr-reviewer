import { GitBranch, Plus, History, Settings, Layers } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV = [
  { id: 'input', label: 'New Review', icon: Plus },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentView, onNavigate, reviewCount = 0 }) {
  return (
    <aside className="w-56 shrink-0 bg-bg-surface border-r border-border-default flex flex-col h-screen">
      {/* Logo */}
      <div className="h-12 border-b border-border-default flex items-center px-4 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <GitBranch size={14} className="text-white" />
        </div>
        <span className="font-semibold text-text-primary text-sm tracking-tight">PR Reviewer</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 pt-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative
                ${active
                  ? 'text-text-primary bg-bg-hover'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/50'}
              `}
            >
              {active && (
                <motion.div
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-accent rounded-full"
                  layoutId="sidebar-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <Icon size={15} className={active ? 'text-accent' : ''} />
              {label}
              {id === 'history' && reviewCount > 0 && (
                <span className="ml-auto text-[11px] text-text-tertiary bg-bg-elevated px-1.5 py-0.5 rounded font-mono">
                  {reviewCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border-default space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
          <Layers size={12} className="text-accent/60" />
          <span>LangGraph + Groq</span>
        </div>
        <p className="text-[10px] text-text-tertiary">
          Built by{' '}
          <a
            href="https://github.com/karthikdk2004"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-accent transition-colors"
          >
            Karthik
          </a>
        </p>
      </div>
    </aside>
  )
}
