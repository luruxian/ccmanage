import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import request from '@/utils/request'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  agreement: boolean
}

const Register: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // 清除错误信息
    if (error) {
      setError('')
    }
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填字段')
      return false
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6位')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }

    if (!formData.agreement) {
      setError('请同意服务条款和隐私政策')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      await request.post('/auth/register', {
        email: formData.email,
        password: formData.password
      })

      // 注册成功，跳转到邮箱验证页面
      navigate('/email-verification', {
        state: { email: formData.email }
      })

    } catch (error: any) {
      console.error('注册失败:', error)

      // 服务器端注册错误处理
      if (error.response?.status === 409) {
        setError('该邮箱已被注册')
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('注册失败，请稍后重试')
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
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">开始使用agnets.app</h2>
            <p className="text-slate-300 text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧注册表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">创建账户</CardTitle>
              <CardDescription className="text-base">
                注册您的agnets.app账户
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认密码</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="确认密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="agreement"
                    name="agreement"
                    checked={formData.agreement}
                    onCheckedChange={(checked: boolean) =>
                      setFormData(prev => ({ ...prev, agreement: checked }))
                    }
                  />
                  <Label htmlFor="agreement" className="text-sm">
                    我已阅读并同意
                    <a href="#" className="text-blue-600 hover:text-blue-700 ml-1">服务条款</a>
                    和
                    <a href="#" className="text-blue-600 hover:text-blue-700 ml-1">隐私政策</a>
                  </Label>
                </div>

                {/* 注册错误提示 */}
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
                  {loading ? '注册中...' : '注册账户'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  已有账户？
                  <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
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