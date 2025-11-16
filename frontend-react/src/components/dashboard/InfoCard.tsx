import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InfoItem {
  label: string
  value: string | React.ReactNode
  icon?: React.ReactNode
}

interface InfoCardProps {
  title: string
  subtitle?: string
  items: InfoItem[]
  variant?: 'default' | 'bordered' | 'compact'
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  items,
  variant = 'default'
}) => {
  const getCardClass = () => {
    switch (variant) {
      case 'bordered':
        return 'border-2 border-gray-100 bg-white'
      case 'compact':
        return 'bg-gray-50 border-gray-200'
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
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.icon && (
                <div className="text-gray-400">
                  {item.icon}
                </div>
              )}
              <span className="text-sm font-medium text-gray-600">{item.label}</span>
            </div>
            <div className="text-sm text-gray-900 font-medium">
              {item.value}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}