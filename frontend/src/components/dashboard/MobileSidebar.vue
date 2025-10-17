<template>
  <!-- 移动端侧边栏抽屉 -->
  <div class="mobile-sidebar-overlay" v-if="showMobileSidebar" @click="$emit('close')"></div>
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
</template>

<script setup lang="ts">
import { ElIcon } from 'element-plus'
import {
  VideoPlay as ElIconVideoPlay,
  Key as ElIconKey,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading
} from '@element-plus/icons-vue'

interface Props {
  showMobileSidebar: boolean
  activeTab: string
}

interface Emits {
  (e: 'close'): void
  (e: 'tab-change', tab: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const setActiveTab = (tab: string) => {
  emit('tab-change', tab)
  emit('close')
}
</script>