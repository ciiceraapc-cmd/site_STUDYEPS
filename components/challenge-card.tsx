import { Button } from '@/components/ui/button'

interface ChallengeCardProps {
  title: string
  description: string
  points: number
  difficulty: 'fácil' | 'médio' | 'difícil'
  progress?: number
  completed?: boolean
  onStart?: () => void
}

const difficultyColors = {
  fácil: 'bg-green-100 text-green-800',
  médio: 'bg-yellow-100 text-yellow-800',
  difícil: 'bg-red-100 text-red-800',
}

export function ChallengeCard({
  title,
  description,
  points,
  difficulty,
  progress = 0,
  completed = false,
  onStart,
}: ChallengeCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[difficulty]}`}>
          {difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      
      {progress > 0 && !completed && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Progresso</span>
            <span className="text-xs font-medium text-gray-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-indigo-600">+{points} pts</span>
        </div>
        <Button
          size="sm"
          onClick={onStart}
          disabled={completed}
          className={completed ? 'opacity-50' : ''}
        >
          {completed ? 'Concluído' : 'Começar'}
        </Button>
      </div>
    </div>
  )
}
