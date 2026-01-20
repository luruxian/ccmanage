import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

interface ActivationForm {
  userKey: string
}

interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

interface ActivationResponse {
  message: string
  is_refuel_package: boolean
  credits_added: number
  activation_date: string | null
  expire_date: string | null
}

const KeyActivation: React.FC = () => {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserStore()

  const [formData, setFormData] = useState<ActivationForm>({
    userKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null)
  const [activatedKeyInfo, setActivatedKeyInfo] = useState({
    userKey: '',
    activationDate: '',
    expireDate: '',
    credits: 0,
    isRefuelPackage: false,
    creditsAdded: 0
  })

  // 检查用户认证状态
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  // Toast 通知自动隐藏
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.userKey.trim()) {
      setToastMessage({ type: 'error', message: '请输入用户Key' })
      return false
    }

    if (formData.userKey.length < 10) {
      setToastMessage({ type: 'error', message: '用户Key长度不能少于10位' })
      return false
    }

    return true
  }

  const handleActivation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const res: ActivationResponse = await request.post('/keys/activate-user-key', {
        user_key: formData.userKey
      })

      // 设置激活信息
      const activationDate = res.activation_date
        ? new Date(res.activation_date).toLocaleString('zh-CN')
        : new Date().toLocaleString('zh-CN')

      const expireDate = res.expire_date
        ? new Date(res.expire_date).toLocaleString('zh-CN')
        : ''

      setActivatedKeyInfo({
        userKey: formData.userKey,
        activationDate,
        expireDate,
        credits: 0,
        isRefuelPackage: res.is_refuel_package,
        creditsAdded: res.credits_added
      })

      setShowSuccessDialog(true)

      // 根据是否为加油包显示不同的成功消息
      if (res.is_refuel_package) {
        setToastMessage({
          type: 'success',
          message: `加油包积分累加成功！已为您当前的有效密钥增加 ${res.credits_added} 积分`
        })
      } else {
        setToastMessage({
          type: 'success',
          message: res.message || '用户Key激活成功！'
        })
      }

      setFormData({ userKey: '' })

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

      setToastMessage({ type: 'error', message: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToastMessage({ type: 'success', message: '已复制到剪贴板' })
    } catch (error) {
      setToastMessage({ type: 'error', message: '复制失败' })
    }
  }

  const goToDashboard = () => {
    setShowSuccessDialog(false)
    navigate('/app/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 py-12 px-4">
      {/* Toast 通知 */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              用户Key激活
            </CardTitle>
            <p className="text-gray-600 mt-2">激活您的用户Key以使用服务</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userKey" className="text-gray-700">
                  用户Key
                </Label>
                <Input
                  id="userKey"
                  name="userKey"
                  type="text"
                  placeholder="请输入要激活的用户Key"
                  value={formData.userKey}
                  onChange={handleInputChange}
                  className="h-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
                />
                <div className="text-sm text-gray-500 mt-1">
                  输入您获得的用户Key，格式如：sk-xxxxxxxx...
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">激活规则说明：</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>标准订阅</strong>：每个用户只能有一个激活且在有效期内的密钥</li>
                  <li>• <strong>加油包</strong>：只能给唯一有效密钥累加积分，不能单独激活</li>
                  <li>• 如果您已有激活的密钥，将无法激活新的标准订阅</li>
                  <li>• 加油包密钥不会显示在普通用户的API密钥管理页面</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/90 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? '激活中...' : '激活用户Key'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => navigate('/app/dashboard')}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                返回控制台
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 激活成功对话框 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {activatedKeyInfo.isRefuelPackage ? '积分累加成功' : '激活成功'}
            </DialogTitle>
          </DialogHeader>

          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold mb-4">
              {activatedKeyInfo.isRefuelPackage ? '加油包积分累加成功！' : '用户Key激活成功！'}
            </h4>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              {activatedKeyInfo.isRefuelPackage ? (
                <>
                  <p><strong>积分增加:</strong> {activatedKeyInfo.creditsAdded} 积分</p>
                  <p className="mt-2"><strong>处理时间:</strong> {activatedKeyInfo.activationDate}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    加油包积分已成功累加到您当前的有效密钥中，不会创建新的API密钥。
                  </p>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                {activatedKeyInfo.isRefuelPackage ? '积分累加成功' : '激活成功'}
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {activatedKeyInfo.isRefuelPackage
                  ? '加油包积分已成功累加到您当前的有效密钥中。'
                  : '您的用户Key已成功激活，现在可以使用服务了'}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              onClick={goToDashboard}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary/90"
            >
              前往管理
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default KeyActivation