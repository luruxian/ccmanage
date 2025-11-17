import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

interface ForgotPasswordForm {
  email: string
}

interface ForgotPasswordResponse {
  message: string
}

const ForgotPassword: React.FC = () => {
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
      const response: ForgotPasswordResponse = await request.post('/auth/forgot-password', {
        email: data.email
      })

      // 请求成功
      setSuccess(true)

    } catch (error: any) {
      console.error('密码重置请求失败:', error)

      // 错误处理
      if (error.response?.data?.detail) {
        setServerError(error.response.data.detail)
      } else {
        setServerError('请求失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex">
      {/* 左侧品牌展示区 (桌面端70%) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-card text-card-foreground p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">重置密码</h2>
            <p className="text-muted-foreground text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">忘记密码</CardTitle>
              <CardDescription className="text-base">
                输入您的邮箱地址，我们将发送重置链接
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">重置链接已发送</h3>
                  <p className="text-muted-foreground">
                    我们已向 <span className="font-medium">{form.getValues('email')}</span> 发送了密码重置链接，请检查您的邮箱。
                  </p>
                  <div className="pt-4">
                    <Link to="/login">
                      <Button className="w-full">
                        返回登录
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
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
              )}

              {!success && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    返回登录
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword