import { redirect } from 'next/navigation'
import { getProject, getPersonasForProject, getChatMessages } from '@/lib/db/queries'
import { PersonaSidebar } from '@/components/chat/PersonaSidebar'
import { ChatClient } from './ChatClient'

export default async function ChatPage({ params }: { params: Promise<{ id: string; personaId: string }> }) {
  const { id, personaId } = await params
  const [project, personas, initialMessages] = await Promise.all([
    getProject(id),
    getPersonasForProject(id),
    getChatMessages(personaId),
  ])

  const persona = personas.find(p => p.id === personaId)
  if (!persona || !project) redirect(`/projects/${id}`)

  return (
    <div className="h-screen flex">
      <PersonaSidebar persona={persona} projectId={id} />
      <div className="flex-1 flex flex-col">
        <ChatClient
          persona={persona}
          projectId={id}
          initialMessages={initialMessages}
        />
      </div>
    </div>
  )
}
