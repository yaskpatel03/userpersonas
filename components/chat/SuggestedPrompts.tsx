const DEFAULT_PROMPTS = [
  'What would confuse you in this onboarding?',
  'Would you trust this product?',
  'Why would you abandon this flow?',
  'What do you need to know before continuing?',
  'What would make you feel more comfortable?',
]

export function SuggestedPrompts({ onSelect, disabled }: { onSelect: (p: string) => void; disabled: boolean }) {
  return (
    <div className="px-4 pb-3 flex gap-2 flex-wrap">
      {DEFAULT_PROMPTS.map(p => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          disabled={disabled}
          className="text-xs text-zinc-500 border border-zinc-200 rounded-full px-3 py-1.5 hover:border-zinc-400 hover:text-zinc-700 transition-colors disabled:opacity-40"
        >
          {p}
        </button>
      ))}
    </div>
  )
}
