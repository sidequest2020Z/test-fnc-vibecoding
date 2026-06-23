export type CategoryType =
  | 'Stakeholder Engagement'
  | 'Policy & Research'
  | 'Project Delivery'
  | 'Operations'
  | 'Learning & Development'
  | 'Leadership'

export type ImpactLevel = 'high' | 'medium' | 'low'

export interface Tag {
  label: string
  category: CategoryType
  color: string
}

export interface Metric {
  value: number
  unit: string
  label: string
}

export interface WorkEntry {
  id: string
  date: string
  content: string
  tags: Tag[]
  metrics: Metric[]
  impact: ImpactLevel
  enriched: boolean
  createdAt: string
}
