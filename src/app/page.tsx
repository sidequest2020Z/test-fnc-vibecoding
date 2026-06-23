'use client'

import { useState, useEffect } from 'react'
import QuickLogBox from '@/components/QuickLogBox'
import EntryCard from '@/components/EntryCard'
import { getEntries, deleteEntry, seedDemoData } from '@/lib/storage'
import type { WorkEntry } from '@/lib/types'
import { Flame, TrendingUp } from 'lucide-react'

function getStreak(entries: WorkEntry[]): number {
  if (entries.length === 0) return 0
  const dates = [...new Set(entries.map((e) => e.date))].sort().reverse()
  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let check = today
  for (const d of dates) {
    if (d === check) {
      streak++
      const prev = new Date(check)
      prev.setDate(prev.getDate() - 1)
      check = prev.toISOString().split('T')[0]
    } else {
      break
    }
  }
  return streak
}

export default function HomePage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    seedDemoData()
    setEntries(getEntries())
    setMounted(true)
  }, [])

  function handleEntryAdded(entry: WorkEntry) {
    setEntries((prev) => [entry, ...prev])
  }

  function handleDelete(id: string) {
    deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const streak = getStreak(entries)
  const thisWeek = entries.filter((e) => {
    const d = new Date(e.date)
    const now = new Date()
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return d >= weekAgo
  })

  const highImpact = entries.filter((e) => e.impact === 'high').length

  if (!mounted) return null

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-slate-800">{entries.length}</div>
          <div className="text-xs text-slate-400 mt-0.5">Total Entries</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame size={18} className={streak > 0 ? 'text-orange-500' : 'text-slate-300'} />
            <span className="text-2xl font-bold text-slate-800">{streak}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Day Streak</div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-2xl font-bold text-slate-800">{highImpact}</span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">High Impact</div>
        </div>
      </div>

      <QuickLogBox onEntryAdded={handleEntryAdded} />

      {/* Recent entries */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500">Recent entries</h2>
          {thisWeek.length > 0 && (
            <span className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-0.5 rounded-full">
              {thisWeek.length} this week
            </span>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-sm">No entries yet. Log your first win above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
