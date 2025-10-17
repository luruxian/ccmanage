<template>
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
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElButton, ElTabs, ElTabPane, ElMessage } from 'element-plus'

const installMethod = ref('npm')

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.install-methods {
  padding: 10px 0;
}

.install-content {
  padding: 10px 0;
}

.os-method {
  margin-bottom: 20px;
}

.os-method h5 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.code-block {
  background: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 15px;
  border: 1px solid #333;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #444;
}

.code-header span {
  font-size: 0.8rem;
  color: #ccc;
}

.code-block pre {
  margin: 0;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #e6e6e6;
}

.install-note {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
  margin-top: 15px;
}

.install-note p {
  margin: 0 0 10px 0;
  font-weight: 500;
}

.install-note ul {
  margin: 0;
  padding-left: 20px;
}

.install-note li {
  margin-bottom: 5px;
  line-height: 1.5;
}

.install-note code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85rem;
}
</style>