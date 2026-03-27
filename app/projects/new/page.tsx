'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Step1Context } from '@/components/questionnaire/Step1Context'
import { Step2Options } from '@/components/questionnaire/Step2Options'
import { Step3Assumptions } from '@/components/questionnaire/Step3Assumptions'
import { PersonaPreviewPanel } from '@/components/questionnaire/PersonaPreviewPanel'

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [productContext, setProductContext] = useState('')
  const [category, setCategory] = useState('')
  const [geography, setGeography] = useState('')
  const [userType, setUserType] = useState('')
  const [workflows, setWorkflows] = useState<string[]>([])
  const [constraints, setConstraints] = useState<string[]>([])
  const [assumptions, setAssumptions] = useState('')
  const [projectName, setProjectName] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    try {
      // Create project
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          product_context: productContext,
          category: category || null,
          geography: geography || null,
          user_type: userType || null,
          key_workflows: workflows,
          constraints,
          known_assumptions: assumptions || null,
        }),
      })
      const projectData = await projectRes.json()
      if (!projectRes.ok) throw new Error(projectData.error || 'Failed to create project')

      // Generate personas
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectData.project.id }),
      })
      if (!genRes.ok) {
        const genData = await genRes.json().catch(() => ({}))
        throw new Error(genData.error || `Generation failed (${genRes.status})`)
      }

      router.push(`/projects/${projectData.project.id}`)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-sm text-red-700">{error}</div>
      )}
    <div className="flex-1 flex">
      {/* Left: form (50%) */}
      <div className="w-1/2 flex flex-col border-r border-zinc-100 bg-white min-h-screen">
        {step === 1 && (
          <Step1Context
            productContext={productContext}
            category={category}
            onContextChange={setProductContext}
            onCategoryChange={setCategory}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2Options
            geography={geography}
            userType={userType}
            workflows={workflows}
            constraints={constraints}
            onGeographyChange={setGeography}
            onUserTypeChange={setUserType}
            onWorkflowsChange={setWorkflows}
            onConstraintsChange={setConstraints}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3Assumptions
            assumptions={assumptions}
            projectName={projectName}
            onAssumptionsChange={setAssumptions}
            onProjectNameChange={setProjectName}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
      </div>

      {/* Right: preview panel (50%) */}
      <div className="w-1/2 bg-zinc-50 min-h-screen">
        <PersonaPreviewPanel contextLength={productContext.length} />
      </div>
    </div>
    </div>
  )
}
