import type { Persona } from '@/lib/personas/types'

const GRADIENTS = [
  'from-indigo-950 to-indigo-800',
  'from-emerald-950 to-emerald-800',
  'from-orange-950 to-orange-800',
  'from-violet-950 to-violet-800',
]

const BADGE_CLASSES = {
  grounded: 'bg-green-100 text-green-800',
  inferred: 'bg-yellow-100 text-yellow-800',
  assumption: 'bg-red-100 text-red-800',
}

const BADGE_LABELS = {
  grounded: '✓ Mostly Grounded',
  inferred: '⚠ Mostly Inferred',
  assumption: '⚠ Assumption-Heavy',
}

interface PersonaHeroProps {
  persona: Persona
  index: number
  onChat: () => void
}

export function PersonaHero({ persona, index, onChat }: PersonaHeroProps) {
  const gradient = GRADIENTS[index % GRADIENTS.length]
  return (
    <div className={`bg-gradient-to-br ${gradient} px-8 py-6 flex items-start justify-between gap-6`}>
      <div className="flex items-start gap-5">
        <img
          src={persona.avatar_url}
          alt={persona.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/20 shrink-0"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{persona.name}</h2>
          <p className="text-sm text-white/70 mt-0.5">{persona.label}</p>
          <p className="text-sm text-white/80 mt-3 italic border-l-2 border-white/30 pl-3 leading-relaxed max-w-lg">
            "{persona.quote}"
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${BADGE_CLASSES[persona.confidence_overall]}`}>
          {BADGE_LABELS[persona.confidence_overall]}
        </span>
        <button
          onClick={onChat}
          className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/20 transition-colors"
        >
          Chat with {persona.name.split(' ')[0]} →
        </button>
      </div>
    </div>
  )
}
