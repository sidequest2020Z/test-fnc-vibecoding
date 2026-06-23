'use client'

import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Zap, Minus, TrendingUp } from 'lucide-react'
import type { WorkEntry, ImpactLevel } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  entry: WorkEntry
  onDelete: (id: string) => void
}

const IMPACT_CONFIG: Record<ImpactLevel, { label: string; color: string; icon: React.ReactNode }> = {
  high: { label: 'High Impact', color: 'text-emerald-600', icon: <TrendingUp size={12} /> },
  medium: { label: 'Medium', color: 'text-amber-600', icon: <Zap size={12} /> },
  low: { label: 'Routine', color: 'text-slate-400', icon: <Minus size={12} /> },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function EntryCard({ entry, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const impact = IMPACT_CONFIG[entry.impact]

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400 font-medium">{formatDate(entry.date)}</span>
              <span className={clsx('flex items-center gap-1 text-xs font-medium', impact.color)}>
                {impact.icon}
                {impact.label}
              </span>
            </div>
            <p className={clsx('text-sm text-slate-700 leading-relaxed', !expanded && 'line-clamp-2')}>
              {entry.content}
            </p>
            {entry.content.length > 120 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
              >
                {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
              </button>
            )}
          </div>
          <button
            onClick={() => onDelete(entry.id)}
            className="flex-shrink-0 p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.tags.map((tag) => (
              <span key={tag.label} className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', tag.color)}>
                {tag.label}
              </span>
            ))}
            {entry.metrics.map((m, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {m.value} {m.unit}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
