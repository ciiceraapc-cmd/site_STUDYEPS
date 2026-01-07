'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { ChallengeCard } from '@/components/challenge-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Trophy, Zap } from 'lucide-react'

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [userProgress, setUserProgress] = useState<{ [key: string]: any }>({})
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load all challenges
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('*')
          .order('points', { ascending: false })

        // Load user progress
        const { data: progressData } = await supabase
          .from('user_challenges')
          .select('*')
          .eq('user_id', user.id)

        setChallenges(challengesData || [])

        // Map progress by challenge_id
        const progressMap = {}
        progressData?.forEach(p => {
          progressMap[p.challenge_id] = p
        })
        setUserProgress(progressMap)
      } catch (error) {
        console.error('Error loading challenges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadChallenges()
  }, [supabase])

  const handleCompleteChallenge = async (challengeId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const challenge = challenges.find(c => c.id === challengeId)
      const existingProgress = userProgress[challengeId]

      if (existingProgress) {
        // Update existing progress
        await supabase
          .from('user_challenges')
          .update({
            is_completed: true,
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id)
      } else {
        // Create new progress
        await supabase
          .from('user_challenges')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            is_completed: true,
            progress_percentage: 100,
            completed_at: new Date().toISOString(),
          })
      }

      // Update user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (stats) {
        await supabase
          .from('user_stats')
          .update({
            total_points: (stats.total_points || 0) + (challenge?.points || 0),
            total_challenges_completed: (stats.total_challenges_completed || 0) + 1,
          })
          .eq('user_id', user.id)
      }

      // Refresh data
      setUserProgress(prev => ({
        ...prev,
        [challengeId]: { ...userProgress[challengeId], is_completed: true }
      }))
    } catch (error) {
      console.error('Error updating challenge:', error)
    }
  }

  const categories = ['all', 'daily', 'weekly', 'milestone']
  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter(c => c.challenge_type === selectedCategory)

  const totalPoints = challenges.reduce((sum, c) => sum + (c.points || 0), 0)
  const completedPoints = Object.values(userProgress)
    .filter((p: any) => p.is_completed)
    .reduce((sum, p: any) => {
      const challenge = challenges.find(c => c.id === p.challenge_id)
      return sum + (challenge?.points || 0)
    }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Desafios</h1>
          <p className="text-gray-600">Complete desafios para ganhar pontos e desbloquer recompensas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Pontos Ganhos</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">{completedPoints}</p>
            <p className="text-sm text-gray-600">de {totalPoints} pontos totais</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(completedPoints / totalPoints) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Desafios Completados</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {Object.values(userProgress).filter((p: any) => p.is_completed).length}
            </p>
            <p className="text-sm text-gray-600">de {challenges.length} desafios</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat === 'daily' ? 'Diários' : cat === 'weekly' ? 'Semanais' : 'Marcos'}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Carregando desafios...</p>
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                title={challenge.title}
                description={challenge.description}
                points={challenge.points}
                difficulty={challenge.difficulty_level}
                progress={userProgress[challenge.id]?.progress_percentage || 0}
                completed={userProgress[challenge.id]?.is_completed || false}
                onStart={() => handleCompleteChallenge(challenge.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum desafio encontrado</p>
          </div>
        )}

        {/* Rewards Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ganhe pontos e desbloqueie recompensas exclusivas!</p>
          <Link href="/rewards">
            <Button size="lg">
              Ver Loja de Recompensas
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
