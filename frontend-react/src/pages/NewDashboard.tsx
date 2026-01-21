import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/user'
import ccImage from '@/assets/images/cc.jpg'
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
import { useToast } from '@/components/ui/ToastProvider'
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
import { CheckCircle } from 'lucide-react'

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
  package_type?: string;  // 套餐类型：01-标准订阅，02-Max系列订阅，20-体验积分包，21-临时积分包，91-加油包
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
  const { success, error } = useToast()

  const [stats, setStats] = useState<DashboardStats>({
    activeKeys: 0,
    totalCredits: 0,
    usedCredits: 0,
    remainingCredits: 0,
    usagePercentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [keyStats, setKeyStats] = useState({ active: 0 })
  const [resetCreditsDialogVisible, setResetCreditsDialogVisible] = useState(false)
  const [resettingCredits, setResettingCredits] = useState(false)
  const [resetCreditsKey, setResetCreditsKey] = useState<ApiKey | null>(null)

  // 密钥激活相关状态
  const [keyActivationDialogVisible, setKeyActivationDialogVisible] = useState(false)
  const [activatingKey, setActivatingKey] = useState(false)
  const [userKeyInput, setUserKeyInput] = useState('')
  const [showActivationSuccessDialog, setShowActivationSuccessDialog] = useState(false)
  const [activatedKeyInfo, setActivatedKeyInfo] = useState({
    userKey: '',
    activationDate: '',
    expireDate: '',
    credits: 0
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // 从密钥列表计算统计数据
      const response: any = await request.get('/keys/')
      const keys = response.keys || []

      // 设置API密钥列表
      setApiKeys(keys)

      // 计算活跃密钥数量
      const activeKeys = keys.filter((k: ApiKey) => k.status === 'active').length

      // 计算积分统计数据（这里需要根据实际业务逻辑调整）
      const totalCredits = keys.reduce((sum: number, k: ApiKey) => sum + (k.total_credits || 0), 0)
      const remainingCredits = keys.reduce((sum: number, k: ApiKey) => sum + (k.remaining_credits || 0), 0)
      const usedCredits = totalCredits - remainingCredits
      const usagePercentage = totalCredits > 0 ? Math.round((usedCredits / totalCredits) * 100) : 0

      setStats({
        activeKeys,
        totalCredits,
        usedCredits,
        remainingCredits,
        usagePercentage
      })

      // 更新密钥统计数据
      setKeyStats({ active: activeKeys })
    } catch (error) {
      console.error('加载dashboard数据失败:', error)
      // 如果API调用失败，使用默认值
      setStats({
        activeKeys: 0,
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        usagePercentage: 0
      })
      setApiKeys([])
      setKeyStats({ active: 0 })
    } finally {
      setLoading(false)
    }
  }

  // 重新加载用户密钥和统计数据
  const loadUserKeys = async () => {
    await loadDashboardData()
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
        error('密钥ID无效，无法重置积分')
        return
      }

      const response = await request.put(`/keys/${keyId}/reset-credits`)

      // 重新加载密钥列表以更新显示
      await loadUserKeys()

      // 安全地访问响应数据
      const message = response?.data?.message || '积分重置成功'
      success(message)

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
      // 显示message
      success(message)
      
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
        error('密钥ID无效，无法下载配置')
        return
      }

      const response: any = await request.get(`/keys/${keyId}/download-config`)

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

        success('配置文件下载成功，包含 settings.json 和 config.json')
      } else {
        error('下载失败：响应数据格式错误')
      }
    } catch (err: any) {
      console.error('下载配置失败:', err)

      // 改进错误处理
      let message = '下载设置文件失败'
      if (err?.response?.data?.detail) {
        message = err.response.data.detail
      } else if (err?.response?.data?.message) {
        message = err.response.data.message
      } else if (err?.message) {
        message = err.message
      }

      error(message)
    }
  }

  // 密钥激活相关函数
  const validateKeyActivationForm = (): boolean => {
    if (!userKeyInput.trim()) {
      error('请输入用户Key')
      return false
    }

    if (userKeyInput.length < 10) {
      error('用户Key长度不能少于10位')
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
      success(res?.message || '用户Key激活成功！')
      setUserKeyInput('')

      // 激活成功后刷新密钥列表
      await loadUserKeys()

    } catch (err: any) {
      console.error('激活失败:', err)

      let errorMessage = '激活失败，请稍后重试'
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      error(errorMessage)
    } finally {
      setActivatingKey(false)
    }
  }


  const handleActivationSuccessClose = () => {
    setShowActivationSuccessDialog(false)
    setKeyActivationDialogVisible(false)
  }


  const quickActions = [
    {
      label: '激活密钥',
      onClick: () => setKeyActivationDialogVisible(true),
      variant: 'default' as const
    },
    {
      label: '查看订阅',
      onClick: () => navigate('/app/packages'),
      variant: 'outline' as const
    }
  ]


  const announcements = [
    {
      title: '系统升级通知',
      content: '系统将于本周六凌晨进行维护升级，预计2小时。',
      time: '2025-01-18 14:30'
    },
    {
      title: '新功能上线',
      content: 'Claude Sonnet 4.5 现已全面支持，欢迎体验。',
      time: '2025-10-01 10:00'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/3 mb-6 sm:mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        {/* 欢迎区域 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            欢迎回来，{user?.name || '用户'}！
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            今天是使用 Claude Code 的好日子 ✨
          </p>
        </div>

        {/* 第一行卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <div className="mb-6 sm:mb-8">
          <ApiKeysManagement
            apiKeys={apiKeys}
            loadingKeys={loading}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* 公告卡片 */}
          <FeatureCard
            title="最新公告"
            description="系统通知和重要更新"
            icon={Bell}
            actions={[]}
          >
            <div className="space-y-3 mt-4">
              {announcements.map((announcement, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium text-foreground">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{announcement.time}</p>
                </div>
              ))}
            </div>
          </FeatureCard>

          {/* 社区卡片 */}
          <FeatureCard
            title="加入社区"
            description="获取最新动态和技术支持"
            icon={Circle}
            actions={[]}
          >
            <div className="text-center mt-4">
              <div className="bg-muted rounded-lg p-4 inline-block">
                <img
                  src={ccImage}
                  alt="社区二维码"
                  className="w-32 h-32 rounded object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
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
              <Label htmlFor="userKey" className="text-foreground">
                用户Key
              </Label>
              <Input
                id="userKey"
                name="userKey"
                type="text"
                placeholder="请输入要激活的用户Key"
                value={userKeyInput}
                onChange={(e) => setUserKeyInput(e.target.value)}
                className="h-12 text-base"
              />
              <div className="text-sm text-muted-foreground mt-1">
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
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-4">用户Key激活成功！</h4>

            <div className="bg-muted rounded-lg p-4 mb-4 text-left">
              <p><strong>激活时间:</strong> {activatedKeyInfo.activationDate}</p>
            </div>

            <Alert className="bg-success/10 border-success/20">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertTitle className="text-success-foreground">激活成功</AlertTitle>
              <AlertDescription className="text-success-foreground/90">
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

    </div>
  )
}

export default NewDashboard