'use client'

import { useState, useRef } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { simulateAIEnrichment } from '@/lib/ai'
import { saveEntry } from '@/lib/storage'
import type { WorkEntry } from '@/lib/types'
import clsx from 'clsx'

interface Props {
  onEntryAdded: (entry: WorkEntry) => void
}

const PROMPTS = [
  "What did you get done today?",
  "What problem did you solve today?",
  "What progress did you make?",
  "What did you deliver this week?",
  "What's a win worth remembering?",
]

export default function QuickLogBox({ onEntryAdded }: Props) {
  const [text, setText] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [lastEntry, setLastEntry] = useState<WorkEntry | null>(null)
  const placeholder = PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length]
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = ta.scrollHeight + 'px'
    }
  }

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true)

    // Simulate AI delay
    await new Promise((r) => setTimeout(r, 600))
    const enriched = simulateAIEnrichment(text)

    const entry: WorkEntry = {
      id: crypto.randomUUID(),
      date,
      content: text.trim(),
      tags: enriched.tags,
      metrics: enriched.metrics,
      impact: enriched.impact,
      enriched: true,
      createdAt: new Date().toISOString(),
    }

    saveEntry(entry)
    setLastEntry(entry)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setShowConfirmation(true)
    setLoading(false)
    onEntryAdded(entry)

    setTimeout(() => setShowConfirmation(false), 4000)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Log</span>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none text-slate-800 text-base leading-relaxed placeholder:text-slate-300 focus:outline-none"
          style={{ minHeight: '80px' }}
        />

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs text-slate-400 border-0 bg-slate-50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
            <span className="text-xs text-slate-300">⌘↵ to submit</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              text.trim() && !loading
                ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-sm hover:shadow-md'
                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            )}
          >
            {loading ? (
              <><Sparkles size={14} className="animate-spin" /> Analysing...</>
            ) : (
              <><Send size={14} /> Log it</>
            )}
          </button>
        </div>
      </div>

      {showConfirmation && lastEntry && (
        <div className="px-5 py-3 bg-teal-50 border-t border-teal-100 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-teal-500" />
            <span className="text-sm text-teal-700 font-medium">Logged & tagged as </span>
            {lastEntry.tags.map((t) => (
              <span key={t.label} className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', t.color)}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
