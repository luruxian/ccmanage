import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { ArrowLeft } from 'lucide-react'
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

const UsageHistory: React.FC = () => {
  const { apiKey } = useParams<{ apiKey: string }>()
  const navigate = useNavigate()
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null)
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [loadingUsageRecords, setLoadingUsageRecords] = useState(false)
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

      setUsageRecords(response.records || [])
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / pagination.size)
      }))
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
    <div className="p-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/app/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回仪表盘
        </Button>
        <h2 className="text-2xl font-bold">使用历史</h2>
      </div>

      {/* API密钥基本信息 */}
      {selectedApiKey && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🔑</span>
              <span>API密钥信息</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">订阅名称:</span>
                <div className="mt-1">{selectedApiKey.package_name || '未知订阅'}</div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">API密钥:</span>
                <div className="mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
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
                <div className="mt-1">
                  {selectedApiKey.activation_date ? new Date(selectedApiKey.activation_date).toLocaleString('zh-CN') : '未激活'}
                </div>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">剩余积分:</span>
                <div className="mt-1">
                  <span className={getRemainingCreditsClass(selectedApiKey.remaining_credits, selectedApiKey.total_credits)}>
                    {selectedApiKey.remaining_credits !== null ? selectedApiKey.remaining_credits : '-'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用记录表格 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>使用记录</span>
            </CardTitle>
            <Button
              variant="outline"
              onClick={loadUsageRecords}
              disabled={loadingUsageRecords}
            >
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsageRecords ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">请求时间</TableHead>
                      <TableHead className="w-24">积分消耗</TableHead>
                      <TableHead className="w-32">剩余积分</TableHead>
                      <TableHead className="w-24">响应状态</TableHead>
                      <TableHead className="w-1/3">服务类型</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageRecords.map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {record.request_timestamp ? new Date(record.request_timestamp).toLocaleString('zh-CN') : '-'}
                        </TableCell>
                        <TableCell>
                          {record.credits_used || 0}
                        </TableCell>
                        <TableCell>
                          {record.remaining_credits !== null && record.remaining_credits !== undefined ? (
                            <span className={getRemainingCreditsClass(record.remaining_credits, selectedApiKey?.total_credits)}>
                              {record.remaining_credits}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.response_status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.response_status === 'success' ? '成功' : '失败'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            {record.service}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页组件 */}
              <div className="flex items-center justify-between mt-6">
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
  )
}

export default UsageHistory