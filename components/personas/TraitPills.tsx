import type { Trait } from '@/lib/personas/types'

const VARIANT_CLASSES: Record<Trait['variant'], string> = {
  neutral: 'bg-zinc-100 text-zinc-600',
  risk: 'bg-red-50 text-red-600',
  caution: 'bg-yellow-50 text-yellow-700',
  positive: 'bg-green-50 text-green-700',
  urgent: 'bg-blue-50 text-blue-700',
}

export function TraitPills({ traits }: { traits: Trait[] }) {
  return (
    <div className="flex flex-wrap gap-2 px-8 py-4 border-b border-zinc-100 bg-zinc-50/50">
      {traits.map(t => (
        <span key={t.label} className={`text-xs font-medium px-3 py-1 rounded-full ${VARIANT_CLASSES[t.variant]}`}>
          {t.label}
        </span>
      ))}
    </div>
  )
}
