<template>
  <div class="user-key-usage-history-page">
    <div class="container-fluid">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <ElBreadcrumb separator="/">
          <ElBreadcrumbItem @click="goToAdminDashboard" class="clickable">订阅管理</ElBreadcrumbItem>
          <ElBreadcrumbItem @click="goBack" class="clickable">订阅详情</ElBreadcrumbItem>
          <ElBreadcrumbItem>User Key使用履历</ElBreadcrumbItem>
        </ElBreadcrumb>
      </div>

      <!-- User Key基本信息 -->
      <div class="user-key-info-section">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <h3>
                <i class="fas fa-key"></i>
                User Key信息
              </h3>
            </div>
          </template>

          <div v-if="loading.keyInfo" class="loading-container">
            <ElSkeleton :rows="2" animated />
          </div>

          <div v-else class="user-key-info">
            <ElDescriptions :column="3" border>
              <ElDescriptionsItem label="User Key">
                <code class="api-key-display">{{ apiKey }}</code>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="所属用户">
                {{ keyInfo.user_email || '未激活' }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="状态">
                <ElTag :type="getStatusType(keyInfo.status)">
                  {{ getStatusText(keyInfo.status) }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="激活时间">
                {{ keyInfo.activation_date ? formatDate(keyInfo.activation_date) : '未激活' }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="过期时间">
                {{ keyInfo.expire_date ? formatDate(keyInfo.expire_date) : '-' }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="最后使用">
                {{ keyInfo.last_used_at ? formatDate(keyInfo.last_used_at) : '未使用' }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </ElCard>
      </div>

      <!-- 使用统计 -->
      <div class="usage-stats-section">
        <ElCard shadow="never" class="stats-card">
          <template #header>
            <div class="card-header">
              <h3>
                <i class="fas fa-chart-bar"></i>
                使用统计
              </h3>
              <ElButton @click="refreshStats" :loading="loading.stats">
                <i class="fas fa-sync-alt"></i>
                刷新
              </ElButton>
            </div>
          </template>

          <div v-if="loading.stats" class="loading-container">
            <ElSkeleton :rows="2" animated />
          </div>

          <div v-else class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon requests">
                <i class="fas fa-exchange-alt"></i>
              </div>
              <div class="stat-content">
                <h4>{{ usageStats.total_requests || 0 }}</h4>
                <p>总请求次数</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon tokens">
                <i class="fas fa-coins"></i>
              </div>
              <div class="stat-content">
                <h4>{{ formatNumber(usageStats.total_tokens) || 0 }}</h4>
                <p>总Token数</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon credits">
                <i class="fas fa-gem"></i>
              </div>
              <div class="stat-content">
                <h4>{{ usageStats.total_credits_used || 0 }}</h4>
                <p>总积分消耗</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon services">
                <i class="fas fa-cogs"></i>
              </div>
              <div class="stat-content">
                <h4>{{ usageStats.unique_services || 0 }}</h4>
                <p>服务类型数</p>
              </div>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 使用记录列表 -->
      <div class="usage-records-section">
        <ElCard shadow="never" class="records-card">
          <template #header>
            <div class="card-header">
              <h3>
                <i class="fas fa-list"></i>
                使用记录
              </h3>
              <div class="header-actions">
                <ElButton @click="refreshRecords" :loading="loading.records">
                  <i class="fas fa-sync-alt"></i>
                  刷新
                </ElButton>
              </div>
            </div>
          </template>

          <!-- 筛选器 -->
          <div class="filter-section">
            <ElRow :gutter="20">
              <ElCol :span="6">
                <ElSelect
                  v-model="filters.service"
                  placeholder="服务类型筛选"
                  clearable
                  @change="applyFilters"
                >
                  <ElOption label="全部" value="" />
                  <ElOption
                    v-for="service in availableServices"
                    :key="service"
                    :label="service"
                    :value="service"
                  />
                </ElSelect>
              </ElCol>
              <ElCol :span="8">
                <ElDatePicker
                  v-model="filters.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  @change="applyFilters"
                  clearable
                />
              </ElCol>
              <ElCol :span="4">
                <ElButton type="primary" @click="applyFilters">
                  <i class="fas fa-search"></i>
                  筛选
                </ElButton>
              </ElCol>
            </ElRow>
          </div>

          <!-- 使用记录表格 -->
          <div class="records-table">
            <ElTable
              v-loading="loading.records"
              :data="usageRecords"
              style="width: 100%"
            >
              <ElTableColumn prop="service" label="服务类型" width="150">
                <template #default="scope">
                  <ElTag type="info" size="small">
                    {{ scope.row.service }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="input_tokens" label="输入Token" width="120">
                <template #default="scope">
                  {{ formatNumber(scope.row.input_tokens) || '-' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="output_tokens" label="输出Token" width="120">
                <template #default="scope">
                  {{ formatNumber(scope.row.output_tokens) || '-' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="total_tokens" label="总Token" width="120">
                <template #default="scope">
                  {{ formatNumber(scope.row.total_tokens) || '-' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="credits_used" label="积分消耗" width="100">
                <template #default="scope">
                  {{ scope.row.credits_used || 0 }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="remaining_credits" label="剩余积分" width="120">
                <template #default="scope">
                  <span v-if="scope.row.remaining_credits !== null && scope.row.remaining_credits !== undefined"
                        :class="getRemainingCreditsClass(scope.row.remaining_credits)">
                    {{ scope.row.remaining_credits }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="response_status" label="响应状态" width="100">
                <template #default="scope">
                  <ElTag :type="scope.row.response_status === 'success' ? 'success' : 'danger'" size="small">
                    {{ scope.row.response_status === 'success' ? '成功' : '失败' }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="request_timestamp" label="请求时间" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.request_timestamp) }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="error_message" label="错误信息" min-width="200">
                <template #default="scope">
                  <span v-if="scope.row.error_message" class="error-message">
                    {{ scope.row.error_message }}
                  </span>
                  <span v-else class="success-message">-</span>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ElCard, ElButton, ElBreadcrumb, ElBreadcrumbItem, ElDescriptions, ElDescriptionsItem,
  ElTag, ElSkeleton, ElTable, ElTableColumn, ElSelect, ElOption, ElRow, ElCol,
  ElPagination, ElDatePicker
} from 'element-plus'
import request from '../../utils/request'

interface UsageRecord {
  id: number
  api_key_id: number
  service: string
  request_count: number
  credits_used: number
  remaining_credits?: number
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  request_timestamp: string
  response_status?: string
  error_message?: string
}

interface UsageStats {
  total_requests: number
  total_tokens: number
  total_credits_used: number
  unique_services: number
  input_tokens: number
  output_tokens: number
  avg_tokens_per_request: number
  first_request: string
  last_request: string
}

interface KeyInfo {
  user_email?: string
  status: string
  activation_date?: string
  expire_date?: string
  last_used_at?: string
}

const route = useRoute()
const router = useRouter()

const apiKey = ref<string>('')
const keyInfo = ref<KeyInfo>({} as KeyInfo)
const usageRecords = ref<UsageRecord[]>([])
const usageStats = ref<UsageStats>({} as UsageStats)
const availableServices = ref<string[]>([])

const loading = reactive({
  keyInfo: false,
  stats: false,
  records: false
})

const filters = reactive({
  service: '',
  dateRange: null as [string, string] | null
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 获取API Key基本信息（这里需要从后端获取，暂时模拟）
const loadKeyInfo = async () => {
  try {
    loading.keyInfo = true
    // 这里需要调用后端API获取key信息，暂时模拟
    // const response = await request.get(`/api/v1/admin/api-keys/${apiKey.value}/info`)
    // keyInfo.value = response

    // 模拟数据
    keyInfo.value = {
      user_email: 'user@example.com',
      status: 'active',
      activation_date: '2024-01-01T00:00:00Z',
      expire_date: '2024-12-31T23:59:59Z',
      last_used_at: '2024-01-15T10:30:00Z'
    }
  } catch (error) {
    console.error('加载Key信息失败:', error)
    ElMessage.error('加载Key信息失败')
  } finally {
    loading.keyInfo = false
  }
}

// 获取使用统计
const loadUsageStats = async () => {
  try {
    loading.stats = true
    const params: any = {}
    if (filters.dateRange) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }

    const response: any = await request.get(`/api/v1/usage/stats`, {
      params: {
        api_key: apiKey.value,
        ...params
      }
    })
    usageStats.value = response
  } catch (error) {
    console.error('加载使用统计失败:', error)
    ElMessage.error('加载使用统计失败')
  } finally {
    loading.stats = false
  }
}

// 获取使用记录
const loadUsageRecords = async () => {
  try {
    loading.records = true
    const params: any = {
      api_key: apiKey.value,
      page: pagination.page,
      page_size: pagination.size
    }

    if (filters.service) {
      params.service = filters.service
    }

    if (filters.dateRange) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }

    const response: any = await request.get('/api/v1/usage/history', { params })
    usageRecords.value = response.records || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('加载使用记录失败:', error)
    ElMessage.error('加载使用记录失败')
  } finally {
    loading.records = false
  }
}

// 获取可用服务类型
const loadAvailableServices = async () => {
  try {
    const response: any = await request.get('/api/v1/usage/services', {
      params: { api_key: apiKey.value }
    })
    availableServices.value = response || []
  } catch (error) {
    console.error('加载服务类型失败:', error)
  }
}

// 应用筛选器
const applyFilters = () => {
  pagination.page = 1
  loadUsageRecords()
  loadUsageStats()
}

// 刷新统计
const refreshStats = () => {
  loadUsageStats()
}

// 刷新记录
const refreshRecords = () => {
  loadUsageRecords()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadUsageRecords()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadUsageRecords()
}

// 导航方法
const goBack = () => {
  router.go(-1)
}

const goToAdminDashboard = () => {
  router.push('/admin/dashboard')
}

// 工具函数
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatNumber = (num: number) => {
  if (num == null) return '0'
  return num.toLocaleString()
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'expired': return 'danger'
    default: return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '激活'
    case 'inactive': return '非激活'
    case 'expired': return '过期'
    default: return '未知'
  }
}

// 获取剩余积分样式类
const getRemainingCreditsClass = (remainingCredits: number) => {
  if (remainingCredits <= 0) return 'text-danger'
  if (remainingCredits <= 10) return 'text-warning'
  return 'text-success'
}

onMounted(() => {
  apiKey.value = route.params.apiKey as string
  if (apiKey.value) {
    loadKeyInfo()
    loadUsageStats()
    loadUsageRecords()
    loadAvailableServices()
  } else {
    ElMessage.error('缺少API Key参数')
    router.push('/admin/dashboard')
  }
})
</script>

<style scoped>
.user-key-usage-history-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.breadcrumb-section {
  margin-bottom: 20px;
}

.breadcrumb-section .clickable {
  cursor: pointer;
  color: #409eff;
}

.breadcrumb-section .clickable:hover {
  text-decoration: underline;
}

.user-key-info-section,
.usage-stats-section,
.usage-records-section {
  margin-bottom: 24px;
}

.info-card,
.stats-card,
.records-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-container {
  padding: 20px;
}

.user-key-info {
  padding: 20px 0;
}

.api-key-display {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #606266;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-icon.requests { background: #3498db; }
.stat-icon.tokens { background: #f39c12; }
.stat-icon.credits { background: #e74c3c; }
.stat-icon.services { background: #27ae60; }

.stat-content h4 {
  font-size: 1.8rem;
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
}

.stat-content p {
  margin: 4px 0 0 0;
  color: #7f8c8d;
  font-size: 14px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.records-table {
  margin-bottom: 20px;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
}

.success-message {
  color: #909399;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

.text-success {
  color: #67c23a;
}

.text-muted {
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #f0f2f5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-key-usage-history-page {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* 深色主题支持 */
:global(.dark-theme) .user-key-usage-history-page {
  background-color: #0d1117;
}

:global(.dark-theme) .card-header h3 {
  color: #f0f6fc;
}

:global(.dark-theme) .api-key-display {
  background: #21262d;
  color: #f0f6fc;
}

:global(.dark-theme) .stat-item {
  background: #21262d;
}

:global(.dark-theme) .stat-content h4 {
  color: #f0f6fc;
}
</style>