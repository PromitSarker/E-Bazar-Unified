import * as React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  color?: 'emerald' | 'blue' | 'yellow' | 'red' | 'purple'
}

const colorMap = {
  emerald: 'text-emerald-600 bg-emerald-50',
  blue: 'text-blue-600 bg-blue-50',
  yellow: 'text-yellow-600 bg-yellow-50',
  red: 'text-red-600 bg-red-50',
  purple: 'text-purple-600 bg-purple-50',
}

export function StatCard({ label, value, sub, icon, color = 'emerald' }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${colorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
