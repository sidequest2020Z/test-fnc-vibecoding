import type { WorkEntry } from './types'

const KEY = 'worklog_entries'

export function getEntries(): WorkEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as WorkEntry[]) : []
  } catch {
    return []
  }
}

export function saveEntry(entry: WorkEntry): void {
  const entries = getEntries()
  entries.unshift(entry)
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function updateEntry(updated: WorkEntry): void {
  const entries = getEntries()
  const idx = entries.findIndex((e) => e.id === updated.id)
  if (idx !== -1) {
    entries[idx] = updated
    localStorage.setItem(KEY, JSON.stringify(entries))
  }
}

export function deleteEntry(id: string): void {
  const entries = getEntries().filter((e) => e.id !== id)
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function seedDemoData(): void {
  if (getEntries().length > 0) return
  const { simulateAIEnrichment } = require('./ai')

  const demos = [
    { date: '2026-06-20', content: 'Led a briefing with 12 stakeholders on the new procurement framework. Addressed concerns and aligned on implementation timeline.' },
    { date: '2026-06-18', content: 'Completed review of 3 policy documents for the upcoming budget cycle. Submitted recommendations to senior management.' },
    { date: '2026-06-15', content: 'Resolved 24 outstanding cases from the backlog. Reduced queue by 40% this week.' },
    { date: '2026-06-12', content: 'Launched the new officer onboarding portal. 8 new staff onboarded successfully in the first rollout.' },
    { date: '2026-06-10', content: 'Attended a 2-day leadership development workshop. Learnt frameworks for managing high-performing teams.' },
    { date: '2026-06-05', content: 'Facilitated inter-agency workshop with 20 participants from 4 ministries. Drafted joint action plan.' },
    { date: '2026-05-28', content: 'Mentored 2 junior officers on stakeholder engagement techniques. Provided feedback on their first independent briefings.' },
    { date: '2026-05-22', content: 'Published operational guideline document covering new compliance procedures. Circulated to 6 divisions.' },
  ]

  const entries: WorkEntry[] = demos.map((d, i) => {
    const enriched = simulateAIEnrichment(d.content)
    return {
      id: `demo-${i}`,
      date: d.date,
      content: d.content,
      tags: enriched.tags,
      metrics: enriched.metrics,
      impact: enriched.impact,
      enriched: true,
      createdAt: new Date(d.date).toISOString(),
    }
  })

  localStorage.setItem(KEY, JSON.stringify(entries))
}
