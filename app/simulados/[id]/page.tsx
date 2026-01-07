'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SimuladoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [simulado, setSimulado] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadSimuladoData = async () => {
      try {
        const { data: simuladoData } = await supabase
          .from('simulados')
          .select('*')
          .eq('id', params.id)
          .single()

        const { data: questionsData } = await supabase
          .from('simulado_questions')
          .select('*')
          .eq('simulado_id', params.id)
          .order('created_at')

        setSimulado(simuladoData)
        setQuestions(questionsData || [])
        setTimeLeft((simuladoData?.duration_minutes || 30) * 60)
      } catch (error) {
        console.error('Error loading simulado:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSimuladoData()
  }, [params.id, supabase])

  useEffect(() => {
    if (timeLeft <= 0 && timeLeft !== 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let correctCount = 0
    
    // Save responses and calculate score
    for (const question of questions) {
      const userAnswer = answers[question.id]
      const isCorrect = userAnswer === question.correct_answer

      if (isCorrect) correctCount++

      await supabase.from('simulado_responses').insert({
        user_id: user.id,
        simulado_id: params.id,
        question_id: question.id,
        user_answer: userAnswer || '',
        is_correct: isCorrect,
      })
    }

    const percentage = Math.round((correctCount / questions.length) * 100)
    setScore(percentage)

    // Save attempt
    await supabase.from('simulado_attempts').insert({
      user_id: user.id,
      simulado_id: params.id,
      score: correctCount,
      total_questions: questions.length,
      percentage_correct: percentage,
      time_spent_minutes: Math.round((simulado.duration_minutes * 60 - timeLeft) / 60),
      completed_at: new Date().toISOString(),
    })

    setCompleted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Carregando simulado...</p>
        </div>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-100 mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Simulado Concluído!</h1>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 mb-8">
              <p className="text-gray-600 mb-2">Sua pontuação</p>
              <p className="text-6xl font-bold text-indigo-600 mb-2">{score}%</p>
              <p className="text-gray-600">Você acertou {Math.round((score / 100) * questions.length)} de {questions.length} questões</p>
            </div>

            <div className="space-y-3">
              <Link href="/simulados" className="block">
                <Button className="w-full" variant="outline">
                  Voltar aos Simulados
                </Button>
              </Link>
              <Link href="/dashboard" className="block">
                <Button className="w-full">
                  Ir para Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/simulados" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Clock className="w-5 h-5 text-orange-600" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{simulado?.title}</h2>
            <span className="text-sm text-gray-600">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {question && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">{question.question_text}</h3>

            {/* Options */}
            <div className="space-y-3">
              {question.options && question.options.map((option: string, idx: number) => (
                <label key={idx} className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Anterior
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button onClick={handleSubmit} className="flex-1">
              Finalizar Simulado
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Próxima Questão
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Navegação</h4>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-full h-10 rounded text-sm font-medium transition-colors ${
                  idx === currentQuestion
                    ? 'bg-indigo-600 text-white'
                    : answers[questions[idx].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
