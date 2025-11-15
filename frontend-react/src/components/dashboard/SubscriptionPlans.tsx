import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SubscriptionPlansProps {
  onDayCardClick?: () => void
  onWeekCardClick?: () => void
  onMonthCardClick?: () => void
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onDayCardClick,
  onWeekCardClick,
  onMonthCardClick
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">订阅一览</h2>
        <p className="text-muted-foreground mt-2">
          选择最适合您的订阅计划，每日10000积分，支持每天重置一次
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 一日体验卡 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>一日体验卡</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">¥9.8</div>
                <div className="text-sm text-muted-foreground">/日</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>24小时有效期</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>每日10000积分</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>支持每天重置一次</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>即买即用</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>适合短期试用</span>
              </li>
            </ul>
            <Button className="w-full" onClick={onDayCardClick}>
              立即购买
            </Button>
          </CardContent>
        </Card>

        {/* 七日行 */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>七日行</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">¥49.8</div>
                <div className="text-sm text-muted-foreground">/周</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>7天有效期 (168小时)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>每日10000积分</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>支持每天重置一次</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>性价比超值</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>适合中短期项目</span>
              </li>
            </ul>
            <Button className="w-full" onClick={onWeekCardClick}>
              立即购买
            </Button>
          </CardContent>
        </Card>

        {/* 月享卡 - 推荐 */}
        <Card className="flex flex-col border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>月享卡</span>
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  推荐
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">¥199</div>
                <div className="text-sm text-muted-foreground">/月</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>30天有效期 (720小时)</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>每日10000积分</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>支持每天重置一次</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>最超值选择</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>适合长期使用</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>专属客服支持</span>
              </li>
            </ul>
            <Button className="w-full" onClick={onMonthCardClick}>
              立即购买
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 订阅说明 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">💡 订阅说明</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• 日卡：适合临时使用和功能体验</p>
              <p>• 周卡：适合短期项目开发和测试</p>
              <p>• 月卡：适合长期开发和持续使用</p>
              <p>• 所有计划均提供每日10000积分，每天可重置一次</p>
              <p>• 购买后不生效，激活后才开始生效计时。</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubscriptionPlans