'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { StatsCard } from '@/components/stats-card'
import { ChallengeCard } from '@/components/challenge-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BarChart3, Zap, Trophy, Flame, BookOpen, ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // Load user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setStats(statsData || {
          total_points: 0,
          total_simulados_completed: 0,
          total_challenges_completed: 0,
          study_streak: 0,
        })

        // Load challenges
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('*, user_challenges!inner(is_completed, progress_percentage)')
          .eq('user_challenges.user_id', user.id)
          .limit(3)

        setChallenges(challengesData || [])
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h1>
          <p className="text-gray-600">Continue seus estudos e aumente seus pontos</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<Trophy className="w-6 h-6" />}
            label="Pontos Totais"
            value={stats?.total_points || 0}
            color="purple"
          />
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Simulados"
            value={stats?.total_simulados_completed || 0}
            subtext="concluídos"
            color="blue"
          />
          <StatsCard
            icon={<Zap className="w-6 h-6" />}
            label="Desafios"
            value={stats?.total_challenges_completed || 0}
            subtext="concluídos"
            color="orange"
          />
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            label="Sequência"
            value={stats?.study_streak || 0}
            subtext="dias"
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/simulados" className="block">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="inline-flex p-3 rounded-lg bg-blue-100 text-blue-600 mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Fazer Simulado</h3>
              <p className="text-sm text-gray-600">Teste seus conhecimentos</p>
              <div className="flex items-center text-indigo-600 mt-4 font-medium">
                Começar <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/tutor" className="block">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="inline-flex p-3 rounded-lg bg-purple-100 text-purple-600 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Tutor IA</h3>
              <p className="text-sm text-gray-600">Converse com seu tutor</p>
              <div className="flex items-center text-purple-600 mt-4 font-medium">
                Abrir <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/calendar" className="block">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="inline-flex p-3 rounded-lg bg-orange-100 text-orange-600 mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Calendário</h3>
              <p className="text-sm text-gray-600">Planeje seus estudos</p>
              <div className="flex items-center text-orange-600 mt-4 font-medium">
                Acessar <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>
        </div>

        {/* Challenges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Desafios do Dia</h2>
            <Link href="/challenges" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {challenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  title={challenge.title}
                  description={challenge.description}
                  points={challenge.points}
                  difficulty={challenge.difficulty_level}
                  progress={challenge.user_challenges?.[0]?.progress_percentage || 0}
                  completed={challenge.user_challenges?.[0]?.is_completed || false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum desafio disponível no momento</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
