<template>
  <div class="tab-content">
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
            <p>本文档翻译自 Anthropic 官方博客文章。<ElButton type="text" @click="$emit('goToBestPractices')">Claude Code最佳实践（中文翻译）</ElButton></p>
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
</template>

<script setup lang="ts">
import { ElCard, ElButton } from 'element-plus'

interface Emits {
  (e: 'goToBestPractices'): void
}

defineEmits<Emits>()
</script>

<style scoped>
.tab-content {
  padding: 20px 0;
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
</style>