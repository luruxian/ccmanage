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
        <div class="col-md-3 col-lg-2 sidebar d-none d-md-block">
          <div class="sidebar-content">
            <nav class="sidebar-nav">
              <a href="#" :class="['nav-item', { active: activeTab === 'getting-started' }]" @click="activeTab = 'getting-started'">
                <ElIcon><ElIconVideoPlay /></ElIcon>
                安装Claude Code
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'keys' || activeTab === 'usage-history' }]" @click="activeTab = 'keys'">
                <ElIcon><ElIconKey /></ElIcon>
                API密钥
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'packages' }]" @click="activeTab = 'packages'">
                <ElIcon><ElIconList /></ElIcon>
                订阅一览
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'promotion' }]" @click="activeTab = 'promotion'">
                <ElIcon><ElIconTrendCharts /></ElIcon>
                推广计划
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'resources' }]" @click="activeTab = 'resources'">
                <ElIcon><ElIconReading /></ElIcon>
                资料中心
              </a>
            </nav>
          </div>
        </div>

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

# 3. 配置 API 密钥（配置文件可从API密钥一览页面下载，放到下面的指定路径以后，用/exit命令从cluade code退出，然后重新启动claude code）
# 配置文件路径：~/.claude/settings.json</code></pre>
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
          <div v-if="activeTab === 'promotion'" class="tab-content">
            <h2 class="mb-4">推广计划</h2>
            <ElCard>
              <div class="promotion-content">
                <div class="promotion-header">
                  <h3>邀请好友，共享收益</h3>
                  <p class="text-muted">通过推广计划获得更多收益和优惠</p>
                </div>

                <div class="promotion-stats mt-4">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">0</div>
                        <div class="stat-label">邀请人数</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">¥0</div>
                        <div class="stat-label">累计收益</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">¥0</div>
                        <div class="stat-label">本月收益</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="promotion-actions mt-4">
                  <ElButton type="primary">获取推广链接</ElButton>
                  <ElButton type="default">查看推广规则</ElButton>
                </div>

                <div class="promotion-notice mt-4">
                  <p class="text-muted">
                    <small>
                      ⚠️ 推广计划功能即将上线，敬请期待！
                    </small>
                  </p>
                </div>
              </div>
            </ElCard>
          </div>

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
                    <ElTableColumn prop="service" label="服务类型" width="150">
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
                    <ElTableColumn prop="error_message" label="错误信息" min-width="200">
                      <template #default="scope">
                        <span v-if="scope.row.error_message" class="error-message">
                          {{ scope.row.error_message }}
                        </span>
                        <span v-else class="text-muted">-</span>
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
          <ElDialog
            v-model="resetCreditsDialogVisible"
            title="重置积分确认"
            width="500px"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            class="reset-credits-dialog"
          >
            <div class="dialog-content">
              <div class="dialog-icon">
                <div class="icon-wrapper">
                  <i class="fas fa-sync-alt"></i>
                </div>
              </div>
              <div class="dialog-text">
                <h3 class="dialog-title">确认重置积分</h3>
                <p class="dialog-subtitle">您即将重置以下订阅的积分</p>
                <div class="key-info">
                  <div class="info-item">
                    <span class="label">订阅名称：</span>
                    <span class="value">{{ resetCreditsKey?.package_name || '未知订阅' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">当前积分：</span>
                    <span class="value">{{ resetCreditsKey?.remaining_credits || 0 }} / {{ resetCreditsKey?.total_credits || 0 }}</span>
                  </div>
                </div>
                <div class="warning-note">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>重置后积分将恢复到总积分数量，每天只能重置一次！</span>
                </div>
              </div>
            </div>
            <template #footer>
              <div class="dialog-footer">
                <ElButton @click="resetCreditsDialogVisible = false" class="cancel-btn">
                  取消
                </ElButton>
                <ElButton
                  type="primary"
                  @click="confirmResetCredits"
                  :loading="resettingCredits"
                  class="confirm-btn"
                >
                  {{ resettingCredits ? '重置中...' : '确认重置' }}
                </ElButton>
              </div>
            </template>
          </ElDialog>

          <!-- 资料中心 -->
          <div v-if="activeTab === 'resources'" class="tab-content">
            <h2 class="mb-4">资料中心</h2>
            <div class="row">
              <div class="col-md-12">
                <ElCard class="resource-card">
                  <template #header>
                    <div class="resource-header">
                      <h4>📖 Claude Code最佳实践</h4>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>本文档翻译自 Anthropic 官方博客文章。<ElButton type="text" @click="goToClaudeCodeBestPractices">Claude Code最佳实践（中文翻译）</ElButton></p>
                    <p>官方原文： <a href="https://www.anthropic.com/engineering/claude-code-best-practices" target="_blank">Claude Code Best Practices（English）</a></p>
                  </div>
                </ElCard>
              </div>
            </div>

            <div class="resource-notice mt-4">
              <ElCard>
                <div class="notice-content">
                  <h5>📢 最新公告</h5>
                  <p class="text-muted">
                    欢迎使用Claude Code！我们正在不断完善产品功能，如有任何问题或建议，请随时联系我们。
                  </p>
                </div>
              </ElCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  ElDescriptionsItem,
  ElDialog
} from 'element-plus'
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
      // 创建Blob对象
      const blob = new Blob([JSON.stringify(response.config, null, 2)], {
        type: 'application/json'
      })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.filename
      document.body.appendChild(a)
      a.click()

      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      ElMessage.success('设置文件下载成功')
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

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  box-shadow: 4px 0 20px rgba(0,0,0,0.1);
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
}

.sidebar-content {
  padding: 40px 24px;
  position: relative;
  z-index: 1;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  margin-bottom: 8px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.sidebar-nav .nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.sidebar-nav .nav-item:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateX(4px);
}

.sidebar-nav .nav-item:hover::before {
  left: 100%;
}

.sidebar-nav .nav-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  border-color: #3b82f6;
}

.sidebar-nav .nav-item .el-icon {
  margin-right: 12px;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.sidebar-nav .nav-item:hover .el-icon {
  transform: scale(1.1);
}

.main-content {
  padding: 40px;
  background: transparent;
}

.main-content h2 {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0;
}

.el-card {
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  backdrop-filter: blur(10px);
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
}

.el-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
}



.plan-status {
  padding: 20px 0;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

/* 新增样式 */
.key-actions {
  display: flex;
  gap: 12px;
}

.key-actions .btn {
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.key-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
}

/* 密钥统计内联样式 */
.key-stats-inline {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
}

.stat-badge {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.stat-badge:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 14px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.stat-content .stat-number {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-content .stat-label {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.key-stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  text-align: center;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.key-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}

.key-stat-card .stat-number {
  font-size: 2.8rem;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.key-stat-card .stat-label {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 600;
}

.filter-row {
  align-items: center;
}

.empty-keys {
  text-align: center;
  padding: 80px 20px;
  color: #64748b;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  border: 2px dashed #e2e8f0;
  margin: 20px 0;
}

.empty-keys .empty-icon {
  font-size: 80px;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 20px;
}

.empty-keys h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 12px;
  color: #1e293b;
}

.empty-keys p {
  font-size: 1.1rem;
  margin-bottom: 24px;
  color: #64748b;
}

.empty-keys .btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 28px;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.empty-keys .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.key-name-cell {
  display: flex;
  flex-direction: column;
}

.key-id {
  font-size: 0.8rem;
  margin-top: 4px;
}

.api-key-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-text {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.usage-count {
  font-weight: 600;
  color: #409eff;
}

.last-used {
  color: #67c23a;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  font-size: 0.8rem;
  padding: 4px 8px;
}

/* 展开行样式 */
.expand-content {
  padding: 20px;
  background-color: #f8f9fa;
  border-left: 4px solid #007bff;
}

.credits-info {
  max-width: 600px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-label {
  font-weight: 500;
  color: #666;
  min-width: 80px;
}

.info-value {
  font-weight: 600;
}

.progress-section {
  margin-top: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-weight: 500;
  color: #333;
}

.progress-text {
  font-weight: 600;
  color: #666;
}

/* 自定义表格样式 */
.custom-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.header-row {
  display: flex;
  padding: 12px 16px;
  font-weight: 600;
  color: #909399;
  font-size: 14px;
}

.table-body {
  background-color: #fff;
}

.key-item {
  border-bottom: 2px solid #e9ecef;
  background-color: #ffffff;
}

.key-item:last-child {
  border-bottom: none;
}

.key-item:nth-child(even) {
  background-color: #f8f9fa;
}

.key-item:nth-child(even) .main-row,
.key-item:nth-child(even) .credits-row {
  background-color: #f8f9fa;
}

.key-item:nth-child(odd) .main-row,
.key-item:nth-child(odd) .credits-row {
  background-color: #ffffff;
}

.main-row {
  display: flex;
  padding: 12px 16px;
  align-items: center;
  min-height: 60px;
}

.credits-row {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.credits-content {
  padding: 12px 16px;
}

.credits-info-container {
  display: flex;
  align-items: center;
  gap: 30px;
  flex-wrap: wrap;
}

.credits-basic {
  display: flex;
  gap: 20px;
  align-items: center;
}

.credit-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.credit-label {
  font-weight: 500;
  color: #666;
  font-size: 14px;
}

.credit-value {
  font-weight: 600;
  font-size: 14px;
}

.credits-progress {
  flex: 1;
  min-width: 200px;
  max-width: 300px;
}

.progress-with-label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-with-label .progress-label {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  min-width: 60px;
}

.progress-with-label .el-progress {
  flex: 1;
}

.credits-progress .progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.credits-progress .progress-label {
  font-size: 13px;
  color: #666;
}

.credits-progress .progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 列宽度设置 */
.col-subscription {
  width: 160px;
  min-width: 160px;
}

.col-api-key {
  flex: 1;
  min-width: 220px;
}

.col-status {
  width: 90px;
  min-width: 90px;
}

.col-activation {
  width: 130px;
  min-width: 130px;
}

.col-expire {
  width: 130px;
  min-width: 130px;
}

.col-days {
  width: 100px;
  min-width: 100px;
}

.col-actions {
  width: 200px;
  min-width: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-row,
  .main-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .col-subscription,
  .col-api-key,
  .col-status,
  .col-activation,
  .col-expire,
  .col-days,
  .col-actions {
    width: 100%;
    margin-bottom: 8px;
  }

  .credits-info-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .credits-basic {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .credits-progress {
    width: 100%;
    max-width: none;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

/* 新增页面样式 */
.getting-started-content {
  padding: 20px 0;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.quick-start-steps {
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}

.step-content h4 {
  margin-bottom: 8px;
  color: #2c3e50;
}

.step-content p {
  margin: 0;
  color: #666;
}

.promotion-content {
  padding: 20px 0;
}

.promotion-header {
  text-align: center;
  margin-bottom: 30px;
}

.promotion-header h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.promotion-stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 16px;
  border-left: 4px solid #27ae60;
}

.promotion-stat-card .stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 8px;
}

.promotion-stat-card .stat-label {
  color: #666;
  font-size: 0.9rem;
}

.promotion-actions {
  text-align: center;
}

.promotion-actions .el-button {
  margin: 0 10px;
}

.promotion-notice {
  text-align: center;
  padding: 15px;
  background: #fff3cd;
  border-radius: 8px;
}

.resource-card {
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.resource-header h4 {
  margin: 0;
  color: #2c3e50;
}

.resource-content {
  padding: 10px 0;
}

.resource-content p {
  margin-bottom: 15px;
  color: #666;
}

.resource-notice {
  margin-top: 30px;
}

.notice-content {
  padding: 20px;
  text-align: center;
}

.notice-content h5 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.notice-content p {
  margin: 0;
  line-height: 1.6;
}

/* 订阅一览页面样式 */
.packages-content {
  padding: 20px 0;
}

.packages-header {
  text-align: center;
}

.package-card {
  margin-bottom: 30px;
  border: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.package-card.featured {
  border: 2px solid #409eff;
  position: relative;
}

.package-header {
  text-align: center;
  padding: 10px 0;
  position: relative;
}

.package-header h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.package-badge {
  position: absolute;
  top: -15px;
  right: 20px;
  background: #409eff;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.package-price {
  margin-top: 15px;
}

.package-price .price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #409eff;
}

.package-price .period {
  font-size: 1rem;
  color: #666;
  margin-left: 5px;
}

.package-content {
  padding: 20px;
}

.package-features {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.package-features li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f5;
  color: #555;
  font-size: 0.95rem;
}

.package-features li:last-child {
  border-bottom: none;
}

.package-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
}

.packages-notice {
  margin-top: 40px;
}

.packages-notice .notice-content {
  text-align: left;
}

.packages-notice .notice-content h5 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.packages-notice .notice-content p {
  line-height: 1.8;
}

/* 安装页面样式 */
.requirements-content {
  padding: 16px 0;
}

.requirements-list {
  margin: 0;
  padding-left: 20px;
}

.requirements-list li {
  margin-bottom: 8px;
  color: #555;
}

.install-methods {
  padding: 16px 0;
}

.method-tabs {
  margin-bottom: 20px;
}

.install-content {
  padding: 20px 0;
}

.code-block {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  margin: 16px 0;
  overflow: hidden;
}

.code-header {
  background: #f6f8fa;
  padding: 8px 16px;
  border-bottom: 1px solid #e1e4e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #586069;
}

.code-block pre {
  margin: 0;
  padding: 16px;
  background: #f6f8fa;
  color: #24292e;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.45;
  overflow-x: auto;
}

.install-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.install-note p {
  margin-bottom: 8px;
  color: #856404;
}

.install-note ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.install-note li {
  margin-bottom: 4px;
  color: #856404;
}

.install-note code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  color: #d73a49;
}

.os-method {
  margin-bottom: 24px;
}

.os-method h5 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.usage-guide {
  padding: 20px 0;
}

.command-list {
  margin-top: 16px;
}

.command-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.command-item:last-child {
  border-bottom: none;
}

.command-item code {
  background: #f6f8fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #d73a49;
  margin-right: 12px;
  min-width: 120px;
}

.command-item span {
  color: #666;
  font-size: 14px;
}

.tips-list {
  margin: 16px 0 0 0;
  padding-left: 20px;
}

.tips-list li {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.6;
}

.examples {
  padding: 20px 0;
}

.example-list {
  margin-top: 16px;
}

.example-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.example-command {
  margin-bottom: 8px;
}

.example-command code {
  background: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  color: #24292e;
  border: 1px solid #e1e4e8;
}

.example-desc {
  color: #666;
  font-size: 13px;
  margin-left: 4px;
}

/* Node.js安装页面样式 */
.nodejs-install-content {
  padding: 16px 0;
}

.nodejs-methods {
  margin-top: 16px;
}

.nodejs-method {
  padding: 20px 0;
}

.method-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 16px;
}

.install-steps {
  margin: 16px 0;
}

.install-steps ol {
  padding-left: 24px;
}

.install-steps li {
  margin-bottom: 8px;
  color: #555;
  line-height: 1.6;
}

.install-steps .link-primary {
  color: #409eff;
  text-decoration: none;
}

.install-steps .link-primary:hover {
  text-decoration: underline;
}

.linux-distros {
  margin-top: 16px;
}

.distro-item {
  margin-bottom: 24px;
}

.distro-item h6 {
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
}

/* Node.js验证样式 */
.nodejs-verification {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e6f7ff;
  background: #f6ffed;
  border-radius: 8px;
  padding: 20px;
}

.nodejs-verification h5 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.nodejs-verification h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.nodejs-troubleshooting {
  margin-top: 20px;
}

.nodejs-troubleshooting h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

/* Claude Code验证样式 */
.claude-verification {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e6f7ff;
  background: #f0f9ff;
  border-radius: 8px;
  padding: 20px;
}

.claude-verification h5 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.claude-verification h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.claude-troubleshooting {
  margin-top: 20px;
}

.claude-troubleshooting h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

/* 版本验证样式 */
.verification-content {
  padding: 16px 0;
}

.verification-steps {
  margin-top: 16px;
}

.verification-step {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f2f5;
}

.verification-step:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.verification-step h5 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.expected-output {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 4px;
}

.expected-output p {
  margin: 0;
  font-size: 14px;
  color: #0c4a6e;
}

.expected-output code {
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #1e40af;
}

.troubleshooting {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f2f5;
}

.troubleshooting h5 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.troubleshooting-items {
  margin-top: 16px;
}

.troubleshooting-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.troubleshooting-item h6 {
  margin-bottom: 8px;
  color: #92400e;
  font-weight: 600;
}

.troubleshooting-item ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.troubleshooting-item li {
  margin-bottom: 4px;
  color: #92400e;
  line-height: 1.5;
}

.troubleshooting-item code {
  background: #fef9e7;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  color: #b45309;
}

/* Claude Code Router 样式 */
.router-install-content {
  padding: 16px 0;
}

.features-list {
  list-style: none;
  padding-left: 0;
  margin-bottom: 20px;
}

.features-list li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f2f5;
  color: #555;
  line-height: 1.6;
}

.features-list li:last-child {
  border-bottom: none;
}

.install-step {
  margin-bottom: 24px;
}

.install-step h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.config-step {
  margin-bottom: 24px;
}

.config-step h6 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-weight: 600;
}

.usage-commands {
  margin: 16px 0;
}

.router-notice {
  padding: 15px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  margin-top: 20px;
}

.router-notice .notice-content p {
  margin: 0;
  color: #0c4a6e;
  line-height: 1.6;
}

/* 使用履历页面样式 */
.usage-history-section {
  padding: 0;
}

.usage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn {
  color: #409eff;
  padding: 8px 16px;
}

.back-btn:hover {
  background: #ecf5ff;
}

.api-key-display {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #606266;
}

/* 使用记录头部样式 */
.records-header-info h4 {
  margin-bottom: 8px;
}

.total-requests-badge {
  margin-top: 8px;
}

.badge-content {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #409eff 0%, #5cadff 100%);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.badge-content:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 12px;
}

.badge-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.badge-label {
  font-size: 11px;
  opacity: 0.9;
  font-weight: 500;
}

.badge-value {
  font-size: 16px;
  font-weight: 700;
  margin-top: 1px;
}


.error-message {
  color: #f56c6c;
  font-size: 12px;
}

.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.align-items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mb-3 {
  margin-bottom: 1rem;
}

.text-center {
  text-align: center;
}

.py-4 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.text-muted {
  color: #909399;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .key-actions {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }

  .api-key-cell {
    flex-direction: column;
    align-items: flex-start;
  }

  .code-block pre {
    font-size: 12px;
    padding: 12px;
  }

  .command-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .command-item code {
    margin-bottom: 4px;
    min-width: auto;
  }

  .records-header-info {
    text-align: left;
  }

  .total-requests-badge {
    margin-top: 8px;
  }

  .badge-content {
    padding: 6px 10px;
    gap: 6px;
  }

  .badge-icon {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .badge-value {
    font-size: 14px;
  }

  .usage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

/* 移动端侧边栏样式 */
.mobile-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100%;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  z-index: 1000;
  transition: left 0.3s ease;
  overflow-y: auto;
}

.mobile-sidebar-open {
  left: 0;
}

.mobile-sidebar-content {
  padding: 80px 20px 20px;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  margin: -40px -40px 20px -40px;
}

.mobile-menu-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: #64748b;
  padding: 8px;
  margin-right: 12px;
  cursor: pointer;
}

.mobile-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

/* 移动端主内容区调整 */
@media (max-width: 768px) {
  .main-content {
    padding: 20px 16px;
  }

  .main-content h2 {
    font-size: 1.5rem;
  }

  .el-card {
    border-radius: 12px !important;
  }

  .key-stats-inline {
    flex-direction: column;
    align-items: stretch;
  }

  .stat-badge {
    justify-content: center;
    text-align: center;
  }

  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 16px;
  }

  .key-actions {
    width: 100%;
  }

  .key-actions .btn {
    width: 100%;
    margin-bottom: 8px;
  }

  .package-card {
    margin-bottom: 20px;
  }

  .packages-grid .col-md-4 {
    margin-bottom: 20px;
  }

  /* 表格移动端优化 */
  .custom-table {
    border: none;
    border-radius: 8px;
    overflow: hidden;
  }

  .table-header {
    display: none;
  }

  .key-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 12px;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .key-item:last-child {
    margin-bottom: 0;
  }

  .main-row {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
  }

  .col-subscription,
  .col-api-key,
  .col-status,
  .col-activation,
  .col-expire,
  .col-days,
  .col-actions {
    width: 100%;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .col-subscription::before {
    content: "订阅名称：";
    font-weight: 500;
    color: #64748b;
  }

  .col-api-key::before {
    content: "API密钥：";
    font-weight: 500;
    color: #64748b;
  }

  .col-status::before {
    content: "状态：";
    font-weight: 500;
    color: #64748b;
  }

  .col-activation::before {
    content: "激活时间：";
    font-weight: 500;
    color: #64748b;
  }

  .col-expire::before {
    content: "过期时间：";
    font-weight: 500;
    color: #64748b;
  }

  .col-days::before {
    content: "剩余天数：";
    font-weight: 500;
    color: #64748b;
  }

  .col-actions::before {
    content: "操作：";
    font-weight: 500;
    color: #64748b;
  }

  .action-buttons {
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
  }

  .action-buttons .el-button {
    font-size: 12px;
    padding: 8px 12px;
    min-width: auto;
    min-height: 36px;
  }

  /* 按钮组移动端优化 */
  .key-actions .btn,
  .key-actions .el-button {
    min-height: 44px;
    font-size: 14px;
  }

  /* 表单移动端优化 */
  .el-form-item {
    margin-bottom: 20px;
  }

  .el-input__inner {
    font-size: 16px;
  }

  /* 积分信息移动端优化 */
  .credits-info-container {
    flex-direction: column;
    gap: 12px;
  }

  .credits-basic {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .credits-progress {
    width: 100%;
    max-width: none;
  }

  /* 代码块移动端优化 */
  .code-block pre {
    font-size: 12px;
    padding: 12px;
    overflow-x: auto;
  }

  .code-header {
    padding: 8px 12px;
    font-size: 12px;
  }

  /* 安装步骤移动端优化 */
  .step-item {
    padding: 16px;
    margin-bottom: 16px;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
    margin-right: 12px;
  }
}
</style>