import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">UserPersonas</h1>
            <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/projects/new">
              <Button>+ New project</Button>
            </Link>
            <form action="/auth/signout" method="post">
              <button className="text-sm text-zinc-400 hover:text-zinc-600">Sign out</button>
            </form>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
            <p className="text-zinc-400 text-sm mb-4">No projects yet</p>
            <Link href="/projects/new">
              <Button variant="outline">Create your first project →</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map(project => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-300 transition-colors cursor-pointer">
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-semibold text-zinc-900">{project.name}</h2>
                    <span className="text-xs text-zinc-400">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {project.category && (
                    <span className="inline-block mt-2 text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                      {project.category}
                    </span>
                  )}
                  <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{project.product_context}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
