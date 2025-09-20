<template>
  <div class="subscription-detail-page">
    <div class="container-fluid">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <ElBreadcrumb separator="/">
          <ElBreadcrumbItem @click="goBack" class="clickable">订阅管理</ElBreadcrumbItem>
          <ElBreadcrumbItem>订阅详情</ElBreadcrumbItem>
        </ElBreadcrumb>
      </div>

      <!-- 订阅基本信息 -->
      <div class="subscription-info-section">
        <ElCard shadow="never" class="info-card">
          <template #header>
            <div class="card-header">
              <h3>
                <i class="fas fa-cube"></i>
                订阅信息
              </h3>
            </div>
          </template>

          <div v-if="loading.detail" class="loading-container">
            <ElSkeleton :rows="3" animated />
          </div>

          <div v-else-if="subscription" class="subscription-info">
            <ElDescriptions :column="3" border>
              <ElDescriptionsItem label="订阅名称">
                {{ subscription.package_name }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="订阅代码">
                {{ subscription.package_code }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="状态">
                <ElTag :type="subscription.is_active ? 'success' : 'danger'">
                  {{ subscription.is_active ? '可用' : '不可用' }}
                </ElTag>
              </ElDescriptionsItem>
              <ElDescriptionsItem label="服务端点">
                {{ subscription.endpoint || '未设置' }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="价格">
                ¥{{ subscription.price }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="积分">
                {{ subscription.credits }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="时长">
                {{ subscription.duration_days }} 天
              </ElDescriptionsItem>
              <ElDescriptionsItem label="排序">
                {{ subscription.sort_order }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="创建时间">
                {{ formatDate(subscription.created_at) }}
              </ElDescriptionsItem>
              <ElDescriptionsItem label="描述" :span="3">
                {{ subscription.description || '暂无描述' }}
              </ElDescriptionsItem>
            </ElDescriptions>
          </div>
        </ElCard>
      </div>

      <!-- 用户密钥管理 -->
      <div class="userkeys-section">
        <ElCard shadow="never" class="userkeys-card">
          <template #header>
            <div class="card-header">
              <h3>
                <i class="fas fa-key"></i>
                用户密钥管理
              </h3>
              <div class="header-actions">
                <ElButton
                  type="success"
                  @click="batchGenerateUserKeys"
                  :loading="loading.batchGenerate"
                >
                  <i class="fas fa-plus-circle"></i>
                  批量生成 (10个)
                </ElButton>
                <ElButton
                  type="primary"
                  @click="showBulkOperationDialog"
                  :disabled="selectedUserKeys.length === 0"
                >
                  <i class="fas fa-cogs"></i>
                  批量操作 ({{ selectedUserKeys.length }})
                </ElButton>
                <ElButton @click="refreshUserKeys" :loading="loading.userKeys">
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
                  v-model="userKeyFilter.status"
                  placeholder="状态筛选"
                  clearable
                  @change="loadUserKeys"
                >
                  <ElOption label="全部" value="" />
                  <ElOption label="激活" value="active" />
                  <ElOption label="非激活" value="inactive" />
                  <ElOption label="过期" value="expired" />
                </ElSelect>
              </ElCol>
            </ElRow>
          </div>

          <!-- 用户密钥列表 -->
          <div class="userkeys-table">
            <ElTable
              v-loading="loading.userKeys"
              :data="userKeys"
              @selection-change="handleSelectionChange"
              style="width: 100%"
            >
              <ElTableColumn type="selection" width="55" />
              <ElTableColumn prop="user_email" label="用户邮箱" width="200" />
              <ElTableColumn prop="api_key" label="用户Key" width="250">
                <template #default="scope">
                  <div class="user-key-container">
                    <code class="api-key">{{ truncateKey(scope.row.api_key) }}</code>
                    <ElButton
                      type="primary"
                      size="small"
                      @click="copyToClipboard(scope.row.api_key)"
                      class="copy-btn"
                    >
                      <i class="fas fa-copy"></i>
                    </ElButton>
                  </div>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="key_name" label="密钥名称" width="150" />
              <ElTableColumn prop="status" label="状态" width="100">
                <template #default="scope">
                  <ElTag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="activation_date" label="激活时间" width="180">
                <template #default="scope">
                  {{ scope.row.activation_date ? formatDate(scope.row.activation_date) : '未激活' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="expire_date" label="过期时间" width="180">
                <template #default="scope">
                  {{ scope.row.expire_date ? formatDate(scope.row.expire_date) : '-' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="remaining_days" label="剩余天数" width="120">
                <template #default="scope">
                  <span v-if="scope.row.activation_date" :class="getRemainingDaysClass(scope.row.remaining_days)">
                    {{ scope.row.remaining_days }} 天
                  </span>
                  <span v-else class="inactive">
                    {{ scope.row.remaining_days }} 天 (初始)
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="remaining_credits" label="剩余积分" width="120">
                <template #default="scope">
                  <span class="credits">
                    {{ scope.row.remaining_credits || 0 }} / {{ scope.row.total_credits || 0 }}
                  </span>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="last_used_at" label="最后使用" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.last_used_at) || '未使用' }}
                </template>
              </ElTableColumn>
              <ElTableColumn prop="notes" label="备注" min-width="150" />
            </ElTable>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <ElPagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.size"
              :page-sizes="[25, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </ElCard>
      </div>
    </div>

    <!-- 批量操作对话框 -->
    <ElDialog
      v-model="bulkOperationVisible"
      title="批量操作"
      width="500px"
      :before-close="handleCloseBulkOperation"
    >
      <ElForm :model="bulkOperation" label-width="100px">
        <ElFormItem label="操作类型">
          <ElSelect v-model="bulkOperation.operation" placeholder="选择操作类型">
            <ElOption label="生成密钥" value="generate" />
            <ElOption label="激活密钥" value="activate" />
            <ElOption label="禁用密钥" value="deactivate" />
            <ElOption label="删除密钥" value="delete" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="操作备注">
          <ElInput
            v-model="bulkOperation.notes"
            type="textarea"
            :rows="3"
            placeholder="可选的操作备注"
          />
        </ElFormItem>
        <ElFormItem>
          <div class="operation-info">
            <p>将对 <strong>{{ selectedUserKeys.length }}</strong> 个用户密钥执行 <strong>{{ getOperationText(bulkOperation.operation) }}</strong> 操作</p>
          </div>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="bulkOperationVisible = false">取消</ElButton>
          <ElButton
            type="primary"
            @click="executeBulkOperation"
            :loading="loading.bulkOperation"
            :disabled="!bulkOperation.operation"
          >
            确认执行
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ElCard, ElButton, ElBreadcrumb, ElBreadcrumbItem, ElDescriptions, ElDescriptionsItem,
  ElTag, ElSkeleton, ElTable, ElTableColumn, ElSelect, ElOption, ElRow, ElCol,
  ElPagination, ElDialog, ElForm, ElFormItem, ElInput
} from 'element-plus'
import request from '../../utils/request'

interface Subscription {
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

interface UserKey {
  id: number
  user_id: string
  api_key_id: number
  api_key: string
  key_name?: string
  description?: string
  user_email: string
  activation_date: string
  status: string
  notes?: string
  last_used_at?: string
  start_date: string
  expire_date: string
  remaining_days: number
  remaining_credits: number
  total_credits: number
  created_at: string
}

const route = useRoute()
const router = useRouter()

const subscription = ref<Subscription | null>(null)
const userKeys = ref<UserKey[]>([])
const selectedUserKeys = ref<UserKey[]>([])
const bulkOperationVisible = ref(false)

const loading = reactive({
  detail: false,
  userKeys: false,
  bulkOperation: false,
  batchGenerate: false
})

const userKeyFilter = reactive({
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 50,
  total: 0
})

const bulkOperation = reactive({
  operation: '',
  notes: ''
})

// 获取订阅详情
const loadSubscriptionDetail = async () => {
  try {
    loading.detail = true
    const packageId = route.params.id
    const response: any = await request.get(`/api/v1/packages/${packageId}`)
    subscription.value = response
  } catch (error) {
    console.error('加载订阅详情失败:', error)
    ElMessage.error('加载订阅详情失败')
  } finally {
    loading.detail = false
  }
}

// 获取用户密钥列表
const loadUserKeys = async () => {
  try {
    loading.userKeys = true
    const packageId = route.params.id
    const params = {
      page: pagination.page,
      page_size: pagination.size,
      status_filter: userKeyFilter.status || undefined
    }

    const response: any = await request.get(`/api/v1/packages/${packageId}/userkeys`, { params })
    userKeys.value = response.user_keys || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('加载用户密钥列表失败:', error)
    ElMessage.error('加载用户密钥列表失败')
  } finally {
    loading.userKeys = false
  }
}

// 刷新用户密钥列表
const refreshUserKeys = () => {
  loadUserKeys()
}

// 分页处理
const handlePageChange = (page: number) => {
  pagination.page = page
  loadUserKeys()
}

const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.page = 1
  loadUserKeys()
}

// 选择处理
const handleSelectionChange = (selection: UserKey[]) => {
  selectedUserKeys.value = selection
}

// 批量操作
const showBulkOperationDialog = () => {
  bulkOperationVisible.value = true
}

const handleCloseBulkOperation = () => {
  bulkOperationVisible.value = false
  bulkOperation.operation = ''
  bulkOperation.notes = ''
}

const executeBulkOperation = async () => {
  try {
    loading.bulkOperation = true
    const packageId = route.params.id

    const operationData = {
      user_ids: selectedUserKeys.value.map(uk => uk.user_id),
      api_key_id: selectedUserKeys.value[0]?.api_key_id,
      operation: bulkOperation.operation,
      notes: bulkOperation.notes
    }

    const response: any = await request.post(`/api/v1/packages/${packageId}/userkeys/batch`, operationData)
    ElMessage.success(response.message || '批量操作成功')

    // 重新加载用户密钥列表
    await loadUserKeys()

    // 关闭对话框
    handleCloseBulkOperation()
    selectedUserKeys.value = []

  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
  } finally {
    loading.bulkOperation = false
  }
}

// 工具函数
const goBack = () => {
  router.push('/admin/dashboard')
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
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

const getRemainingDaysClass = (days: number) => {
  if (days <= 0) return 'expired'
  if (days <= 7) return 'warning'
  if (days <= 30) return 'attention'
  return 'normal'
}

const getOperationText = (operation: string) => {
  switch (operation) {
    case 'generate': return '生成密钥'
    case 'activate': return '激活密钥'
    case 'deactivate': return '禁用密钥'
    case 'delete': return '删除密钥'
    default: return operation
  }
}

// 批量生成user key
const batchGenerateUserKeys = async () => {
  try {
    loading.batchGenerate = true
    const packageId = route.params.id

    const response: any = await request.post(`/api/v1/packages/${packageId}/userkeys/batch-generate`, {
      count: 10,
      status: 'inactive'
    })

    ElMessage.success(response.message || '批量生成用户密钥成功')

    // 刷新用户密钥列表
    await loadUserKeys()

  } catch (error) {
    console.error('批量生成用户密钥失败:', error)
    ElMessage.error('批量生成用户密钥失败')
  } finally {
    loading.batchGenerate = false
  }
}

// 截断显示用户Key
const truncateKey = (key: string) => {
  if (!key) return ''
  return key.length > 10 ? `${key.substring(0, 10)}...` : key
}

// 拷贝到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('用户Key已复制到剪贴板')
  } catch (error) {
    // 兼容不支持clipboard API的浏览器
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('用户Key已复制到剪贴板')
  }
}

onMounted(() => {
  loadSubscriptionDetail()
  loadUserKeys()
})
</script>

<style scoped>
.subscription-detail-page {
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

.subscription-info-section {
  margin-bottom: 24px;
}

.userkeys-section {
  margin-bottom: 24px;
}

.info-card, .userkeys-card {
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

.subscription-info {
  padding: 20px 0;
}

.filter-section {
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.userkeys-table {
  margin-bottom: 20px;
}

.user-key-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  flex: 1;
  min-width: 0;
}

.copy-btn {
  flex-shrink: 0;
  padding: 4px 8px;
}

.credits {
  font-weight: 600;
}

.expired {
  color: #f56c6c;
  font-weight: 600;
}

.warning {
  color: #e6a23c;
  font-weight: 600;
}

.attention {
  color: #409eff;
}

.normal {
  color: #67c23a;
}

.inactive {
  color: #909399;
  font-style: italic;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 1px solid #f0f2f5;
}

.operation-info {
  background: #ecf5ff;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.operation-info p {
  margin: 0;
  color: #606266;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .subscription-detail-page {
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
}

/* 深色主题支持 */
:global(.dark-theme) .subscription-detail-page {
  background-color: #0d1117;
}

:global(.dark-theme) .card-header h3 {
  color: #f0f6fc;
}

:global(.dark-theme) .api-key {
  background: #21262d;
  color: #f0f6fc;
}
</style>