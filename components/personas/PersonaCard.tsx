import type { Persona } from '@/lib/personas/types'
import { PersonaHero } from './PersonaHero'
import { TraitPills } from './TraitPills'
import { PersonaTabs } from './PersonaTabs'
import { ConfidenceBar } from './ConfidenceBar'

interface PersonaCardProps {
  persona: Persona
  index: number
  onChat: (personaId: string) => void
}

export function PersonaCard({ persona, index, onChat }: PersonaCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
      <PersonaHero persona={persona} index={index} onChat={() => onChat(persona.id)} />
      <TraitPills traits={persona.traits} />
      <PersonaTabs persona={persona} />
      <ConfidenceBar level={persona.confidence_overall} note={persona.confidence_note} />
    </div>
  )
}
