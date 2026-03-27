interface PillSelectorProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  multiSelect?: boolean
}

export function PillSelector({ options, selected, onChange, multiSelect = false }: PillSelectorProps) {
  function toggle(option: string) {
    if (multiSelect) {
      onChange(selected.includes(option) ? selected.filter(o => o !== option) : [...selected, option])
    } else {
      onChange(selected.includes(option) ? [] : [option])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          onClick={() => toggle(option)}
          className={`px-4 py-1.5 rounded-full text-sm border transition-all duration-150 ${
            selected.includes(option)
              ? 'border-zinc-900 bg-zinc-900 text-white font-medium'
              : 'border-zinc-200 text-zinc-600 hover:border-zinc-400'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
