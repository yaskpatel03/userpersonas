import { NextRequest, NextResponse } from 'next/server'
import { generatePersonas } from '@/lib/gemini/generatePersonas'
import { savePersonas, deletePersonasForProject, getProject, updateProjectContext } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  if (body.product_context) {
    await updateProjectContext(id, body.product_context)
  }

  const project = await getProject(id)
  await deletePersonasForProject(id)
  const personas = await generatePersonas(project)
  const saved = await savePersonas(id, personas)

  return NextResponse.json({ personas: saved })
}
