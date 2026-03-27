export type ConfidenceLevel = 'grounded' | 'inferred' | 'assumption'

export interface Trait {
  label: string
  variant: 'neutral' | 'risk' | 'caution' | 'positive' | 'urgent'
}

export interface Persona {
  id: string
  project_id: string
  name: string
  label: string
  summary: string
  avatar_url: string
  quote: string
  core_job: string
  context: string
  behaviors: string[]
  goals: string[]
  pain_points: string[]
  motivations: string[]
  fears: string[]
  constraints: string[]
  product_expectations: string[]
  abandonment_triggers: string[]
  design_implications: string[]
  traits: Trait[]
  confidence_overall: ConfidenceLevel
  confidence_note: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  product_context: string
  category: string | null
  geography: string | null
  user_type: string | null
  key_workflows: string[]
  constraints: string[]
  known_assumptions: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  persona_id: string
  project_id: string
  role: 'user' | 'assistant'
  content: string
  persona_voice: string | null
  reasoning: string | null
  product_action: string | null
  confidence_level: string | null
  created_at: string
}

// The raw shape Gemini returns for a persona (before DB insert)
export type PersonaPayload = Omit<Persona, 'id' | 'project_id' | 'created_at'>
