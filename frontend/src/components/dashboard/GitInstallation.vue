<template>
  <div class="git-install-content">
    <p class="text-muted mb-3">Git 是版本控制工具，推荐安装以获得更好的开发体验。如果您还没有安装 Git，请按照以下步骤安装：</p>

    <div class="git-methods">
      <ElTabs v-model="gitInstallMethod" type="card">
        <!-- Windows Git安装 -->
        <ElTabPane label="Windows" name="windows-git">
          <div class="git-method">
            <h5>🪟 官方安装包（推荐）</h5>
            <p class="method-desc">下载官方安装包，傻瓜式安装</p>
            <div class="install-steps">
              <ol>
                <li>访问 <a href="https://git-scm.com/download/win" target="_blank" class="link-primary">https://git-scm.com/download/win</a></li>
                <li>下载最新版本的 Git for Windows</li>
                <li>运行下载的 .exe 文件</li>
                <li>按照安装向导完成安装（推荐使用默认设置）</li>
              </ol>
            </div>

            <h5 class="mt-4">🍫 Chocolatey 安装</h5>
            <p class="method-desc">使用 Windows 包管理器</p>
            <div class="code-block">
              <div class="code-header">
                <span>PowerShell（以管理员身份运行）</span>
                <ElButton size="small" @click="copyToClipboard('choco install git')">复制</ElButton>
              </div>
              <pre><code>choco install git</code></pre>
            </div>
          </div>
        </ElTabPane>

        <!-- macOS Git安装 -->
        <ElTabPane label="macOS" name="macos-git">
          <div class="git-method">
            <h5>🍎 官方安装包</h5>
            <p class="method-desc">下载官方 pkg 包安装</p>
            <div class="install-steps">
              <ol>
                <li>访问 <a href="https://git-scm.com/download/mac" target="_blank" class="link-primary">https://git-scm.com/download/mac</a></li>
                <li>下载最新版本的 Git for macOS</li>
                <li>双击运行安装包</li>
                <li>按照安装向导完成安装</li>
              </ol>
            </div>

            <h5 class="mt-4">🍺 Homebrew 安装（推荐）</h5>
            <p class="method-desc">使用 macOS 包管理器</p>
            <div class="code-block">
              <div class="code-header">
                <span>Terminal</span>
                <ElButton size="small" @click="copyToClipboard('brew install git')">复制</ElButton>
              </div>
              <pre><code>brew install git</code></pre>
            </div>

            <h5 class="mt-4">🍎 Xcode Command Line Tools</h5>
            <p class="method-desc">macOS 内置方式</p>
            <div class="code-block">
              <div class="code-header">
                <span>Terminal</span>
                <ElButton size="small" @click="copyToClipboard('xcode-select --install')">复制</ElButton>
              </div>
              <pre><code>xcode-select --install</code></pre>
            </div>
          </div>
        </ElTabPane>

        <!-- Linux Git安装 -->
        <ElTabPane label="Linux" name="linux-git">
          <div class="git-method">
            <h5>📦 包管理器安装</h5>
            <p class="method-desc">使用系统包管理器安装</p>

            <div class="linux-distros">
              <div class="distro-item">
                <h6>Ubuntu/Debian:</h6>
                <div class="code-block">
                  <div class="code-header">
                    <span>Terminal</span>
                    <ElButton size="small" @click="copyToClipboard('sudo apt update && sudo apt install git')">复制</ElButton>
                  </div>
                  <pre><code>sudo apt update && sudo apt install git</code></pre>
                </div>
              </div>

              <div class="distro-item">
                <h6>CentOS/RHEL/Fedora:</h6>
                <div class="code-block">
                  <div class="code-header">
                    <span>Terminal</span>
                    <ElButton size="small" @click="copyToClipboard('sudo yum install git')">复制</ElButton>
                  </div>
                  <pre><code>sudo yum install git</code></pre>
                </div>
              </div>

              <div class="distro-item">
                <h6>Arch Linux:</h6>
                <div class="code-block">
                  <div class="code-header">
                    <span>Terminal</span>
                    <ElButton size="small" @click="copyToClipboard('sudo pacman -S git')">复制</ElButton>
                  </div>
                  <pre><code>sudo pacman -S git</code></pre>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>

    <!-- Git安装验证 -->
    <div class="git-verification mt-4">
      <h5>✅ 验证 Git 安装</h5>
      <p class="text-muted mb-3">安装完成后，请运行以下命令确认 Git 安装成功：</p>

      <div class="verification-steps">
        <div class="verification-step">
          <h6>1️⃣ 验证 Git 安装</h6>
          <div class="code-block">
            <div class="code-header">
              <span>终端/命令提示符</span>
              <ElButton size="small" @click="copyToClipboard('git --version')">复制</ElButton>
            </div>
            <pre><code>git --version</code></pre>
          </div>
          <div class="expected-output">
            <p><strong>期望输出：</strong> <code>git version 2.x.x</code> 或更高版本</p>
          </div>
        </div>

        <div class="verification-step">
          <h6>2️⃣ 配置 Git 用户信息（可选但推荐）</h6>
          <div class="code-block">
            <div class="code-header">
              <span>终端/命令提示符</span>
              <ElButton size="small" @click="copyToClipboard('git config --global user.name YourName')">复制</ElButton>
            </div>
            <pre><code>git config --global user.name "Your Name"</code></pre>
          </div>
          <div class="code-block">
            <div class="code-header">
              <span>终端/命令提示符</span>
              <ElButton size="small" @click="copyToClipboard('git config --global user.email your.email@example.com')">复制</ElButton>
            </div>
            <pre><code>git config --global user.email "your.email@example.com"</code></pre>
          </div>
          <div class="expected-output">
            <p><strong>说明：</strong> 配置您的 Git 用户名和邮箱，用于提交记录</p>
          </div>
        </div>
      </div>

      <div class="git-troubleshooting mt-3">
        <h6>🔧 常见问题</h6>
        <div class="troubleshooting-items">
          <div class="troubleshooting-item">
            <strong>❌ 命令未找到：</strong>
            <ul>
              <li>重新启动终端/命令提示符</li>
              <li>Windows 用户可能需要重启计算机</li>
              <li>确认安装路径已添加到系统 PATH 环境变量</li>
            </ul>
          </div>
          <div class="troubleshooting-item">
            <strong>❌ 权限错误：</strong>
            <ul>
              <li>使用管理员权限运行终端</li>
              <li>Linux/macOS 用户可能需要使用 <code>sudo</code></li>
            </ul>
          </div>
          <div class="troubleshooting-item">
            <strong>❌ 版本过低：</strong>
            <ul>
              <li>Windows：重新下载最新版本安装包</li>
              <li>macOS：运行 <code>brew upgrade git</code></li>
              <li>Linux：使用包管理器更新</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElButton, ElTabs, ElTabPane, ElMessage } from 'element-plus'

const gitInstallMethod = ref('windows-git')

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
.git-install-content {
  padding: 10px 0;
}

.git-method {
  padding: 10px 0;
}

.git-method h5 {
  color: #2c3e50;
  margin-bottom: 8px;
}

.method-desc {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.9rem;
}

.install-steps ol {
  margin: 0;
  padding-left: 20px;
}

.install-steps li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.linux-distros {
  margin-top: 20px;
}

.distro-item {
  margin-bottom: 20px;
}

.distro-item h6 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.code-block {
  background: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
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

.git-verification {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.verification-steps {
  margin-top: 15px;
}

.verification-step {
  margin-bottom: 20px;
}

.verification-step h6 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.expected-output {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e7f3ff;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
}

.expected-output p {
  margin: 0;
  font-size: 0.9rem;
}

.git-troubleshooting {
  background: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.git-troubleshooting h6 {
  color: #856404;
  margin-bottom: 10px;
}

.troubleshooting-items {
  font-size: 0.9rem;
}

.troubleshooting-item {
  margin-bottom: 10px;
}

.troubleshooting-item strong {
  color: #856404;
}

.troubleshooting-item ul {
  margin: 5px 0 0 20px;
}

.troubleshooting-item li {
  margin-bottom: 4px;
}

.troubleshooting-item code {
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.85rem;
}

.link-primary {
  color: #1890ff;
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>