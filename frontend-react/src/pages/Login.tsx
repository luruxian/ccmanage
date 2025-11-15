import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 从URL参数获取邮箱（验证成功后传递）
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const email = searchParams.get('email')
    const verified = searchParams.get('verified')

    if (email) {
      setFormData(prev => ({ ...prev, email }))
      if (verified === 'true') {
        // 可以在这里添加成功消息显示
        console.log('邮箱验证成功！请输入密码登录')
      }
    }
  }, [location.search])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 清除错误信息
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('开始登录流程...')

    // 基本表单验证
    if (!formData.email || !formData.password) {
      setError('请填写邮箱和密码')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6位')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response: LoginResponse = await request.post('/auth/login', {
        email: formData.email,
        password: formData.password
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

      // 立即跳转到仪表板
      console.log('用户登录成功，立即跳转到仪表板')
      navigate('/app/dashboard', { replace: true })

    } catch (error: any) {
      console.error('登录失败:', error)

      // 服务器端登录错误处理
      if (error.response?.status === 401) {
        setError('邮箱或密码错误，请重新输入')
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧品牌展示区 (桌面端70%) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-slate-900 text-white p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-500">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">欢迎回来</h2>
            <p className="text-slate-300 text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧登录表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">欢迎回来</CardTitle>
              <CardDescription className="text-base">
                登录到您的agnets.app账户
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="邮箱地址"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                {/* 登录错误提示 */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-gray-600">
                  还没有账户？
                  <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                    立即注册
                  </Link>
                </p>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 block"
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