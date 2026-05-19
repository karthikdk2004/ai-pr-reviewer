import { GitBranch, Plus, History, Settings, Layers } from 'lucide-react'

const NAV = [
  { id: 'input', label: 'New Review', icon: Plus },
  { id: 'history', label: 'Review History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentView, onNavigate, reviewCount = 0 }) {
  return (
    <aside className="w-60 shrink-0 bg-bg-card border-r border-bg-border flex flex-col h-screen">
      {/* Logo */}
      <div className="h-14 border-b border-bg-border flex items-center px-5 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <GitBranch size={16} className="text-white" />
        </div>
        <span className="font-bold text-white text-base">PR Reviewer</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-zinc-400 hover:text-white hover:bg-bg-elevated'}
              `}
            >
              <Icon size={16} />
              {label}
              {id === 'history' && reviewCount > 0 && (
                <span className="ml-auto text-xs bg-bg-border text-zinc-400 px-1.5 py-0.5 rounded-full">
                  {reviewCount}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-bg-border">
        <div className="flex items-center gap-2 bg-bg-elevated rounded-lg px-3 py-2.5 border border-bg-border">
          <Layers size={14} className="text-accent shrink-0" />
          <div>
            <p className="text-xs text-zinc-400 leading-none">Powered by</p>
            <p className="text-xs font-semibold text-white mt-0.5">LangGraph</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
