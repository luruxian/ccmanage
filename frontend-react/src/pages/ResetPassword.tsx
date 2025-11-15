import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import request from '@/utils/request'

interface ResetPasswordForm {
  password: string
  confirmPassword: string
}

const ResetPassword: React.FC = () => {
  const location = useLocation()

  const [formData, setFormData] = useState<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')

  // 从URL参数获取token
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tokenFromUrl = searchParams.get('token')

    if (tokenFromUrl) {
      setToken(tokenFromUrl)
    } else {
      setError('无效的重置链接')
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

  const validateForm = (): boolean => {
    if (!formData.password || !formData.confirmPassword) {
      setError('请填写所有字段')
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

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!token) {
      setError('无效的重置链接')
      return
    }

    setLoading(true)
    setError('')

    try {
      await request.post('/auth/reset-password', {
        token: token,
        new_password: formData.password
      })

      // 重置成功
      setSuccess(true)

    } catch (error: any) {
      console.error('密码重置失败:', error)

      // 错误处理
      if (error.response?.status === 400) {
        setError('重置链接已过期或无效')
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('密码重置失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">密码重置成功</h2>
              <p className="text-gray-600 mb-6">
                您的密码已成功重置，现在可以使用新密码登录。
              </p>
              <Link to="/login">
                <Button className="w-full">
                  立即登录
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧品牌展示区 (桌面端70%) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-slate-900 text-white p-12">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-blue-500">
              <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold">agnets.app</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">设置新密码</h2>
            <p className="text-slate-300 text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">设置新密码</CardTitle>
              <CardDescription className="text-base">
                请输入您的新密码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">新密码</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="请输入新密码"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                {/* 错误提示 */}
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
                  disabled={loading || !token}
                >
                  {loading ? '重置中...' : '重置密码'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  返回登录
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword