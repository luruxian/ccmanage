import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, LogIn, Mail, Lock, Key, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 清除之前的错误信息
    setLoginError('')

    // 表单验证
    if (!formData.email || !formData.password) {
      setLoginError('请填写邮箱和密码')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLoginError('请输入正确的邮箱格式')
      return
    }

    if (formData.password.length < 6) {
      setLoginError('密码长度不能少于6位')
      return
    }

    // 开始登录请求
    setLoading(true)

    try {
      // 模拟登录请求
      console.log('登录信息:', formData)

      // 这里应该调用实际的登录API
      // const response = await fetch('/api/v1/auth/login', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     password: formData.password
      //   })
      // })

      // if (!response.ok) {
      //   throw new Error('登录失败')
      // }

      // const data = await response.json()

      // 模拟成功登录
      setTimeout(() => {
        setLoading(false)
        // 登录成功后跳转到首页
        navigate('/')
      }, 1000)

    } catch (error: any) {
      console.error('登录失败:', error)
      setLoading(false)

      // 错误处理
      if (error.response?.status === 401) {
        setLoginError('邮箱或密码错误，请重新输入')
      } else if (error.response?.data?.detail) {
        setLoginError(error.response.data.detail)
      } else {
        setLoginError('登录失败，请稍后重试')
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    // 清除错误信息
    if (loginError) {
      setLoginError('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <div className="flex h-screen">
        {/* 左侧品牌区域 (桌面端70%) */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-card p-16">
          <div className="text-center max-w-lg">
            <div className="mb-12">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-primary">
                <Key className="w-16 h-16 text-primary" />
              </div>
              <h1 className="text-5xl font-bold text-card-foreground mb-4">agnets.app</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-card-foreground mb-4">欢迎回来</h2>
              <p className="text-xl text-muted-foreground font-light">安全、高效的AI工具</p>
            </div>
          </div>
        </div>

        {/* 右侧登录区域 (桌面端30%) */}
        <div className="flex-1 lg:flex-none lg:w-1/3 flex items-center justify-center bg-popover p-8 lg:p-16 shadow-xl">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                欢迎回来
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                登录到您的agnets.app账户
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 邮箱输入 */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    邮箱地址
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-12 text-base focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="请输入密码"
                      value={formData.password}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-10 h-12 text-base focus:border-primary focus:ring-primary"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 登录错误提示 */}
                {loginError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <span className="text-destructive text-sm">
                      {loginError}
                    </span>
                  </div>
                )}

                {/* 登录按钮 */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      登录中...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      登录
                    </>
                  )}
                </Button>
              </form>

              {/* 底部链接 */}
              <div className="mt-8 text-center space-y-4">
                <p className="text-muted-foreground text-sm">
                  还没有账户？
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80 font-semibold px-1"
                    onClick={() => navigate('/register')}
                  >
                    立即注册
                  </Button>
                </p>
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground text-sm"
                  onClick={() => navigate('/forgot-password')}
                >
                  忘记密码？
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}