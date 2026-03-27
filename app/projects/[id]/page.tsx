import { redirect } from 'next/navigation'
import { getProject, getPersonasForProject } from '@/lib/db/queries'
import { PersonaCarouselClient } from './PersonaCarouselClient'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [project, personas] = await Promise.all([
    getProject(id),
    getPersonasForProject(id),
  ])

  if (!project) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-2xl font-bold text-zinc-900">{project.name}</h1>
          <div className="flex gap-2">
            <a href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600">← Dashboard</a>
          </div>
        </div>
        <p className="text-sm text-zinc-500 mb-8">
          {personas.length} persona{personas.length !== 1 ? 's' : ''} generated ·{' '}
          {project.category && `${project.category} · `}
          <span className="text-amber-600">Some traits may be inferred</span>
        </p>
        <PersonaCarouselClient personas={personas} projectId={id} />
      </div>
    </div>
  )
}
