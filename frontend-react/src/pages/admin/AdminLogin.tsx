import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

interface AdminLoginForm {
  username: string
  password: string
}

interface AdminLoginResponse {
  admin: {
    id: number
    username: string
    display_name?: string
    role: string
    is_active: boolean
    last_login_at?: string
    created_at: string
    updated_at: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useUserStore()

  const [formData, setFormData] = useState<AdminLoginForm>({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 回车键登录处理
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !loading) {
      handleSubmit()
    }
  }

  // 添加和移除键盘事件监听器
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [loading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // 清除错误信息
    if (error) {
      setError('')
    }
  }

  const validateForm = (): boolean => {
    // 用户名验证
    if (!formData.username.trim()) {
      setError('请输入管理员用户名')
      return false
    }

    if (formData.username.length < 3 || formData.username.length > 50) {
      setError('用户名长度为3-50位')
      return false
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      setError('用户名只能包含字母、数字、下划线和连字符')
      return false
    }

    // 密码验证
    if (!formData.password) {
      setError('请输入管理员密码')
      return false
    }

    if (formData.password.length < 6) {
      setError('密码长度不能少于6位')
      return false
    }

    return true
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    console.log('开始管理员登录流程...')

    // 表单验证
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response: AdminLoginResponse = await request.post('/admin/login', {
        username: formData.username,
        password: formData.password
      })

      // 保存管理员信息
      console.log('管理员登录成功，保存管理员信息到状态管理')
      login({
        id: response.admin.id.toString(),
        name: response.admin.display_name || response.admin.username,
        email: response.admin.username, // 使用用户名作为email字段
        token: response.tokens.access_token,
        refreshToken: response.tokens.refresh_token
      })
      // 更新用户角色
      updateUser({ role: response.admin.role })

      // 跳转到管理员控制台
      console.log('管理员登录成功，立即跳转到管理员控制台')
      navigate('/admin/dashboard', { replace: true })

    } catch (error: any) {
      console.error('管理员登录失败:', error)

      // 服务器端登录错误处理
      if (error.response?.status === 401) {
        setError('用户名或密码错误')
      } else if (error.response?.status === 403) {
        setError('账户已被禁用')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              管理员登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">
                  管理员用户名
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="管理员用户名"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  管理员密码
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="管理员密码"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                {loading ? '登录中...' : '登录管理中心'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                仅限授权管理员访问
              </div>
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                返回用户登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminLogin