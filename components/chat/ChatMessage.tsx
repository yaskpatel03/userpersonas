import type { ChatMessage as ChatMessageType } from '@/lib/personas/types'

export function ChatMessage({ message, avatarUrl }: { message: ChatMessageType; avatarUrl: string }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-zinc-900 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[70%] text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 items-start">
      <img src={avatarUrl} alt="persona" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
      <div className="flex flex-col gap-2 max-w-[85%]">
        {/* Persona voice */}
        <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-zinc-900 leading-relaxed">
          {message.persona_voice}
        </div>
        {/* Why */}
        {message.reasoning && (
          <div className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-600 leading-relaxed">
            <span className="font-semibold text-zinc-700">Why: </span>{message.reasoning}
          </div>
        )}
        {/* Product action */}
        {message.product_action && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 text-xs text-green-800 leading-relaxed">
            <span className="font-semibold">Product action: </span>{message.product_action}
          </div>
        )}
        {/* Confidence */}
        {message.confidence_level && (
          <p className="text-xs text-zinc-400 pl-1">{message.confidence_level}</p>
        )}
      </div>
    </div>
  )
}
