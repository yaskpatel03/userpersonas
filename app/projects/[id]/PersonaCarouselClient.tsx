'use client'

import { useRouter } from 'next/navigation'
import { PersonaCarousel } from '@/components/personas/PersonaCarousel'
import type { Persona } from '@/lib/personas/types'

export function PersonaCarouselClient({ personas, projectId }: { personas: Persona[]; projectId: string }) {
  const router = useRouter()
  function handleChat(personaId: string) {
    router.push(`/projects/${projectId}/chat/${personaId}`)
  }
  return <PersonaCarousel personas={personas} onChat={handleChat} />
}
