import * as React from 'react'
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils'

interface TimelineStep {
  status: string
  label: string
  timestamp?: Date | string | null
  isCompleted: boolean
  isCurrent: boolean
}

interface StatusTimelineProps {
  orderType: 'DELIVERY' | 'PICKUP'
  currentStatus: string
  statusHistory?: { status: string; timestamp: Date | string }[]
}

const DELIVERY_STEPS = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
]

const PICKUP_STEPS = [
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COMPLETED',
]

export function StatusTimeline({ orderType, currentStatus, statusHistory = [] }: StatusTimelineProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
        <span>✕</span> Order Cancelled
      </div>
    )
  }

  const steps = orderType === 'DELIVERY' ? DELIVERY_STEPS : PICKUP_STEPS
  const currentIdx = steps.indexOf(currentStatus)

  return (
    <ol className="relative border-l-2 border-gray-200 ml-3 space-y-6">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx || currentStatus === 'COMPLETED'
        const isCurrent = step === currentStatus

        const histEntry = statusHistory.find(h => h.status === step)

        return (
          <li key={step} className="ml-5">
            {/* Circle indicator */}
            <span
              className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full border-2 
                ${isCompleted ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'bg-white border-emerald-500' : 'bg-white border-gray-300'}`}
            >
              {isCompleted && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isCurrent && !isCompleted && (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </span>
            <div className={`flex flex-col ${isCurrent ? 'opacity-100' : isCompleted ? 'opacity-100' : 'opacity-40'}`}>
              <p className={`text-sm font-medium ${isCurrent ? 'text-emerald-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {getOrderStatusLabel(step)}
              </p>
              {histEntry?.timestamp && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(histEntry.timestamp).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
