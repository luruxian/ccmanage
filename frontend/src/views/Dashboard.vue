<template>
  <div class="dashboard">
    <!-- 移动端侧边栏抽屉 -->
    <div class="mobile-sidebar-overlay" v-if="showMobileSidebar" @click="showMobileSidebar = false"></div>
    <div class="mobile-sidebar" :class="{ 'mobile-sidebar-open': showMobileSidebar }">
      <div class="mobile-sidebar-content">
        <nav class="sidebar-nav">
          <a href="#" :class="['nav-item', { active: activeTab === 'getting-started' }]" @click="setActiveTab('getting-started')">
            <ElIcon><ElIconVideoPlay /></ElIcon>
            安装Claude Code
          </a>
          <a href="#" :class="['nav-item', { active: activeTab === 'keys' || activeTab === 'usage-history' }]" @click="setActiveTab('keys')">
            <ElIcon><ElIconKey /></ElIcon>
            API密钥
          </a>
          <a href="#" :class="['nav-item', { active: activeTab === 'packages' }]" @click="setActiveTab('packages')">
            <ElIcon><ElIconList /></ElIcon>
            订阅一览
          </a>
          <a href="#" :class="['nav-item', { active: activeTab === 'promotion' }]" @click="setActiveTab('promotion')">
            <ElIcon><ElIconTrendCharts /></ElIcon>
            推广计划
          </a>
          <a href="#" :class="['nav-item', { active: activeTab === 'resources' }]" @click="setActiveTab('resources')">
            <ElIcon><ElIconReading /></ElIcon>
            资料中心
          </a>
        </nav>
      </div>
    </div>

    <div class="container-fluid">
      <div class="row">
        <!-- 桌面端侧边栏 -->
        <PCSidebar
          :active-tab="activeTab"
          @tab-change="handleTabChange"
        />

        <!-- 主内容区 -->
        <div class="col-12 col-md-9 col-lg-10 main-content">
          <!-- 移动端顶部栏 -->
          <div class="mobile-header d-md-none">
            <button class="mobile-menu-btn" @click="showMobileSidebar = true">
              <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-title">
              {{ getCurrentTabTitle() }}
            </div>
          </div>

          <!-- API密钥管理 -->
          <div v-if="activeTab === 'keys'" class="tab-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2>API密钥一览</h2>
              <div class="key-actions">
                <router-link to="/key-activation" class="btn btn-primary me-2">
                  <ElIcon><ElIconPlus /></ElIcon>
                  激活新密钥
                </router-link>
                <ElButton @click="refreshKeys" :loading="loadingKeys">
                  <ElIcon><ElIconRefresh /></ElIcon>
                  刷新
                </ElButton>
              </div>
            </div>

            <!-- 密钥统计 -->
            <div class="key-stats-inline mb-4">
              <div class="stat-badge">
                <div class="stat-icon">
                  <ElIcon><ElIconKey /></ElIcon>
                </div>
                <div class="stat-content">
                  <span class="stat-number">{{ keyStats.active }}</span>
                  <span class="stat-label">激活密钥</span>
                </div>
              </div>
            </div>


            <!-- 密钥列表 -->
            <ElCard>
              <div v-if="loadingKeys" class="text-center py-4">
                <ElSkeleton :rows="5" animated />
              </div>
              <div v-else-if="filteredKeys.length === 0" class="empty-keys">
                <i class="fas fa-key empty-icon"></i>
                <h4>暂无密钥</h4>
                <p>您还没有创建任何API密钥</p>
                <router-link to="/key-activation" class="btn btn-primary">
                  立即激活密钥
                </router-link>
              </div>
              <div v-else>
                <div class="custom-table">
                  <div class="table-header">
                    <div class="header-row">
                      <div class="col-subscription">订阅名称</div>
                      <div class="col-api-key">API密钥</div>
                      <div class="col-status">状态</div>
                      <div class="col-activation">激活时间</div>
                      <div class="col-expire">过期时间</div>
                      <div class="col-days">剩余天数</div>
                      <div class="col-actions">操作</div>
                    </div>
                  </div>
                  <div class="table-body">
                    <div v-for="key in filteredKeys" :key="key.user_key_id" class="key-item">
                      <!-- 第一行：主要信息 -->
                      <div class="main-row">
                        <div class="col-subscription">
                          <div class="key-name-cell">
                            <strong>{{ key.package_name || '未知订阅' }}</strong>
                          </div>
                        </div>
                        <div class="col-api-key">
                          <div class="api-key-cell">
                            <code class="api-key-text">{{ maskApiKey(key.api_key) }}</code>
                            <ElButton size="small" text @click="copyApiKey(key.api_key)">
                              <ElIcon><ElIconCopyDocument /></ElIcon>
                            </ElButton>
                          </div>
                        </div>
                        <div class="col-status">
                          <ElTag :type="getStatusType(key.status)" size="small">
                            {{ getStatusText(key.status) }}
                          </ElTag>
                        </div>
                        <div class="col-activation">
                          <span v-if="key.activation_date" class="date-text">
                            {{ formatDateShort(key.activation_date) }}
                          </span>
                          <span v-else class="text-muted">未激活</span>
                        </div>
                        <div class="col-expire">
                          <span v-if="key.expire_date" class="date-text">
                            {{ formatDateShort(key.expire_date) }}
                          </span>
                          <span v-else class="text-muted">永久</span>
                        </div>
                        <div class="col-days">
                          <span v-if="key.remaining_days !== null"
                                :class="getRemainingDaysClass(key.remaining_days)">
                            {{ key.remaining_days }}天
                          </span>
                          <span v-else class="text-muted">永久</span>
                        </div>
                        <div class="col-actions">
                          <div class="action-buttons">
                            <ElButton
                              type="primary"
                              size="small"
                              @click="viewUsageHistory(key)"
                            >
                              履历
                            </ElButton>
                            <ElButton
                              type="success"
                              size="small"
                              @click="resetCredits(key)"
                              :disabled="!canResetCredits(key)"
                              style="margin-left: 4px;"
                            >
                              重置积分
                            </ElButton>
                            <ElButton
                              type="info"
                              size="small"
                              @click="downloadConfig(key)"
                              style="margin-left: 4px;"
                            >
                              下载配置
                            </ElButton>
                          </div>
                        </div>
                      </div>
                      <!-- 第二行：积分信息 -->
                      <div class="credits-row">
                        <div class="credits-content">
                          <div class="credits-info-container">
                            <div class="credits-basic">
                              <div class="credit-item">
                                <span class="credit-label">总积分：</span>
                                <span v-if="key.total_credits !== null" class="credit-value">
                                  {{ key.total_credits }}
                                </span>
                                <span v-else class="text-muted">-</span>
                              </div>
                              <div class="credit-item">
                                <span class="credit-label">剩余积分：</span>
                                <span v-if="key.remaining_credits !== null"
                                      class="credit-value"
                                      :class="getRemainingCreditsClass(key.remaining_credits, key.total_credits)">
                                  {{ key.remaining_credits }}
                                </span>
                                <span v-else class="text-muted">-</span>
                              </div>
                            </div>
                            <div v-if="key.total_credits && key.total_credits > 0" class="credits-progress">
                              <div class="progress-with-label">
                                <span class="progress-label">剩余积分</span>
                                <ElProgress
                                  :percentage="Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)"
                                  :color="getProgressColor(Math.round(((key.remaining_credits || 0) / key.total_credits) * 100))"
                                  :stroke-width="6"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分页 -->
                <div v-if="filteredKeys.length > 0" class="pagination-wrapper">
                  <ElPagination
                    v-model:current-page="keyPagination.current"
                    v-model:page-size="keyPagination.size"
                    :page-sizes="[10, 20, 50]"
                    :total="filteredKeys.length"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleKeySizeChange"
                    @current-change="handleKeyPageChange"
                  />
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 安装Claude Code -->
          <div v-if="activeTab === 'getting-started'" class="tab-content">
            <h2 class="mb-4">安装Claude Code</h2>

            <!-- 系统要求 -->
            <ElCard class="mb-4">
              <template #header>
                <h4>💻 系统要求</h4>
              </template>
              <div class="requirements-content">
                <p class="text-muted mb-3">在开始安装之前，请确保您的系统满足以下要求：</p>
                <ul class="requirements-list">
                  <li><strong>Node.js 18+</strong> （用于NPM安装方式）</li>
                  <li><strong>Git</strong> （推荐，用于版本控制功能）</li>
                </ul>
              </div>
            </ElCard>

            <!-- Node.js安装指南 -->
            <ElCard class="mb-4">
              <template #header>
                <h4>📦 Node.js 安装指南</h4>
              </template>
              <div class="nodejs-install-content">
                <p class="text-muted mb-3">如果您还没有安装Node.js，请按照以下步骤安装：</p>

                <div class="nodejs-methods">
                  <ElTabs v-model="nodeInstallMethod" type="card">
                    <!-- Windows Node.js安装 -->
                    <ElTabPane label="Windows" name="windows-node">
                      <div class="nodejs-method">
                        <h5>🪟 官方安装包（推荐）</h5>
                        <p class="method-desc">下载官方安装包，傻瓜式安装</p>
                        <div class="install-steps">
                          <ol>
                            <li>访问 <a href="https://nodejs.org" target="_blank" class="link-primary">https://nodejs.org</a></li>
                            <li>下载LTS版本（长期支持版本）</li>
                            <li>运行下载的.msi文件</li>
                            <li>按照安装向导完成安装</li>
                          </ol>
                        </div>

                      </div>
                    </ElTabPane>

                    <!-- macOS Node.js安装 -->
                    <ElTabPane label="macOS" name="macos-node">
                      <div class="nodejs-method">
                        <h5>🍎 官方安装包</h5>
                        <p class="method-desc">下载官方pkg包安装</p>
                        <div class="install-steps">
                          <ol>
                            <li>访问 <a href="https://nodejs.org" target="_blank" class="link-primary">https://nodejs.org</a></li>
                            <li>下载LTS版本的.pkg文件</li>
                            <li>双击运行安装包</li>
                            <li>按照安装向导完成安装</li>
                          </ol>
                        </div>

                        <h5 class="mt-4">🍺 Homebrew安装（推荐）</h5>
                        <p class="method-desc">使用macOS包管理器</p>
                        <div class="code-block">
                          <div class="code-header">
                            <span>Terminal</span>
                            <ElButton size="small" @click="copyToClipboard('brew install node')">复制</ElButton>
                          </div>
                          <pre><code>brew install node</code></pre>
                        </div>
                      </div>
                    </ElTabPane>

                    <!-- Linux Node.js安装 -->
                    <ElTabPane label="Linux" name="linux-node">
                      <div class="nodejs-method">
                        <h5>📦 包管理器安装</h5>
                        <p class="method-desc">使用系统包管理器安装</p>

                        <div class="linux-distros">
                          <div class="distro-item">
                            <h6>Ubuntu/Debian:</h6>
                            <div class="code-block">
                              <div class="code-header">
                                <span>Terminal</span>
                                <ElButton size="small" @click="copyToClipboard('curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -\\nsudo apt-get install -y nodejs')">复制</ElButton>
                              </div>
                              <pre><code>curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs</code></pre>
                            </div>
                          </div>

                          <div class="distro-item">
                            <h6>CentOS/RHEL/Fedora:</h6>
                            <div class="code-block">
                              <div class="code-header">
                                <span>Terminal</span>
                                <ElButton size="small" @click="copyToClipboard('curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -\\nsudo yum install -y nodejs')">复制</ElButton>
                              </div>
                              <pre><code>curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs</code></pre>
                            </div>
                          </div>

                          <div class="distro-item">
                            <h6>Arch Linux:</h6>
                            <div class="code-block">
                              <div class="code-header">
                                <span>Terminal</span>
                                <ElButton size="small" @click="copyToClipboard('sudo pacman -S nodejs npm')">复制</ElButton>
                              </div>
                              <pre><code>sudo pacman -S nodejs npm</code></pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ElTabPane>
                  </ElTabs>
                </div>

                <!-- Node.js安装验证 -->
                <div class="nodejs-verification mt-4">
                  <h5>✅ 验证Node.js安装</h5>
                  <p class="text-muted mb-3">安装完成后，请运行以下命令确认安装成功：</p>

                  <div class="verification-steps">
                    <div class="verification-step">
                      <h6>1️⃣ 验证 Node.js 安装</h6>
                      <div class="code-block">
                        <div class="code-header">
                          <span>终端/命令提示符</span>
                          <ElButton size="small" @click="copyToClipboard('node --version')">复制</ElButton>
                        </div>
                        <pre><code>node --version</code></pre>
                      </div>
                      <div class="expected-output">
                        <p><strong>期望输出：</strong> <code>v18.x.x</code> 或更高版本</p>
                      </div>
                    </div>

                    <div class="verification-step">
                      <h6>2️⃣ 验证 NPM 安装</h6>
                      <div class="code-block">
                        <div class="code-header">
                          <span>终端/命令提示符</span>
                          <ElButton size="small" @click="copyToClipboard('npm --version')">复制</ElButton>
                        </div>
                        <pre><code>npm --version</code></pre>
                      </div>
                      <div class="expected-output">
                        <p><strong>期望输出：</strong> <code>9.x.x</code> 或更高版本</p>
                      </div>
                    </div>
                  </div>

                  <div class="nodejs-troubleshooting mt-3">
                    <h6>🔧 常见问题</h6>
                    <div class="troubleshooting-items">
                      <div class="troubleshooting-item">
                        <strong>❌ 命令未找到：</strong>
                        <ul>
                          <li>重新启动终端/命令提示符</li>
                          <li>Windows用户可能需要重启计算机</li>
                          <li>确认安装路径已添加到系统PATH环境变量</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ElCard>

            <!-- 安装方法选择 -->
            <ElCard class="mb-4">
              <template #header>
                <h4>🚀 Claude Code安装方法</h4>
              </template>
              <div class="install-methods">
                <div class="method-tabs">
                  <ElTabs v-model="installMethod" type="card">
                    <!-- NPM安装 -->
                    <ElTabPane label="NPM 安装（推荐）" name="npm">
                      <div class="install-content">
                        <p class="text-muted mb-3">适用于所有支持Node.js的系统，安装简单快速</p>
                        <div class="code-block">
                          <div class="code-header">
                            <span>Terminal / 命令提示符</span>
                            <ElButton size="small" @click="copyToClipboard('npm install -g @anthropic-ai/claude-code')">复制</ElButton>
                          </div>
                          <pre><code>npm install -g @anthropic-ai/claude-code</code></pre>
                        </div>
                        <div class="install-note">
                          <p><strong>📝 注意：</strong></p>
                          <ul>
                            <li>需要先安装 Node.js 18 或更高版本</li>
                            <li>在某些系统上可能需要管理员权限（sudo）</li>
                          </ul>
                        </div>
                      </div>
                    </ElTabPane>

                    <!-- Windows安装 -->
                    <ElTabPane label="Windows" name="windows">
                      <div class="install-content">
                        <p class="text-muted mb-3">Windows系统专用安装方法</p>

                        <div class="os-method mb-4">
                          <h5>🔵 PowerShell 安装（推荐）</h5>
                          <div class="code-block">
                            <div class="code-header">
                              <span>PowerShell（以管理员身份运行）</span>
                              <ElButton size="small" @click="copyToClipboard('irm https://claude.ai/install.ps1 | iex')">复制</ElButton>
                            </div>
                            <pre><code>irm https://claude.ai/install.ps1 | iex</code></pre>
                          </div>
                        </div>

                        <div class="os-method">
                          <h5>⬛ 命令提示符 (CMD)</h5>
                          <div class="code-block">
                            <div class="code-header">
                              <span>命令提示符（以管理员身份运行）</span>
                              <ElButton size="small" @click="copyToClipboard('curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd')">复制</ElButton>
                            </div>
                            <pre><code>curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd</code></pre>
                          </div>
                        </div>

                        <div class="install-note">
                          <p><strong>💡 Windows 小贴士：</strong></p>
                          <ul>
                            <li>右键点击 PowerShell 或 CMD，选择"以管理员身份运行"</li>
                            <li>如果遇到执行策略问题，先运行：<code>Set-ExecutionPolicy RemoteSigned</code></li>
                            <li>安装完成后重启终端以使用 <code>claude</code> 命令</li>
                          </ul>
                        </div>
                      </div>
                    </ElTabPane>

                    <!-- macOS安装 -->
                    <ElTabPane label="macOS" name="macos">
                      <div class="install-content">
                        <p class="text-muted mb-3">macOS系统专用安装方法</p>

                        <div class="os-method">
                          <h5>🍎 一键安装脚本</h5>
                          <div class="code-block">
                            <div class="code-header">
                              <span>Terminal</span>
                              <ElButton size="small" @click="copyToClipboard('curl -fsSL https://claude.ai/install.sh | bash')">复制</ElButton>
                            </div>
                            <pre><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
                          </div>
                        </div>

                        <div class="install-note">
                          <p><strong>🍎 macOS 小贴士：</strong></p>
                          <ul>
                            <li>打开 Terminal（终端）应用程序</li>
                            <li>如果提示权限问题，可能需要在命令前加 <code>sudo</code></li>
                            <li>首次运行可能会触发 macOS 安全提示，请允许执行</li>
                            <li>如果使用 Homebrew，也可以通过包管理器安装</li>
                          </ul>
                        </div>
                      </div>
                    </ElTabPane>

                    <!-- Linux安装 -->
                    <ElTabPane label="Linux" name="linux">
                      <div class="install-content">
                        <p class="text-muted mb-3">Linux系统专用安装方法</p>

                        <div class="os-method">
                          <h5>🐧 一键安装脚本</h5>
                          <div class="code-block">
                            <div class="code-header">
                              <span>Terminal</span>
                              <ElButton size="small" @click="copyToClipboard('curl -fsSL https://claude.ai/install.sh | bash')">复制</ElButton>
                            </div>
                            <pre><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
                          </div>
                        </div>

                        <div class="install-note">
                          <p><strong>🐧 Linux 小贴士：</strong></p>
                          <ul>
                            <li>大多数发行版都支持该安装脚本</li>
                            <li>如果需要管理员权限，在命令前加 <code>sudo</code></li>
                            <li>确保已安装 <code>curl</code> 或 <code>wget</code></li>
                            <li>安装完成后可能需要重新加载 shell 配置：<code>source ~/.bashrc</code></li>
                          </ul>
                        </div>
                      </div>
                    </ElTabPane>
                  </ElTabs>
                </div>

                <!-- Claude Code安装验证 -->
                <div class="claude-verification mt-4">
                  <h5>✅ 验证Claude Code安装</h5>
                  <p class="text-muted mb-3">安装完成后，请运行以下命令确认Claude Code安装成功：</p>

                  <div class="verification-steps">
                    <div class="verification-step">
                      <h6>1️⃣ 验证 Claude Code 安装</h6>
                      <div class="code-block">
                        <div class="code-header">
                          <span>终端/命令提示符</span>
                          <ElButton size="small" @click="copyToClipboard('claude --version')">复制</ElButton>
                        </div>
                        <pre><code>claude --version</code></pre>
                      </div>
                      <div class="expected-output">
                        <p><strong>期望输出：</strong> Claude Code版本信息</p>
                      </div>
                    </div>

                    <div class="verification-step">
                      <h6>2️⃣ 测试 Claude Code 功能</h6>
                      <div class="code-block">
                        <div class="code-header">
                          <span>终端/命令提示符</span>
                          <ElButton size="small" @click="copyToClipboard('claude /help')">复制</ElButton>
                        </div>
                        <pre><code>claude /help</code></pre>
                      </div>
                      <div class="expected-output">
                        <p><strong>期望输出：</strong> Claude Code帮助信息和可用命令列表</p>
                      </div>
                    </div>
                  </div>

                  <div class="claude-troubleshooting mt-3">
                    <h6>🔧 常见问题</h6>
                    <div class="troubleshooting-items">
                      <div class="troubleshooting-item">
                        <strong>❌ 命令未找到：</strong>
                        <ul>
                          <li>重新启动终端/命令提示符</li>
                          <li>确认安装路径已添加到系统PATH环境变量</li>
                          <li>Windows用户可能需要重启计算机</li>
                        </ul>
                      </div>
                      <div class="troubleshooting-item">
                        <strong>❌ 权限错误：</strong>
                        <ul>
                          <li>使用管理员权限运行终端</li>
                          <li>Linux/macOS用户可能需要使用 <code>sudo</code></li>
                        </ul>
                      </div>
                      <div class="troubleshooting-item">
                        <strong>❌ 版本过低：</strong>
                        <ul>
                          <li>运行 <code>npm update -g @anthropic-ai/claude-code</code> 更新Claude Code</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ElCard>


            <!-- 使用指南 -->
            <ElCard class="mb-4">
              <template #header>
                <h4>📚 快速使用指南</h4>
              </template>
              <div class="usage-guide">
                <!-- 使用步骤 -->
                <div class="usage-steps mt-2">
                  <h5>🚀 开始使用步骤</h5>
                  <p class="text-muted mb-2">按照以下步骤快速开始使用 Claude Code：</p>

                  <div class="code-block">
                    <div class="code-header">
                      <span>完整使用流程</span>
                      <ElButton size="small" @click="copyToClipboard('# 1. 导航到您的项目文件夹\ncd /path/to/your/project\n\n# 2. 用 claude 命令启动 Claude Code\nclaude\n\n# 3. 配置 API 密钥（从API密钥一览页面下载配置文件）\n# 配置文件路径：~/.claude/settings.json')">复制</ElButton>
                    </div>
                    <pre><code># 1. 导航到您的项目文件夹
cd /path/to/your/project

# 2. 用 claude 命令启动 Claude Code
claude

# 3. 配置 API 密钥（配置文件可从API密钥一览页面下载，解压缩放到下面的指定路径以后，用/exit命令从cluade code退出，然后重新启动claude code）
# 配置文件路径：~/.claude/settings.json,~/.claude/config.json</code></pre>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <h5>🎯 基本命令</h5>
                    <div class="command-list">
                      <div class="command-item">
                        <code>claude</code>
                        <span>启动交互式会话</span>
                      </div>
                      <div class="command-item">
                        <code>claude "任务描述"</code>
                        <span>执行一次性任务</span>
                      </div>
                      <div class="command-item">
                        <code>claude commit</code>
                        <span>创建Git提交</span>
                      </div>
                      <div class="command-item">
                        <code>/help</code>
                        <span>显示帮助信息</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h5>💡 使用技巧</h5>
                    <ul class="tips-list">
                      <li>使用自然语言描述您的需求</li>
                      <li>将复杂任务拆分为多个步骤</li>
                      <li>使用 Tab 键进行命令补全</li>
                      <li>按 ↑ 键查看命令历史</li>
                      <li>在项目目录中运行获得最佳效果</li>
                    </ul>
                  </div>
                </div>
                </div>
              </div>
            </ElCard>

            <!-- 示例使用 -->
            <ElCard>
              <template #header>
                <h4>🌟 示例使用</h4>
              </template>
              <div class="examples">
                <p class="text-muted mb-3">以下是一些常见的使用示例：</p>
                <div class="example-list">
                  <div class="example-item">
                    <div class="example-command">
                      <code>"这个项目是做什么的？"</code>
                    </div>
                    <div class="example-desc">了解项目概况</div>
                  </div>
                  <div class="example-item">
                    <div class="example-command">
                      <code>"添加一个hello world函数"</code>
                    </div>
                    <div class="example-desc">生成代码</div>
                  </div>
                  <div class="example-item">
                    <div class="example-command">
                      <code>"修复这个bug"</code>
                    </div>
                    <div class="example-desc">调试和修复</div>
                  </div>
                  <div class="example-item">
                    <div class="example-command">
                      <code>"提交我的更改"</code>
                    </div>
                    <div class="example-desc">Git操作</div>
                  </div>
                </div>
              </div>
            </ElCard>

            <!-- VS Code插件安装 -->
            <ElCard class="mb-4">
              <template #header>
                <h4>🔌 VS Code插件安装</h4>
              </template>
              <div class="vscode-install-content">
                <p class="text-muted mb-3">如果您使用Visual Studio Code，可以安装Claude Code插件获得更好的开发体验</p>

                <div class="vscode-methods">
                  <h5>方法一：通过VS Code扩展市场安装（推荐）</h5>
                  <div class="install-steps">
                    <ol>
                      <li>打开Visual Studio Code</li>
                      <li>点击左侧的扩展图标（或按 Ctrl+Shift+X）</li>
                      <li>在搜索框中输入 "Claude Code"</li>
                      <li>找到由 Anthropic 开发的 Claude Code 插件</li>
                      <li>点击"安装"按钮</li>
                    </ol>
                  </div>

                  <h5 class="mt-4">方法二：通过命令行安装</h5>
                  <div class="code-block">
                    <div class="code-header">
                      <span>Terminal</span>
                      <ElButton size="small" @click="copyToClipboard('code --install-extension anthropic.claude-code')">复制</ElButton>
                    </div>
                    <pre><code>code --install-extension anthropic.claude-code</code></pre>
                  </div>

                  <h5 class="mt-4">方法三：通过VS Code快速打开</h5>
                  <div class="code-block">
                    <div class="code-header">
                      <span>Terminal</span>
                      <ElButton size="small" @click="copyToClipboard('code --install-extension anthropic.claude-code')">复制</ElButton>
                    </div>
                    <pre><code>code --install-extension anthropic.claude-code</code></pre>
                  </div>

                  <div class="install-note">
                    <p><strong>💡 VS Code 插件小贴士：</strong></p>
                    <ul>
                      <li>安装完成后需要重启 VS Code</li>
                      <li>确保已安装 Claude Code CLI 工具</li>
                      <li>在 VS Code 中按 Ctrl+Shift+P 打开命令面板，输入 "Claude" 查看可用命令</li>
                      <li>插件会自动检测项目中的 Claude Code 配置</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 订阅一览 -->
          <div v-if="activeTab === 'packages'" class="tab-content">
            <h2 class="mb-4">订阅一览</h2>
            <div class="packages-content">
              <div class="packages-header mb-4">
                <p class="text-muted">选择最适合您的订阅计划，每日10000积分，支持每天重置一次</p>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <ElCard class="package-card">
                    <template #header>
                      <div class="package-header">
                        <h4>一日体验卡</h4>
                        <div class="package-price">
                          <span class="price">¥9.8</span>
                          <span class="period">/日</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 24小时有效期</li>
                        <li>✓ 每日10000积分</li>
                        <li>✓ 支持每天重置一次</li>
                        <li>✓ 即买即用</li>
                        <li>✓ 适合短期试用</li>
                      </ul>
                      <ElButton type="primary" class="package-btn" @click="handleDayCardClick">立即购买</ElButton>
                    </div>
                  </ElCard>
                </div>

                <div class="col-md-4">
                  <ElCard class="package-card">
                    <template #header>
                      <div class="package-header">
                        <h4>七日行</h4>
                        
                        <div class="package-price">
                          <span class="price">¥49.8</span>
                          <span class="period">/周</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 7天有效期 (168小时)</li>
                        <li>✓ 每日10000积分</li>
                        <li>✓ 支持每天重置一次</li>
                        <li>✓ 性价比超值</li>
                        <li>✓ 适合中短期项目</li>
                      </ul>
                      <ElButton type="primary" class="package-btn" @click="handleWeekCardClick">立即购买</ElButton>
                    </div>
                  </ElCard>
                </div>

                <div class="col-md-4">
                  <ElCard class="package-card featured">
                    <template #header>
                      <div class="package-header">
                        <h4>月享卡</h4>
                        <div class="package-badge">推荐</div>
                        <div class="package-price">
                          <span class="price">¥199</span>
                          <span class="period">/月</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 30天有效期 (720小时)</li>
                        <li>✓ 每日10000积分</li>
                        <li>✓ 支持每天重置一次</li>
                        <li>✓ 最超值选择</li>
                        <li>✓ 适合长期使用</li>
                        <li>✓ 专属客服支持</li>
                      </ul>
                      <ElButton type="primary" class="package-btn" @click="handleMonthCardClick">立即购买</ElButton>
                    </div>
                  </ElCard>
                </div>
              </div>

              <div class="packages-notice mt-4">
                <ElCard>
                  <div class="notice-content">
                    <h5>💡 订阅说明</h5>
                    <p class="text-muted">
                      • 日卡：适合临时使用和功能体验<br>
                      • 周卡：适合短期项目开发和测试<br>
                      • 月卡：适合长期开发和持续使用<br>
                      • 所有计划均提供每日10000积分，每天可重置一次<br>
                      • 购买后不生效，激活后才开始生效计时。
                    </p>
                  </div>
                </ElCard>
              </div>
            </div>
          </div>


          <!-- 推广计划 -->
          <PromotionPlan
            v-if="activeTab === 'promotion'"
            @get-promotion-link="handleGetPromotionLink"
            @view-promotion-rules="handleViewPromotionRules"
          />

          <!-- 使用履历 -->
          <div v-if="activeTab === 'usage-history'" class="tab-content">
            <div class="usage-history-section">
              <!-- 返回按钮 -->
              <div class="usage-header mb-4">
                <ElButton @click="activeTab = 'keys'" type="text" class="back-btn">
                  <ElIcon><ElIconArrowLeft /></ElIcon>
                  返回API密钥管理
                </ElButton>
                <h2>使用履历</h2>
              </div>

              <!-- API Key基本信息 -->
              <ElCard class="mb-4" v-if="selectedApiKey">
                <template #header>
                  <h4>
                    <ElIcon><ElIconKey /></ElIcon>
                    API密钥信息
                  </h4>
                </template>
                <ElDescriptions :column="2" border>
                  <ElDescriptionsItem label="订阅名称">
                    {{ selectedApiKey.package_name || '未知订阅' }}
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="API密钥">
                    <code class="api-key-display">{{ maskApiKey(selectedApiKey.api_key) }}</code>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="状态">
                    <ElTag :type="selectedApiKey.is_active ? 'success' : 'danger'">
                      {{ selectedApiKey.is_active ? '激活' : '禁用' }}
                    </ElTag>
                  </ElDescriptionsItem>
                  <ElDescriptionsItem label="激活时间">
                    {{ formatDate(selectedApiKey.activation_date) }}
                  </ElDescriptionsItem>
                </ElDescriptions>
              </ElCard>

              <!-- 使用记录 -->
              <ElCard>
                <template #header>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="records-header-info">
                      <h4>
                        <ElIcon><ElIconList /></ElIcon>
                        使用记录
                      </h4>
                      <div class="total-requests-badge">
                        <div class="badge-content">
                          <span class="badge-icon">
                            <ElIcon><ElIconTrendCharts /></ElIcon>
                          </span>
                          <div class="badge-text">
                            <span class="badge-label">总请求次数</span>
                            <span class="badge-value">{{ usageStats.total_requests || 0 }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ElButton @click="refreshUsageRecords" :loading="loadingUsageRecords">
                      <ElIcon><ElIconRefresh /></ElIcon>
                      刷新
                    </ElButton>
                  </div>
                </template>


                <div v-if="loadingUsageRecords" class="text-center py-4">
                  <ElSkeleton :rows="5" animated />
                </div>

                <div v-else>
                  <ElTable :data="usageRecords" style="width: 100%">
                    <ElTableColumn prop="service" label="服务类型" width="200">
                      <template #default="scope">
                        <ElTag type="info" size="small">
                          {{ scope.row.service }}
                        </ElTag>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn prop="credits_used" label="积分消耗" width="100">
                      <template #default="scope">
                        {{ scope.row.credits_used || 0 }}
                      </template>
                    </ElTableColumn>
                    <ElTableColumn prop="remaining_credits" label="剩余积分" width="120">
                      <template #default="scope">
                        <span v-if="scope.row.remaining_credits !== null && scope.row.remaining_credits !== undefined"
                              :class="getUsageRecordRemainingCreditsClass(scope.row.remaining_credits)">
                          {{ scope.row.remaining_credits }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn prop="response_status" label="响应状态" width="100">
                      <template #default="scope">
                        <ElTag :type="scope.row.response_status === 'success' ? 'success' : 'danger'" size="small">
                          {{ scope.row.response_status === 'success' ? '成功' : '失败' }}
                        </ElTag>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn prop="request_timestamp" label="请求时间" width="180">
                      <template #default="scope">
                        {{ formatDate(scope.row.request_timestamp) }}
                      </template>
                    </ElTableColumn>
                  </ElTable>

                  <!-- 分页 -->
                  <div v-if="usageRecords.length > 0" class="pagination-wrapper">
                    <ElPagination
                      v-model:current-page="usagePagination.current"
                      v-model:page-size="usagePagination.size"
                      :page-sizes="[10, 20, 50]"
                      :total="usagePagination.total"
                      layout="total, sizes, prev, pager, next, jumper"
                      @size-change="handleUsageSizeChange"
                      @current-change="handleUsagePageChange"
                    />
                  </div>
                </div>
              </ElCard>
            </div>
          </div>

          <!-- 重置积分确认弹窗 -->
          <ResetCreditsDialog
            v-model="resetCreditsDialogVisible"
            :key-data="resetCreditsKey"
            :loading="resettingCredits"
            @confirm="confirmResetCredits"
            @cancel="handleResetCreditsCancel"
          />

          <!-- 资料中心 -->
          <ResourcesCenter
            v-if="activeTab === 'resources'"
            @go-to-best-practices="goToClaudeCodeBestPractices"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElIcon,
  ElProgress,
  ElMessage,
  ElSkeleton,
  ElPagination,
  ElTabs,
  ElTabPane,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'
import ResetCreditsDialog from '../components/ResetCreditsDialog.vue'
import ResourcesCenter from '../components/ResourcesCenter.vue'
import PromotionPlan from '../components/PromotionPlan.vue'
import PCSidebar from '../components/dashboard/PCSidebar.vue'
import {
  Key as ElIconKey,
  Plus as ElIconPlus,
  Refresh as ElIconRefresh,
  CopyDocument as ElIconCopyDocument,
  VideoPlay as ElIconVideoPlay,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading,
  ArrowLeft as ElIconArrowLeft
} from '@element-plus/icons-vue'
import request from '../utils/request'
import '../styles/dashboard/index.css'

const router = useRouter()

interface ApiKey {
  id?: string
  user_key_id: string
  key_name: string
  api_key: string
  is_active: boolean
  usage_count?: number
  last_used_at?: string
  created_at: string
  package_name?: string
  activation_date?: string
  expire_date?: string
  remaining_days?: number
  status?: string
  total_credits?: number
  remaining_credits?: number
}

const activeTab = ref('keys')
const apiKeys = ref<ApiKey[]>([])
const filteredKeys = ref<ApiKey[]>([])
const loadingKeys = ref(false)
const selectedApiKey = ref<ApiKey | null>(null)
const showMobileSidebar = ref(false)

// 重置积分弹窗相关
const resetCreditsDialogVisible = ref(false)
const resettingCredits = ref(false)
const resetCreditsKey = ref<ApiKey | null>(null)

const keyStats = reactive({
  active: 0
})


const keyPagination = reactive({
  current: 1,
  size: 10
})

const planInfo = reactive({
  has_active_plan: false,
  plan_type: '免费套餐',
  credits_remaining: 0,
  total_credits: 0,
  usage_percentage: 0
})

const installMethod = ref('npm')
const nodeInstallMethod = ref('windows-node')

// 使用履历相关数据
const usageStats = reactive({
  total_requests: 0,
  total_tokens: 0,
  total_credits_used: 0,
  unique_services: 0
})

const usageRecords = ref<any[]>([])
const availableServices = ref<string[]>([])
const loadingUsageStats = ref(false)
const loadingUsageRecords = ref(false)


const usagePagination = reactive({
  current: 1,
  size: 20,
  total: 0
})




const loadUserKeys = async () => {
  try {
    loadingKeys.value = true
    const response: any = await request.get('/api/v1/keys/')
    apiKeys.value = response.keys || []

    // 更新统计数据
    keyStats.active = apiKeys.value.filter(k => k.status === 'active').length

    filteredKeys.value = apiKeys.value
  } catch (error) {
    console.error('获取密钥列表失败:', error)
    ElMessage.error('获取密钥列表失败')
  } finally {
    loadingKeys.value = false
  }
}

const loadPlanStatus = async () => {
  try {
    const response = await request.get('/api/v1/keys/plan-status')
    Object.assign(planInfo, response.data)
  } catch (error) {
    console.error('获取套餐状态失败:', error)
    // 设置默认值确保页面能正常显示
    Object.assign(planInfo, {
      has_active_plan: false,
      plan_type: '无订阅',
      credits_remaining: 0,
      total_credits: 0,
      usage_percentage: 0
    })
    // 不显示错误提示，避免对没有API key的用户造成困扰
  }
}

// 已删除禁用/启用按钮，此函数暂时保留
// const toggleKeyStatus = async (key: any) => {
//   try {
//     await request.put(`/api/v1/keys/${key.id}/toggle`)
//     key.is_active = !key.is_active
//     ElMessage.success(`密钥已${key.is_active ? '启用' : '禁用'}`)
//   } catch (error) {
//     ElMessage.error('操作失败')
//   }
// }


const getProgressColor = (percentage: number) => {
  if (percentage > 50) return '#67c23a'  // 剩余积分多，绿色
  if (percentage > 20) return '#e6a23c'  // 剩余积分中等，橙色
  return '#f56c6c'  // 剩余积分少，红色
}

// 获取状态对应的标签类型
const getStatusType = (status?: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'expired':
      return 'danger'
    case 'inactive':
    default:
      return 'warning'
  }
}

// 获取状态对应的文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'active':
      return '激活'
    case 'expired':
      return '过期'
    case 'inactive':
    default:
      return '未激活'
  }
}

// 获取剩余天数的样式类
const getRemainingDaysClass = (days?: number) => {
  if (days === undefined || days === null) return 'text-muted'
  if (days <= 3) {
    return 'text-danger fw-bold'
  } else if (days <= 7) {
    return 'text-warning fw-bold'
  }
  return 'text-success'
}

// 获取剩余积分的样式类
const getRemainingCreditsClass = (remainingCredits?: number, totalCredits?: number) => {
  if (remainingCredits === undefined || totalCredits === undefined) return 'text-muted'
  if (!totalCredits || totalCredits <= 0) {
    return 'text-muted'
  }

  const percentage = (remainingCredits / totalCredits) * 100

  if (percentage <= 10) {
    return 'text-danger fw-bold'
  } else if (percentage <= 30) {
    return 'text-warning fw-bold'
  }
  return 'text-success'
}

// 获取使用记录剩余积分样式类（仅基于剩余积分值）
const getUsageRecordRemainingCreditsClass = (remainingCredits: number) => {
  if (remainingCredits <= 0) return 'text-danger'
  if (remainingCredits <= 10) return 'text-warning'
  return 'text-success'
}



// 检查是否可以重置积分
const canResetCredits = (key: any) => {
  // 检查是否有总积分设置
  if (!key.total_credits || key.total_credits <= 0) {
    return false
  }

  // 检查状态是否为激活
  if (key.status !== 'active') {
    return false
  }

  // 这里可以添加更多检查逻辑，比如今天是否已重置过
  // 但由于前端无法准确判断，主要依赖后端验证
  return true
}

// 重置积分 - 打开确认弹窗
const resetCredits = (key: any) => {
  resetCreditsKey.value = key
  resetCreditsDialogVisible.value = true
}

// 确认重置积分
const confirmResetCredits = async () => {
  if (!resetCreditsKey.value) return

  try {
    resettingCredits.value = true

    // 检查key对象是否有有效的ID
    const keyId = resetCreditsKey.value.id || resetCreditsKey.value.user_key_id
    if (!keyId) {
      ElMessage.error('密钥ID无效，无法重置积分')
      return
    }

    console.log('重置积分请求 - 密钥ID:', keyId)
    const response = await request.put(`/api/v1/keys/${keyId}/reset-credits`)
    console.log('重置积分响应:', response)

    // 重新加载密钥列表以更新显示
    await loadUserKeys()

    // 安全地访问响应数据
    const message = response?.data?.message || '积分重置成功'
    ElMessage.success(message)

    // 关闭弹窗
    resetCreditsDialogVisible.value = false
    resetCreditsKey.value = null
  } catch (error: any) {
    console.error('重置积分失败:', error)

    // 改进错误处理
    let message = '重置失败'
    if (error?.response?.data?.detail) {
      message = error.response.data.detail
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    ElMessage.error(message)
  } finally {
    resettingCredits.value = false
  }
}

// 处理重置积分取消
const handleResetCreditsCancel = () => {
  resetCreditsKey.value = null
}

// 处理获取推广链接
const handleGetPromotionLink = () => {
  ElMessage.info('推广计划功能即将上线，敬请期待！')
}

// 处理查看推广规则
const handleViewPromotionRules = () => {
  ElMessage.info('推广规则功能即将上线，敬请期待！')
}

// 下载设置文件
const downloadConfig = async (key: any) => {
  try {
    // 检查key对象是否有有效的ID
    const keyId = key.id || key.user_key_id
    if (!keyId) {
      ElMessage.error('密钥ID无效，无法下载配置')
      return
    }

    console.log('下载配置请求 - 密钥ID:', keyId)
    const response: any = await request.get(`/api/v1/keys/${keyId}/download-config`)
    console.log('下载配置响应:', response)

    if (response.config && response.filename) {
      // 创建 settings.json
      const settingsBlob = new Blob([JSON.stringify(response.config, null, 2)], {
        type: 'application/json'
      })

      // 创建 config.json - 基于 settings_template.json 的结构
      const configData = {
        primaryApiKey: key.api_key
      }
      const configBlob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      })

      // 创建ZIP文件
      const zip = new JSZip()
      zip.file('settings.json', settingsBlob)
      zip.file('config.json', configBlob)

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({type: 'blob'})

      // 创建下载链接
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'claude-code-config.zip'
      document.body.appendChild(a)
      a.click()

      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      ElMessage.success('配置文件下载成功，包含 settings.json 和 config.json')
    } else {
      ElMessage.error('下载失败：响应数据格式错误')
    }
  } catch (error: any) {
    console.error('下载配置失败:', error)

    // 改进错误处理
    let message = '下载设置文件失败'
    if (error?.response?.data?.detail) {
      message = error.response.data.detail
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    ElMessage.error(message)
  }
}

// 新增的密钥管理方法
const refreshKeys = () => {
  loadUserKeys()
}

const goToClaudeCodeBestPractices = () => {
  router.push('/claude-code-best-practices')
}

// 处理订阅卡片点击事件
const handleDayCardClick = () => {
  // 跳转到日卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}

const handleWeekCardClick = () => {
  // 跳转到周卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}

const handleMonthCardClick = () => {
  // 跳转到月卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}


const maskApiKey = (apiKey: string) => {
  if (!apiKey) return '-'
  if (apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
}

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey)
    ElMessage.success('API密钥已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const viewUsageHistory = (key: any) => {
  // 在同一页面切换到使用履历标签
  activeTab.value = 'usage-history'
  selectedApiKey.value = key

  // 加载使用履历数据
  loadUsageStats()
  loadUsageRecords()
  loadAvailableServices()
}

// 已删除详情按钮，此函数暂时保留
// const viewKeyDetails = (key: any) => {
//   ElMessageBox.alert(
//     `
//     <div>
//       <p><strong>订阅名称:</strong> ${key.package_name || '未知订阅'}</p>
//       <p><strong>API密钥:</strong> ${key.api_key}</p>
//       <p><strong>状态:</strong> ${key.is_active ? '激活' : '禁用'}</p>
//       <p><strong>激活时间:</strong> ${formatDate(key.activation_date)}</p>
//       <p><strong>最后使用:</strong> ${key.last_used_at ? formatDate(key.last_used_at) : '从未使用'}</p>
//     </div>
//     `,
//     '密钥详情',
//     {
//       dangerouslyUseHTMLString: true,
//       confirmButtonText: '关闭'
//     }
//   )
// }

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}


const handleKeyPageChange = (page: number) => {
  keyPagination.current = page
}

const handleKeySizeChange = (size: number) => {
  keyPagination.size = size
  keyPagination.current = 1
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 使用履历相关方法
const loadUsageStats = async () => {
  if (!selectedApiKey.value) return

  try {
    loadingUsageStats.value = true
    const params: any = {}

    const response: any = await request.get(`/api/v1/usage/stats`, {
      params: {
        api_key: selectedApiKey.value.api_key,
        ...params
      }
    })
    Object.assign(usageStats, response)
  } catch (error) {
    console.error('加载使用统计失败:', error)
    ElMessage.error('加载使用统计失败')
  } finally {
    loadingUsageStats.value = false
  }
}

const loadUsageRecords = async () => {
  if (!selectedApiKey.value) return

  try {
    loadingUsageRecords.value = true
    const params: any = {
      api_key: selectedApiKey.value.api_key,
      page: usagePagination.current,
      page_size: usagePagination.size
    }



    const response: any = await request.get('/api/v1/usage/history', { params })
    usageRecords.value = response.records || []
    usagePagination.total = response.total || 0
  } catch (error) {
    console.error('加载使用记录失败:', error)
    ElMessage.error('加载使用记录失败')
  } finally {
    loadingUsageRecords.value = false
  }
}

const loadAvailableServices = async () => {
  if (!selectedApiKey.value) return

  try {
    const response: any = await request.get('/api/v1/usage/services', {
      params: { api_key: selectedApiKey.value.api_key }
    })
    availableServices.value = response || []
  } catch (error) {
    console.error('加载服务类型失败:', error)
  }
}

// 移动端设置激活标签
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  showMobileSidebar.value = false
}

// 获取当前标签页标题
const getCurrentTabTitle = () => {
  const titles: Record<string, string> = {
    'keys': 'API密钥',
    'getting-started': '安装Claude Code',
    'packages': '订阅一览',
    'promotion': '推广计划',
    'resources': '资料中心',
    'usage-history': '使用履历'
  }
  return titles[activeTab.value] || '控制台'
}

const refreshUsageRecords = () => {
  loadUsageRecords()
}


const handleUsagePageChange = (page: number) => {
  usagePagination.current = page
  loadUsageRecords()
}

const handleUsageSizeChange = (size: number) => {
  usagePagination.size = size
  usagePagination.current = 1
  loadUsageRecords()
}

// 处理标签页切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

onMounted(() => {
  loadUserKeys()
  loadPlanStatus()

  // 检查URL参数中的tab参数
  const urlParams = new URLSearchParams(window.location.search)
  const tabParam = urlParams.get('tab')
  if (tabParam && ['keys', 'getting-started', 'packages', 'promotion', 'resources'].includes(tabParam)) {
    activeTab.value = tabParam
  }
})
</script>

