import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const VerifyError: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">验证失败</h2>
            <p className="text-muted-foreground mb-6">
              邮箱验证链接无效或已过期，请重新请求验证邮件。
            </p>
            <div className="space-y-3">
              <Link to="/login">
                <Button className="w-full">
                  返回登录
                </Button>
              </Link>
              <div className="text-sm text-muted-foreground">
                如需重新发送验证邮件，请联系客服
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VerifyError