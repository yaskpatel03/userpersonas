'use client'

import { useEffect, useRef } from 'react'
import type { ChatMessage as ChatMessageType } from '@/lib/personas/types'
import { ChatMessage } from './ChatMessage'

interface ChatMessagesProps {
  messages: ChatMessageType[]
  avatarUrl: string
  loading: boolean
}

export function ChatMessages({ messages, avatarUrl, loading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
      {messages.length === 0 && (
        <p className="text-center text-sm text-zinc-400 mt-12">
          Ask this persona a question about your product.
        </p>
      )}
      {messages.map(msg => (
        <ChatMessage key={msg.id} message={msg} avatarUrl={avatarUrl} />
      ))}
      {loading && (
        <div className="flex gap-3 items-center">
          <img src={avatarUrl} alt="persona" className="w-7 h-7 rounded-full object-cover" />
          <div className="bg-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-400 animate-pulse">
            Thinking...
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}
