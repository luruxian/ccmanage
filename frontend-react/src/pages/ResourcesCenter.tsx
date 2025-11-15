import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

const ResourcesCenter: React.FC = () => {
  const navigate = useNavigate()

  const handleGoToBestPractices = () => {
    navigate('/app/best-practices')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">资料中心</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📖 Claude Code最佳实践
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                本文档翻译自 Anthropic 官方博客文章。
                <Button
                  variant="link"
                  onClick={handleGoToBestPractices}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  Claude Code最佳实践（中文翻译）
                </Button>
              </p>
              <p className="text-gray-700">
                官方原文：
                <a
                  href="https://www.anthropic.com/engineering/claude-code-best-practices"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Claude Code Best Practices（English）
                </a>
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <h5 className="text-lg font-semibold mb-2">📢 最新公告</h5>
                <p className="text-gray-600">
                  欢迎使用Claude Code！我们正在不断完善产品功能，如有任何问题或建议，请随时联系我们。
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResourcesCenter