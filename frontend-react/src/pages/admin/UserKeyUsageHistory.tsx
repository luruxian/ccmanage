import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import { ArrowLeft, Home } from 'lucide-react'
import request from '@/utils/request'

interface KeyInfo {
  user_email?: string | null
  status: string
  activation_date?: string | null
  expire_date?: string | null
  last_used_at?: string | null
}

interface UsageStats {
  total_requests: number
  total_tokens: number
  total_credits_used: number
  unique_services: number
  input_tokens: number
  output_tokens: number
  avg_tokens_per_request: number
  first_request: string
  last_request: string
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

const UserKeyUsageHistory: React.FC = () => {
  const { apiKey } = useParams<{ apiKey: string }>()
  const navigate = useNavigate()
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [availableServices, setAvailableServices] = useState<string[]>([])
  const [loading, setLoading] = useState({
    keyInfo: false,
    stats: false,
    records: false
  })
  const [errors, setErrors] = useState({
    keyInfo: '',
    stats: '',
    records: '',
    services: ''
  })
  const [filters, setFilters] = useState({
    service: 'all',
    startDate: '',
    endDate: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0
  })

  const loadKeyInfo = async () => {
    if (!apiKey) return
    try {
      setLoading(prev => ({ ...prev, keyInfo: true }))
      setErrors(prev => ({ ...prev, keyInfo: '' }))
      const response: any = await request.get('/admin/user-keys', {
        params: { api_key: apiKey }
      })

      console.log('Key信息响应:', response)

      // 适配不同的响应结构
      const userKeys = response.user_keys || response.data?.user_keys || []

      if (userKeys.length > 0) {
        const keyData = userKeys[0]
        setKeyInfo({
          user_email: keyData.user_email,
          status: keyData.status,
          activation_date: keyData.activation_date,
          expire_date: keyData.expire_date,
          last_used_at: keyData.last_used_at
        })
      } else {
        setKeyInfo({
          user_email: '未激活',
          status: 'inactive',
          activation_date: null,
          expire_date: null,
          last_used_at: null
        })
      }
    } catch (error) {
      console.error('加载Key信息失败:', error)
      setErrors(prev => ({ ...prev, keyInfo: '加载Key信息失败' }))
      setKeyInfo({
        user_email: '加载失败',
        status: 'unknown',
        activation_date: null,
        expire_date: null,
        last_used_at: null
      })
    } finally {
      setLoading(prev => ({ ...prev, keyInfo: false }))
    }
  }

  const loadUsageStats = async () => {
    if (!apiKey) return
    try {
      setLoading(prev => ({ ...prev, stats: true }))
      setErrors(prev => ({ ...prev, stats: '' }))
      const params: any = { api_key: apiKey }

      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate

      const response: any = await request.get(`/usage/stats`, { params })
      console.log('使用统计响应:', response)

      // 适配不同的响应结构
      const statsData = response.data || response
      setUsageStats(statsData)
    } catch (error) {
      console.error('加载使用统计失败:', error)
      setErrors(prev => ({ ...prev, stats: '加载使用统计失败' }))
      setUsageStats(null)
    } finally {
      setLoading(prev => ({ ...prev, stats: false }))
    }
  }

  const loadUsageRecords = async () => {
    if (!apiKey) return
    try {
      setLoading(prev => ({ ...prev, records: true }))
      setErrors(prev => ({ ...prev, records: '' }))
      const params: any = {
        api_key: apiKey,
        page: pagination.page,
        page_size: pagination.size
      }

      if (filters.service && filters.service !== 'all') params.service = filters.service
      if (filters.startDate) params.start_date = filters.startDate
      if (filters.endDate) params.end_date = filters.endDate

      const response: any = await request.get('/usage/history', { params })
      console.log('使用记录响应:', response)

      // 适配不同的响应结构
      const recordsData = response.records || response.data?.records || []
      const total = response.total || response.data?.total || 0

      setUsageRecords(recordsData)
      setPagination(prev => ({ ...prev, total }))
    } catch (err) {
      console.error('failed to load usage history', err)
      setErrors(prev => ({ ...prev, records: '加载使用记录失败' }))
      setUsageRecords([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(prev => ({ ...prev, records: false }))
    }
  }

  const loadAvailableServices = async () => {
    if (!apiKey) return
    try {
      setErrors(prev => ({ ...prev, services: '' }))
      const response: any = await request.get('/usage/services', {
        params: { api_key: apiKey }
      })
      console.log('服务类型响应:', response)

      // 适配不同的响应结构
      const services = response.data || response || []
      setAvailableServices(services)
    } catch (error) {
      console.error('加载服务类型失败:', error)
      setErrors(prev => ({ ...prev, services: '加载服务类型失败' }))
      setAvailableServices([])
    }
  }

  const loadAllData = async () => {
    if (!apiKey) return
    await Promise.all([
      loadKeyInfo(),
      loadUsageStats(),
      loadUsageRecords(),
      loadAvailableServices()
    ])
  }

  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    loadUsageRecords()
    loadUsageStats()
  }

  const refreshStats = () => {
    loadUsageStats()
  }

  const refreshRecords = () => {
    loadUsageRecords()
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSizeChange = (size: number) => {
    setPagination(prev => ({ page: 1, size, total: prev.total }))
  }

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    loadUsageRecords()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size])

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const formatNumber = (num: number) => {
    if (num == null) return '0'
    return num.toLocaleString()
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '激活'
      case 'inactive': return '非激活'
      case 'expired': return '过期'
      default: return '未知'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'inactive': return 'secondary'
      case 'expired': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* 面包屑导航 */}
      <div className="mb-6 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                管理面板
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">用户密钥</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>使用履历</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            返回管理
          </Button>
          <h1 className="text-2xl font-bold text-foreground">User Key使用履历</h1>
        </div>
      </div>

      {/* User Key基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔑 User Key信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.keyInfo && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.keyInfo}</AlertDescription>
            </Alert>
          )}
          {loading.keyInfo && <div className="text-center py-8 text-muted-foreground">加载中...</div>}
          {!loading.keyInfo && keyInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-muted-foreground">User Key</label>
                <div className="text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                  {apiKey}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">所属用户</label>
                <div className="text-lg font-semibold text-foreground">
                  {keyInfo.user_email || '未激活'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">状态</label>
                <div className="mt-1">
                  <Badge variant={getStatusVariant(keyInfo.status)}>
                    {getStatusText(keyInfo.status)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">激活时间</label>
                <div className="text-sm text-foreground">
                  {keyInfo.activation_date ? formatDate(keyInfo.activation_date) : '未激活'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">过期时间</label>
                <div className="text-sm text-foreground">
                  {keyInfo.expire_date ? formatDate(keyInfo.expire_date) : '-'}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">最后使用</label>
                <div className="text-sm text-foreground">
                  {keyInfo.last_used_at ? formatDate(keyInfo.last_used_at) : '未使用'}
                </div>
              </div>
            </div>
          ) : (
            !loading.keyInfo && <div className="text-center py-8 text-muted-foreground">加载失败</div>
          )}
        </CardContent>
      </Card>

      {/* 使用统计 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📊 使用统计
            </CardTitle>
            <Button
              onClick={refreshStats}
              disabled={loading.stats}
              variant="outline"
              size="sm"
            >
              {loading.stats ? '刷新中...' : '刷新'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {errors.stats && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errors.stats}</AlertDescription>
            </Alert>
          )}
          {loading.stats && <div className="text-center py-8 text-muted-foreground">加载中...</div>}
          {!loading.stats && usageStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-blue-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {usageStats.total_requests || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">总请求次数</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-yellow-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatNumber(usageStats.total_tokens) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">总Token数</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-red-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {usageStats.total_credits_used || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">总积分消耗</div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-green-500">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {usageStats.unique_services || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">服务类型数</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            !loading.stats && <div className="text-center py-8 text-muted-foreground">暂无数据</div>
          )}
        </CardContent>
      </Card>

      {/* 使用记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              📋 使用记录
            </CardTitle>
            <Button
              onClick={refreshRecords}
              disabled={loading.records}
              variant="outline"
              size="sm"
            >
              {loading.records ? '刷新中...' : '刷新'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 错误显示 */}
          {(errors.records || errors.services) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {errors.records && <div>{errors.records}</div>}
                {errors.services && <div>{errors.services}</div>}
              </AlertDescription>
            </Alert>
          )}

          {/* 筛选器 */}
          <div className="mb-6 p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="service-filter">服务类型</Label>
                <Select
                  value={filters.service}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, service: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="全部服务类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    {availableServices.map(service => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="start-date">开始时间</Label>
                <Input
                  type="datetime-local"
                  id="start-date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date">结束时间</Label>
                <Input
                  type="datetime-local"
                  id="end-date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  筛选
                </Button>
              </div>
            </div>
          </div>

          {loading.records && <div className="text-center py-8 text-muted-foreground">加载中...</div>}
          {!loading.records && usageRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">暂无记录</div>
          )}
          {!loading.records && usageRecords.length > 0 && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>服务类型</TableHead>
                    <TableHead>输入Token</TableHead>
                    <TableHead>输出Token</TableHead>
                    <TableHead>总Token</TableHead>
                    <TableHead>积分消耗</TableHead>
                    <TableHead>剩余积分</TableHead>
                    <TableHead>响应状态</TableHead>
                    <TableHead>请求时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {record.service}
                      </Badge>
                    </TableCell>
                      <TableCell>{formatNumber(record.input_tokens || 0) || '-'}</TableCell>
                      <TableCell>{formatNumber(record.output_tokens || 0) || '-'}</TableCell>
                      <TableCell>{formatNumber(record.total_tokens || 0) || '-'}</TableCell>
                      <TableCell>{record.credits_used || 0}</TableCell>
                      <TableCell>
                        {record.remaining_credits !== null && record.remaining_credits !== undefined ? (
                          <span className={record.remaining_credits <= 0 ? 'text-destructive font-semibold' :
                                           record.remaining_credits <= 10 ? 'text-orange-600 font-semibold' :
                                           'text-green-600'}>
                            {record.remaining_credits}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={record.response_status === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {record.response_status === 'success' ? '成功' : '失败'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(record.request_timestamp)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  共 {pagination.total} 条记录
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">每页</span>
                    <Select
                      value={pagination.size.toString()}
                      onValueChange={(value: string) => handleSizeChange(Number(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">条</span>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className={pagination.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm text-muted-foreground px-4">
                          第 {pagination.page} 页
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className={pagination.page * pagination.size >= pagination.total ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserKeyUsageHistory
