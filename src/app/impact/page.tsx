'use client'

import { useEffect, useState } from 'react'
import { getEntries } from '@/lib/storage'
import type { WorkEntry, CategoryType } from '@/lib/types'
import { TrendingUp, Award, Target, Layers } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  'Stakeholder Engagement': 'bg-blue-500',
  'Policy & Research': 'bg-purple-500',
  'Project Delivery': 'bg-green-500',
  'Operations': 'bg-orange-500',
  'Learning & Development': 'bg-yellow-500',
  'Leadership': 'bg-pink-500',
}

const CATEGORY_BG: Record<string, string> = {
  'Stakeholder Engagement': 'bg-blue-50',
  'Policy & Research': 'bg-purple-50',
  'Project Delivery': 'bg-green-50',
  'Operations': 'bg-orange-50',
  'Learning & Development': 'bg-yellow-50',
  'Leadership': 'bg-pink-50',
}

const CATEGORY_TEXT: Record<string, string> = {
  'Stakeholder Engagement': 'text-blue-700',
  'Policy & Research': 'text-purple-700',
  'Project Delivery': 'text-green-700',
  'Operations': 'text-orange-700',
  'Learning & Development': 'text-yellow-700',
  'Leadership': 'text-pink-700',
}

function groupByMonth(entries: WorkEntry[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const e of entries) {
    const key = e.date.slice(0, 7)
    result[key] = (result[key] || 0) + 1
  }
  return result
}

export default function ImpactPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setEntries(getEntries())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const categoryCounts: Record<string, number> = {}
  let totalMetrics = { people: 0, cases: 0, meetings: 0, documents: 0 }

  for (const entry of entries) {
    for (const tag of entry.tags) {
      categoryCounts[tag.category] = (categoryCounts[tag.category] || 0) + 1
    }
    for (const m of entry.metrics) {
      if (m.unit === 'people') totalMetrics.people += m.value
      if (m.unit === 'cases') totalMetrics.cases += m.value
      if (m.unit === 'meetings') totalMetrics.meetings += m.value
      if (m.unit === 'documents') totalMetrics.documents += m.value
    }
  }

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const maxCount = sortedCategories[0]?.[1] || 1

  const highImpact = entries.filter((e) => e.impact === 'high').length
  const medImpact = entries.filter((e) => e.impact === 'medium').length
  const totalImpact = entries.length

  const monthlyData = groupByMonth(entries)
  const months = Object.keys(monthlyData).sort().slice(-6)
  const maxMonthly = Math.max(...months.map((m) => monthlyData[m] || 0), 1)

  return (
    <div className="space-y-5">
      {/* Hero stats */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Impact This Year</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-4xl font-bold">{entries.length}</div>
            <div className="text-sm text-slate-300 mt-1">Contributions logged</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-teal-400">{highImpact}</div>
            <div className="text-sm text-slate-300 mt-1">High-impact wins</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold">{sortedCategories.length}</div>
            <div className="text-xs text-slate-400">Areas covered</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{totalMetrics.people}</div>
            <div className="text-xs text-slate-400">People engaged</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{totalMetrics.cases}</div>
            <div className="text-xs text-slate-400">Cases handled</div>
          </div>
        </div>
      </div>

      {/* Impact breakdown */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Impact breakdown</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'High Impact', count: highImpact, color: 'bg-emerald-500', text: 'text-emerald-700' },
            { label: 'Medium Impact', count: medImpact, color: 'bg-amber-400', text: 'text-amber-700' },
            { label: 'Routine', count: totalImpact - highImpact - medImpact, color: 'bg-slate-200', text: 'text-slate-500' },
          ].map(({ label, count, color, text }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${text}`}>{label}</span>
                <span className="text-slate-400">{count}</span>
              </div>
              <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all`}
                  style={{ width: `${totalImpact > 0 ? (count / totalImpact) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Contribution areas</h3>
        </div>
        {sortedCategories.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No data yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([cat, count]) => (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BG[cat] || 'bg-slate-100'} ${CATEGORY_TEXT[cat] || 'text-slate-600'}`}>
                    {cat}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{count} entries</span>
                </div>
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${CATEGORY_COLORS[cat] || 'bg-slate-400'} rounded-full transition-all`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly activity */}
      {months.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Monthly activity</h3>
          </div>
          <div className="flex items-end gap-2 h-24">
            {months.map((m) => {
              const count = monthlyData[m] || 0
              const heightPct = (count / maxMonthly) * 100
              const [year, month] = m.split('-')
              const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-SG', { month: 'short' })
              return (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">{count}</span>
                  <div className="w-full bg-slate-50 rounded-t-md relative" style={{ height: '64px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-teal-400 rounded-t-md transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Key metrics */}
      {(totalMetrics.people + totalMetrics.cases + totalMetrics.meetings + totalMetrics.documents) > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">Extracted metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'People engaged', value: totalMetrics.people, show: totalMetrics.people > 0 },
              { label: 'Cases handled', value: totalMetrics.cases, show: totalMetrics.cases > 0 },
              { label: 'Meetings facilitated', value: totalMetrics.meetings, show: totalMetrics.meetings > 0 },
              { label: 'Documents produced', value: totalMetrics.documents, show: totalMetrics.documents > 0 },
            ].filter((m) => m.show).map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
