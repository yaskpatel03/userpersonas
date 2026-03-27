'use client'

import { ProgressBar } from '@/components/shared/ProgressBar'
import { PillSelector } from '@/components/shared/PillSelector'
import { Button } from '@/components/ui/button'

const GEOGRAPHIES = ['Canada', 'USA', 'Europe', 'UK', 'Australia', 'Global', 'Other']
const USER_TYPES = ['Consumers', 'Small businesses', 'Enterprises', 'Students', 'Patients', 'Immigrants', 'Operations teams']
const WORKFLOWS = ['Signup', 'Identity verification', 'Document upload', 'Checkout', 'Onboarding', 'Dashboard', 'Search', 'Booking']
const CONSTRAINTS = ['Low trust', 'Low digital literacy', 'Mobile-first', 'Compliance-heavy', 'High urgency', 'Language barriers', 'Low income']

interface Step2Props {
  geography: string
  userType: string
  workflows: string[]
  constraints: string[]
  onGeographyChange: (v: string) => void
  onUserTypeChange: (v: string) => void
  onWorkflowsChange: (v: string[]) => void
  onConstraintsChange: (v: string[]) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Options({
  geography, userType, workflows, constraints,
  onGeographyChange, onUserTypeChange, onWorkflowsChange, onConstraintsChange,
  onNext, onBack,
}: Step2Props) {
  return (
    <div className="flex flex-col h-full px-11 py-10 overflow-y-auto">
      <ProgressBar current={2} total={3} />
      <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">Step 2 of 3 — Optional context</p>
      <h2 className="text-2xl font-bold text-zinc-900 mb-1">Tell us more</h2>
      <p className="text-sm text-zinc-500 mb-6">Optional — but better context means better personas.</p>

      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Geography</p>
          <PillSelector options={GEOGRAPHIES} selected={geography ? [geography] : []} onChange={sel => onGeographyChange(sel[0] ?? '')} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Primary user type</p>
          <PillSelector options={USER_TYPES} selected={userType ? [userType] : []} onChange={sel => onUserTypeChange(sel[0] ?? '')} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Key workflows</p>
          <PillSelector options={WORKFLOWS} selected={workflows} onChange={onWorkflowsChange} multiSelect />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Known constraints</p>
          <PillSelector options={CONSTRAINTS} selected={constraints} onChange={onConstraintsChange} multiSelect />
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-4">
        <Button variant="outline" onClick={onBack}>← Back</Button>
        <Button onClick={onNext}>Continue →</Button>
      </div>
    </div>
  )
}
