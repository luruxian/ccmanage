import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister?: () => void
  onSwitchToForgotPassword?: () => void
  prefillEmail?: string
  verified?: boolean
}

interface LoginForm {
  email: string
  password: string
}

interface LoginResponse {
  user: {
    user_id: string
    email: string
    phone?: string
    is_active: boolean
    is_email_verified: boolean
    last_login_at?: string
    created_at: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword, prefillEmail, verified }) => {
  const navigate = useNavigate()
  const { login } = useUserStore()

  // 使用react-hook-form管理表单状态
  const form = useForm<LoginForm>({
    defaultValues: {
      email: prefillEmail || '',
      password: '',
    },
  })

  const [loading, setLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState('')

  // 当prefillEmail变化时更新表单
  React.useEffect(() => {
    if (prefillEmail) {
      form.setValue('email', prefillEmail)
    }
  }, [prefillEmail, form])

  // 表单提交处理
  const onSubmit = async (data: LoginForm) => {
    console.log('开始登录流程...')

    setLoading(true)
    setServerError('')

    try {
      const response: LoginResponse = await request.post('/auth/login', {
        email: data.email,
        password: data.password
      })

      // 保存用户信息和token
      console.log('登录成功，保存用户信息到状态管理')
      login({
        id: response.user.user_id,
        name: response.user.email,
        email: response.user.email,
        token: response.tokens.access_token,
        refreshToken: response.tokens.refresh_token
      })

      // 关闭模态并跳转到仪表板
      console.log('用户登录成功，关闭模态并跳转到仪表板')
      onClose()
      navigate('/app/dashboard', { replace: true })

    } catch (error: any) {
      console.error('登录失败:', error)

      // 服务器端登录错误处理
      if (error.response?.status === 401) {
        setServerError('邮箱或密码错误，请重新输入')
      } else if (error.response?.data?.detail) {
        setServerError(error.response.data.detail)
      } else {
        setServerError('登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {verified ? '🎉 邮箱验证成功' : '欢迎回来'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {verified ? '您的邮箱已验证成功，现在可以登录了' : '登录到您的agnets.app账户'}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* 邮箱字段 */}
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: '请输入邮箱地址',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: '请输入有效的邮箱地址'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>邮箱地址</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="邮箱地址"
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 密码字段 */}
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: '请输入密码',
                    minLength: {
                      value: 6,
                      message: '密码长度不能少于6位'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>密码</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="密码"
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 服务器错误提示 */}
                {serverError && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {serverError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                还没有账户？
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    if (onSwitchToRegister) {
                      onSwitchToRegister()
                    } else {
                      navigate('/register')
                    }
                  }}
                  className="text-primary hover:text-primary/80 font-medium ml-1"
                >
                  立即注册
                </button>
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  if (onSwitchToForgotPassword) {
                    onSwitchToForgotPassword()
                  } else {
                    navigate('/forgot-password')
                  }
                }}
                className="text-sm text-muted-foreground hover:text-foreground block"
              >
                忘记密码？
              </button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default LoginModal