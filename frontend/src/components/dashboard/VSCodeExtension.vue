<template>
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
</template>

<script setup lang="ts">
import { ElCard, ElButton, ElMessage } from 'element-plus'

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
.vscode-install-content {
  padding: 10px 0;
}

.vscode-methods h5 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.install-steps ol {
  margin: 0;
  padding-left: 20px;
}

.install-steps li {
  margin-bottom: 8px;
  line-height: 1.6;
}


.install-note {
  background: #e7f3ff;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #1890ff;
  margin-top: 20px;
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
</style>