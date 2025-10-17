<template>
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
.usage-guide {
  padding: 10px 0;
}

.usage-steps {
  padding: 10px 0;
}

.usage-steps h5 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.code-block {
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
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

.command-list {
  margin-top: 15px;
}

.command-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.command-item code {
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 0.85rem;
  margin-right: 10px;
  min-width: 120px;
}

.command-item span {
  color: #666;
  font-size: 0.9rem;
}

.tips-list {
  margin-top: 15px;
  padding-left: 20px;
}

.tips-list li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: #666;
}
</style>