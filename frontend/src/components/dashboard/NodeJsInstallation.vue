<template>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElCard, ElButton, ElTabs, ElTabPane, ElMessage } from 'element-plus'

const nodeInstallMethod = ref('windows-node')

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
.nodejs-install-content {
  padding: 10px 0;
}

.nodejs-method {
  padding: 10px 0;
}

.nodejs-method h5 {
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

.nodejs-verification {
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

.nodejs-troubleshooting {
  background: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.nodejs-troubleshooting h6 {
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

.link-primary {
  color: #1890ff;
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}
</style>