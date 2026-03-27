import { createClient } from '@/lib/supabase/server'
import type { Project, Persona, ChatMessage, PersonaPayload } from '@/lib/personas/types'

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<Project> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProject(input: {
  name: string
  product_context: string
  category?: string
  geography?: string
  user_type?: string
  key_workflows?: string[]
  constraints?: string[]
  known_assumptions?: string
}): Promise<Project> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProjectContext(id: string, product_context: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ product_context })
    .eq('id', id)
  if (error) throw error
}

// ── Personas ──────────────────────────────────────────────────────────────────

export async function getPersonasForProject(project_id: string): Promise<Persona[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('project_id', project_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function savePersonas(project_id: string, personas: PersonaPayload[]): Promise<Persona[]> {
  const supabase = await createClient()
  const rows = personas.map(p => ({ ...p, project_id }))
  const { data, error } = await supabase
    .from('personas')
    .insert(rows)
    .select()
  if (error) throw error
  return data
}

export async function deletePersonasForProject(project_id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('project_id', project_id)
  if (error) throw error
}

// ── Chat Messages ─────────────────────────────────────────────────────────────

export async function getChatMessages(persona_id: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('persona_id', persona_id)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function saveChatMessage(msg: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(msg)
    .select()
    .single()
  if (error) throw error
  return data
}
