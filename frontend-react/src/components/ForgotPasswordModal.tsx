import React from 'react'
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
import request from '@/utils/request'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

interface ForgotPasswordForm {
  email: string
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  // 使用react-hook-form管理表单状态
  const form = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  })

  const [loading, setLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState('')
  const [success, setSuccess] = React.useState(false)

  // 表单提交处理
  const onSubmit = async (data: ForgotPasswordForm) => {
    console.log('开始密码重置流程...')

    setLoading(true)
    setServerError('')

    try {
      await request.post('/auth/password-reset', {
        email: data.email
      })

      // 请求成功
      setSuccess(true)

    } catch (error: any) {
      console.error('密码重置请求失败:', error)

      // 错误处理
      if (error.response?.status === 404) {
        setServerError('该邮箱未注册')
      } else if (error.response?.data?.detail) {
        setServerError(error.response.data.detail)
      } else {
        setServerError('请求失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    onClose()
    if (onSwitchToLogin) {
      onSwitchToLogin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {success ? '重置链接已发送' : '忘记密码'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {success
              ? '我们已向您的邮箱发送了密码重置链接'
              : '输入您的邮箱地址以重置密码'}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="pt-6">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">重置链接已发送</h3>
                <p className="text-muted-foreground mb-6">
                  我们已向 <span className="font-medium">{form.getValues('email')}</span> 发送了密码重置链接，请检查您的邮箱。
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    返回登录
                  </Button>
                </div>
              </div>
            ) : (
              <>
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
                              placeholder="请输入您的邮箱地址"
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
                      {loading ? '发送中...' : '发送重置链接'}
                    </Button>
                  </form>
                </Form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    返回登录
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}

export default ForgotPasswordModal