import type { ConfidenceLevel } from '@/lib/personas/types'

interface ConfidenceBarProps {
  level: ConfidenceLevel
  note: string
}

const LEVELS: Record<ConfidenceLevel, { width: string; color: string; label: string }> = {
  grounded: { width: 'w-3/4', color: 'bg-green-500', label: 'Mostly Grounded' },
  inferred: { width: 'w-5/12', color: 'bg-amber-400', label: 'Mostly Inferred' },
  assumption: { width: 'w-1/4', color: 'bg-red-400', label: 'Assumption-Heavy' },
}

export function ConfidenceBar({ level, note }: ConfidenceBarProps) {
  const cfg = LEVELS[level]
  return (
    <div className="px-8 py-4 border-t border-zinc-100 flex items-center gap-4">
      <span className="text-xs font-semibold text-zinc-500 whitespace-nowrap">Confidence</span>
      <div className="w-28 h-1 bg-zinc-100 rounded-full shrink-0">
        <div className={`h-full rounded-full ${cfg.width} ${cfg.color} transition-all`} />
      </div>
      <span className="text-xs text-zinc-400 leading-relaxed">{note}</span>
    </div>
  )
}
