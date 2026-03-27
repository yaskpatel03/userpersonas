import { NextRequest, NextResponse } from 'next/server'
import { createProject, getProjects } from '@/lib/db/queries'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await getProjects()
  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const project = await createProject(body)
  return NextResponse.json({ project }, { status: 201 })
}
