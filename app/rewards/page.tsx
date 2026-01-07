'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Gift, Lock, Check } from 'lucide-react'

export default function RewardsPage() {
  const [rewards, setRewards] = useState<any[]>([])
  const [userRewards, setUserRewards] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Load all rewards
        const { data: rewardsData } = await supabase
          .from('rewards')
          .select('*')
          .order('cost_points')

        // Load user's earned rewards
        const { data: userRewardsData } = await supabase
          .from('user_rewards')
          .select('*')
          .eq('user_id', user.id)

        // Load user stats
        const { data: statsData } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        setRewards(rewardsData || [])
        setUserRewards(userRewardsData || [])
        setStats(statsData || {})
      } catch (error) {
        console.error('Error loading rewards:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRewards()
  }, [supabase])

  const handleRedeemReward = async (rewardId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const reward = rewards.find(r => r.id === rewardId)
    if (!reward || (stats?.total_points || 0) < reward.cost_points) return

    try {
      // Add reward to user
      await supabase.from('user_rewards').insert({
        user_id: user.id,
        reward_id: rewardId,
      })

      // Update user stats
      await supabase
        .from('user_stats')
        .update({
          total_points: (stats.total_points || 0) - reward.cost_points,
        })
        .eq('user_id', user.id)

      // Refresh data
      setStats(prev => ({
        ...prev,
        total_points: (prev.total_points || 0) - reward.cost_points
      }))
      setUserRewards(prev => [...prev, { reward_id: rewardId }])
    } catch (error) {
      console.error('Error redeeming reward:', error)
    }
  }

  const isRewardOwned = (rewardId: string) =>
    userRewards.some(ur => ur.reward_id === rewardId)

  const canAfford = (cost: number) =>
    (stats?.total_points || 0) >= cost

  const categories = [...new Set(rewards.map(r => r.category))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loja de Recompensas</h1>
          <p className="text-gray-600">Use seus pontos para desbloquear recompensas exclusivas</p>
        </div>

        {/* Points Balance */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-6 h-6" />
            <p className="text-indigo-100">Seus Pontos</p>
          </div>
          <p className="text-5xl font-bold">{stats?.total_points || 0} pts</p>
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Carregando recompensas...</p>
          </div>
        ) : rewards.length > 0 ? (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-xl font-bold text-gray-900 mb-4 capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rewards
                    .filter(r => r.category === category)
                    .map(reward => {
                      const owned = isRewardOwned(reward.id)
                      const affordable = canAfford(reward.cost_points)

                      return (
                        <div
                          key={reward.id}
                          className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="aspect-square bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                            <Gift className="w-16 h-16 text-indigo-300" />
                          </div>

                          <div className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-2">{reward.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                            <div className="flex items-center justify-between">
                              <div className="font-bold text-indigo-600">
                                {reward.cost_points} pts
                              </div>

                              {owned ? (
                                <Button disabled className="gap-2">
                                  <Check className="w-4 h-4" />
                                  Obtido
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleRedeemReward(reward.id)}
                                  disabled={!affordable}
                                  className="gap-2"
                                >
                                  {!affordable && <Lock className="w-4 h-4" />}
                                  {affordable ? 'Resgatar' : 'Bloqueado'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma recompensa disponível</p>
          </div>
        )}
      </main>
    </div>
  )
}
