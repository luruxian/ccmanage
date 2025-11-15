import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ClaudeCodeBestPractices: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Claude Code最佳实践指南
            </CardTitle>
            <p className="text-gray-600 text-lg mt-4">
              Claude Code是一个用于代理式编程的命令行工具。本文介绍了在各种代码库、语言和环境中使用Claude Code的有效技巧和窍门。
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 自定义您的设置</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">a. 创建CLAUDE.md文件</h3>
                <p className="text-gray-700 leading-relaxed">
                  CLAUDE.md是一个特殊文件，Claude在开始对话时会自动将其拉入上下文。这使其成为记录以下内容的理想位置：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>常用bash命令</li>
                  <li>核心文件和实用函数</li>
                  <li>代码风格指南</li>
                  <li>测试说明</li>
                  <li>仓库规范</li>
                  <li>开发环境设置</li>
                  <li>项目特有的任何意外行为或警告</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 为Claude提供更多工具</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">a. 将Claude与bash工具一起使用</h3>
                <p className="text-gray-700 leading-relaxed">
                  Claude Code继承您的bash环境，使其能够访问您的所有工具。虽然Claude知道常见实用程序，但它不会知道您的自定义bash工具，除非有说明。
                </p>

                <h3 className="text-xl font-semibold text-gray-800">b. 将Claude与MCP一起使用</h3>
                <p className="text-gray-700 leading-relaxed">
                  Claude Code既作为MCP服务器也作为客户端。作为客户端，它可以连接到任意数量的MCP服务器以访问其工具。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 尝试常见工作流程</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">a. 探索、规划、编码、提交</h3>
                <p className="text-gray-700 leading-relaxed">
                  这种多功能工作流程适合许多问题：首先要求Claude进行研究和规划，然后实施解决方案，最后提交结果。
                </p>

                <h3 className="text-xl font-semibold text-gray-800">b. 编写测试、提交；编码、迭代、提交</h3>
                <p className="text-gray-700 leading-relaxed">
                  这是Anthropic最喜欢的工作流程，用于可以通过测试轻松验证的更改。测试驱动开发（TDD）与代理式编程变得更加强大。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 优化您的工作流程</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">a. 在指令中要具体</h3>
                <p className="text-gray-700 leading-relaxed">
                  Claude Code的成功率随着更具体的指令显著提高，特别是在首次尝试时。提前给出明确方向减少了后期过程修正的需要。
                </p>

                <h3 className="text-xl font-semibold text-gray-800">b. 给Claude图像</h3>
                <p className="text-gray-700 leading-relaxed">
                  Claude在图像和图表方面表现出色。这在使用设计模拟作为UI开发的参考点，以及使用视觉图表进行分析和调试时特别有用。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 使用无头模式自动化您的基础设施</h2>
              <p className="text-gray-700 leading-relaxed">
                Claude Code包含无头模式，用于CI、预提交钩子、构建脚本和自动化等非交互式上下文。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 通过多Claude工作流程提升</h2>
              <p className="text-gray-700 leading-relaxed">
                除了独立使用外，一些最强大的应用涉及并行运行多个Claude实例。例如，让一个Claude编写代码，而另一个Claude审查或测试它。
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">重要提示</h3>
              <p className="text-blue-700">
                这些建议并非一成不变或普遍适用；请将这些建议视为起点。我们鼓励您进行实验，找到最适合您的方法！
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ClaudeCodeBestPractices