interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 h-0.5 rounded-full transition-colors duration-300 ${
            i < current ? 'bg-zinc-900' : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  )
}
