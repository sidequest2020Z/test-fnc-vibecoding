'use client'

import { useState, useEffect } from 'react'
import { getEntries, deleteEntry } from '@/lib/storage'
import EntryCard from '@/components/EntryCard'
import type { WorkEntry } from '@/lib/types'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

function getWeekBounds(offset: number): { start: Date; end: Date; label: string } {
  const now = new Date()
  const day = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - day + (day === 0 ? -6 : 1) + offset * 7)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const fmt = (d: Date) => d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })
  const label = offset === 0 ? 'This week' : offset === -1 ? 'Last week' : `${fmt(startOfWeek)} – ${fmt(endOfWeek)}`

  return { start: startOfWeek, end: endOfWeek, label }
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklyPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setEntries(getEntries())
    setMounted(true)
  }, [])

  function handleDelete(id: string) {
    deleteEntry(id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  if (!mounted) return null

  const { start, end, label } = getWeekBounds(weekOffset)

  const weekEntries = entries.filter((e) => {
    const d = new Date(e.date + 'T00:00:00')
    return d >= start && d <= end
  })

  // Group by day
  const byDay: Record<string, WorkEntry[]> = {}
  for (const entry of weekEntries) {
    const d = new Date(entry.date + 'T00:00:00')
    const dayKey = d.toLocaleDateString('en-SG', { weekday: 'short' })
    if (!byDay[dayKey]) byDay[dayKey] = []
    byDay[dayKey].push(entry)
  }

  // Build week grid
  const weekDates = DAYS.map((_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })

  const totalTags = weekEntries.flatMap((e) => e.tags).length
  const highCount = weekEntries.filter((e) => e.impact === 'high').length

  return (
    <div className="space-y-5">
      {/* Week navigator */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <div className="font-semibold text-slate-800">{label}</div>
            <div className="text-xs text-slate-400">
              {start.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })} –{' '}
              {end.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
          <button
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset === 0}
            className="p-2 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day pills */}
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((d, i) => {
            const dayKey = d.toLocaleDateString('en-SG', { weekday: 'short' })
            const count = byDay[dayKey]?.length || 0
            const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="text-xs text-slate-400">{DAYS[i]}</span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    count > 0
                      ? 'bg-teal-500 text-white'
                      : isToday
                      ? 'bg-slate-100 text-slate-600 ring-2 ring-teal-200'
                      : 'bg-slate-50 text-slate-300'
                  }`}
                >
                  {count > 0 ? count : d.getDate()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly summary */}
      {weekEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-teal-700">{weekEntries.length}</div>
            <div className="text-xs text-teal-600">Entries</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">{highCount}</div>
            <div className="text-xs text-emerald-600">High Impact</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{totalTags}</div>
            <div className="text-xs text-blue-600">Tags Applied</div>
          </div>
        </div>
      )}

      {/* Entries */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 mb-3">
          {weekEntries.length} {weekEntries.length === 1 ? 'entry' : 'entries'} logged
        </h2>

        {weekEntries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-100">
            <Calendar size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm">No entries for this week.</p>
            <p className="text-xs mt-1">Head to Log to add some!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weekEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
