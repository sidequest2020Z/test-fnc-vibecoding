import type { CategoryType, ImpactLevel, Tag, Metric, WorkEntry } from './types'

const CATEGORY_KEYWORDS: Record<CategoryType, string[]> = {
  'Stakeholder Engagement': [
    'meeting', 'briefing', 'workshop', 'stakeholder', 'consultation',
    'presentation', 'discussed', 'aligned', 'engaged', 'coordinated',
    'liaison', 'committee', 'townhall', 'session', 'interview',
  ],
  'Policy & Research': [
    'policy', 'research', 'review', 'analysis', 'report', 'drafted',
    'paper', 'framework', 'guideline', 'proposal', 'study', 'data',
    'survey', 'recommendation', 'findings',
  ],
  'Project Delivery': [
    'launched', 'delivered', 'completed', 'deployed', 'implemented',
    'milestone', 'project', 'initiative', 'rollout', 'onboarded',
    'system', 'platform', 'solution', 'developed', 'built',
  ],
  'Operations': [
    'processed', 'resolved', 'handled', 'managed', 'cases', 'queries',
    'requests', 'backlog', 'tickets', 'approvals', 'operations',
    'workflow', 'procedures', 'compliance', 'audit',
  ],
  'Learning & Development': [
    'training', 'course', 'certified', 'workshop', 'learnt', 'learned',
    'skill', 'seminar', 'conference', 'upskilled', 'development',
    'knowledge', 'studied', 'attended',
  ],
  'Leadership': [
    'led', 'managed', 'mentored', 'coached', 'supervised', 'guided',
    'team', 'officer', 'staff', 'intern', 'junior', 'feedback',
    'delegation', 'decision', 'strategy',
  ],
}

const CATEGORY_COLORS: Record<CategoryType, string> = {
  'Stakeholder Engagement': 'bg-blue-100 text-blue-800',
  'Policy & Research': 'bg-purple-100 text-purple-800',
  'Project Delivery': 'bg-green-100 text-green-800',
  'Operations': 'bg-orange-100 text-orange-800',
  'Learning & Development': 'bg-yellow-100 text-yellow-800',
  'Leadership': 'bg-pink-100 text-pink-800',
}

const HIGH_IMPACT_KEYWORDS = [
  'launched', 'delivered', 'completed', 'resolved', 'led', 'implemented',
  'approved', 'published', 'deployed', 'achieved', 'milestone',
]

const MEDIUM_IMPACT_KEYWORDS = [
  'presented', 'reviewed', 'coordinated', 'facilitated', 'drafted',
  'prepared', 'supported', 'attended', 'participated',
]

function extractNumbers(text: string): Metric[] {
  const metrics: Metric[] = []
  const patterns = [
    { regex: /(\d+)\s*(stakeholder|officer|participant|attendee|member|team)s?/gi, unit: 'people', label: 'People engaged' },
    { regex: /(\d+)\s*(case|ticket|request|query|queries|issue)s?/gi, unit: 'cases', label: 'Cases handled' },
    { regex: /(\d+)\s*(meeting|session|briefing|workshop)s?/gi, unit: 'meetings', label: 'Meetings held' },
    { regex: /(\d+)\s*(report|paper|document|guideline)s?/gi, unit: 'documents', label: 'Documents produced' },
    { regex: /(\d+)\s*(day|week|month)s?/gi, unit: 'days', label: 'Time period' },
    { regex: /(\d+)\s*%/g, unit: '%', label: 'Percentage metric' },
    { regex: /\$(\d[\d,]*)/g, unit: '$', label: 'Value' },
    { regex: /(\d+)\s*(project|initiative)s?/gi, unit: 'projects', label: 'Projects' },
  ]

  const seen = new Set<string>()
  for (const { regex, unit, label } of patterns) {
    let match
    while ((match = regex.exec(text)) !== null) {
      const value = parseInt(match[1].replace(/,/g, ''), 10)
      const key = `${value}-${unit}`
      if (!seen.has(key) && !isNaN(value)) {
        seen.add(key)
        metrics.push({ value, unit, label })
      }
    }
  }

  return metrics.slice(0, 3)
}

export function simulateAIEnrichment(content: string): {
  tags: Tag[]
  metrics: Metric[]
  impact: ImpactLevel
} {
  const lower = content.toLowerCase()

  // Detect categories
  const matchedCategories: { category: CategoryType; score: number }[] = []
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length
    if (score > 0) {
      matchedCategories.push({ category: category as CategoryType, score })
    }
  }
  matchedCategories.sort((a, b) => b.score - a.score)

  const topCategories = matchedCategories.slice(0, 2)
  const tags: Tag[] = topCategories.map(({ category }) => ({
    label: category,
    category,
    color: CATEGORY_COLORS[category],
  }))

  if (tags.length === 0) {
    tags.push({ label: 'Operations', category: 'Operations', color: CATEGORY_COLORS['Operations'] })
  }

  // Detect impact
  const highCount = HIGH_IMPACT_KEYWORDS.filter((kw) => lower.includes(kw)).length
  const medCount = MEDIUM_IMPACT_KEYWORDS.filter((kw) => lower.includes(kw)).length
  const impact: ImpactLevel = highCount >= 2 ? 'high' : medCount >= 2 ? 'medium' : highCount >= 1 ? 'medium' : 'low'

  const metrics = extractNumbers(content)

  return { tags, metrics, impact }
}

export function generateAPASummary(entries: WorkEntry[]): {
  bullets: string[]
  narrative: string
} {
  if (entries.length === 0) {
    return {
      bullets: ['No entries logged yet. Start logging your work to generate your APA summary.'],
      narrative: '',
    }
  }

  // Aggregate metrics
  const categoryCounts: Record<string, number> = {}
  let totalMetricValues: Record<string, number> = {}
  let highImpactCount = 0

  for (const entry of entries) {
    for (const tag of entry.tags) {
      categoryCounts[tag.category] = (categoryCounts[tag.category] || 0) + 1
    }
    if (entry.impact === 'high') highImpactCount++
    for (const metric of entry.metrics) {
      const key = metric.unit
      totalMetricValues[key] = (totalMetricValues[key] || 0) + metric.value
    }
  }

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  const secondCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[1]

  const bullets: string[] = []

  bullets.push(`Logged ${entries.length} work contributions across the APA period, demonstrating consistent and proactive documentation of impact.`)

  if (topCategory) {
    bullets.push(`Primary contribution area: ${topCategory[0]} — with ${topCategory[1]} recorded activities, reflecting sustained engagement in this domain.`)
  }
  if (secondCategory) {
    bullets.push(`Secondary contribution area: ${secondCategory[0]} — contributing ${secondCategory[1]} documented activities.`)
  }
  if (highImpactCount > 0) {
    bullets.push(`${highImpactCount} high-impact deliverable${highImpactCount > 1 ? 's' : ''} identified, including significant milestones, launches, and resolved outcomes.`)
  }
  if (totalMetricValues['people'] || totalMetricValues['meetings']) {
    const people = totalMetricValues['people'] || 0
    const meetings = totalMetricValues['meetings'] || 0
    const parts = []
    if (people > 0) parts.push(`${people} stakeholders engaged`)
    if (meetings > 0) parts.push(`${meetings} sessions facilitated`)
    bullets.push(`Stakeholder touchpoints: ${parts.join(', ')}.`)
  }
  if (totalMetricValues['cases'] || totalMetricValues['documents']) {
    const cases = totalMetricValues['cases'] || 0
    const docs = totalMetricValues['documents'] || 0
    const parts = []
    if (cases > 0) parts.push(`${cases} cases processed`)
    if (docs > 0) parts.push(`${docs} documents produced`)
    bullets.push(`Output metrics: ${parts.join(', ')}.`)
  }

  const categoryList = Object.keys(categoryCounts).join(', ')
  const narrative = `Over the past year, I have made consistent and measurable contributions across multiple key areas of my role — including ${categoryList}. I logged ${entries.length} work entries, ensuring that my contributions were captured in a timely and accurate manner. ${highImpactCount > 0 ? `Notably, ${highImpactCount} of these were high-impact deliverables that drove meaningful outcomes for the division. ` : ''}I have actively engaged stakeholders, supported policy work, and ensured operational continuity throughout the year. These contributions reflect my commitment to performance excellence and my team's mission.`

  return { bullets, narrative }
}
