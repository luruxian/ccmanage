import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatCard, FeatureCard } from '@/components/dashboard'
import { ArrowLeft, History, BarChart3, Calendar, CreditCard } from 'lucide-react'
import request from '@/utils/request'

interface ApiKey {
  id?: string
  user_key_id: string
  key_name: string
  api_key: string
  package_name?: string
  activation_date?: string
  expire_date?: string
  status?: string
  total_credits?: number
  remaining_credits?: number
}

interface UsageRecord {
  id: number
  api_key_id: number
  service: string
  request_count: number
  credits_used: number
  remaining_credits?: number
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  request_timestamp: string
  response_status?: string
  error_message?: string
}

interface UsageStats {
  totalRequests: number
  totalCreditsUsed: number
  successRate: number
  uniqueServices: number
}

const UsageHistory: React.FC = () => {
  const { apiKey } = useParams<{ apiKey: string }>()
  const navigate = useNavigate()
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [loadingUsageRecords, setLoadingUsageRecords] = useState(false)
  const [usageStats, setUsageStats] = useState<UsageStats>({
    totalRequests: 0,
    totalCreditsUsed: 0,
    successRate: 0,
    uniqueServices: 0
  })
  const [pagination, setPagination] = useState({
    current: 1,
    size: 20,
    total: 0,
    totalPages: 0
  })

  // 加载API密钥信息
  const loadApiKeyInfo = async () => {
    if (!apiKey) return

    try {
      const response: any = await request.get('/keys/')
      const userKeys = response.keys || []

      // 找到匹配的密钥
      const matchedKey = userKeys.find((key: ApiKey) => key.api_key === apiKey)
      if (matchedKey) {
        setSelectedApiKey(matchedKey)
      }
    } catch (error) {
      console.error('加载API密钥信息失败:', error)
    }
  }

  // 加载使用记录
  const loadUsageRecords = async () => {
    if (!apiKey) return

    try {
      setLoadingUsageRecords(true)

      const response: any = await request.get('/usage/history', {
        params: {
          api_key: apiKey,
          page: pagination.current,
          page_size: pagination.size
        }
      })

      const records = response.records || []
      setUsageRecords(records)
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.size)
      }))

      // 计算使用统计数据
      const totalRequests = response.total || 0
      const totalCreditsUsed = records.reduce((sum: number, record: UsageRecord) => sum + (record.credits_used || 0), 0)
      const successCount = records.filter((record: UsageRecord) => record.response_status === 'success').length
      const successRate = records.length > 0 ? Math.round((successCount / records.length) * 100) : 0
      const uniqueServices = new Set(records.map((record: UsageRecord) => record.service)).size

      setUsageStats({
        totalRequests,
        totalCreditsUsed,
        successRate,
        uniqueServices
      })
    } catch (error) {
      console.error('获取使用记录失败:', error)
      setUsageRecords([])
    } finally {
      setLoadingUsageRecords(false)
    }
  }

  // 分页事件处理
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }))
  }

  const handleSizeChange = (size: number) => {
    setPagination(prev => ({
      ...prev,
      size,
      current: 1,
      totalPages: Math.ceil(prev.total / size)
    }))
  }

  useEffect(() => {
    loadApiKeyInfo()
    loadUsageRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, pagination.current, pagination.size])

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return '激活'
      case 'expired':
        return '过期'
      case 'inactive':
      default:
        return '未激活'
    }
  }

  const getRemainingCreditsClass = (remainingCredits?: number, totalCredits?: number) => {
    if (remainingCredits === undefined || totalCredits === undefined) return 'text-muted-foreground'
    if (!totalCredits || totalCredits <= 0) {
      return 'text-muted-foreground'
    }

    const percentage = (remainingCredits / totalCredits) * 100

    if (percentage <= 10) {
      return 'text-red-600 font-bold'
    } else if (percentage <= 30) {
      return 'text-yellow-600 font-bold'
    }
    return 'text-green-600'
  }

  const maskApiKey = (apiKey: string) => {
    if (!apiKey) return '-'
    if (apiKey.length <= 8) return apiKey
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 返回按钮和标题 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/app/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回仪表盘
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">使用历史</h1>
        </div>

        {/* API密钥基本信息卡片 */}
        {selectedApiKey && (
          <div className="mb-8">
            <FeatureCard
              title="API密钥信息"
              icon={CreditCard}
              variant="gradient"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">订阅名称:</span>
                  <div className="mt-1 font-medium">{selectedApiKey.package_name || '未知订阅'}</div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">API密钥:</span>
                  <div className="mt-1">
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {maskApiKey(selectedApiKey.api_key)}
                    </code>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">状态:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(selectedApiKey.status)}`}>
                      {getStatusText(selectedApiKey.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">激活时间:</span>
                  <div className="mt-1 font-medium">
                    {selectedApiKey.activation_date ? new Date(selectedApiKey.activation_date).toLocaleString('zh-CN') : '未激活'}
                  </div>
                </div>
              </div>
            </FeatureCard>
          </div>
        )}

        {/* 使用统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总请求次数"
            value={usageStats.totalRequests}
            description="所有时间内的请求总数"
            icon={History}
            variant="gradient"
          />
        </div>

        {/* 使用记录卡片 */}
        <Card className="rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white border-gray-200">
          <CardContent className="p-6">
            {/* 卡片标题和刷新按钮 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary">
                  <History className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">使用记录</h3>
                  <p className="text-sm text-gray-600">详细的API调用记录和统计信息</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsageRecords}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </Button>
            </div>
          {loadingUsageRecords ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : usageRecords.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">暂无使用记录</h3>
              <p className="text-sm text-muted-foreground">
                该API密钥暂无使用记录
              </p>
            </div>
          ) : (
            <>
              {/* 记录卡片网格 */}
              <div className="space-y-4 mb-6">
                {usageRecords.map((record, index) => (
                  <Card key={index} className="border-l-4 border-primary/50 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">请求时间</span>
                          <div className="mt-1 font-medium">
                            {record.request_timestamp ? new Date(record.request_timestamp).toLocaleString('zh-CN') : '-'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">积分消耗</span>
                          <div className="mt-1 font-medium text-orange-600">
                            {record.credits_used || 0}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">剩余积分</span>
                          <div className="mt-1">
                            {record.remaining_credits !== null && record.remaining_credits !== undefined ? (
                              <span className={`font-medium ${getRemainingCreditsClass(record.remaining_credits, selectedApiKey?.total_credits)}`}>
                                {record.remaining_credits}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">响应状态</span>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.response_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {record.response_status === 'success' ? '成功' : '失败'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">服务类型</span>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {record.service}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 分页组件 */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">每页显示</span>
                  <Select
                    value={pagination.size.toString()}
                    onValueChange={(value) => handleSizeChange(Number(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue placeholder="选择数量" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">条记录</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    共 {pagination.total} 条记录
                  </span>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(pagination.current - 1)}
                          className={pagination.current === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink
                          isActive
                          className="cursor-pointer"
                        >
                          {pagination.current}
                        </PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(pagination.current + 1)}
                          className={pagination.current === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UsageHistory