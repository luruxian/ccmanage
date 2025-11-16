import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import {
  StatCard,
  FeatureCard,
  InfoCard,
  ProgressCard
} from '@/components/dashboard'
import {
  Key,
  Package,
  TrendingUp,
  Clock,
  Zap,
  Gift,
  Bell,
  Circle
} from 'lucide-react'

interface DashboardStats {
  activeKeys: number
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  usagePercentage: number
}

const NewDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()

  const [stats, setStats] = useState<DashboardStats>({
    activeKeys: 0,
    totalCredits: 0,
    usedCredits: 0,
    remainingCredits: 0,
    usagePercentage: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // 这里应该调用实际的API来获取dashboard数据
      // 暂时使用模拟数据
      const mockStats: DashboardStats = {
        activeKeys: 3,
        totalCredits: 10000,
        usedCredits: 3500,
        remainingCredits: 6500,
        usagePercentage: 35
      }
      setStats(mockStats)
    } catch (error) {
      console.error('加载dashboard数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      label: '激活密钥',
      onClick: () => navigate('/key-activation'),
      variant: 'default' as const
    },
    {
      label: '查看订阅',
      onClick: () => navigate('/packages'),
      variant: 'outline' as const
    }
  ]

  const subscriptionInfo = [
    { label: '当前套餐', value: '标准版' },
    { label: '每日上限', value: '10,000 积分' },
    { label: '剩余天数', value: '28 天' },
    { label: '注册时间', value: '2024-01-15' }
  ]

  const announcements = [
    {
      title: '系统升级通知',
      content: '系统将于本周六凌晨进行维护升级，预计2小时。',
      time: '2024-01-18 14:30'
    },
    {
      title: '新功能上线',
      content: 'Claude Sonnet 4.5 现已全面支持，欢迎体验。',
      time: '2024-01-15 10:00'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 欢迎区域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来，{user?.name || '用户'}！
          </h1>
          <p className="text-lg text-gray-600">
            今天是使用 Claude 的好日子 ✨
          </p>
        </div>

        {/* 统计卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="激活密钥"
            value={stats.activeKeys}
            description="当前激活的密钥数量"
            icon={Key}
            variant="gradient"
          />
          <StatCard
            title="剩余积分"
            value={stats.remainingCredits.toLocaleString()}
            description="可用积分余额"
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="使用率"
            value={`${stats.usagePercentage}%`}
            description="当前套餐使用情况"
            icon={TrendingUp}
            variant="outline"
          />
          <StatCard
            title="活跃天数"
            value="28"
            description="连续使用天数"
            icon={Clock}
          />
        </div>

        {/* 主要内容网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧列 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 积分进度卡片 */}
            <ProgressCard
              title="积分仪表盘"
              subtitle="实时监控你的使用情况"
              current={stats.usedCredits}
              total={stats.totalCredits}
              unit=" 积分"
              variant="primary"
            />

            {/* 功能卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FeatureCard
                title="快速操作"
                description="常用功能快速入口"
                icon={Zap}
                actions={quickActions}
                variant="gradient"
              />
              <FeatureCard
                title="邀请好友"
                description="邀请好友获得奖励积分"
                icon={Gift}
                actions={[
                  {
                    label: '分享邀请',
                    onClick: () => console.log('分享邀请'),
                    variant: 'outline'
                  }
                ]}
                variant="accent"
              />
            </div>

            {/* 公告卡片 */}
            <FeatureCard
              title="最新公告"
              description="系统通知和重要更新"
              icon={Bell}
              actions={[
                {
                  label: '查看全部',
                  onClick: () => console.log('查看公告'),
                  variant: 'ghost'
                }
              ]}
            >
              <div className="space-y-3 mt-4">
                {announcements.map((announcement, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-2">
                    <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-400 mt-1">{announcement.time}</p>
                  </div>
                ))}
              </div>
            </FeatureCard>
          </div>

          {/* 右侧列 */}
          <div className="space-y-8">
            {/* 订阅信息 */}
            <InfoCard
              title="订阅信息"
              items={subscriptionInfo}
              variant="bordered"
            />

            {/* 社区卡片 */}
            <FeatureCard
              title="加入社区"
              description="获取最新动态和技术支持"
              icon={Circle}
              actions={[
                {
                  label: '加入群聊',
                  onClick: () => console.log('加入群聊'),
                  variant: 'outline'
                }
              ]}
            >
              <div className="text-center mt-4">
                <div className="bg-gray-100 rounded-lg p-4 inline-block">
                  <div className="w-32 h-32 bg-gray-300 rounded flex items-center justify-center text-gray-500">
                    二维码
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  扫描二维码加入社群
                </p>
              </div>
            </FeatureCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewDashboard