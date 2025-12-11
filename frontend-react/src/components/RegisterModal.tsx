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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import request from '@/utils/request'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  agreement: boolean
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const navigate = useNavigate()

  // 使用react-hook-form管理表单状态
  const form = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreement: false,
    },
  })

  const [loading, setLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState('')

  // 获取密码字段的值用于确认密码验证
  const password = form.watch('password')

  // 表单提交处理
  const onSubmit = async (data: RegisterForm) => {
    console.log('开始注册流程...')

    setLoading(true)
    setServerError('')

    try {
      await request.post('/auth/register', {
        email: data.email,
        password: data.password
      })

      // 注册成功，跳转到邮箱验证页面
      console.log('注册成功，跳转到邮箱验证页面')
      onClose()
      navigate('/email-verification', {
        state: { email: data.email }
      })

    } catch (error: any) {
      console.error('注册失败:', error)

      // 服务器端注册错误处理
      if (error.response?.status === 409) {
        setServerError('该邮箱已被注册')
      } else if (error.response?.data?.detail) {
        setServerError(error.response.data.detail)
      } else {
        setServerError('注册失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">创建新账户</DialogTitle>
          <DialogDescription className="text-base">
            注册您的agnets.app账户
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

                {/* 确认密码字段 */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  rules={{
                    required: '请确认密码',
                    validate: (value) => value === password || '两次输入的密码不一致'
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>确认密码</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="确认密码"
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 同意条款字段 */}
                <FormField
                  control={form.control}
                  name="agreement"
                  rules={{
                    required: '请阅读并同意服务条款和隐私政策'
                  }}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          我已阅读并同意
                          <a href="/terms" className="text-primary hover:text-primary/80 ml-1">
                            服务条款
                          </a>
                          和
                          <a href="/privacy" className="text-primary hover:text-primary/80 ml-1">
                            隐私政策
                          </a>
                        </FormLabel>
                        <FormMessage />
                      </div>
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
                  {loading ? '注册中...' : '注册'}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                已有账户？
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    if (onSwitchToLogin) {
                      onSwitchToLogin()
                    } else {
                      navigate('/login')
                    }
                  }}
                  className="text-primary hover:text-primary/80 font-medium ml-1"
                >
                  立即登录
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterModal