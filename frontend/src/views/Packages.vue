<template>
  <div class="packages-page">
    <div class="container-fluid">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="row align-items-center">
          <div class="col">
            <h1 class="page-title">
              <i class="fas fa-cube"></i>
              订阅管理
            </h1>
            <p class="page-subtitle">管理和浏览可用的订阅服务</p>
          </div>
          <div class="col-auto">
            <ElButton type="primary" @click="refreshPackages" :loading="loading.list">
              <i class="fas fa-sync-alt"></i>
              刷新列表
            </ElButton>
          </div>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <ElCard shadow="never" class="filter-card">
          <ElRow :gutter="20">
            <ElCol :span="8">
              <ElInput
                v-model="searchParams.keyword"
                placeholder="搜索订阅名称或描述"
                :prefix-icon="ElIconSearch"
                @keyup.enter="handleSearch"
                clearable
              />
            </ElCol>
            <ElCol :span="6">
              <ElSelect
                v-model="searchParams.category"
                placeholder="选择分类"
                clearable
                style="width: 100%"
              >
                <ElOption
                  v-for="category in packageCategories"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                />
              </ElSelect>
            </ElCol>
            <ElCol :span="6">
              <ElSelect
                v-model="searchParams.status"
                placeholder="选择状态"
                clearable
                style="width: 100%"
              >
                <ElOption label="全部" value="" />
                <ElOption label="可用" value="available" />
                <ElOption label="不可用" value="unavailable" />
              </ElSelect>
            </ElCol>
            <ElCol :span="4">
              <ElButton type="primary" @click="handleSearch" style="width: 100%">
                <i class="fas fa-search"></i>
                搜索
              </ElButton>
            </ElCol>
          </ElRow>
        </ElCard>
      </div>

      <!-- 包列表 -->
      <div class="packages-section">
        <ElCard shadow="never" class="packages-card">
          <div v-if="loading.list" class="loading-container">
            <ElSkeleton :rows="5" animated />
          </div>
          <div v-else-if="packages.length === 0" class="empty-state">
            <i class="fas fa-cube empty-icon"></i>
            <h3>暂无订阅数据</h3>
            <p>当前没有找到匹配的订阅服务</p>
          </div>
          <div v-else class="packages-grid">
            <div
              v-for="pkg in packages"
              :key="pkg.id"
              class="package-card"
            >
              <div class="package-header">
                <div class="package-info">
                  <h4 class="package-name clickable" @click="goToSubscriptionDetail(pkg.id)">{{ pkg.package_name }}</h4>
                  <span class="package-version">¥{{ pkg.price }}</span>
                  <ElTag
                    :type="pkg.is_active ? 'success' : 'danger'"
                    size="small"
                    class="package-status"
                  >
                    {{ pkg.is_active ? '可用' : '不可用' }}
                  </ElTag>
                </div>
                <div class="package-actions">
                  <ElButton
                    type="primary"
                    size="small"
                    @click="handlePackageAction(pkg)"
                    :disabled="!pkg.is_active"
                  >
                    {{ getUserAction(pkg) }}
                  </ElButton>
                </div>
              </div>
              <div class="package-content">
                <p class="package-description">{{ pkg.description || '暂无描述' }}</p>
                <div class="package-meta">
                  <span class="meta-item">
                    <i class="fas fa-coins"></i>
                    {{ pkg.credits }} 积分
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-calendar"></i>
                    {{ pkg.duration_days }} 天
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-clock"></i>
                    {{ formatDate(pkg.created_at) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="packages.length > 0" class="pagination-container">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 包详情对话框 -->
    <ElDialog
      v-model="packageDetailVisible"
      title="包详情"
      width="60%"
      :before-close="handleCloseDetail"
    >
      <div v-if="selectedPackage" class="package-detail">
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="订阅名称">
            {{ selectedPackage.package_name }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="订阅代码">
            {{ selectedPackage.package_code }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="selectedPackage.is_active ? 'success' : 'danger'">
              {{ selectedPackage.is_active ? '可用' : '不可用' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="价格">
            ¥{{ selectedPackage.price }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="描述" :span="2">
            {{ selectedPackage.description || '暂无描述' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="创建时间">
            {{ formatDate(selectedPackage.created_at) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="更新时间">
            {{ formatDate(selectedPackage.updated_at) }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="积分">
            {{ selectedPackage.credits }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="时长">
            {{ selectedPackage.duration_days }} 天
          </ElDescriptionsItem>
        </ElDescriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="packageDetailVisible = false">关闭</ElButton>
          <ElButton
            v-if="selectedPackage && selectedPackage.is_active"
            type="primary"
            @click="handlePackageAction(selectedPackage)"
          >
            {{ getUserAction(selectedPackage) }}
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ElCard, ElButton, ElInput, ElSelect, ElOption, ElRow, ElCol,
  ElTag, ElSkeleton, ElPagination, ElDialog, ElDescriptions, ElDescriptionsItem
} from 'element-plus'
import { Search as ElIconSearch } from '@element-plus/icons-vue'
import request from '../utils/request'

interface Package {
  id: number
  package_code: string
  package_name: string
  description?: string
  endpoint?: string
  price: number
  credits: number
  duration_days: number
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

const router = useRouter()
const packages = ref<Package[]>([])
const selectedPackage = ref<Package | null>(null)
const packageDetailVisible = ref(false)

const loading = reactive({
  list: false,
  action: false
})

const searchParams = reactive({
  keyword: '',
  category: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const packageCategories = [
  { label: '开发工具', value: 'development' },
  { label: '系统工具', value: 'system' },
  { label: '网络工具', value: 'network' },
  { label: '安全工具', value: 'security' },
  { label: '数据库', value: 'database' },
  { label: '其他', value: 'others' }
]

// 加载包列表
const loadPackages = async () => {
  try {
    loading.list = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      keyword: searchParams.keyword || undefined,
      category: searchParams.category || undefined,
      status: searchParams.status || undefined
    }

    const response: any = await request.get('/api/v1/packages', { params })
    packages.value = response.packages || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('加载包列表失败:', error)
    ElMessage.error('加载包列表失败')
  } finally {
    loading.list = false
  }
}

// 搜索包
const handleSearch = () => {
  pagination.page = 1
  loadPackages()
}

// 刷新包列表
const refreshPackages = () => {
  loadPackages()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadPackages()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadPackages()
}

// 获取用户对包的操作文本
const getUserAction = (_pkg: Package) => {
  return '查看详情'
}

// 处理包操作
const handlePackageAction = (pkg: Package) => {
  selectedPackage.value = pkg
  packageDetailVisible.value = true
}

// 关闭详情对话框
const handleCloseDetail = () => {
  packageDetailVisible.value = false
  selectedPackage.value = null
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 导航到订阅详情页面
const goToSubscriptionDetail = (packageId: number) => {
  router.push(`/admin/subscriptions/${packageId}`)
}

onMounted(() => {
  loadPackages()
})
</script>

<style scoped>
.packages-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title i {
  color: #409eff;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.packages-section {
  margin-bottom: 24px;
}

.packages-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.loading-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 16px;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding: 20px;
}

.package-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
}

.package-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  border-color: #409eff;
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.package-info {
  flex: 1;
}

.package-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.package-name.clickable {
  cursor: pointer;
  transition: color 0.3s ease;
}

.package-name.clickable:hover {
  color: #409eff;
  text-decoration: underline;
}

.package-version {
  display: inline-block;
  background: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-right: 8px;
}

.package-status {
  margin-left: 8px;
}

.package-actions {
  margin-left: 16px;
}

.package-content {
  margin-top: 16px;
}

.package-description {
  color: #7f8c8d;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.package-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #95a5a6;
  font-size: 0.875rem;
}

.meta-item i {
  color: #bdc3c7;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #f0f2f5;
}

.package-detail {
  margin: 20px 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .packages-page {
    padding: 16px;
  }

  .packages-grid {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  .package-header {
    flex-direction: column;
    gap: 12px;
  }

  .package-actions {
    margin-left: 0;
    width: 100%;
  }

  .package-meta {
    gap: 12px;
  }
}

/* 深色主题支持 */
:global(.dark-theme) .packages-page {
  background-color: #0d1117;
}

:global(.dark-theme) .page-title {
  color: #f0f6fc;
}

:global(.dark-theme) .page-subtitle {
  color: #8b949e;
}

:global(.dark-theme) .package-card {
  background: #161b22;
  border-color: #30363d;
}

:global(.dark-theme) .package-name {
  color: #f0f6fc;
}

:global(.dark-theme) .package-description {
  color: #8b949e;
}
</style>