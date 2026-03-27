'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { PillSelector } from '@/components/shared/PillSelector'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const CATEGORIES = ['Banking', 'Healthcare', 'SaaS', 'Marketplace', 'Education', 'Enterprise', 'Other']
const MAX_CONTEXT = 500

interface Step1Props {
  productContext: string
  category: string
  onContextChange: (v: string) => void
  onCategoryChange: (v: string) => void
  onNext: () => void
}

export function Step1Context({ productContext, category, onContextChange, onCategoryChange, onNext }: Step1Props) {
  const canContinue = productContext.trim().length > 30 && category !== ''

  return (
    <div className="flex flex-col h-full px-11 py-10">
      <ProgressBar current={1} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 1 of 3 — Product context</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">What are you building?</h2>
      <p className="text-sm text-zinc-500 mb-6">Describe your product, who it's for, and what problem it solves.</p>

      <Textarea
        value={productContext}
        onChange={e => onContextChange(e.target.value.slice(0, MAX_CONTEXT))}
        placeholder="e.g. We are building a mobile banking app for newcomers in Canada. Users need to open an account quickly, verify identity, understand fees, and feel safe using the app..."
        className="resize-none min-h-[120px] mb-1 text-sm"
      />
      <p className="text-xs text-zinc-400 text-right mb-6">{productContext.length} / {MAX_CONTEXT}</p>

      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Product category</p>
      <PillSelector
        options={CATEGORIES}
        selected={category ? [category] : []}
        onChange={sel => onCategoryChange(sel[0] ?? '')}
        multiSelect={false}
      />

      <div className="mt-auto pt-8">
        <Button onClick={onNext} disabled={!canContinue} className="w-full sm:w-auto">
          Continue →
        </Button>
      </div>
    </div>
  )
}
