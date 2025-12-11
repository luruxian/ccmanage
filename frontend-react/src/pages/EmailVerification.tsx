import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const EmailVerification: React.FC = () => {
  const location = useLocation()
  const email = (location.state as any)?.email || ''

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">验证您的邮箱</h2>
            <p className="text-muted-foreground mb-4">
              我们已向 <span className="font-medium">{email || '您的邮箱'}</span> 发送了验证链接
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              请检查您的邮箱并点击验证链接以激活您的账户。
              如果您没有收到邮件，请检查垃圾邮件文件夹。
            </p>

            <div className="space-y-3">
              <Link to="/" state={{ showLoginModal: true }}>
                <Button className="w-full">
                  返回登录
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                验证成功后，您可以使用邮箱和密码登录
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default EmailVerification