import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  agreement: boolean
}

interface RegisterResponse {
  message: string
}

const Register: React.FC = () => {
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

  // 表单提交处理
  const onSubmit = async (data: RegisterForm) => {
    console.log('开始注册流程...')

    setLoading(true)
    setServerError('')

    try {
      const response: RegisterResponse = await request.post('/auth/register', {
        email: data.email,
        password: data.password
      })

      // 注册成功，跳转到邮箱验证页面
      console.log('注册成功，跳转到邮箱验证页面')
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
    <div className="min-h-screen bg-muted flex">
      {/* 左侧品牌展示区 (桌面端70%) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-card text-card-foreground p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary">
              <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">开始使用agnets.app</h2>
            <p className="text-muted-foreground text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧注册表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
              <CardDescription className="text-base">
                注册您的agnets.app账户
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

                  {/* 确认密码字段 */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    rules={{
                      required: '请确认密码',
                      validate: (value) => {
                        const password = form.getValues('password')
                        return value === password || '两次输入的密码不一致'
                      }
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

                  {/* 协议同意字段 */}
                  <FormField
                    control={form.control}
                    name="agreement"
                    rules={{
                      required: '请同意服务条款和隐私政策'
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
                            <a href="#" className="text-primary hover:text-primary/80 ml-1">服务条款</a>
                            和
                            <a href="#" className="text-primary hover:text-primary/80 ml-1">隐私政策</a>
                          </FormLabel>
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
                    {loading ? '注册中...' : '注册账户'}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  已有账户？
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium ml-1">
                    立即登录
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Register