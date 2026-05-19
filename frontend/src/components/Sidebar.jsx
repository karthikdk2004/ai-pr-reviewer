import { GitBranch, Plus, History, Settings, Layers, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV = [
  { id: 'input', label: 'New Review', icon: Plus },
  { id: 'history', label: 'Review History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentView, onNavigate, reviewCount = 0 }) {
  return (
    <aside className="w-60 shrink-0 bg-bg-card/90 border-r border-bg-border flex flex-col h-screen backdrop-blur-sm">
      {/* Logo */}
      <div className="h-14 border-b border-bg-border flex items-center px-5 gap-2.5">
        <motion.div
          className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <GitBranch size={16} className="text-white" />
        </motion.div>
        <span className="font-bold text-white text-base">PR Reviewer</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <motion.button
              key={id}
              onClick={() => onNavigate(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 relative group
                ${active
                  ? 'text-accent'
                  : 'text-zinc-400 hover:text-white'}
              `}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {active && (
                <motion.div
                  className="absolute inset-0 bg-accent/12 border border-accent/20 rounded-lg shadow-sm shadow-accent/5"
                  layoutId="activeNav"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3 w-full">
                <Icon size={16} className={active ? '' : 'group-hover:text-accent/60 transition-colors'} />
                {label}
                {id === 'history' && reviewCount > 0 && (
                  <span className="ml-auto text-xs bg-bg-border text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                    {reviewCount}
                  </span>
                )}
              </span>
            </motion.button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-3 border-t border-bg-border">
        <div className="flex items-center gap-2.5 bg-bg-elevated/80 rounded-lg px-3 py-2.5 border border-bg-border">
          <Layers size={14} className="text-accent shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-500 leading-none uppercase tracking-wider font-medium">Powered by</p>
            <p className="text-xs font-semibold text-white mt-0.5">LangGraph + Groq</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
          <span>Built by</span>
          <a
            href="https://github.com/karthikdk2004"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-accent transition-colors font-semibold"
          >
            Karthik
          </a>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Heart size={10} className="text-red-400/60 fill-red-400/60" />
          </motion.span>
        </div>
      </div>
    </aside>
  )
}
