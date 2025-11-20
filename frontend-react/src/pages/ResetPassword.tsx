import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import request from '@/utils/request'

interface ResetPasswordForm {
  email: string
  verification_code: string
  new_password: string
  confirm_password: string
}

const ResetPassword: React.FC = () => {
  const location = useLocation()

  const [formData, setFormData] = useState<ResetPasswordForm>({
    email: '',
    verification_code: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // 从URL参数获取邮箱和验证码
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const emailFromUrl = searchParams.get('email')
    const codeFromUrl = searchParams.get('code')

    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }))
    } else {
      setError('缺少邮箱参数，请重新申请密码重置')
    }

    if (codeFromUrl) {
      setFormData(prev => ({ ...prev, verification_code: codeFromUrl }))
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
    if (!formData.email || !formData.verification_code || !formData.new_password || !formData.confirm_password) {
      setError('请填写所有字段')
      return false
    }

    if (formData.verification_code.length !== 6) {
      setError('验证码必须是6位数字')
      return false
    }

    if (formData.new_password.length < 6) {
      setError('密码长度不能少于6位')
      return false
    }

    if (formData.new_password !== formData.confirm_password) {
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

    setLoading(true)
    setError('')

    try {
      await request.post('/auth/password-reset-confirm', {
        email: formData.email,
        verification_code: formData.verification_code,
        new_password: formData.new_password
      })

      // 重置成功
      setSuccess(true)

    } catch (error: any) {
      console.error('密码重置失败:', error)

      // 错误处理
      if (error.response?.status === 400) {
        const detail = error.response.data?.detail
        if (detail && detail.includes('验证码')) {
          setError('验证码无效或已过期，请重新申请')
        } else if (detail && detail.includes('密码')) {
          setError('密码格式不符合要求，请重新输入')
        } else {
          setError('请求参数有误，请检查输入信息')
        }
      } else if (error.response?.status === 404) {
        setError('用户不存在，请重新申请密码重置')
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
      <div className="min-h-screen bg-muted flex flex-col justify-center items-center p-8">
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
            <h2 className="text-2xl font-semibold mb-4">设置新密码</h2>
            <p className="text-muted-foreground text-lg">安全、高效的AI工具</p>
          </div>
        </div>
      </div>

      {/* 右侧表单区 (桌面端30%) */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none lg:shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">重置密码</CardTitle>
              <CardDescription className="text-base">
                为您的账户设置新密码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 邮箱字段 */}
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
                    readOnly
                  />
                  <p className="text-sm text-muted-foreground">邮箱地址（不可修改）</p>
                </div>

                {/* 验证码字段 */}
                <div className="space-y-2">
                  <Label htmlFor="verification_code">验证码</Label>
                  <Input
                    id="verification_code"
                    name="verification_code"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={formData.verification_code}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                    maxLength={6}
                  />
                  <p className="text-sm text-muted-foreground">请输入邮件中的6位验证码</p>
                </div>

                {/* 新密码字段 */}
                <div className="space-y-2">
                  <Label htmlFor="new_password">新密码</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    placeholder="请输入新密码"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                {/* 确认密码字段 */}
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">确认新密码</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="请再次输入新密码"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="h-12 text-base"
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading || !formData.email}
                >
                  {loading ? '重置中...' : '重置密码'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
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