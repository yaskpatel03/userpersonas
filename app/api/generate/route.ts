import { NextRequest, NextResponse } from 'next/server'
import { generatePersonas } from '@/lib/gemini/generatePersonas'
import { savePersonas, deletePersonasForProject, getProject } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { project_id } = await request.json()
  if (!project_id) return NextResponse.json({ error: 'project_id required' }, { status: 400 })

  try {
    const project = await getProject(project_id)

    // Delete existing personas before regenerating
    await deletePersonasForProject(project_id)

    const personas = await generatePersonas(project)
    const saved = await savePersonas(project_id, personas)

    return NextResponse.json({ personas: saved })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    console.error('Generate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
