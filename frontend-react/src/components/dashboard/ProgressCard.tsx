import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ProgressCardProps {
  title: string
  subtitle?: string
  current: number
  total: number
  unit?: string
  showPercentage?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  subtitle,
  current,
  total,
  unit = '',
  showPercentage = true,
  variant = 'default'
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  const getProgressColor = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary'
      case 'success':
        return 'bg-success'
      case 'warning':
        return 'bg-warning'
      case 'error':
        return 'bg-error'
      default:
        return 'bg-primary'
    }
  }

  const getCardClass = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/20 bg-primary/5'
      case 'success':
        return 'border-success/20 bg-success/5'
      case 'warning':
        return 'border-warning/20 bg-warning/5'
      case 'error':
        return 'border-error/20 bg-error/5'
      default:
        return 'bg-white border-gray-200'
    }
  }

  return (
    <Card className={`rounded-xl shadow-sm ${getCardClass()}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-gray-900">
              {current.toLocaleString()}{unit}
            </div>
            {showPercentage && (
              <div className="text-sm text-gray-500">
                {percentage}%
              </div>
            )}
          </div>

          {/* 自定义进度条 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>已使用</span>
            <span>总计 {total.toLocaleString()}{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}