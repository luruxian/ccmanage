import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCopy } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ChevronDown, ChevronRight, Check, Info, Code, CheckCircle } from 'lucide-react'

// 复制到剪贴板的工具函数
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (err) {
    alert('复制失败')
  }
}

const GettingStarted: React.FC = () => {
  // 可折叠部分的状态
  const [nodeJsExpanded, setNodeJsExpanded] = React.useState(false)
  const [gitExpanded, setGitExpanded] = React.useState(false)

  const [commonIssuesExpanded, setCommonIssuesExpanded] = React.useState(false)

  return (
    <div className="space-y-8 p-4 md:p-6 max-w-4xl mx-auto">
      {/* 页面标题区域 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800 flex items-center justify-center gap-2">
          🚀 开始使用 Claude Code
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          按照以下步骤安装和配置 Claude Code CLI 工具，提升您的开发效率
        </p>
      </div>
      
      {/* 提示卡片 - 快速导航 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-1">
              安装流程指南
            </h3>
            <p className="text-gray-700">
              请按顺序完成以下步骤：系统要求 → Node.js安装 → Git安装 → Claude Code安装 → 验证安装 → 使用指南
            </p>
          </div>
        </div>
      </div>
      
      {/* 系统要求卡片 */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-3">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            📋 系统要求
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="system-requirements-content">
            <div className="mb-4">
              <p className="mb-2">在安装 Claude Code 前，请确保您的系统满足以下要求：</p>
              <ul className="space-y-3 system-requirements-list">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Node.js 18+</strong> - Claude Code 需要 Node.js 18 或更高版本才能运行。
                    如果您的系统上安装了较低版本，需要先进行升级。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Git</strong> - Claude Code 使用 Git 进行版本控制相关操作，
                    请确保您的系统已安装 Git 并配置了基本信息。
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>npm 或 yarn</strong> - 用于安装和管理 Claude Code 包。
                    Node.js 安装通常会自带 npm。
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>提示：</strong> 您可以使用 <code className="bg-white px-1 py-0.5 rounded">node -v</code> 和 <code className="bg-white px-1 py-0.5 rounded">git --version</code> 命令检查您当前安装的版本。
              </p>
            </div>
          </div>

          {/* Node.js 安装指南 */}
          <div className="border border-blue-100 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-colors duration-300"
              onClick={() => setNodeJsExpanded(!nodeJsExpanded)}
            >
              <div className="flex items-center gap-2 font-medium text-blue-800">
                {nodeJsExpanded ? (
                  <ChevronDown className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                )}
                <span>📦 Node.js 安装指南</span>
              </div>
            </div>
            {nodeJsExpanded && (
              <div className="p-4 border-t border-gray-200">
                <p className="mb-4">Node.js 是运行 Claude Code 的必要环境，请根据您的操作系统选择合适的安装方法：</p>
                
                <Tabs defaultValue="windows" className="node-installation-content">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="windows">Windows</TabsTrigger>
                    <TabsTrigger value="macos">macOS</TabsTrigger>
                    <TabsTrigger value="linux">Linux</TabsTrigger>
                    <TabsTrigger value="verify">验证安装</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="windows" className="node-install-method">
                    <div className="mb-3">
                      <h4 className="font-medium mb-2">方法一：使用官方安装包</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-4">
                        <li>访问 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Node.js 官网</a></li>
                        <li>下载 Windows 的 LTS 版本安装包</li>
                        <li>运行安装程序，按照提示完成安装</li>
                        <li>安装过程中，请确保勾选 "Add to PATH" 选项</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 nvm-windows</h4>
                      <p className="mb-2 text-sm">nvm-windows 是 Node.js 版本管理器，可以让您轻松切换不同的 Node.js 版本：</p>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://github.com/coreybutler/nvm-windows/releases" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nvm-windows 发布页面</a></li>
                        <li>下载并安装最新的 nvm-setup.zip</li>
                        <li>安装完成后，打开命令提示符，运行以下命令：</li>
                      </ol>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">nvm install 18</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('nvm install 18')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">nvm use 18</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('nvm use 18')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="macos" className="node-install-method">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">方法一：使用官方安装包</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Node.js 官网</a></li>
                        <li>下载 macOS 的 LTS 版本安装包</li>
                        <li>运行安装程序，按照提示完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 Homebrew</h4>
                      <p className="mb-2 text-sm">如果您已安装 Homebrew，可以使用以下命令：</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">brew install node@18</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('brew install node@18')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600">如果需要将 Node.js 添加到 PATH，请运行：</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">echo 'export PATH="/usr/local/opt/node@18/bin:$PATH"' &gt;&gt; ~/.zshrc && source ~/.zshrc</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('echo \'export PATH="/usr/local/opt/node@18/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="linux" className="node-install-method">
                    <div>
                      <h4 className="font-medium mb-2">各发行版安装方法</h4>
                      
                      <div className="linux-distributions mb-4">
                        <div className="mb-3">
                          <p className="font-medium text-sm mb-1">Ubuntu/Debian:</p>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs</code>
                            <Button 
                              size="sm" 
                              onClick={() => copyToClipboard('curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs')}
                              className="gap-1"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="font-medium text-sm mb-1">Fedora/RHEL/CentOS:</p>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo dnf install -y nodejs</code>
                            <Button 
                              size="sm" 
                              onClick={() => copyToClipboard('curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo dnf install -y nodejs')}
                              className="gap-1"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm mb-1">使用 nvm (推荐，适用于所有 Linux):</p>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash</code>
                            <Button 
                              size="sm" 
                              onClick={() => copyToClipboard('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash')}
                              className="gap-1"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">安装完成后，重启终端并运行：</p>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">nvm install 18</code>
                            <Button 
                              size="sm" 
                              onClick={() => copyToClipboard('nvm install 18')}
                              className="gap-1"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">nvm use 18</code>
                            <Button 
                              size="sm" 
                              onClick={() => copyToClipboard('nvm use 18')}
                              className="gap-1"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="verify" className="node-install-method">
                    <div>
                      <h4 className="font-medium mb-3">验证 Node.js 安装</h4>
                      <p className="mb-2">安装完成后，运行以下命令验证 Node.js 和 npm 版本：</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">node -v</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('node -v')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">npm -v</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('npm -v')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      
                      <div className="expected-output bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">预期输出示例：</p>
                        <pre className="text-xs text-gray-600 bg-white p-2 rounded">
{`v18.16.0  # Node.js 版本
9.5.1     # npm 版本`}
                        </pre>
                      </div>
                      
                      <div className="troubleshooting">
                        <h4 className="font-medium mb-2">常见问题解决</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">权限错误</p>
                            <p className="text-gray-600">如果安装过程中遇到权限错误，请尝试使用管理员/root权限运行命令，或使用 nvm 安装以避免权限问题。</p>
                          </div>
                          <div>
                            <p className="font-medium">版本不匹配</p>
                            <p className="text-gray-600">确保安装的是 Node.js 18 或更高版本。如果已经安装了较旧的版本，可以使用 nvm 或官方安装程序升级。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Git 安装指南 */}
          <div className="border border-green-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-colors duration-300"
              onClick={() => setGitExpanded(!gitExpanded)}
            >
              <div className="flex items-center gap-2 font-medium text-green-800">
                {gitExpanded ? (
                  <ChevronDown className="h-5 w-5 text-green-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-green-600" />
                )}
                <span>🔀 Git 安装指南</span>
              </div>
            </div>
            {gitExpanded && (
              <div className="p-4 border-t border-gray-200">
                <Tabs defaultValue="windows" className="git-install-methods">
                  <TabsList className="mb-4">
                    <TabsTrigger value="windows">Windows</TabsTrigger>
                    <TabsTrigger value="macos">macOS</TabsTrigger>
                    <TabsTrigger value="linux">Linux</TabsTrigger>
                    <TabsTrigger value="verify">验证安装</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="windows" className="git-install-method">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">方法一：使用官方安装程序</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Git 官方网站</a></li>
                        <li>下载 Windows 版本的安装程序</li>
                        <li>运行安装程序，按照默认选项完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 Chocolatey</h4>
                      <p className="mb-2 text-sm">如果您已安装 Chocolatey 包管理器，可以使用以下命令：</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">choco install git -y</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('choco install git -y')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="macos" className="git-install-method">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">方法一：使用 Homebrew</h4>
                      <p className="mb-2 text-sm">使用 Homebrew 安装 Git（推荐）：</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">brew install git</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('brew install git')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用官方安装包</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Git 官方网站</a></li>
                        <li>下载 macOS 版本的安装程序</li>
                        <li>运行安装程序，按照默认选项完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法三：使用 Xcode Command Line Tools</h4>
                      <p className="mb-2 text-sm">如果已安装 Xcode 或 Xcode Command Line Tools，Git 可能已预安装。如果没有，可以通过以下命令安装：</p>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">xcode-select --install</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('xcode-select --install')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="linux" className="git-install-method">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Debian/Ubuntu</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">sudo apt update && sudo apt install git -y</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('sudo apt update && sudo apt install git -y')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">CentOS/RHEL</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">sudo yum install git -y</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('sudo yum install git -y')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Fedora</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">sudo dnf install git -y</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('sudo dnf install git -y')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="verify" className="git-install-method">
                    <div>
                      <h4 className="font-medium mb-3">验证 Git 安装</h4>
                      <p className="mb-2">安装完成后，运行以下命令验证 Git 版本：</p>
                       
                      <div className="flex items-center gap-2 mb-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">git --version</code>
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard('git --version')}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                       
                      <div className="expected-output bg-gray-50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">预期输出示例：</p>
                        <pre className="text-xs text-gray-600 bg-white p-2 rounded">
{`git version 2.40.0  # 版本号可能会有所不同`}
                        </pre>
                      </div>
                       
                      <div className="troubleshooting">
                        <h4 className="font-medium mb-2">常见问题解决</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">命令未找到</p>
                            <p className="text-gray-600">如果安装后仍然显示 "command not found"，可能是 PATH 环境变量未正确设置，请重启终端或手动添加 Git 到 PATH。</p>
                          </div>
                          <div>
                            <p className="font-medium">权限错误</p>
                            <p className="text-gray-600">在 Linux/macOS 上，如果遇到权限错误，请尝试使用 sudo 或以管理员身份运行命令。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-blue-600" /> Claude Code 安装
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="npm">NPM 安装（推荐）</TabsTrigger>
              <TabsTrigger value="windows">Windows</TabsTrigger>
              <TabsTrigger value="macos">macOS</TabsTrigger>
              <TabsTrigger value="linux">Linux</TabsTrigger>
            </TabsList>
            
            <TabsContent value="npm" className="space-y-4">
              <p>使用 npm 全局安装 Claude Code CLI 工具：</p>
              <div className="flex items-center gap-2 mb-4">
                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">npm install -g claude-code-cli</code>
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard('npm install -g claude-code-cli')}
                  className="gap-1"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>注意：</strong> 安装过程中可能需要管理员权限，Windows 用户请以管理员身份运行命令提示符，macOS/Linux 用户请在命令前添加 sudo。
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>小贴士：</strong> 如果您希望在特定项目中使用而非全局安装，可以省略 -g 参数，并在项目目录中使用 npx claude 命令。
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="windows" className="space-y-4">
              <h4 className="font-medium">Windows 系统安装步骤：</h4>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>以管理员身份打开命令提示符或 PowerShell：
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                    <li>点击开始菜单</li>
                    <li>搜索 "cmd" 或 "PowerShell"</li>
                    <li>右键点击并选择 "以管理员身份运行"</li>
                  </ul>
                </li>
                <li>运行以下命令安装 Claude Code CLI：</li>
              </ol>
              <div className="flex items-center gap-2 mb-4">
                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">npm install -g claude-code-cli</code>
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard('npm install -g claude-code-cli')}
                  className="gap-1"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  安装完成后，您可以在任意目录下使用 claude 命令。
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Windows 小贴士：</strong> 如果安装后在命令行中无法识别 claude 命令，可能需要将 npm 全局模块路径添加到系统环境变量中。
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="macos" className="space-y-4">
              <h4 className="font-medium">macOS 系统安装步骤：</h4>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>打开终端：
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                    <li>在 Launchpad 中搜索 "终端"</li>
                    <li>或使用 Spotlight（Command + 空格键）搜索 "Terminal"</li>
                  </ul>
                </li>
                <li>运行以下命令安装 Claude Code CLI：</li>
              </ol>
              <div className="flex items-center gap-2 mb-4">
                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">sudo npm install -g claude-code-cli</code>
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard('sudo npm install -g claude-code-cli')}
                  className="gap-1"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                输入您的密码并按 Enter 键继续。安装过程中密码输入不会显示在屏幕上，这是正常的安全措施。
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  安装完成后，您可以在任意目录下使用 claude 命令。
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>macOS 小贴士：</strong> 如果您使用的是 zsh（macOS 的默认 shell），可能需要在安装后重新启动终端窗口。
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="linux" className="space-y-4">
              <h4 className="font-medium">Linux 系统安装步骤：</h4>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>打开终端：
                  <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                    <li>使用快捷键 Ctrl + Alt + T</li>
                    <li>或在应用程序菜单中搜索 "终端"</li>
                  </ul>
                </li>
                <li>运行以下命令安装 Claude Code CLI：</li>
              </ol>
              <div className="flex items-center gap-2 mb-4">
                <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">sudo npm install -g claude-code-cli</code>
                <Button 
                  size="sm" 
                  onClick={() => copyToClipboard('sudo npm install -g claude-code-cli')}
                  className="gap-1"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">
                输入您的密码并按 Enter 键继续。安装过程中密码输入不会显示在屏幕上，这是正常的安全措施。
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  安装完成后，您可以在任意目录下使用 claude 命令。
                </p>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>Linux 小贴士：</strong> 如果遇到 EACCES 权限错误，可以考虑使用 nvm（Node Version Manager）来管理 Node.js 安装，这样不需要 sudo 权限。
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg bg-gradient-to-br from-green-50 to-white border-green-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" /> 安装验证
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <p className="text-gray-700">在完成所有安装步骤后，请按照以下步骤验证安装是否成功。正确的安装验证可以确保您的开发环境配置正确。</p>
            
            {/* 验证 Node.js 和 npm 版本 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Node.js 和 npm 版本</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">node -v</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('node -v')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-600 ml-3">预期输出示例：v18.16.0 或更高版本</p>
                
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">npm -v</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('npm -v')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-600 ml-3">预期输出示例：9.5.1 或更高版本</p>
              </div>
            </div>
            
            {/* 验证 Git 安装 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Git 安装</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">git --version</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('git --version')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-600 ml-3">预期输出示例：git version 2.40.1 或更高版本</p>
              </div>
            </div>
            
            {/* 验证 Claude Code CLI 安装 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Claude Code CLI 安装</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">claude --version</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('claude --version')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-600 ml-3">预期输出示例：Claude Code CLI v1.2.3 或类似版本信息</p>
              </div>
            </div>
            
            {/* 验证配置 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Claude 配置</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">claude config list</code>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('claude config list')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-600 ml-3">显示当前 Claude CLI 的配置信息</p>
              </div>
            </div>
            
            {/* 常见问题解决方案 */}
            <div className="border border-gray-200 rounded-lg">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100" 
                onClick={() => setCommonIssuesExpanded(!commonIssuesExpanded)}
              >
                <div className="flex items-center gap-2 font-medium">
                  {commonIssuesExpanded ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                  <span>常见问题解决方案</span>
                </div>
              </div>
              {commonIssuesExpanded && (
                <div className="p-4 border-t border-gray-200 space-y-5">
                  <div>
                    <h4 className="font-medium mb-2">命令未找到</h4>
                    <p className="text-sm text-gray-600 mb-1">如果收到 "command not found" 错误，请尝试：</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>关闭当前终端并重新打开</li>
                      <li>检查 npm 全局安装路径是否已添加到系统 PATH</li>
                      <li>尝试重新安装 Claude Code CLI</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">权限错误</h4>
                    <p className="text-sm text-gray-600 mb-1">如果遇到权限错误，请确保：</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>Windows 用户以管理员身份运行命令提示符</li>
                      <li>macOS/Linux 用户使用 sudo 命令</li>
                      <li>检查 npm 全局目录的权限设置</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">版本过低</h4>
                    <p className="text-sm text-gray-600 mb-1">如果 Node.js 版本过低，请：</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>升级到 Node.js 18+ 版本</li>
                      <li>考虑使用 nvm (Node Version Manager) 来管理多个 Node.js 版本</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">API 密钥错误</h4>
                    <p className="text-sm text-gray-600 mb-1">如果使用 Claude 命令时遇到 API 密钥相关错误：</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      <li>确保您已正确设置 API 密钥：<code>claude config set api_key 您的API密钥</code></li>
                      <li>检查 API 密钥是否有效且未过期</li>
                      <li>验证您的网络连接是否正常</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">提示：</h4>
              <p className="text-sm text-blue-700">
                如果所有验证步骤都通过，恭喜您！您的开发环境已成功配置。您可以开始使用 Claude Code 来增强您的开发工作流了。
                如果遇到问题，请先检查常见问题解决方案，或查看官方文档获取更多帮助。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">📚 使用指南</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 开始使用步骤 */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                🚀 开始使用步骤
              </h3>
              <p className="text-gray-600 mb-4">按照以下步骤快速开始使用 Claude Code：</p>
              
              {/* 完整使用流程代码块 */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                  <span className="font-medium">完整使用流程</span>
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('# 1. 导航到您的项目文件夹\ncd /path/to/your/project\n\n# 2. 用 claude 命令启动 Claude Code\nclaude\n\n# 3. 配置 API 密钥（从API密钥一览页面下载配置文件）\n# 配置文件路径：~/.claude/settings.json')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 overflow-auto text-sm"><code># 1. 导航到您的项目文件夹
cd /path/to/your/project

# 2. 用 claude 命令启动 Claude Code
claude

# 3. 配置 API 密钥（配置文件可从API密钥一览页面下载，解压缩放到下面的指定路径以后，用/exit命令从cluade code退出，然后重新启动claude code）
# 配置文件路径：~/.claude/settings.json,~/.claude/config.json</code></pre>
              </div>
              
              {/* 基本命令和使用技巧 - 两列布局 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 基本命令 */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    🎯 基本命令
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude</code>
                      <span className="text-gray-600">启动交互式会话</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude "任务描述"</code>
                      <span className="text-gray-600">执行一次性任务</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude commit</code>
                      <span className="text-gray-600">创建Git提交</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude explain</code>
                      <span className="text-gray-600">解释代码功能和工作原理</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude refactor</code>
                      <span className="text-gray-600">优化和重构代码</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">claude test</code>
                      <span className="text-gray-600">为代码生成测试用例</span>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm whitespace-nowrap mr-3 min-w-[120px]">/help</code>
                      <span className="text-gray-600">显示帮助信息</span>
                    </div>
                  </div>
                </div>
                
                {/* 使用技巧 */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    💡 使用技巧
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>使用自然语言描述您的需求，越具体越好</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>将复杂任务拆分为多个步骤，逐步完成</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>使用 Tab 键进行命令补全，提高效率</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>按 ↑ 键查看命令历史，重复使用之前的命令</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>在项目目录中运行获得最佳效果，Claude 可以更好地理解项目结构</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>使用 <code className="bg-white px-1 rounded text-xs">/exit</code> 命令退出交互式会话</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>定期更新 Claude Code CLI 到最新版本以获取新功能</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* API密钥配置 */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">🔑 API密钥配置</h3>
                    <p className="text-gray-600 mb-3">首次使用时，配置您的 API 密钥：</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-3 py-1.5 rounded text-sm flex-1">claude config set api_key 您的API密钥</code>
                      <Button 
                        size="sm" 
                        onClick={() => copyToClipboard('claude config set api_key 您的API密钥')}
                        className="gap-1"
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        复制
                      </Button>
                    </div>
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <strong>提示：</strong> 您也可以从API密钥一览页面下载配置文件，解压后放到指定路径：~/.claude/
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            🔌 VS Code插件安装
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-600">如果您使用Visual Studio Code，可以安装Claude Code插件获得更好的开发体验</p>

            <div className="space-y-6">
              {/* 方法一：通过VS Code扩展市场安装 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  📦 方法一：通过VS Code扩展市场安装（推荐）
                </h3>
                <ol className="list-decimal pl-6 space-y-3">
                  <li className="text-gray-700">打开Visual Studio Code</li>
                  <li className="text-gray-700">点击左侧的扩展图标（或按 Ctrl+Shift+X）</li>
                  <li className="text-gray-700">在搜索框中输入 "Claude Code"</li>
                  <li className="text-gray-700">找到由 Anthropic 开发的 Claude Code 插件</li>
                  <li className="text-gray-700">点击"安装"按钮</li>
                </ol>
              </div>

              {/* 方法二：通过命令行安装 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  🖥️ 方法二：通过命令行安装
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                    <span className="font-medium">Terminal</span>
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard('code --install-extension anthropic.claude-code')}
                      className="gap-1"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      复制
                    </Button>
                  </div>
                  <pre className="bg-gray-50 p-4 overflow-auto text-sm"><code>code --install-extension anthropic.claude-code</code></pre>
                </div>
              </div>

              {/* 方法三：通过VS Code快速打开 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  ⚡ 方法三：通过VS Code快速打开
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
                    <span className="font-medium">Terminal</span>
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard('code --install-extension anthropic.claude-code')}
                      className="gap-1"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      复制
                    </Button>
                  </div>
                  <pre className="bg-gray-50 p-4 overflow-auto text-sm"><code>code --install-extension anthropic.claude-code</code></pre>
                </div>
              </div>

              {/* VS Code插件小贴士 */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  💡 VS Code 插件小贴士
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>安装完成后需要重启 VS Code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>确保已安装 Claude Code CLI 工具</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>在 VS Code 中按 <code className="bg-white px-1 rounded text-xs">Ctrl+Shift+P</code> 打开命令面板，输入 "Claude" 查看可用命令</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>插件会自动检测项目中的 Claude Code 配置</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>右键点击编辑器中的代码，选择 "Claude Code" 相关选项可以快速使用功能</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>使用 <code className="bg-white px-1 rounded text-xs">Ctrl+Shift+Alt+C</code> 快捷键快速访问 Claude Code</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GettingStarted
