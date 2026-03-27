import { NextRequest, NextResponse } from 'next/server'
import { getChatResponse } from '@/lib/gemini/chat'
import { saveChatMessage, getChatMessages } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'
import { getPersonasForProject, getProject } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { persona_id, project_id, message } = await request.json()
  if (!persona_id || !project_id || !message) {
    return NextResponse.json({ error: 'persona_id, project_id, and message required' }, { status: 400 })
  }

  // Save user message
  await saveChatMessage({
    persona_id,
    project_id,
    role: 'user',
    content: message,
    persona_voice: null,
    reasoning: null,
    product_action: null,
    confidence_level: null,
  })

  // Get persona + project for context
  const personas = await getPersonasForProject(project_id)
  const persona = personas.find(p => p.id === persona_id)
  if (!persona) return NextResponse.json({ error: 'Persona not found' }, { status: 404 })

  const project = await getProject(project_id)

  // Get AI response
  const response = await getChatResponse(persona, project.product_context, message)

  // Save assistant message
  const saved = await saveChatMessage({
    persona_id,
    project_id,
    role: 'assistant',
    ...response,
  })

  return NextResponse.json({ message: saved })
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const persona_id = searchParams.get('persona_id')
  if (!persona_id) return NextResponse.json({ error: 'persona_id required' }, { status: 400 })

  const messages = await getChatMessages(persona_id)
  return NextResponse.json({ messages })
}
