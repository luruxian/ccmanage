import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import {
  StatCard,
  FeatureCard,
  ApiKeysManagement
} from '@/components/dashboard'
import {
  Key,
  Zap,
  Bell,
  Circle
} from 'lucide-react'
import request from '@/utils/request'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface ApiKey {
  id?: string;
  user_key_id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  usage_count?: number;
  last_used_at?: string;
  created_at: string;
  package_name?: string;
  activation_date?: string;
  expire_date?: string;
  remaining_days?: number;
  status?: string;
  total_credits?: number;
  remaining_credits?: number;
}

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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [keyStats, setKeyStats] = useState({ active: 0 })
  const [resetCreditsDialogVisible, setResetCreditsDialogVisible] = useState(false)
  const [resettingCredits, setResettingCredits] = useState(false)
  const [resetCreditsKey, setResetCreditsKey] = useState<ApiKey | null>(null)

  // 密钥激活相关状态
  const [keyActivationDialogVisible, setKeyActivationDialogVisible] = useState(false)
  const [activatingKey, setActivatingKey] = useState(false)
  const [userKeyInput, setUserKeyInput] = useState('')
  const [activationToast, setActivationToast] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [showActivationSuccessDialog, setShowActivationSuccessDialog] = useState(false)
  const [activatedKeyInfo, setActivatedKeyInfo] = useState({
    userKey: '',
    activationDate: '',
    expireDate: '',
    credits: 0
  })

  useEffect(() => {
    loadDashboardData()
    loadUserKeys()
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

  // 加载用户密钥
  const loadUserKeys = async () => {
    try {
      setLoadingKeys(true)
      const response: any = await request.get('/keys/')
      setApiKeys(response.keys || [])

      // 更新统计数据
      const activeCount = (response.keys || []).filter((k: ApiKey) => k.status === 'active').length
      setKeyStats({ active: activeCount })
    } catch (error) {
      console.error('获取密钥列表失败:', error)
    } finally {
      setLoadingKeys(false)
    }
  }

  // 重置积分相关函数
  const resetCredits = (key: ApiKey) => {
    setResetCreditsKey(key)
    setResetCreditsDialogVisible(true)
  }

  // 确认重置积分
  const confirmResetCredits = async () => {
    if (!resetCreditsKey) return

    try {
      setResettingCredits(true)

      // 检查key对象是否有有效的ID
      const keyId = resetCreditsKey.id || resetCreditsKey.user_key_id
      if (!keyId) {
        alert('密钥ID无效，无法重置积分')
        return
      }

      console.log('重置积分请求 - 密钥ID:', keyId)
      const response = await request.put(`/keys/${keyId}/reset-credits`)
      console.log('重置积分响应:', response)

      // 重新加载密钥列表以更新显示
      await loadUserKeys()

      // 安全地访问响应数据
      const message = response?.data?.message || '积分重置成功'
      alert(message)

      // 关闭弹窗
      setResetCreditsDialogVisible(false)
      setResetCreditsKey(null)
    } catch (error: any) {
      console.error('重置积分失败:', error)

      // 改进错误处理
      let message = '重置失败'
      if (error?.response?.data?.detail) {
        message = error.response.data.detail
      } else if (error?.response?.data?.message) {
        message = error.response.data.message
      } else if (error?.message) {
        message = error.message
      }

      alert(message)
    } finally {
      setResettingCredits(false)
    }
  }

  // 处理重置积分取消
  const handleResetCreditsCancel = () => {
    setResetCreditsKey(null)
    setResetCreditsDialogVisible(false)
  }

  // 下载配置函数
  const downloadConfig = async (key: ApiKey) => {
    try {
      // 检查key对象是否有有效的ID
      const keyId = key.id || key.user_key_id
      if (!keyId) {
        alert('密钥ID无效，无法下载配置')
        return
      }

      console.log('下载配置请求 - 密钥ID:', keyId)
      const response: any = await request.get(`/keys/${keyId}/download-config`)
      console.log('下载配置响应:', response)

      if (response.config && response.filename) {
        // 创建 settings.json
        const settingsBlob = new Blob([JSON.stringify(response.config, null, 2)], {
          type: 'application/json'
        })

        // 创建 config.json - 基于 settings_template.json 的结构
        const configData = {
          primaryApiKey: key.api_key
        }
        const configBlob = new Blob([JSON.stringify(configData, null, 2)], {
          type: 'application/json'
        })

        // 创建ZIP文件
        const JSZip = await import('jszip')
        const zip = new JSZip.default()
        zip.file('settings.json', settingsBlob)
        zip.file('config.json', configBlob)

        // 生成ZIP文件
        const zipBlob = await zip.generateAsync({type: 'blob'})

        // 创建下载链接
        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'claude-code-config.zip'
        document.body.appendChild(a)
        a.click()

        // 清理
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        alert('配置文件下载成功，包含 settings.json 和 config.json')
      } else {
        alert('下载失败：响应数据格式错误')
      }
    } catch (error: any) {
      console.error('下载配置失败:', error)

      // 改进错误处理
      let message = '下载设置文件失败'
      if (error?.response?.data?.detail) {
        message = error.response.data.detail
      } else if (error?.response?.data?.message) {
        message = error.response.data.message
      } else if (error?.message) {
        message = error.message
      }

      alert(message)
    }
  }

  // 密钥激活相关函数
  const validateKeyActivationForm = (): boolean => {
    if (!userKeyInput.trim()) {
      setActivationToast({ type: 'error', message: '请输入用户Key' })
      return false
    }

    if (userKeyInput.length < 10) {
      setActivationToast({ type: 'error', message: '用户Key长度不能少于10位' })
      return false
    }

    return true
  }

  const handleKeyActivation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateKeyActivationForm()) {
      return
    }

    setActivatingKey(true)

    try {
      const res: any = await request.post('/keys/activate-user-key', {
        user_key: userKeyInput
      })

      setActivatedKeyInfo({
        userKey: userKeyInput,
        activationDate: new Date().toLocaleString('zh-CN'),
        expireDate: '',
        credits: 0
      })

      setShowActivationSuccessDialog(true)
      setActivationToast({ type: 'success', message: res?.message || '用户Key激活成功！' })
      setUserKeyInput('')

      // 激活成功后刷新密钥列表
      await loadUserKeys()

    } catch (error: any) {
      console.error('激活失败:', error)

      let errorMessage = '激活失败，请稍后重试'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      setActivationToast({ type: 'error', message: errorMessage })
    } finally {
      setActivatingKey(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setActivationToast({ type: 'success', message: '已复制到剪贴板' })
    } catch (error) {
      setActivationToast({ type: 'error', message: '复制失败' })
    }
  }

  const handleActivationSuccessClose = () => {
    setShowActivationSuccessDialog(false)
    setKeyActivationDialogVisible(false)
  }

  // Toast 通知自动隐藏
  useEffect(() => {
    if (activationToast) {
      const timer = setTimeout(() => {
        setActivationToast(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [activationToast])

  const quickActions = [
    {
      label: '激活密钥',
      onClick: () => setKeyActivationDialogVisible(true),
      variant: 'default' as const
    },
    {
      label: '查看订阅',
      onClick: () => navigate('/packages'),
      variant: 'outline' as const
    }
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
            今天是使用 Claude Code 的好日子 ✨
          </p>
        </div>

        {/* 第一行卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="激活密钥"
            value={stats.activeKeys}
            description="当前激活的密钥数量"
            icon={Key}
            variant="gradient"
          />
          <FeatureCard
            title="快速操作"
            description="常用功能快速入口"
            icon={Zap}
            actions={quickActions}
            variant="gradient"
          />
        </div>

        {/* API密钥管理 - 独占一行 */}
        <div className="mb-8">
          <ApiKeysManagement
            apiKeys={apiKeys}
            loadingKeys={loadingKeys}
            keyStats={keyStats}
            onRefreshKeys={loadUserKeys}
            onViewUsageHistory={(key) => {
              // 导航到使用历史页面
              navigate(`/app/usage-history/${encodeURIComponent(key.api_key)}`)
            }}
            onResetCredits={resetCredits}
            onDownloadConfig={downloadConfig}
          />
        </div>

        {/* 其他功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* 重置积分确认对话框 */}
      <Dialog open={resetCreditsDialogVisible} onOpenChange={setResetCreditsDialogVisible}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认重置积分</DialogTitle>
            <DialogDescription>
              您确定要重置此API密钥的积分吗？此操作将把积分恢复为初始值，无法撤销。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {resetCreditsKey && (
              <div className="text-sm text-muted-foreground">
                <p><strong>订阅名称:</strong> {resetCreditsKey.package_name || '未知订阅'}</p>
                <p><strong>API密钥:</strong> {resetCreditsKey.api_key.substring(0, 4) + '****' + resetCreditsKey.api_key.substring(resetCreditsKey.api_key.length - 4)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleResetCreditsCancel}
              disabled={resettingCredits}
            >
              取消
            </Button>
            <Button
              onClick={confirmResetCredits}
              disabled={resettingCredits}
            >
              {resettingCredits ? '重置中...' : '确认重置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 密钥激活对话框 */}
      <Dialog open={keyActivationDialogVisible} onOpenChange={setKeyActivationDialogVisible}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">用户Key激活</DialogTitle>
            <DialogDescription className="text-center">
              激活您的用户Key以使用服务
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleKeyActivation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userKey" className="text-gray-700">
                用户Key
              </Label>
              <Input
                id="userKey"
                name="userKey"
                type="text"
                placeholder="请输入要激活的用户Key"
                value={userKeyInput}
                onChange={(e) => setUserKeyInput(e.target.value)}
                className="h-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
              />
              <div className="text-sm text-gray-500 mt-1">
                输入您获得的用户Key，格式如：sk-xxxxxxxx...
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={activatingKey}
            >
              {activatingKey ? '激活中...' : '激活用户Key'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* 激活成功对话框 */}
      <Dialog open={showActivationSuccessDialog} onOpenChange={setShowActivationSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">激活成功</DialogTitle>
          </DialogHeader>

          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-4">用户Key激活成功！</h4>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <p><strong>激活时间:</strong> {activatedKeyInfo.activationDate}</p>
              <p className="mt-2"><strong>用户Key:</strong></p>
              <div className="flex gap-2 mt-2">
                <Input
                  value={activatedKeyInfo.userKey}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => copyToClipboard(activatedKeyInfo.userKey)}
                  variant="outline"
                >
                  复制
                </Button>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">激活成功</AlertTitle>
              <AlertDescription className="text-green-700">
                您的用户Key已成功激活，现在可以使用服务了
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={handleActivationSuccessClose}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/90"
            >
              完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 激活通知 Toast */}
      {activationToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          activationToast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {activationToast.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{activationToast.message}</span>
        </div>
      )}
    </div>
  )
}

export default NewDashboard