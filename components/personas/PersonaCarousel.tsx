'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Persona } from '@/lib/personas/types'
import { PersonaCard } from './PersonaCard'

interface PersonaCarouselProps {
  personas: Persona[]
  onChat: (personaId: string) => void
}

export function PersonaCarousel({ personas, onChat }: PersonaCarouselProps) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent(c => (c - 1 + personas.length) % personas.length), [personas.length])
  const next = useCallback(() => setCurrent(c => (c + 1) % personas.length), [personas.length])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Touch swipe
  let touchStart = 0
  function onTouchStart(e: React.TouchEvent) { touchStart = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  return (
    <div className="relative">
      {/* Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {personas.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === current ? 'w-6 bg-zinc-900' : 'w-2 bg-zinc-300'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      {personas.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-10 h-10 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-700 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            ›
          </button>
        </>
      )}

      {/* Card */}
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {personas[current] && (
          <PersonaCard persona={personas[current]} index={current} onChat={onChat} />
        )}
      </div>

      <p className="text-center text-xs text-zinc-400 mt-3">
        Persona {current + 1} of {personas.length} · use arrows or swipe to navigate
      </p>
    </div>
  )
}
