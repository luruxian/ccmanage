import { useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose: () => void
}

export function Toast({ type, message, duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    const baseStyles = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2'

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border-2 border-green-600`
      case 'error':
        return `${baseStyles} bg-red-500 text-white border-2 border-red-600`
      case 'warning':
        return `${baseStyles} bg-orange-500 text-white border-2 border-orange-600`
      case 'info':
        return `${baseStyles} bg-blue-500 text-white border-2 border-blue-600`
      default:
        return `${baseStyles} bg-gray-500 text-white border-2 border-gray-600`
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
      default:
        return <Info size={20} />
    }
  }

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <span className="font-medium">{message}</span>
    </div>
  )
}