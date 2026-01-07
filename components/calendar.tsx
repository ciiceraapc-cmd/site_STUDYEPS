'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarDay {
  date: Date
  events: any[]
  isCurrentMonth: boolean
}

interface CalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  events: { [key: string]: any[] }
}

export function Calendar({ selectedDate, onDateSelect, events }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const daysInPrevMonth = getDaysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    
    const days: CalendarDay[] = []

    // Previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, daysInPrevMonth - i)
      days.push({
        date,
        events: events[date.toISOString().split('T')[0]] || [],
        isCurrentMonth: false,
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
      days.push({
        date,
        events: events[date.toISOString().split('T')[0]] || [],
        isCurrentMonth: true,
      })
    }

    // Next month's days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i)
      days.push({
        date,
        events: events[date.toISOString().split('T')[0]] || [],
        isCurrentMonth: false,
      })
    }

    return days
  }

  const days = generateCalendarDays()
  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">{monthName}</h3>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={previousMonth}
            className="p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelected = selectedDate.toDateString() === day.date.toDateString()
          const isToday = new Date().toDateString() === day.date.toDateString()
          const hasEvents = day.events.length > 0

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(day.date)}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-1 ${
                !day.isCurrentMonth
                  ? 'text-gray-300 bg-gray-50'
                  : isSelected
                  ? 'bg-indigo-600 text-white'
                  : isToday
                  ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600'
                  : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{day.date.getDate()}</span>
              {hasEvents && (
                <div className="flex gap-0.5">
                  {day.events.slice(0, 2).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-indigo-600'
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
