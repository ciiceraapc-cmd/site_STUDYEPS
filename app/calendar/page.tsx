'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Calendar } from '@/components/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<{ [key: string]: any[] }>({})
  const [selectedDayEvents, setSelectedDayEvents] = useState<any[]>([])
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState('30')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('study_calendar')
          .select('*')
          .eq('user_id', user.id)

        // Group events by date
        const eventsMap: { [key: string]: any[] } = {}
        data?.forEach(event => {
          const dateKey = event.date
          if (!eventsMap[dateKey]) {
            eventsMap[dateKey] = []
          }
          eventsMap[dateKey].push(event)
        })

        setEvents(eventsMap)

        // Get events for selected date
        const selectedDateKey = selectedDate.toISOString().split('T')[0]
        setSelectedDayEvents(eventsMap[selectedDateKey] || [])
      } catch (error) {
        console.error('Error loading calendar:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCalendarData()
  }, [supabase])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    const dateKey = date.toISOString().split('T')[0]
    setSelectedDayEvents(events[dateKey] || [])
    setShowForm(false)
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const { data: newEvent } = await supabase
        .from('study_calendar')
        .insert({
          user_id: user.id,
          date: dateStr,
          topic,
          duration_minutes: parseInt(duration),
          notes: notes || null,
        })
        .select()
        .single()

      if (newEvent) {
        // Update local state
        setSelectedDayEvents(prev => [...prev, newEvent])
        setEvents(prev => ({
          ...prev,
          [dateStr]: [...(prev[dateStr] || []), newEvent]
        }))

        // Reset form
        setTopic('')
        setDuration('30')
        setNotes('')
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await supabase
        .from('study_calendar')
        .delete()
        .eq('id', eventId)

      const dateStr = selectedDate.toISOString().split('T')[0]
      setSelectedDayEvents(prev => prev.filter(e => e.id !== eventId))
      setEvents(prev => ({
        ...prev,
        [dateStr]: prev[dateStr].filter(e => e.id !== eventId)
      }))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário de Estudos</h1>
          <p className="text-gray-600">Planeje e acompanhe suas sessões de estudo</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                events={events}
              />
            )}
          </div>

          {/* Day Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h2>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Estudo
                </Button>
              </div>

              {/* Add Event Form */}
              {showForm && (
                <form onSubmit={handleAddEvent} className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tópico
                      </label>
                      <Input
                        type="text"
                        placeholder="Ex: Estudar Português"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duração (minutos)
                        </label>
                        <Input
                          type="number"
                          placeholder="30"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          min="5"
                          max="480"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Anotações (opcional)
                      </label>
                      <textarea
                        placeholder="Adicione suas notas..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        Salvar Sessão
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Events List */}
              <div className="space-y-3">
                {selectedDayEvents.length > 0 ? (
                  selectedDayEvents.map(event => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.topic}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Duração: {event.duration_minutes} minutos
                          </p>
                          {event.notes && (
                            <p className="text-sm text-gray-700 mt-2 italic">{event.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhuma sessão agendada para este dia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
