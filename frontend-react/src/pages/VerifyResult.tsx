import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import request from '@/utils/request'

const VerifyResult: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(location.search)
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('无效的验证链接')
        return
      }

      try {
        await request.post('/auth/verify-email', {
          token: token
        })

        setStatus('success')
        setMessage('邮箱验证成功')
      } catch (error: any) {
        console.error('邮箱验证失败:', error)
        setStatus('error')

        if (error.response?.status === 400) {
          setMessage('验证链接已过期或无效')
        } else {
          setMessage('验证失败，请稍后重试')
        }
      }
    }

    verifyEmail()
  }, [location.search])

  const handleNavigateToLogin = () => {
    const searchParams = new URLSearchParams(location.search)
    const email = searchParams.get('email')

    if (email && status === 'success') {
      navigate(`/login?email=${encodeURIComponent(email)}&verified=true`)
    } else {
      navigate('/login')
    }
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            {status === 'success' ? (
              <>
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">验证成功</h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <Button onClick={handleNavigateToLogin} className="w-full">
                  立即登录
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">验证失败</h2>
                <p className="text-muted-foreground mb-6">
                  {message}
                </p>
                <Button onClick={handleNavigateToLogin} className="w-full">
                  返回登录
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyResult