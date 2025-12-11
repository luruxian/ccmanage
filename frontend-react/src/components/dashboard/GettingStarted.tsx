import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardCopy } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/ToastProvider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

import { Check, Info, Code, CheckCircle } from 'lucide-react'

const GettingStarted: React.FC = () => {
  const { success, error } = useToast()

  // 复制到剪贴板的工具函数
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      success('已复制到剪贴板')
    } catch {
      error('复制失败')
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 p-2 sm:p-4 md:p-6 lg:p-8 container mx-auto">
      {/* 页面标题区域 */}
      <div className="text-center mb-6 sm:mb-8 md:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground flex items-center justify-center gap-2">
          🚀 开始使用 Claude Code
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
          按照以下步骤安装和配置 Claude Code CLI 工具，提升您的开发效率
        </p>
      </div>
      
      {/* 提示卡片 - 快速导航 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>安装流程指南</AlertTitle>
        <AlertDescription>
          请按顺序完成以下步骤：系统要求 → Node.js安装 → Git安装 → Claude Code安装 → 验证安装 → 使用指南
        </AlertDescription>
      </Alert>
      
      {/* 系统要求卡片 */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-4">
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            📋 系统要求
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="system-requirements-content">
            <div className="mb-4">
              <p className="mb-2">在安装 Claude Code 前，请确保您的系统满足以下要求：</p>
              <ul className="space-y-3 system-requirements-list">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Node.js 18+</strong> - Claude Code 需要 Node.js 18 或更高版本才能运行。
                    如果您的系统上安装了较低版本，需要先进行升级。
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>Git</strong> - Claude Code 使用 Git 进行版本控制相关操作，
                    请确保您的系统已安装 Git 并配置了基本信息。
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success mt-1 flex-shrink-0" />
                  <span>
                    <strong>npm 或 yarn</strong> - 用于安装和管理 Claude Code 包。
                    Node.js 安装通常会自带 npm。
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary">
                <strong>提示：</strong> 您可以使用 <code className="bg-background px-1 py-0.5 rounded text-xs">node -v</code> 和 <code className="bg-background px-1 py-0.5 rounded text-xs">git --version</code> 命令检查您当前安装的版本。
              </p>
            </div>
          </div>

          {/* Node.js 安装指南 */}
          <Accordion type="single" collapsible className="mb-4">
            <AccordionItem value="nodejs-installation">
              <AccordionTrigger className="text-base font-medium hover:no-underline">
                📦 Node.js 安装指南
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">Node.js 是运行 Claude Code 的必要环境，请根据您的操作系统选择合适的安装方法：</p>

                <Tabs defaultValue="windows" className="node-installation-content">
                  <TabsList className="flex flex-wrap gap-1 mb-4 overflow-x-auto">
                    <TabsTrigger value="windows" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Windows</TabsTrigger>
                    <TabsTrigger value="macos" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">macOS</TabsTrigger>
                    <TabsTrigger value="linux" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Linux</TabsTrigger>
                    <TabsTrigger value="verify" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">验证安装</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="windows" className="node-install-method">
                    <div className="mb-3">
                      <h4 className="font-medium mb-2">方法一：使用官方安装包</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-4">
                        <li>访问 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">Node.js 官网</a></li>
                        <li>下载 Windows 的 LTS 版本安装包</li>
                        <li>运行安装程序，按照提示完成安装</li>
                        <li>安装过程中，请确保勾选 "Add to PATH" 选项</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 nvm-windows</h4>
                      <p className="mb-2 text-sm">nvm-windows 是 Node.js 版本管理器，可以让您轻松切换不同的 Node.js 版本：</p>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://github.com/coreybutler/nvm-windows/releases" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">nvm-windows 发布页面</a></li>
                        <li>下载并安装最新的 nvm-setup.zip</li>
                        <li>安装完成后，打开命令提示符，运行以下命令：</li>
                      </ol>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">nvm install 18</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('nvm install 18')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">nvm use 18</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('nvm use 18')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                        <li>访问 <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">Node.js 官网</a></li>
                        <li>下载 macOS 的 LTS 版本安装包</li>
                        <li>运行安装程序，按照提示完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 Homebrew</h4>
                      <p className="mb-2 text-sm">如果您已安装 Homebrew，可以使用以下命令：</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">brew install node@18</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('brew install node@18')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">如果需要将 Node.js 添加到 PATH，请运行：</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">echo 'export PATH="/usr/local/opt/node@18/bin:$PATH"' &gt;&gt; ~/.zshrc && source ~/.zshrc</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('echo \'export PATH="/usr/local/opt/node@18/bin:$PATH"\' >> ~/.zshrc && source ~/.zshrc')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs</code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard('curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs')}
                              className="gap-1 w-full sm:w-auto flex-shrink-0"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="font-medium text-sm mb-1">Fedora/RHEL/CentOS:</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo dnf install -y nodejs</code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard('curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash - && sudo dnf install -y nodejs')}
                              className="gap-1 w-full sm:w-auto flex-shrink-0"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <p className="font-medium text-sm mb-1">使用 nvm (推荐，适用于所有 Linux):</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash</code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash')}
                              className="gap-1 w-full sm:w-auto flex-shrink-0"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">安装完成后，重启终端并运行：</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">nvm install 18</code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard('nvm install 18')}
                              className="gap-1 w-full sm:w-auto flex-shrink-0"
                            >
                              <ClipboardCopy className="h-4 w-4" />
                              复制
                            </Button>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">nvm use 18</code>
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard('nvm use 18')}
                              className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">node -v</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('node -v')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">npm -v</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('npm -v')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                      
                      <div className="expected-output bg-black/50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">预期输出示例：</p>
                        <pre className="text-xs text-muted-foreground bg-white p-2 rounded">
{`v18.16.0  # Node.js 版本
9.5.1     # npm 版本`}
                        </pre>
                      </div>
                      
                      <div className="troubleshooting">
                        <h4 className="font-medium mb-2">常见问题解决</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">权限错误</p>
                            <p className="text-muted-foreground">如果安装过程中遇到权限错误，请尝试使用管理员/root权限运行命令，或使用 nvm 安装以避免权限问题。</p>
                          </div>
                          <div>
                            <p className="font-medium">版本不匹配</p>
                            <p className="text-muted-foreground">确保安装的是 Node.js 18 或更高版本。如果已经安装了较旧的版本，可以使用 nvm 或官方安装程序升级。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Git 安装指南 */}
          <Accordion type="single" collapsible>
            <AccordionItem value="git-installation">
              <AccordionTrigger className="text-base font-medium hover:no-underline">
                🔀 Git 安装指南
              </AccordionTrigger>
              <AccordionContent>
                <Tabs defaultValue="windows" className="git-install-methods">
                  <TabsList className="flex flex-wrap gap-1 mb-4 overflow-x-auto">
                    <TabsTrigger value="windows" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Windows</TabsTrigger>
                    <TabsTrigger value="macos" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">macOS</TabsTrigger>
                    <TabsTrigger value="linux" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Linux</TabsTrigger>
                    <TabsTrigger value="verify" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">验证安装</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="windows" className="git-install-method">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">方法一：使用官方安装程序</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">Git 官方网站</a></li>
                        <li>下载 Windows 版本的安装程序</li>
                        <li>运行安装程序，按照默认选项完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用 Chocolatey</h4>
                      <p className="mb-2 text-sm">如果您已安装 Chocolatey 包管理器，可以使用以下命令：</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">choco install git -y</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('choco install git -y')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">brew install git</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('brew install git')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法二：使用官方安装包</h4>
                      <ol className="list-decimal pl-5 space-y-2 mb-3">
                        <li>访问 <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 hover:underline">Git 官方网站</a></li>
                        <li>下载 macOS 版本的安装程序</li>
                        <li>运行安装程序，按照默认选项完成安装</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">方法三：使用 Xcode Command Line Tools</h4>
                      <p className="mb-2 text-sm">如果已安装 Xcode 或 Xcode Command Line Tools，Git 可能已预安装。如果没有，可以通过以下命令安装：</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">xcode-select --install</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('xcode-select --install')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">sudo apt update && sudo apt install git -y</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('sudo apt update && sudo apt install git -y')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">CentOS/RHEL</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">sudo yum install git -y</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('sudo yum install git -y')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Fedora</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">sudo dnf install git -y</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('sudo dnf install git -y')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
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
                       
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">git --version</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard('git --version')}
                          className="gap-1 w-full sm:w-auto flex-shrink-0"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          复制
                        </Button>
                      </div>
                       
                      <div className="expected-output bg-black/50 p-3 rounded-lg mb-3">
                        <p className="text-sm font-medium mb-1">预期输出示例：</p>
                        <pre className="text-xs text-muted-foreground bg-white p-2 rounded">
{`git version 2.40.0  # 版本号可能会有所不同`}
                        </pre>
                      </div>
                       
                      <div className="troubleshooting">
                        <h4 className="font-medium mb-2">常见问题解决</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="font-medium">命令未找到</p>
                            <p className="text-muted-foreground">如果安装后仍然显示 "command not found"，可能是 PATH 环境变量未正确设置，请重启终端或手动添加 Git 到 PATH。</p>
                          </div>
                          <div>
                            <p className="font-medium">权限错误</p>
                            <p className="text-muted-foreground">在 Linux/macOS 上，如果遇到权限错误，请尝试使用 sudo 或以管理员身份运行命令。</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md bg-gradient-to-br from-primary/5 to-background border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" /> Claude Code 安装
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="npm" className="w-full">
            <TabsList className="flex flex-wrap gap-1 mb-4 overflow-x-auto">
              <TabsTrigger value="npm" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">NPM 安装</TabsTrigger>
              <TabsTrigger value="windows" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Windows</TabsTrigger>
              <TabsTrigger value="macos" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">macOS</TabsTrigger>
              <TabsTrigger value="linux" className="text-xs sm:text-sm md:text-base flex-1 min-w-0 whitespace-nowrap">Linux</TabsTrigger>
            </TabsList>
            
            <TabsContent value="npm" className="space-y-4">
              <p>使用 npm 全局安装 Claude Code CLI 工具：</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">npm install -g @anthropic-ai/claude-code</code>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard('npm install -g @anthropic-ai/claude-code')}
                  className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  复制
                </Button>
              </div>
              
              <Alert>
                <AlertTitle>注意</AlertTitle>
                <AlertDescription>
                  安装过程中可能需要管理员权限，Windows 用户请以管理员身份运行命令提示符，macOS/Linux 用户请在命令前添加 sudo。
                </AlertDescription>
              </Alert>

              <Alert variant="default">
                <AlertTitle>小贴士</AlertTitle>
                <AlertDescription>
                  如果您希望在特定项目中使用而非全局安装，可以省略 -g 参数，并在项目目录中使用 npx claude 命令。
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="windows" className="space-y-4">
              <h4 className="font-medium">Windows 系统安装方法</h4>
              <p className="text-muted mb-3">Windows系统专用安装方法</p>

              <div className="os-method mb-4">
                <h5 className="font-medium mb-2">🔵 PowerShell 安装（推荐）</h5>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">irm https://claude.ai/install.ps1 | iex</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('irm https://claude.ai/install.ps1 | iex')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">以管理员身份运行 PowerShell</p>
              </div>

              <div className="os-method mb-4">
                <h5 className="font-medium mb-2">⬛ 命令提示符 (CMD)</h5>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">以管理员身份运行命令提示符</p>
              </div>

              <Alert>
                <AlertTitle>💡 Windows 小贴士</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>右键点击 PowerShell 或 CMD，选择"以管理员身份运行"</li>
                    <li>如果遇到执行策略问题，先运行：<code className="bg-black text-white px-1 rounded">Set-ExecutionPolicy RemoteSigned</code></li>
                    <li>安装完成后重启终端以使用 <code className="bg-black text-white px-1 rounded">claude</code> 命令</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="macos" className="space-y-4">
              <h4 className="font-medium">macOS 系统安装方法</h4>
              <p className="text-muted mb-3">macOS系统专用安装方法</p>

              <div className="os-method mb-4">
                <h5 className="font-medium mb-2">🍎 一键安装脚本</h5>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -fsSL https://claude.ai/install.sh | bash</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('curl -fsSL https://claude.ai/install.sh | bash')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">打开 Terminal（终端）应用程序</p>
              </div>

              <Alert>
                <AlertTitle>🍎 macOS 小贴士</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>打开 Terminal（终端）应用程序</li>
                    <li>如果提示权限问题，可能需要在命令前加 <code className="bg-black text-white px-1 rounded">sudo</code></li>
                    <li>首次运行可能会触发 macOS 安全提示，请允许执行</li>
                    <li>如果使用 Homebrew，也可以通过包管理器安装</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="linux" className="space-y-4">
              <h4 className="font-medium">Linux 系统安装方法</h4>
              <p className="text-muted mb-3">Linux系统专用安装方法</p>

              <div className="os-method mb-4">
                <h5 className="font-medium mb-2">🐧 一键安装脚本</h5>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">curl -fsSL https://claude.ai/install.sh | bash</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('curl -fsSL https://claude.ai/install.sh | bash')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">适用于大多数 Linux 发行版</p>
              </div>

              <Alert>
                <AlertTitle>🐧 Linux 小贴士</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>大多数发行版都支持该安装脚本</li>
                    <li>如果需要管理员权限，在命令前加 <code className="bg-black text-white px-1 rounded">sudo</code></li>
                    <li>确保已安装 <code className="bg-black text-white px-1 rounded">curl</code> 或 <code className="bg-black text-white px-1 rounded">wget</code></li>
                    <li>安装完成后可能需要重新加载 shell 配置：<code className="bg-black text-white px-1 rounded">source ~/.bashrc</code></li>
                  </ul>
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-md bg-gradient-to-br from-success/5 to-background border-success/20">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" /> 安装验证
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <p className="text-muted-foreground">在完成所有安装步骤后，请按照以下步骤验证安装是否成功。正确的安装验证可以确保您的开发环境配置正确。</p>
            
            {/* 验证 Node.js 和 npm 版本 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Node.js 和 npm 版本</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">node -v</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('node -v')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-3">预期输出示例：v18.16.0 或更高版本</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">npm -v</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('npm -v')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-3">预期输出示例：9.5.1 或更高版本</p>
              </div>
            </div>
            
            {/* 验证 Git 安装 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Git 安装</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">git --version</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('git --version')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-3">预期输出示例：git version 2.40.1 或更高版本</p>
              </div>
            </div>
            
            {/* 验证 Claude Code CLI 安装 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Claude Code CLI 安装</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">claude --version</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('claude --version')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-3">预期输出示例：Claude Code CLI v1.2.3 或类似版本信息</p>
              </div>
            </div>
            
            {/* 验证配置 */}
            <div>
              <h3 className="font-semibold text-lg mb-3">验证 Claude 配置</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">claude config list</code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('claude config list')}
                    className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground ml-3">显示当前 Claude CLI 的配置信息</p>
              </div>
            </div>
            
            {/* 常见问题解决方案 */}
            <Accordion type="single" collapsible>
              <AccordionItem value="common-issues">
                <AccordionTrigger className="font-medium hover:no-underline">
                  常见问题解决方案
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-5">
                  <div>
                    <h4 className="font-medium mb-2">命令未找到</h4>
                    <p className="text-sm text-muted-foreground mb-1">如果收到 "command not found" 错误，请尝试：</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      <li>关闭当前终端并重新打开</li>
                      <li>检查 npm 全局安装路径是否已添加到系统 PATH</li>
                      <li>尝试重新安装 Claude Code CLI</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">权限错误</h4>
                    <p className="text-sm text-muted-foreground mb-1">如果遇到权限错误，请确保：</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      <li>Windows 用户以管理员身份运行命令提示符</li>
                      <li>macOS/Linux 用户使用 sudo 命令</li>
                      <li>检查 npm 全局目录的权限设置</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">版本过低</h4>
                    <p className="text-sm text-muted-foreground mb-1">如果 Node.js 版本过低，请：</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      <li>升级到 Node.js 18+ 版本</li>
                      <li>考虑使用 nvm (Node Version Manager) 来管理多个 Node.js 版本</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">API 密钥错误</h4>
                    <p className="text-sm text-muted-foreground mb-1">如果使用 Claude 命令时遇到 API 密钥相关错误：</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      <li>确保您已正确设置 API 密钥：<code>claude config set api_key 您的API密钥</code></li>
                      <li>检查 API 密钥是否有效且未过期</li>
                      <li>验证您的网络连接是否正常</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-2">提示：</h4>
              <p className="text-sm text-primary">
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
              <p className="text-muted-foreground mb-4 text-sm md:text-base">按照以下步骤快速开始使用 Claude Code：</p>
              
              {/* 完整使用流程代码块 */}
              <div className="bg-black text-white/50 rounded-lg border border-border overflow-hidden mb-6">
                <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-black text-white">
                  <span className="font-medium text-sm md:text-base">完整使用流程</span>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard('# 1. 导航到您的项目文件夹\ncd /path/to/your/project\n\n# 2. 用 claude 命令启动 Claude Code\nclaude\n\n# 3. 配置 API 密钥（从API密钥一览页面下载配置文件）\n# 配置文件路径：~/.claude/settings.json')}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    复制
                  </Button>
                </div>
                <pre className="bg-black text-white/50 p-2 sm:p-3 md:p-4 overflow-auto text-xs sm:text-sm md:text-base"><code># 1. 导航到您的项目文件夹
cd /path/to/your/project

# 2. 用 claude 命令启动 Claude Code
claude

# 3. 配置 API 密钥（配置文件可从API密钥一览页面下载，解压缩放到下面的指定路径以后，用/exit命令从cluade code退出，然后重新启动claude code）
# 配置文件路径：~/.claude/settings.json,~/.claude/config.json</code></pre>
              </div>
              
              {/* 基本命令和使用技巧 - 两列布局 */}
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-6">
                {/* 基本命令 */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl mb-3 flex items-center gap-2">
                    🎯 基本命令
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm md:text-base whitespace-pre-wrap break-words mr-3 min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">claude</code>
                      <span className="text-muted-foreground text-sm md:text-base">启动交互式会话</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">claude "任务描述"</code>
                      <span className="text-muted-foreground">执行一次性任务</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">claude commit</code>
                      <span className="text-muted-foreground">创建Git提交</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">claude explain</code>
                      <span className="text-muted-foreground">解释代码功能和工作原理</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">claude refactor</code>
                      <span className="text-muted-foreground">优化和重构代码</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">claude test</code>
                      <span className="text-muted-foreground">为代码生成测试用例</span>
                    </div>
                    <div className="flex items-center p-3 bg-black text-white rounded-lg">
                      <code className="bg-black text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-pre-wrap break-words mr-3 min-w-[100px] sm:min-w-[120px]">/help</code>
                      <span className="text-muted-foreground">显示帮助信息</span>
                    </div>
                  </div>
                </div>
                
                {/* 使用技巧 */}
                <div>
                  <h3 className="font-semibold text-base sm:text-lg md:text-xl mb-3 flex items-center gap-2">
                    💡 使用技巧
                  </h3>
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>使用自然语言描述您的需求，越具体越好</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>将复杂任务拆分为多个步骤，逐步完成</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>使用 Tab 键进行命令补全，提高效率</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>按 ↑ 键查看命令历史，重复使用之前的命令</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>在项目目录中运行获得最佳效果，Claude 可以更好地理解项目结构</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>使用 <code className="bg-background px-1 rounded text-xs">/exit</code> 命令退出交互式会话</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary mt-1">•</span>
                        <span>定期更新 Claude Code CLI 到最新版本以获取新功能</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* API密钥配置 */}
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-3">🔑 API密钥配置</h3>
                    <p className="text-muted-foreground mb-3">首次使用时，配置您的 API 密钥：</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <code className="bg-black text-white px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm md:text-base flex-1 overflow-x-auto whitespace-pre-wrap break-words">claude config set api_key 您的API密钥</code>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard('claude config set api_key 您的API密钥')}
                        className="gap-1 sm:w-auto w-full sm:flex-shrink-0"
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
          <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            🔌 VS Code插件安装
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">如果您使用Visual Studio Code，可以安装Claude Code插件获得更好的开发体验</p>

            <div className="space-y-6">
              {/* 方法一：通过VS Code扩展市场安装 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  📦 方法一：通过VS Code扩展市场安装（推荐）
                </h3>
                <ol className="list-decimal pl-6 space-y-3">
                  <li className="text-muted-foreground">打开Visual Studio Code</li>
                  <li className="text-muted-foreground">点击左侧的扩展图标（或按 Ctrl+Shift+X）</li>
                  <li className="text-muted-foreground">在搜索框中输入 "Claude Code"</li>
                  <li className="text-muted-foreground">找到由 Anthropic 开发的 Claude Code 插件</li>
                  <li className="text-muted-foreground">点击"安装"按钮</li>
                </ol>
              </div>

              {/* 方法二：通过命令行安装 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  🖥️ 方法二：通过命令行安装
                </h3>
                <div className="bg-black text-white/50 rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-black text-white">
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
                  <pre className="bg-black text-white/50 p-2 sm:p-4 overflow-auto text-xs sm:text-sm"><code>code --install-extension anthropic.claude-code</code></pre>
                </div>
              </div>

              {/* 方法三：通过VS Code快速打开 */}
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-1">
                  ⚡ 方法三：通过VS Code快速打开
                </h3>
                <div className="bg-black text-white/50 rounded-lg border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-black text-white">
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
                  <pre className="bg-black text-white/50 p-2 sm:p-4 overflow-auto text-xs sm:text-sm"><code>code --install-extension anthropic.claude-code</code></pre>
                </div>
              </div>

              {/* VS Code插件小贴士 */}
              <div className="bg-primary/5 border-l-4 border-primary p-5 rounded-r-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  💡 VS Code 插件小贴士
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>安装完成后需要重启 VS Code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>确保已安装 Claude Code CLI 工具</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>在 VS Code 中按 <code className="bg-background px-1 rounded text-xs">Ctrl+Shift+P</code> 打开命令面板，输入 "Claude" 查看可用命令</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>插件会自动检测项目中的 Claude Code 配置</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>右键点击编辑器中的代码，选择 "Claude Code" 相关选项可以快速使用功能</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary mt-1">•</span>
                    <span>使用 <code className="bg-background px-1 rounded text-xs">Ctrl+Shift+Alt+C</code> 快捷键快速访问 Claude Code</span>
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
