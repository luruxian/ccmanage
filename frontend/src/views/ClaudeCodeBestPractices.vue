<template>
  <div class="dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- 侧边栏 -->
        <div class="col-md-3 col-lg-2 sidebar">
          <div class="sidebar-content">
            <nav class="sidebar-nav">
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconVideoPlay /></ElIcon>
                安装Claude Code
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconKey /></ElIcon>
                API密钥
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconList /></ElIcon>
                订阅一览
              </router-link>
              <router-link to="/dashboard" :class="['nav-item']">
                <ElIcon><ElIconTrendCharts /></ElIcon>
                推广计划
              </router-link>
              <a href="#" @click="goToResourceCenter" :class="['nav-item', 'active']">
                <ElIcon><ElIconReading /></ElIcon>
                资料中心
              </a>
            </nav>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="col-md-9 col-lg-10 main-content">
          <div class="tab-content">
            <!-- 面包屑导航 -->
            <nav aria-label="breadcrumb" class="mb-4">
              <ol class="breadcrumb">
                <li class="breadcrumb-item">
                  <a href="#" @click="goToResourceCenter">资料中心</a>
                </li>
                <li class="breadcrumb-item active" aria-current="page">Claude Code最佳实践</li>
              </ol>
            </nav>

            <h2 class="mb-4">Claude Code最佳实践</h2>

            <!-- 页面内容暂时保持空白 -->
            <div class="best-practices-content">
              <ElCard>
                <div class="empty-content">
                  <ElIcon size="48" color="#909399"><ElIconDocumentCopy /></ElIcon>
                  <p class="text-muted mt-3">内容正在准备中，敬请期待...</p>
                </div>
              </ElCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElIcon, ElCard } from 'element-plus'
import { useRouter } from 'vue-router'
import {
  VideoPlay as ElIconVideoPlay,
  Key as ElIconKey,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading,
  DocumentCopy as ElIconDocumentCopy
} from '@element-plus/icons-vue'

const router = useRouter()

const goToResourceCenter = () => {
  router.push('/dashboard?tab=resources')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.sidebar {
  background: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  min-height: 100vh;
  padding: 0;
}

.sidebar-content {
  padding: 30px 20px;
}

.sidebar-nav .nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  color: #666;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
}

.sidebar-nav .nav-item:hover,
.sidebar-nav .nav-item.active {
  background: #409eff;
  color: white;
}

.sidebar-nav .nav-item .el-icon {
  margin-right: 10px;
}

.main-content {
  padding: 30px;
}

.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb-item a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #6c757d;
}

.best-practices-content {
  margin-top: 20px;
}

.empty-content {
  text-align: center;
  padding: 60px 20px;
}

.empty-content .el-icon {
  margin-bottom: 16px;
}

.tab-content {
  background: transparent;
}

h2 {
  color: #2c3e50;
  font-weight: 600;
}
</style>