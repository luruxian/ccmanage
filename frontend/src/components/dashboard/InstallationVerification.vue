<template>
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
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from 'element-plus'

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
.claude-verification {
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

.code-block {
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.code-header span {
  font-size: 0.8rem;
  color: #6c757d;
}

.code-block pre {
  margin: 0;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
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

.claude-troubleshooting {
  background: #fff3cd;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.claude-troubleshooting h6 {
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
</style>