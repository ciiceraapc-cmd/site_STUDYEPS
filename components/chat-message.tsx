import { Markdown } from '@/components/markdown'

interface ChatMessageProps {
  role: 'user' | 'ai'
  content: string
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
          role === 'user'
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        }`}
      >
        {role === 'ai' ? (
          <Markdown content={content} />
        ) : (
          <p className="text-sm">{content}</p>
        )}
      </div>
    </div>
  )
}
