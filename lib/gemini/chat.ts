import { flashModel } from './client'
import { buildChatPrompt } from './prompts'
import type { Persona } from '@/lib/personas/types'

export async function getChatResponse(
  persona: Persona,
  productContext: string,
  userQuestion: string
): Promise<{
  persona_voice: string
  reasoning: string
  product_action: string
  confidence_level: string
  content: string
}> {
  const prompt = buildChatPrompt(
    persona.name,
    productContext,
    persona.label,
    userQuestion
  )

  const result = await flashModel.generateContent(prompt)
  const text = result.response.text().trim()

  let parsed: {
    PERSONA_VOICE: string
    WHY: string
    PRODUCT_ACTION: string
    CONFIDENCE: string
  }

  try {
    parsed = JSON.parse(text)
  } catch {
    // Fallback if Gemini wraps in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Chat response not parseable')
    parsed = JSON.parse(jsonMatch[0])
  }

  return {
    persona_voice: parsed.PERSONA_VOICE,
    reasoning: parsed.WHY,
    product_action: parsed.PRODUCT_ACTION,
    confidence_level: parsed.CONFIDENCE,
    content: parsed.PERSONA_VOICE, // top-level content for message list
  }
}
