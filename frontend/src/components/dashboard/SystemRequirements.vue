<template>
  <ElCard class="mb-4">
    <template #header>
      <h4>💻 系统要求</h4>
    </template>
    <div class="requirements-content">
      <p class="text-muted mb-3">在开始安装之前，请确保您的系统满足以下要求：</p>
      <ul class="requirements-list">
        <li><strong>Node.js 18+</strong> （用于NPM安装方式）</li>
        <li><strong>Git</strong> （用于版本控制功能）</li>
      </ul>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ElCard } from 'element-plus'
</script>

<style scoped>
.requirements-content {
  padding: 10px 0;
}

.requirements-list {
  margin: 0;
  padding-left: 20px;
}

.requirements-list li {
  margin-bottom: 8px;
  line-height: 1.6;
}
</style>