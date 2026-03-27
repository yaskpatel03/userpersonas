'use client'

import { useState } from 'react'
import type { Persona } from '@/lib/personas/types'

const TABS = [
  { id: 'goals', label: 'Goals & Context' },
  { id: 'painpoints', label: 'Pain Points & Fears' },
  { id: 'behaviors', label: 'Behaviors' },
  { id: 'design', label: 'Design Implications' },
]

function Section({ label, items, variant = 'default' }: { label: string; items: string[]; variant?: 'default' | 'red' | 'green' }) {
  const labelClass = variant === 'red' ? 'text-red-600' : variant === 'green' ? 'text-green-700' : 'text-zinc-500'
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${labelClass}`}>{label}</p>
      <ul className="space-y-1.5 pl-4 list-disc">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-zinc-600 leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ImplicationItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-xs shrink-0 mt-0.5">→</div>
      <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
    </div>
  )
}

export function PersonaTabs({ persona }: { persona: Persona }) {
  const [activeTab, setActiveTab] = useState('goals')

  return (
    <div>
      {/* Tab nav */}
      <div className="flex border-b border-zinc-100 px-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-8 py-6">
        {activeTab === 'goals' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section label="Core Job to Be Done" items={[persona.core_job]} variant="green" />
              <Section label="Context" items={[persona.context]} />
            </div>
            <div className="space-y-6">
              <Section label="Goals" items={persona.goals} variant="green" />
              <Section label="Motivations" items={persona.motivations} />
            </div>
          </div>
        )}
        {activeTab === 'painpoints' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <Section label="Pain Points" items={persona.pain_points} variant="red" />
              <Section label="Abandonment Triggers" items={persona.abandonment_triggers} variant="red" />
            </div>
            <div className="space-y-6">
              <Section label="Fears & Objections" items={persona.fears} variant="red" />
              <Section label="Constraints" items={persona.constraints} />
            </div>
          </div>
        )}
        {activeTab === 'behaviors' && (
          <div className="grid grid-cols-2 gap-8">
            <Section label="Typical Behaviors" items={persona.behaviors} />
            <Section label="Product Expectations" items={persona.product_expectations} />
          </div>
        )}
        {activeTab === 'design' && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Design & PM Implications</p>
            {persona.design_implications.map((item, i) => (
              <ImplicationItem key={i} text={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
