interface PersonaPreviewPanelProps {
  contextLength: number // chars typed so far
}

const PREVIEW_PERSONAS = [
  { name: 'Alex', label: 'Primary user', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Maya', label: 'Secondary user', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
  { name: 'Jordan', label: 'Edge case user', avatar: 'https://randomuser.me/api/portraits/men/67.jpg' },
]

export function PersonaPreviewPanel({ contextLength }: PersonaPreviewPanelProps) {
  // Reveal cards progressively as user types more context
  const revealed = contextLength > 200 ? 3 : contextLength > 80 ? 2 : contextLength > 20 ? 1 : 0

  return (
    <div className="flex flex-col items-center justify-center h-full px-10 gap-4">
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Preview — personas you'll get</p>
      {PREVIEW_PERSONAS.map((p, i) => (
        <div
          key={p.name}
          className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 transition-all duration-500"
          style={{ opacity: i < revealed ? 1 : 0.15, filter: i < revealed ? 'none' : 'blur(4px)' }}
        >
          <div className="flex items-center gap-3">
            <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-semibold text-zinc-900">{p.name}</div>
              <div className="text-xs text-zinc-400">{p.label}</div>
            </div>
            {i < revealed && (
              <div className="ml-auto text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-medium">Inferred</div>
            )}
          </div>
          {i < revealed && (
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Will be generated from your product context...
            </p>
          )}
        </div>
      ))}
      <p className="text-xs text-zinc-400 text-center mt-2">
        {contextLength < 20 ? 'Start typing to preview...' : 'Personas revealed as you add more context'}
      </p>
    </div>
  )
}
