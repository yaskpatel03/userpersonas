import type { Persona } from '@/lib/personas/types'

const BADGE_CLASSES = {
  grounded: 'bg-green-50 text-green-700',
  inferred: 'bg-yellow-50 text-yellow-700',
  assumption: 'bg-red-50 text-red-700',
}

export function PersonaSidebar({ persona, projectId }: { persona: Persona; projectId: string }) {
  return (
    <div className="w-64 shrink-0 bg-zinc-50 border-r border-zinc-100 p-6 flex flex-col gap-4">
      <a href={`/projects/${projectId}`} className="text-xs text-zinc-400 hover:text-zinc-600">← Back to personas</a>
      <div className="flex items-center gap-3">
        <img src={persona.avatar_url} alt={persona.name} className="w-11 h-11 rounded-full object-cover" />
        <div>
          <p className="font-bold text-zinc-900">{persona.name}</p>
          <p className="text-xs text-zinc-500">{persona.label}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Primary goal</p>
        <p className="text-sm text-zinc-700 leading-relaxed">{persona.core_job}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Main blocker</p>
        <p className="text-sm text-zinc-700 leading-relaxed">{persona.pain_points[0]}</p>
      </div>
      <div className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${BADGE_CLASSES[persona.confidence_overall]}`}>
        ⚠ {persona.confidence_note}
      </div>
    </div>
  )
}
