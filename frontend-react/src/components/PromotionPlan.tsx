import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PromotionPlanProps {
  onGetPromotionLink: () => void
  onViewPromotionRules: () => void
}

const PromotionPlan: React.FC<PromotionPlanProps> = ({
  onGetPromotionLink,
  onViewPromotionRules
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">推广计划</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">邀请好友，共享收益</h3>
            <p className="text-gray-600">通过推广计划获得更多收益和优惠</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">邀请人数</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">¥0</div>
              <div className="text-gray-600">累计收益</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">¥0</div>
              <div className="text-gray-600">本月收益</div>
            </div>
          </div>

          <div className="text-center space-x-4">
            <Button
              onClick={onGetPromotionLink}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              获取推广链接
            </Button>
            <Button
              variant="outline"
              onClick={onViewPromotionRules}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              查看推广规则
            </Button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-700 text-sm">
              ⚠️ 推广计划功能即将上线，敬请期待！
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PromotionPlan