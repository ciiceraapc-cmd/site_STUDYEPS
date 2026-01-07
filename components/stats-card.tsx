interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  subtext?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
}

export function StatsCard({
  icon,
  label,
  value,
  subtext,
  color = 'blue',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {subtext && <span className="text-sm text-gray-500">{subtext}</span>}
      </div>
    </div>
  )
}
