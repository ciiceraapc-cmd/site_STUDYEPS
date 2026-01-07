import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { groq } from '@ai-sdk/groq'

export async function POST(request: Request) {
  try {
    const { message, sessionId, topic } = await request.json()
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // Get context from previous messages in this session
    const { data: previousMessages } = await supabase
      .from('ai_chat_history')
      .select('user_message, ai_response')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build conversation context
    let conversationContext = 'Você é um tutor educacional para candidatos de Escolas Técnicas Estaduais (ETE). '
    conversationContext += 'Você é amigável, paciente e didático. Explique conceitos de forma clara e acessível. '
    conversationContext += 'Quando apropriado, faça perguntas para verificar compreensão. '
    
    if (topic) {
      conversationContext += `O tópico atual de estudo é: ${topic}. `
    }

    // Add conversation history
    let fullPrompt = conversationContext
    if (previousMessages && previousMessages.length > 0) {
      fullPrompt += '\n\nHistórico da conversa:\n'
      for (const msg of previousMessages) {
        fullPrompt += `Aluno: ${msg.user_message}\n`
        fullPrompt += `Tutor: ${msg.ai_response}\n`
      }
    }

    fullPrompt += `\nAluno: ${message}\n\nTutor:`

    // Generate response using Groq with LLaMA 3.1
    const { text: aiResponse } = await generateText({
      model: groq('llama-3.1-70b-versatile'),
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 500,
    })

    // Save to database
    await supabase.from('ai_chat_history').insert({
      user_id: user.id,
      session_id: sessionId,
      user_message: message,
      ai_response: aiResponse,
      topic: topic || null,
    })

    return new Response(JSON.stringify({
      message: aiResponse,
      sessionId,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[v0] Error in AI tutor:', error)
    return new Response(
      JSON.stringify({ error: 'Erro ao processar sua pergunta' }),
      { status: 500 }
    )
  }
}
