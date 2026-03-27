'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Step3Props {
  assumptions: string
  projectName: string
  onAssumptionsChange: (v: string) => void
  onProjectNameChange: (v: string) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

export function Step3Assumptions({
  assumptions, projectName,
  onAssumptionsChange, onProjectNameChange,
  onSubmit, onBack, loading,
}: Step3Props) {
  return (
    <div className="flex flex-col h-full px-11 py-10">
      <ProgressBar current={3} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 3 of 3 — Final details</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">What do you already believe?</h2>
      <p className="text-sm text-zinc-500 mb-6">
        These will be labeled as <strong>assumptions</strong> in the output — not facts. Very useful for surfacing blind spots.
      </p>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Project name</p>
          <input
            value={projectName}
            onChange={e => onProjectNameChange(e.target.value)}
            placeholder="e.g. Banking App for Newcomers"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2">Known assumptions (optional)</p>
          <Textarea
            value={assumptions}
            onChange={e => onAssumptionsChange(e.target.value)}
            placeholder="e.g. Users are comfortable with mobile apps. Most will be between 25–40. They will have a smartphone but may not have a laptop..."
            className="resize-none min-h-[100px] text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3 mt-auto">
        <Button variant="outline" onClick={onBack} disabled={loading}>← Back</Button>
        <Button onClick={onSubmit} disabled={loading || !projectName.trim()}>
          {loading ? 'Generating personas...' : 'Generate personas →'}
        </Button>
      </div>
    </div>
  )
}
