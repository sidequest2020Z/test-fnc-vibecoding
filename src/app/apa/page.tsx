'use client'

import { useEffect, useState } from 'react'
import { getEntries } from '@/lib/storage'
import { generateAPASummary } from '@/lib/ai'
import type { WorkEntry } from '@/lib/types'
import { Copy, Check, Sparkles, FileText, List } from 'lucide-react'

export default function APAPage() {
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [copiedBullets, setCopiedBullets] = useState(false)
  const [copiedNarrative, setCopiedNarrative] = useState(false)
  const [activeTab, setActiveTab] = useState<'bullets' | 'narrative'>('bullets')

  useEffect(() => {
    setEntries(getEntries())
    setMounted(true)
  }, [])

  if (!mounted) return null

  const { bullets, narrative } = generateAPASummary(entries)

  function copyBullets() {
    const text = bullets.map((b) => `• ${b}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedBullets(true)
    setTimeout(() => setCopiedBullets(false), 2000)
  }

  function copyNarrative() {
    navigator.clipboard.writeText(narrative)
    setCopiedNarrative(true)
    setTimeout(() => setCopiedNarrative(false), 2000)
  }

  const highCount = entries.filter((e) => e.impact === 'high').length
  const catSet = new Set(entries.flatMap((e) => e.tags.map((t) => t.category)))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg">Your APA Summary</h1>
            <p className="text-sm text-teal-100 mt-0.5">
              Generated from {entries.length} logged entries — ready to paste into your performance review.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xl font-bold">{entries.length}</div>
            <div className="text-xs text-teal-200">Entries</div>
          </div>
          <div>
            <div className="text-xl font-bold">{highCount}</div>
            <div className="text-xs text-teal-200">High Impact</div>
          </div>
          <div>
            <div className="text-xl font-bold">{catSet.size}</div>
            <div className="text-xs text-teal-200">Areas</div>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-200" />
          <h3 className="font-semibold text-slate-600 mb-1">No entries yet</h3>
          <p className="text-sm text-slate-400">Log your work first, then come back here to generate your APA summary.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab('bullets')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'bullets'
                    ? 'text-teal-700 bg-teal-50 border-b-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={14} />
                Key Bullets
              </button>
              <button
                onClick={() => setActiveTab('narrative')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'narrative'
                    ? 'text-teal-700 bg-teal-50 border-b-2 border-teal-500'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <FileText size={14} />
                Narrative
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'bullets' ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Quantified achievements</span>
                    <button
                      onClick={copyBullets}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 transition-colors font-medium"
                    >
                      {copiedBullets ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {bullets.map((bullet, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Narrative summary</span>
                    <button
                      onClick={copyNarrative}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-500 hover:text-teal-600 transition-colors font-medium"
                    >
                      {copiedNarrative ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700 leading-7 whitespace-pre-wrap">{narrative}</p>
                </>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <span className="text-amber-500 text-sm">💡</span>
              <div>
                <div className="text-sm font-semibold text-amber-800 mb-1">Tips for your APA</div>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Use the bullets as your key achievements list — they're already quantified.</li>
                  <li>• Personalise the narrative with specific project names your supervisor will recognise.</li>
                  <li>• Add any context the AI couldn't extract from your raw logs.</li>
                  <li>• Keep logging throughout the year so next APA writes itself.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
