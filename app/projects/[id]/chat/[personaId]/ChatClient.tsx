'use client'

import { useState } from 'react'
import type { Persona, ChatMessage } from '@/lib/personas/types'
import { ChatMessages } from '@/components/chat/ChatMessages'
import { ChatInput } from '@/components/chat/ChatInput'
import { SuggestedPrompts } from '@/components/chat/SuggestedPrompts'

interface ChatClientProps {
  persona: Persona
  projectId: string
  initialMessages: ChatMessage[]
}

export function ChatClient({ persona, projectId, initialMessages }: ChatClientProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)

  async function handleSend(text: string) {
    setLoading(true)

    // Optimistic user message
    const tempUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      persona_id: persona.id,
      project_id: projectId,
      role: 'user',
      content: text,
      persona_voice: null,
      reasoning: null,
      product_action: null,
      confidence_level: null,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUser])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona_id: persona.id, project_id: projectId, message: text }),
    })
    const { message: assistantMsg } = await res.json()
    setMessages(prev => [...prev.filter(m => m.id !== tempUser.id), tempUser, assistantMsg])
    setLoading(false)
  }

  return (
    <>
      <ChatMessages messages={messages} avatarUrl={persona.avatar_url} loading={loading} />
      <SuggestedPrompts onSelect={handleSend} disabled={loading} />
      <ChatInput onSend={handleSend} loading={loading} />
    </>
  )
}
