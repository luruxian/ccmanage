import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

interface IntroductionContentProps {
  onRegisterClick?: () => void
}

const IntroductionContent: React.FC<IntroductionContentProps> = ({ onRegisterClick }) => {
  const navigate = useNavigate()

  // 核心优势
  const coreAdvantages = [
    {
      title: '智能编码助手',
      description: '上下文感知的智能代码生成与补全，支持各种编程语言，让编码如行云流水',
      features: ['🚀 智能代码补全与生成', '🔍 实时错误检测与修复', '🌐 多语言智能支持', '📝 代码解释与文档生成'],
      icon: '🤖',
      color: 'from-blue-500/10 to-blue-600/10',
    },
    {
      title: '开发效率倍增器',
      description: '自动化重复工作，减少70%编码时间，让您专注于核心逻辑与创新',
      features: ['⚡ 减少重复编码工作', '🛠️ 一键代码重构优化', '🔄 自动化测试生成', '📊 智能调试辅助'],
      icon: '⚡',
      color: 'from-green-500/10 to-green-600/10',
    },
    {
      title: '代码质量守护者',
      description: '确保代码质量与安全，内置最佳实践检查、安全漏洞扫描',
      features: ['🛡️ 实时安全漏洞检测', '📏 代码规范自动检查', '🏆 行业最佳实践指导', '🔒 隐私合规性检查'],
      icon: '🛡️',
      color: 'from-purple-500/10 to-purple-600/10',
    },
    {
      title: '团队协作加速器',
      description: '提升团队协作效率，促进知识共享，让新成员快速上手',
      features: ['👥 智能代码审查辅助', '🎓 新人快速上手指导', '📚 团队知识库构建', '🤝 协作工作流优化'],
      icon: '👥',
      color: 'from-orange-500/10 to-orange-600/10',
    },
  ]

  // 功能特性
  const features = [
    {
      title: '智能代码补全',
      description: '基于上下文的精准代码建议，理解您的编程意图',
      badge: '高效',
      icon: '💡',
    },
    {
      title: '错误检测修复',
      description: '实时识别代码问题并提供智能修复方案',
      badge: '可靠',
      icon: '🔧',
    },
    {
      title: '代码重构助手',
      description: '一键优化代码结构、性能和可维护性',
      badge: '优化',
      icon: '♻️',
    },
    {
      title: '文档自动生成',
      description: '从代码自动生成清晰、完整的技术文档',
      badge: '智能',
      icon: '📚',
    },
    {
      title: '多语言支持',
      description: '覆盖JavaScript、Python、Java等主流编程语言',
      badge: '全面',
      icon: '🌍',
    },
    {
      title: '安全扫描',
      description: '识别潜在安全风险，确保代码安全性',
      badge: '安全',
      icon: '🔒',
    },
    {
      title: '测试生成',
      description: '自动创建测试用例，提升代码覆盖率',
      badge: '质量',
      icon: '🧪',
    },
    {
      title: 'IDE集成',
      description: '无缝对接VS Code、IntelliJ等主流开发环境',
      badge: '便捷',
      icon: '🔌',
    },
  ]

  // 使用场景
  const useCases = [
    {
      title: '个人开发者',
      description: '快速原型开发，学习新技术，提升个人编码能力',
      icon: '👨‍💻',
    },
    {
      title: '创业团队',
      description: '保持代码质量，加速产品迭代，应对快速变化的需求',
      icon: '🚀',
    },
    {
      title: '大型企业',
      description: '规范代码标准，提升团队协作效率，降低维护成本',
      icon: '🏢',
    },
  ]

  const handleGetStarted = () => {
    if (onRegisterClick) {
      onRegisterClick()
    } else {
      navigate('/register')
    }
  }

  const handleViewDemo = () => {
    window.open('https://claude.ai/code', '_blank')
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center justify-center px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary font-semibold">
          🚀 新一代AI编程助手
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          让AI成为您的
          <span className="text-primary ml-2">编码伙伴</span>
          <br />
          <span className="text-3xl md:text-4xl lg:text-5xl">开发效率提升</span>
          <span className="text-primary ml-2 text-5xl md:text-6xl lg:text-7xl">10倍</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
          Claude Code - 智能代码助手，帮助您编写更优质、更安全的代码，
          专注于创造而非重复，让编程变得更高效、更愉悦。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-10 py-7 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            🚀 立即体验
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleViewDemo}
            className="px-10 py-7 text-lg font-semibold"
          >
            📺 观看演示视频
          </Button>
        </div>
      </div>

      {/* Core Advantages */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Claude Code的<span className="text-primary">核心优势</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {coreAdvantages.map((advantage, index) => (
            <Card key={index} className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`text-4xl p-3 rounded-lg bg-gradient-to-br ${advantage.color}`}>
                    {advantage.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{advantage.title}</CardTitle>
                    <CardDescription className="text-base">
                      {advantage.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {advantage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span>{feature.split(' ')[0]}</span>
                      <span className="text-muted-foreground">{feature.substring(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          强大的<span className="text-primary">功能特性</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          适合<span className="text-primary">所有开发者</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="text-center border-0 shadow-lg">
              <CardContent className="pt-10 pb-8">
                <div className="text-5xl mb-6">{useCase.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{useCase.title}</h3>
                <p className="text-muted-foreground text-lg">
                  {useCase.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <Card className="mb-20 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">10×</div>
              <div className="text-lg font-semibold">开发效率提升</div>
              <div className="text-muted-foreground text-sm">平均提升倍数</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <div className="text-lg font-semibold">开发者信任</div>
              <div className="text-muted-foreground text-sm">全球活跃用户</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">98%</div>
              <div className="text-lg font-semibold">用户满意度</div>
              <div className="text-muted-foreground text-sm">推荐使用率</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15h</div>
              <div className="text-lg font-semibold">每周节省时间</div>
              <div className="text-muted-foreground text-sm">平均每位开发者</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          准备好提升您的<span className="text-primary">开发体验</span>了吗？
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
          加入全球开发者的行列，体验AI编程带来的革命性变化。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="px-12 py-8 text-xl font-bold shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-primary to-primary/90"
          >
            🚀 立即免费注册
          </Button>
          
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          claude code十分强大，值得拥有
        </p>
      </div>
    </div>
  )
}

export default IntroductionContent