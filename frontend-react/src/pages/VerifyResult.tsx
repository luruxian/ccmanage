import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const VerifyResult: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [failureReason, setFailureReason] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    // 从URL参数获取验证结果
    const searchParams = new URLSearchParams(location.search)
    const statusParam = searchParams.get('status')
    const reasonParam = searchParams.get('reason')
    const emailParam = searchParams.get('email')

    if (statusParam === 'success') {
      setStatus('success')
      setMessage('邮箱验证成功')
      setUserEmail(emailParam || '')
    } else {
      setStatus('error')
      setFailureReason(reasonParam || '')

      // 根据失败原因设置消息
      switch (reasonParam) {
        case 'token_invalid':
          setMessage('验证链接无效或已过期')
          break
        case 'user_not_found':
          setMessage('用户不存在')
          break
        case 'server_error':
          setMessage('服务器错误，请稍后重试')
          break
        default:
          setMessage('验证失败，请重试')
      }
    }
  }, [location.search])

  const handleNavigateToLogin = () => {
    // 如果验证成功，传递邮箱参数以便预填充
    if (status === 'success' && userEmail) {
      navigate({
        pathname: '/login',
        search: `?email=${encodeURIComponent(userEmail)}&verified=true`
      })
    } else {
      navigate('/login')
    }
  }

  const handleNavigateToRegister = () => {
    navigate('/register')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">正在验证</h2>
              <p className="text-muted-foreground">
                正在验证您的邮箱，请稍候...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            {/* 成功状态 */}
            {status === 'success' ? (
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">验证成功!</h2>
                <p className="text-gray-600 mb-4">
                  🎉 欢迎加入 agnets.app | agnet club
                  <br />
                  您的邮箱已成功验证，账户已激活
                </p>

                {/* 成功时的用户信息 */}
                {userEmail && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                    <p className="mb-2">
                      <strong>Hi {userEmail} 👋</strong>
                    </p>
                    <p className="mb-0">
                      您现在可以享受以下功能：
                    </p>
                    <ul className="mt-2 mb-0 space-y-1">
                      <li>🚀 利用Claude Code更高效地完成编程工作</li>
                      <li>🔗 实现开发工作流的无缝整合</li>
                      <li>📊 实时监控使用情况</li>
                      <li>🎯 享受专业级的技术支持</li>
                    </ul>
                  </div>
                )}

                <Button onClick={handleNavigateToLogin} className="w-full bg-green-600 hover:bg-green-700">
                  🚀 前往登录
                </Button>

                {/* 底部提示 */}
                <div className="text-center mt-3">
                  <p className="text-gray-500 text-sm">
                    请使用注册时的邮箱和密码登录
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center mb-4">
                {/* 失败状态 */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">验证失败</h2>
                <p className="text-gray-600 mb-4">
                  {message}
                </p>

                {/* 失败时的帮助信息 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                  <p className="mb-2">
                    <strong>💡 解决方案：</strong>
                  </p>
                  <ul className="mt-2 mb-0 space-y-1">
                    {failureReason === 'token_invalid' ? (
                      <li>
                        • 验证链接可能已过期（15分钟有效期）
                        <br />• 请尝试重新请求验证邮件
                      </li>
                    ) : failureReason === 'user_not_found' ? (
                      <li>
                        • 用户账户可能已被删除
                        <br />• 请重新注册账户
                      </li>
                    ) : (
                      <li>
                        • 服务器暂时无法处理请求
                        <br />• 请稍后重试或联系技术支持
                      </li>
                    )}
                  </ul>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <Button onClick={handleNavigateToLogin} className="w-full">
                    前往登录
                  </Button>
                  <Button onClick={handleNavigateToRegister} variant="outline" className="w-full">
                    重新注册
                  </Button>
                </div>

                {/* 底部提示 */}
                <div className="text-center mt-3">
                  <p className="text-gray-500 text-sm">
                    需要帮助？请联系 support@agnets.app
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyResult