import { GitBranch, Plus, History, Settings, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV = [
  { id: 'input', label: 'New Review', icon: Plus },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentView, onNavigate, reviewCount = 0 }) {
  return (
    <aside className="w-52 shrink-0 bg-bg-surface border-r border-border flex flex-col h-screen">
      {/* Logo */}
      <div className="h-12 border-b border-border flex items-center px-4 gap-2">
        <GitBranch size={15} className="text-accent" />
        <span className="font-semibold text-text-primary text-sm">PR Reviewer</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pt-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] transition-colors relative
                ${active
                  ? 'text-text-primary bg-bg-hover'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover/50'}
              `}
            >
              <Icon size={14} />
              {label}
              {id === 'history' && reviewCount > 0 && (
                <span className="ml-auto text-[11px] text-text-tertiary font-mono">
                  {reviewCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-[11px] text-text-tertiary">
          Built by{' '}
          <a
            href="https://github.com/karthikdk2004"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Karthik
          </a>
        </p>
      </div>
    </aside>
  )
}
