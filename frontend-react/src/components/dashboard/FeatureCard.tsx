import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }>
  variant?: 'default' | 'gradient' | 'accent'
  children?: React.ReactNode
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  actions = [],
  variant = 'default',
  children
}) => {
  const getCardClass = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20'
      case 'accent':
        return 'bg-accent/5 border-accent/20'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getIconClass = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-primary to-primary/80'
      case 'accent':
        return 'bg-accent'
      default:
        return 'bg-primary'
    }
  }

  return (
    <Card className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${getCardClass()}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${getIconClass()}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        {children}
        {actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                className="flex-1"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}