'use client'

import * as React from 'react'

interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastItem['type']) => void
}

const ToastContext = React.createContext<ToastContextValue>({
  showToast: () => {},
})

export function useToast() {
  return React.useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const showToast = React.useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts(t => t.filter(item => item.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm pointer-events-auto
              transition-all duration-300 animate-in slide-in-from-bottom-2
              ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
              ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${toast.type === 'info' ? 'bg-white border-gray-200 text-gray-800' : ''}
            `}
          >
            <span className="text-base">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <p>{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
