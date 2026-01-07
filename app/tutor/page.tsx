'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { ChatMessage } from '@/components/chat-message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Send, Loader } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function TutorPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check authentication and init
    const initTutor = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      setSessionId(uuidv4())

      // Welcome message
      setMessages([{
        role: 'ai',
        content: 'Olá! Bem-vindo ao seu tutor IA. Sou aqui para ajudá-lo com suas dúvidas sobre estudos para o ETE. Qual é o seu tópico de interesse ou qual dúvida você tem?'
      }])
    }

    initTutor()
  }, [supabase, router])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          topic,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      // Add AI response to UI
      setMessages(prev => [...prev, { role: 'ai', content: data.message }])

      // Update topic if mentioned
      if (userMessage.toLowerCase().includes('tópico') || userMessage.toLowerCase().includes('sobre')) {
        setTopic(userMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col p-4">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Tópicos</h2>
          <div className="space-y-2 flex-1">
            {['Português', 'Matemática', 'Ciências', 'História', 'Geografia'].map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  topic === t
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button variant="outline" className="w-full" onClick={() => setSessionId(uuidv4())}>
            Nova Conversa
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} role={msg.role} content={msg.content} />
              ))}
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-6">
            <div className="max-w-4xl mx-auto">
              {topic && (
                <p className="text-xs text-gray-500 mb-3">
                  Tópico atual: <span className="font-medium text-gray-700">{topic}</span>
                </p>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Digite sua pergunta..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3">
                Use este espaço para fazer perguntas, esclarecer dúvidas ou explorar novos tópicos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
