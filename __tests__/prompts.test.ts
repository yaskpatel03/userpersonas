import { describe, it, expect } from 'vitest'
import { buildSegmentationPrompt, buildChatPrompt } from '@/lib/gemini/prompts'

describe('buildSegmentationPrompt', () => {
  it('includes product context in prompt', () => {
    const prompt = buildSegmentationPrompt({
      product_context: 'A banking app for newcomers',
      category: 'Banking',
      geography: 'Canada',
      user_type: null,
      key_workflows: [],
      constraints: [],
      known_assumptions: null,
    })
    expect(prompt).toContain('A banking app for newcomers')
    expect(prompt).toContain('Banking')
    expect(prompt).toContain('Canada')
  })

  it('requests JSON output', () => {
    const prompt = buildSegmentationPrompt({
      product_context: 'test',
      category: null,
      geography: null,
      user_type: null,
      key_workflows: [],
      constraints: [],
      known_assumptions: null,
    })
    expect(prompt.toLowerCase()).toContain('json')
  })
})

describe('buildChatPrompt', () => {
  it('includes persona name in system prompt', () => {
    const prompt = buildChatPrompt('Riya', 'Banking app', 'Newcomer user', 'What confuses you?')
    expect(prompt).toContain('Riya')
    expect(prompt).toContain('What confuses you?')
  })

  it('requests 4-layer response structure', () => {
    const prompt = buildChatPrompt('Riya', 'context', 'label', 'question')
    expect(prompt).toContain('PERSONA_VOICE')
    expect(prompt).toContain('WHY')
    expect(prompt).toContain('PRODUCT_ACTION')
    expect(prompt).toContain('CONFIDENCE')
  })
})
