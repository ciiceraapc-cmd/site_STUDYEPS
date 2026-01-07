'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Clock, Zap, ArrowRight, Filter } from 'lucide-react'

export default function SimuladosPage() {
  const [simulados, setSimulados] = useState<any[]>([])
  const [filteredSimulados, setFilteredSimulados] = useState<any[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadSimulados = async () => {
      try {
        const { data } = await supabase
          .from('simulados')
          .select('*')
          .order('created_at', { ascending: false })

        setSimulados(data || [])
        setFilteredSimulados(data || [])
      } catch (error) {
        console.error('Error loading simulados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSimulados()
  }, [supabase])

  useEffect(() => {
    let filtered = simulados

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(s => s.difficulty_level === selectedDifficulty)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }

    setFilteredSimulados(filtered)
  }, [selectedDifficulty, selectedCategory, simulados])

  const categories = [...new Set(simulados.map(s => s.category))]
  const difficulties = ['fácil', 'médio', 'difícil']

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'fácil':
        return 'bg-green-100 text-green-800'
      case 'médio':
        return 'bg-yellow-100 text-yellow-800'
      case 'difícil':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulados</h1>
          <p className="text-gray-600">Teste seus conhecimentos com simulados completos</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Nível de Dificuldade
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value="all"
                    checked={selectedDifficulty === 'all'}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Todos</span>
                </label>
                {difficulties.map((diff) => (
                  <label key={diff} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={diff}
                      checked={selectedDifficulty === diff}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">{diff}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Disciplina
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={selectedCategory === 'all'}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Todas</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Simulados Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Carregando simulados...</p>
          </div>
        ) : filteredSimulados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulados.map((simulado) => (
              <div
                key={simulado.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="inline-flex p-3 rounded-lg bg-indigo-100">
                      <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor(simulado.difficulty_level)}`}>
                      {simulado.difficulty_level}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 text-lg">{simulado.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{simulado.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Zap className="w-4 h-4" />
                      {simulado.total_questions} questões
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {simulado.duration_minutes} minutos
                    </div>
                  </div>

                  <Link href={`/simulados/${simulado.id}`} className="block">
                    <Button className="w-full">
                      Começar Agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum simulado encontrado com esses filtros</p>
          </div>
        )}
      </main>
    </div>
  )
}
