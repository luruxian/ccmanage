import React, { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
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
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
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
const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useUserStore()
  // 使用react-hook-form管理表单状态
  const form = useForm<LoginForm>({
    defaultValues: {
      email: '',
      password: '',
    },
  })
  const [loading, setLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState('')
  // 从URL参数获取邮箱（验证成功后传递）
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const email = searchParams.get('email')
    const verified = searchParams.get('verified')
    if (email) {
      form.setValue('email', email)
      if (verified === 'true') {
        // 可以在这里添加成功消息显示
      }
    }
  }, [location.search, form])
  // 表单提交处理
  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setServerError('')
    try {
      const response: LoginResponse = await request.post('/auth/login', {
        email: data.email,
        password: data.password
      })
      // 保存用户信息和token
      login({
        id: response.user.user_id,
        name: response.user.email,
        email: response.user.email,
        token: response.tokens.access_token,
        refreshToken: response.tokens.refresh_token
      })
      // 立即跳转到仪表板
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
    <div className="min-h-screen bg-muted flex">
      {/* 左侧品牌展示区 (桌面端70%) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-card text-card-foreground p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">欢迎回来</h2>
            <p className="text-muted-foreground text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>
      {/* 右侧登录表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
              <CardDescription className="text-base">
                登录到您的agnets.app账户
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <Link to="/register" className="text-primary hover:text-primary/80 font-medium ml-1">
                    立即注册
                  </Link>
                </p>
                <Link
                  to="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground block"
                >
                  忘记密码？
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default Login