import { CheckCircle, MessageSquare } from 'lucide-react'

export default function SummaryPanel({ summary, positiveAspects = [] }) {
  return (
    <div className="space-y-4">
      {/* Summary text */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={16} className="text-accent" />
          <h3 className="text-white font-semibold">Review Summary</h3>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {summary || 'No summary available.'}
        </p>
      </div>

      {/* Positive aspects */}
      {positiveAspects.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold">Positive Aspects</h3>
            <span className="ml-auto text-xs text-zinc-500 bg-bg-elevated px-2 py-0.5 rounded-full">
              {positiveAspects.length}
            </span>
          </div>
          <ul className="space-y-2">
            {positiveAspects.map((aspect, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <CheckCircle size={13} className="text-emerald-400/70 shrink-0 mt-0.5" />
                {aspect}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
