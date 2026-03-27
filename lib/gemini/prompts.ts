import type { Project } from '@/lib/personas/types'

type ProjectInput = Pick<Project, 'product_context' | 'category' | 'geography' | 'user_type' | 'key_workflows' | 'constraints' | 'known_assumptions'>

export function buildSegmentationPrompt(project: ProjectInput): string {
  const optional = [
    project.category && `Product category: ${project.category}`,
    project.geography && `Geography/market: ${project.geography}`,
    project.user_type && `Primary user type: ${project.user_type}`,
    project.key_workflows?.length && `Key workflows: ${project.key_workflows.join(', ')}`,
    project.constraints?.length && `Known constraints: ${project.constraints.join(', ')}`,
    project.known_assumptions && `Team's known assumptions: ${project.known_assumptions}`,
  ].filter(Boolean).join('\n')

  return `You are analyzing a product to identify distinct user segments for persona generation.

PRODUCT CONTEXT:
${project.product_context}

${optional ? `ADDITIONAL CONTEXT:\n${optional}` : ''}

Identify 2–4 meaningfully distinct user segments. Focus on differences that actually affect product behavior — trust level, urgency, digital confidence, goal type, emotional state, constraints. Do NOT create segments based on demographics alone.

Respond with valid JSON only, no markdown, no explanation:

{
  "product_domain": "string",
  "target_environment": "string",
  "key_risks": ["string"],
  "trust_level": "low|medium|high",
  "emotional_pressure": "string",
  "segments": [
    {
      "segment_id": "string",
      "label": "string",
      "key_differentiator": "string",
      "suggested_name": "string",
      "suggested_gender": "male|female",
      "priority": "primary|secondary"
    }
  ]
}`
}

export function buildPersonaPrompt(segmentationResult: string, project: ProjectInput): string {
  return `You are building evidence-aware user personas for a product team. These are not decorative profiles — they must be actionable for design and PM decisions.

PRODUCT CONTEXT:
${project.product_context}

SEGMENTATION ANALYSIS:
${segmentationResult}

${project.known_assumptions ? `TEAM'S KNOWN ASSUMPTIONS (label these as assumptions, not facts):\n${project.known_assumptions}` : ''}

Rules:
- Create exactly one persona per segment
- Every attribute must be tagged: "grounded" (directly from input), "inferred" (reasonable from context), or "assumption" (speculative)
- Personas must be distinct — if two are too similar, merge them
- Focus on goals, behaviors, fears, and constraints — not demographics
- Include a realistic first-person quote that reveals their emotional state
- Never invent statistics or precise percentages

Respond with valid JSON only, no markdown:

{
  "personas": [
    {
      "name": "string (realistic first name + last name)",
      "label": "string (short descriptor e.g. 'First-time newcomer banking user')",
      "summary": "string (one sentence — who they are and what they need)",
      "quote": "string (first-person, reveals emotional state, max 20 words)",
      "core_job": "string",
      "context": "string (situation they are in)",
      "behaviors": ["string"],
      "goals": ["string"],
      "pain_points": ["string"],
      "motivations": ["string"],
      "fears": ["string"],
      "constraints": ["string"],
      "product_expectations": ["string"],
      "abandonment_triggers": ["string"],
      "design_implications": ["string"],
      "traits": [
        { "label": "string", "variant": "neutral|risk|caution|positive|urgent" }
      ],
      "confidence_overall": "grounded|inferred|assumption",
      "confidence_note": "string (explain what is grounded vs inferred)"
    }
  ]
}`
}

export function buildChatPrompt(
  personaName: string,
  productContext: string,
  personaLabel: string,
  userQuestion: string
): string {
  return `You are ${personaName}, a user persona — ${personaLabel}.

Product context: ${productContext}

The product team is asking you a question. Respond as this persona, grounded in their goals, fears, constraints and context. Do not pretend to have conducted real research. Be specific, not generic.

Structure your response as valid JSON with exactly these four keys:

{
  "PERSONA_VOICE": "First-person answer from the persona's viewpoint (2-4 sentences, emotionally honest)",
  "WHY": "Explain the reasoning: which specific goals, fears or constraints drive this reaction (1-3 sentences)",
  "PRODUCT_ACTION": "Concrete recommendation for the product team based on this reaction (1-3 actionable sentences)",
  "CONFIDENCE": "grounded|inferred|assumption — plus one sentence explaining what is certain vs assumed"
}

Question from the team: ${userQuestion}`
}
