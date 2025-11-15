import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Settings, RotateCw, Copy, Edit2, Eye } from 'lucide-react'
import request from '@/utils/request'

interface SubscriptionInfo {
  id: number
  package_name: string
  package_code: string
  endpoint?: string
  price: number
  credits: number
  duration_days: number
  sort_order: number
  created_at: string
  description?: string
  is_active: boolean
}

interface UserKey {
  id: number
  user_id: number
  api_key: string
  real_api_key?: string
  user_email: string
  status: string
  activation_date?: string
  expire_date?: string
  remaining_days: number
  remaining_credits: number
  total_credits: number
  last_used_at?: string
  notes?: string
}

const SubscriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [userKeys, setUserKeys] = useState<UserKey[]>([])
  const [selectedKeys, setSelectedKeys] = useState<UserKey[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')

  const [loadingDetail, setLoadingDetail] = useState(false)
  const [loadingUserKeys, setLoadingUserKeys] = useState(false)
  const [loadingBatchGenerate, setLoadingBatchGenerate] = useState(false)
  const [loadingBulkOperation, setLoadingBulkOperation] = useState(false)

  const [pagination, setPagination] = useState({
    page: 1,
    size: 25,
    total: 0,
  })

  const [bulkOperationDialog, setBulkOperationDialog] = useState(false)
  const [bulkOperation, setBulkOperation] = useState({
    operation: '',
    notes: '',
  })

  const [editingKeyId, setEditingKeyId] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  const loadSubscriptionDetail = async () => {
    if (!id) return
    try {
      setLoadingDetail(true)
      const res: any = await request.get(`/admin/subscription/${id}`)
      setSubscription(res || null)
    } catch (err) {
      console.error('failed to load subscription detail', err)
    } finally {
      setLoadingDetail(false)
    }
  }

  const loadUserKeys = async () => {
    if (!id) return
    try {
      setLoadingUserKeys(true)
      const res: any = await request.get(`/packages/${id}/userkeys`, {
        params: {
          page: pagination.page,
          page_size: pagination.size,
          status_filter: statusFilter || undefined,
        }
      })
      setUserKeys(res.user_keys || [])
      setPagination(prev => ({ ...prev, total: res.total || 0 }))
    } catch (err) {
      console.error('failed to load user keys', err)
    } finally {
      setLoadingUserKeys(false)
    }
  }

  useEffect(() => {
    loadSubscriptionDetail()
    loadUserKeys()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pagination.page, pagination.size, statusFilter])

  const handleBatchGenerate = async () => {
    if (!id) return
    try {
      setLoadingBatchGenerate(true)
      await request.post(`/packages/${id}/userkeys/batch-generate`, {
        count: 10,
        status: 'inactive'
      })
      alert('批量生成用户密钥成功')
      setPagination(prev => ({ ...prev, page: 1 }))
      loadUserKeys()
    } catch (err) {
      console.error('failed to batch generate', err)
      alert('批量生成失败')
    } finally {
      setLoadingBatchGenerate(false)
    }
  }

  const handleBulkOperation = async () => {
    if (!id || !bulkOperation.operation) return
    try {
      setLoadingBulkOperation(true)
      await request.post(`/packages/${id}/userkeys/batch`, {
        user_ids: selectedKeys.map(k => k.user_id),
        operation: bulkOperation.operation,
        notes: bulkOperation.notes,
      })
      alert('批量操作成功')
      setBulkOperationDialog(false)
      setBulkOperation({ operation: '', notes: '' })
      setSelectedKeys([])
      loadUserKeys()
    } catch (err) {
      console.error('failed to execute bulk operation', err)
      alert('批量操作失败')
    } finally {
      setLoadingBulkOperation(false)
    }
  }

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key)
      alert('已复制到剪贴板')
    } catch {
      alert('复制失败')
    }
  }

  const handleEditRealApiKey = (userKey: UserKey) => {
    setEditingKeyId(userKey.id)
    setEditingValue(userKey.real_api_key || '')
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const handleSaveRealApiKey = async (userKey: UserKey) => {
    if (!id) return
    try {
      await request.put(`/packages/${id}/userkeys/${userKey.id}/real-api-key`, {
        real_api_key: editingValue
      })
      alert('更新成功')
      setEditingKeyId(null)
      loadUserKeys()
    } catch (err) {
      console.error('failed to save real api key', err)
      alert('更新失败')
    }
  }

  const handleViewUsageHistory = (apiKey: string) => {
    navigate(`/admin/user-key-usage/${apiKey}`)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  const getStatusType = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '激活'
      case 'inactive':
        return '非激活'
      case 'expired':
        return '过期'
      default:
        return '未知'
    }
  }

  const getRemainingDaysClass = (days: number) => {
    if (days <= 0) return 'text-red-600 font-semibold'
    if (days <= 7) return 'text-orange-600 font-semibold'
    if (days <= 30) return 'text-yellow-600 font-semibold'
    return 'text-gray-600'
  }

  if (!id) return <div className="p-6">无效订阅ID</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 顶部导航 */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          返回管理
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">订阅详情</h1>
      </div>

      {/* 订阅基本信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📦 订阅信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDetail ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-gray-600">订阅名称</label>
                <div className="text-lg font-semibold text-gray-900">{subscription.package_name}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">订阅代码</label>
                <div className="text-lg font-semibold text-gray-900">{subscription.package_code}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">状态</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.is_active ? '可用' : '不可用'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">价格</label>
                <div className="text-lg font-semibold text-gray-900">¥{subscription.price}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">积分</label>
                <div className="text-lg font-semibold text-gray-900">{subscription.credits}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">时长</label>
                <div className="text-lg font-semibold text-gray-900">{subscription.duration_days} 天</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">服务端点</label>
                <div className="text-sm text-gray-700">{subscription.endpoint || '未设置'}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">排序</label>
                <div className="text-lg font-semibold text-gray-900">{subscription.sort_order}</div>
              </div>
              <div>
                <label className="text-sm text-gray-600">创建时间</label>
                <div className="text-sm text-gray-700">{formatDate(subscription.created_at)}</div>
              </div>
              {subscription.description && (
                <div className="lg:col-span-3">
                  <label className="text-sm text-gray-600">描述</label>
                  <div className="text-sm text-gray-700 mt-1">{subscription.description}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">未找到订阅</div>
          )}
        </CardContent>
      </Card>

      {/* 用户密钥管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            🔑 用户密钥管理
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleBatchGenerate}
              disabled={loadingBatchGenerate}
            >
              <Plus size={18} />
              批量生成 (10个)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkOperationDialog(true)}
              disabled={selectedKeys.length === 0}
            >
              <Settings size={18} />
              批量操作 ({selectedKeys.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadUserKeys}
            >
              <RotateCw size={18} />
              刷新
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* 筛选器 */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">全部状态</option>
              <option value="active">激活</option>
              <option value="inactive">非激活</option>
              <option value="expired">过期</option>
            </select>
          </div>

          {/* 加载状态 */}
          {loadingUserKeys && (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          )}

          {/* 用户密钥表格 */}
          {!loadingUserKeys && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys(userKeys)
                        } else {
                          setSelectedKeys([])
                        }
                      }}
                      checked={selectedKeys.length === userKeys.length && userKeys.length > 0}
                    />
                  </TableHead>
                  <TableHead>用户邮箱</TableHead>
                  <TableHead>用户Key</TableHead>
                  <TableHead>有效API Key</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>激活时间</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>剩余天数</TableHead>
                  <TableHead>剩余积分</TableHead>
                  <TableHead>最后使用</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userKeys.map((userKey) => (
                  <TableRow key={userKey.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedKeys.some(k => k.id === userKey.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys([...selectedKeys, userKey])
                          } else {
                            setSelectedKeys(selectedKeys.filter(k => k.id !== userKey.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{userKey.user_email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {userKey.api_key.substring(0, 10)}...
                        </code>
                        <button
                          onClick={() => handleCopyKey(userKey.api_key)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="复制"
                        >
                          <Copy size={16} className="text-gray-600" />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingKeyId === userKey.id ? (
                        <div className="flex gap-1">
                          <Input
                            ref={editInputRef}
                            size={undefined}
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveRealApiKey(userKey)
                              } else if (e.key === 'Escape') {
                                setEditingKeyId(null)
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveRealApiKey(userKey)}
                          >
                            保存
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group">
                          <span className="text-xs text-gray-600">
                            {userKey.real_api_key || '未设置'}
                          </span>
                          <button
                            onClick={() => handleEditRealApiKey(userKey)}
                            className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100"
                            title="编辑"
                          >
                            <Edit2 size={14} className="text-gray-600" />
                          </button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusType(userKey.status)}`}>
                        {getStatusText(userKey.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(userKey.activation_date)}</TableCell>
                    <TableCell className="text-sm">{formatDate(userKey.expire_date)}</TableCell>
                    <TableCell>
                      <span className={getRemainingDaysClass(userKey.remaining_days)}>
                        {userKey.activation_date ? `${userKey.remaining_days}天` : `${userKey.remaining_days}天(初始)`}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {userKey.remaining_credits} / {userKey.total_credits}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(userKey.last_used_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewUsageHistory(userKey.api_key)}
                        disabled={!userKey.api_key}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">共 {pagination.total} 条</span>
            <div className="flex gap-2 items-center">
              <select
                value={pagination.size}
                onChange={(e) => {
                  setPagination(prev => ({ ...prev, size: parseInt(e.target.value), page: 1 }))
                }}
                className="px-2 py-1 border border-gray-300 rounded"
              >
                <option value="25">25条/页</option>
                <option value="50">50条/页</option>
                <option value="100">100条/页</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                上一页
              </Button>
              <span className="px-2">{pagination.page}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={userKeys.length < pagination.size}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作对话框 */}
      <Dialog open={bulkOperationDialog} onOpenChange={setBulkOperationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量操作</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="operation">操作类型</Label>
              <select
                id="operation"
                value={bulkOperation.operation}
                onChange={(e) => setBulkOperation(prev => ({ ...prev, operation: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">选择操作类型</option>
                <option value="generate">生成密钥</option>
                <option value="activate">激活密钥</option>
                <option value="deactivate">禁用密钥</option>
                <option value="delete">删除密钥</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">操作备注</Label>
              <textarea
                id="notes"
                value={bulkOperation.notes}
                onChange={(e) => setBulkOperation(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="可选的操作备注"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              将对 <strong>{selectedKeys.length}</strong> 个用户密钥执行
              <strong className="ml-1">
                {bulkOperation.operation === 'generate' && '生成密钥'}
                {bulkOperation.operation === 'activate' && '激活密钥'}
                {bulkOperation.operation === 'deactivate' && '禁用密钥'}
                {bulkOperation.operation === 'delete' && '删除密钥'}
              </strong>
              操作
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkOperationDialog(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleBulkOperation}
              disabled={!bulkOperation.operation || loadingBulkOperation}
            >
              确认执行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SubscriptionDetail
