import { flashModel } from './client'
import { buildSegmentationPrompt, buildPersonaPrompt } from './prompts'
import { getAvatarUrl, inferGender } from '@/lib/personas/avatar'
import type { Project, PersonaPayload } from '@/lib/personas/types'

type ProjectInput = Pick<Project, 'product_context' | 'category' | 'geography' | 'user_type' | 'key_workflows' | 'constraints' | 'known_assumptions'>

function stripMarkdown(text: string): string {
  return text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
}

export async function generatePersonas(project: ProjectInput): Promise<PersonaPayload[]> {
  // Stage 1: Segmentation
  const segPrompt = buildSegmentationPrompt(project)
  const segResult = await flashModel.generateContent(segPrompt)
  const segText = stripMarkdown(segResult.response.text().trim())

  let segmentation: { segments: Array<{ suggested_name: string; suggested_gender: string }> }
  try {
    segmentation = JSON.parse(segText)
  } catch {
    throw new Error(`Segmentation JSON parse failed: ${segText.slice(0, 200)}`)
  }

  // Stage 2: Build personas
  const personaPrompt = buildPersonaPrompt(segText, project)
  const personaResult = await flashModel.generateContent(personaPrompt)
  const personaText = stripMarkdown(personaResult.response.text().trim())

  let parsed: { personas: PersonaPayload[] }
  try {
    parsed = JSON.parse(personaText)
  } catch {
    throw new Error(`Persona JSON parse failed: ${personaText.slice(0, 200)}`)
  }

  // Attach avatar URLs
  return parsed.personas.map((p, i) => {
    const segHint = segmentation.segments[i]
    const gender = (segHint?.suggested_gender === 'female' ? 'female' : null)
      ?? inferGender(p.name)
    return { ...p, avatar_url: getAvatarUrl(p.name, gender) }
  })
}
