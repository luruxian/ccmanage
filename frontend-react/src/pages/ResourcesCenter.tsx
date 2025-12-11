import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

const ResourcesCenter: React.FC = () => {
  const navigate = useNavigate()

  const handleGoToBestPractices = () => {
    navigate('/app/best-practices')
  }

  return (
    <div className="container mx-auto py-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">资料中心</h1>
        <p className="text-lg text-gray-600">
          查看 Claude Code 最佳实践文档
        </p>
      </div>

      {/* Claude Code 最佳实践卡片 */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BookOpen className="w-5 h-5" />
            Claude Code 最佳实践
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            本文档翻译自 Anthropic 官方博客文章，包含使用 Claude Code 的最佳实践和技巧。
          </p>
          <div className="flex gap-2">
            <Button onClick={handleGoToBestPractices}>
              查看中文翻译版
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://www.anthropic.com/engineering/claude-code-best-practices"
                target="_blank"
                rel="noopener noreferrer"
              >
                查看官方原文
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResourcesCenter