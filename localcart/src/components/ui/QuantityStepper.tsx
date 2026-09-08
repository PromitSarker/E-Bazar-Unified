'use client'

import * as React from 'react'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md'
}

export function QuantityStepper({ value, min = 1, max = 999, onChange, size = 'md' }: QuantityStepperProps) {
  const btnClass = size === 'sm'
    ? 'w-6 h-6 text-sm'
    : 'w-8 h-8 text-base'
  const inputClass = size === 'sm'
    ? 'w-8 text-sm'
    : 'w-10 text-sm'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnClass} rounded-lg border border-gray-300 bg-white hover:bg-gray-50 
          text-gray-700 font-medium flex items-center justify-center
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={`${inputClass} text-center font-medium text-gray-900`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnClass} rounded-lg border border-gray-300 bg-white hover:bg-gray-50
          text-gray-700 font-medium flex items-center justify-center
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
