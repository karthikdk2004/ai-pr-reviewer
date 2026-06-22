import { useState, useEffect } from 'react'
import { GitBranch, Plus, History, Settings, Layers, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV = [
  { id: 'input', label: 'New Review', icon: Plus },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ currentView, onNavigate, reviewCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (v) => {
    onNavigate(v)
    setMobileOpen(false)
  }

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-12 border-b border-border-default flex items-center px-4 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
          <GitBranch size={14} className="text-white" />
        </div>
        <span className="font-semibold text-text-primary text-sm tracking-tight">PR Reviewer</span>
        <button
          className="ml-auto md:hidden text-text-tertiary hover:text-text-primary transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 pt-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = currentView === id
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
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
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden w-9 h-9 rounded-lg bg-bg-surface border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        onClick={() => setMobileOpen(true)}
        style={{ display: mobileOpen ? 'none' : undefined }}
      >
        <Menu size={18} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-bg-surface border-r border-border-default flex-col h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-64 bg-bg-surface border-r border-border-default flex flex-col z-50 md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
