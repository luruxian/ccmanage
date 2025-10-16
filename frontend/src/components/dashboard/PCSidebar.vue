<template>
  <div class="col-md-3 col-lg-2 sidebar d-none d-md-block">
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <a href="#" :class="['nav-item', { active: activeTab === 'getting-started' }]" @click="$emit('tab-change', 'getting-started')">
          <ElIcon><ElIconVideoPlay /></ElIcon>
          安装Claude Code
        </a>
        <a href="#" :class="['nav-item', { active: activeTab === 'keys' || activeTab === 'usage-history' }]" @click="$emit('tab-change', 'keys')">
          <ElIcon><ElIconKey /></ElIcon>
          API密钥
        </a>
        <a href="#" :class="['nav-item', { active: activeTab === 'packages' }]" @click="$emit('tab-change', 'packages')">
          <ElIcon><ElIconList /></ElIcon>
          订阅一览
        </a>
        <a href="#" :class="['nav-item', { active: activeTab === 'promotion' }]" @click="$emit('tab-change', 'promotion')">
          <ElIcon><ElIconTrendCharts /></ElIcon>
          推广计划
        </a>
        <a href="#" :class="['nav-item', { active: activeTab === 'resources' }]" @click="$emit('tab-change', 'resources')">
          <ElIcon><ElIconReading /></ElIcon>
          资料中心
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElIcon
} from 'element-plus'
import {
  Key as ElIconKey,
  VideoPlay as ElIconVideoPlay,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading
} from '@element-plus/icons-vue'

interface Props {
  activeTab: string
}

defineProps<Props>()

defineEmits<{
  'tab-change': [tab: string]
}>()
</script>

<style scoped>
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
</style>