'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ChatInputProps {
  onSend: (message: string) => void
  loading: boolean
}

export function ChatInput({ onSend, loading }: ChatInputProps) {
  const [value, setValue] = useState('')

  function handleSend() {
    if (!value.trim() || loading) return
    onSend(value.trim())
    setValue('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-zinc-100 px-4 py-3 flex gap-3 items-end">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question..."
        rows={1}
        className="flex-1 resize-none border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 max-h-32 leading-relaxed"
      />
      <Button onClick={handleSend} disabled={!value.trim() || loading} size="sm">
        Send
      </Button>
    </div>
  )
}
