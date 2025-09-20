<template>
  <div class="dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- 侧边栏 -->
        <div class="col-md-3 col-lg-2 sidebar">
          <div class="sidebar-content">
            <div class="user-info">
              <div class="user-avatar">
                <ElAvatar :size="60" :src="userStore.avatar || undefined">
                  {{ userStore.name?.charAt(0) }}
                </ElAvatar>
              </div>
              <h5 class="mt-3">{{ userStore.name }}</h5>
              <p class="text-muted">{{ userStore.email }}</p>
            </div>

            <nav class="sidebar-nav">
              <a href="#" class="nav-item active" @click="activeTab = 'overview'">
                <ElIcon><ElIconDataAnalysis /></ElIcon>
                概览
              </a>
              <a href="#" class="nav-item" @click="activeTab = 'keys'">
                <ElIcon><ElIconKey /></ElIcon>
                API密钥
              </a>
              <router-link to="/packages" class="nav-item">
                <ElIcon><ElIconBox /></ElIcon>
                软件包
              </router-link>
              <a href="#" class="nav-item" @click="activeTab = 'plan'">
                <ElIcon><ElIconCreditCard /></ElIcon>
                套餐状态
              </a>
              <a href="#" class="nav-item" @click="activeTab = 'settings'">
                <ElIcon><ElIconSetting /></ElIcon>
                设置
              </a>
            </nav>

            <div class="sidebar-footer">
              <ElButton type="text" @click="handleLogout">
                <ElIcon><ElIconSwitchButton /></ElIcon>
                退出登录
              </ElButton>
            </div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="col-md-9 col-lg-10 main-content">
          <!-- 概览 -->
          <div v-if="activeTab === 'overview'" class="tab-content">
            <h2 class="mb-4">控制台概览</h2>

            <div class="row mb-4">
              <div class="col-md-3">
                <div class="stat-card">
                  <div class="stat-icon bg-primary">
                    <ElIcon><ElIconKey /></ElIcon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ stats.totalKeys }}</h3>
                    <p>API密钥</p>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card">
                  <div class="stat-icon bg-success">
                    <ElIcon><ElIconDataAnalysis /></ElIcon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ stats.totalRequests }}</h3>
                    <p>总请求数</p>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card">
                  <div class="stat-icon bg-warning">
                    <ElIcon><ElIconCoin /></ElIcon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ stats.creditsRemaining }}</h3>
                    <p>剩余积分</p>
                  </div>
                </div>
              </div>

              <div class="col-md-3">
                <div class="stat-card">
                  <div class="stat-icon bg-info">
                    <ElIcon><ElIconTimer /></ElIcon>
                  </div>
                  <div class="stat-info">
                    <h3>{{ stats.planDaysLeft }}</h3>
                    <p>套餐剩余天数</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <ElCard class="recent-activity">
                  <template #header>
                    <h5>最近活动</h5>
                  </template>
                  <div class="activity-list">
                    <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                      <div class="activity-icon">
                        <ElIcon><ElIconCircleCheck /></ElIcon>
                      </div>
                      <div class="activity-content">
                        <p class="mb-1">{{ activity.description }}</p>
                        <small class="text-muted">{{ activity.time }}</small>
                      </div>
                    </div>
                  </div>
                </ElCard>
              </div>
            </div>
          </div>

          <!-- API密钥管理 -->
          <div v-if="activeTab === 'keys'" class="tab-content">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h2>API密钥管理</h2>
              <div class="key-actions">
                <router-link to="/key-activation" class="btn btn-primary me-2">
                  <ElIcon><ElIconPlus /></ElIcon>
                  激活新密钥
                </router-link>
                <ElButton @click="refreshKeys" :loading="loadingKeys">
                  <ElIcon><ElIconRefresh /></ElIcon>
                  刷新
                </ElButton>
              </div>
            </div>

            <!-- 密钥统计卡片 -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="key-stat-card">
                  <div class="stat-number">{{ keyStats.total }}</div>
                  <div class="stat-label">总密钥数</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="key-stat-card">
                  <div class="stat-number">{{ keyStats.active }}</div>
                  <div class="stat-label">激活密钥</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="key-stat-card">
                  <div class="stat-number">{{ keyStats.used_today }}</div>
                  <div class="stat-label">今日使用</div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="key-stat-card">
                  <div class="stat-number">{{ keyStats.requests_total }}</div>
                  <div class="stat-label">总请求数</div>
                </div>
              </div>
            </div>

            <!-- 密钥搜索和筛选 -->
            <ElCard class="mb-4">
              <ElRow :gutter="16" class="filter-row">
                <ElCol :span="8">
                  <ElInput
                    v-model="keyFilters.search"
                    placeholder="搜索密钥名称..."
                    :prefix-icon="ElIconSearch"
                    clearable
                    @input="filterKeys"
                  />
                </ElCol>
                <ElCol :span="6">
                  <ElSelect
                    v-model="keyFilters.status"
                    placeholder="筛选状态"
                    clearable
                    @change="filterKeys"
                  >
                    <ElOption label="全部" value="" />
                    <ElOption label="激活" value="active" />
                    <ElOption label="禁用" value="inactive" />
                  </ElSelect>
                </ElCol>
                <ElCol :span="6">
                  <ElSelect
                    v-model="keyFilters.usage"
                    placeholder="使用情况"
                    clearable
                    @change="filterKeys"
                  >
                    <ElOption label="全部" value="" />
                    <ElOption label="近期使用" value="recent" />
                    <ElOption label="未使用" value="unused" />
                  </ElSelect>
                </ElCol>
                <ElCol :span="4">
                  <ElButton type="primary" @click="filterKeys" style="width: 100%">
                    筛选
                  </ElButton>
                </ElCol>
              </ElRow>
            </ElCard>

            <!-- 密钥列表 -->
            <ElCard>
              <div v-if="loadingKeys" class="text-center py-4">
                <ElSkeleton :rows="5" animated />
              </div>
              <div v-else-if="filteredKeys.length === 0" class="empty-keys">
                <i class="fas fa-key empty-icon"></i>
                <h4>暂无密钥</h4>
                <p>您还没有创建任何API密钥</p>
                <router-link to="/key-activation" class="btn btn-primary">
                  立即激活密钥
                </router-link>
              </div>
              <div v-else>
                <ElTable :data="filteredKeys" stripe>
                  <ElTableColumn prop="key_name" label="密钥名称" min-width="150">
                    <template #default="scope">
                      <div class="key-name-cell">
                        <strong>{{ scope.row.key_name }}</strong>
                        <div class="key-id text-muted small">ID: {{ scope.row.user_key_id }}</div>
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="api_key" label="自定义密钥" show-overflow-tooltip min-width="200">
                    <template #default="scope">
                      <div class="api-key-cell">
                        <code class="api-key-text">{{ maskApiKey(scope.row.api_key) }}</code>
                        <ElButton size="small" text @click="copyApiKey(scope.row.api_key)">
                          <ElIcon><ElIconCopyDocument /></ElIcon>
                        </ElButton>
                      </div>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="is_active" label="状态" width="100">
                    <template #default="scope">
                      <ElTag :type="scope.row.is_active ? 'success' : 'danger'">
                        {{ scope.row.is_active ? '激活' : '禁用' }}
                      </ElTag>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="usage_count" label="使用次数" width="100">
                    <template #default="scope">
                      <span class="usage-count">{{ scope.row.usage_count || 0 }}</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="last_used_at" label="最后使用" min-width="150">
                    <template #default="scope">
                      <span v-if="scope.row.last_used_at" class="last-used">
                        {{ formatRelativeTime(scope.row.last_used_at) }}
                      </span>
                      <span v-else class="text-muted">从未使用</span>
                    </template>
                  </ElTableColumn>
                  <ElTableColumn prop="created_at" label="创建时间" min-width="150">
                    <template #default="scope">
                      {{ formatDate(scope.row.created_at) }}
                    </template>
                  </ElTableColumn>
                  <ElTableColumn label="操作" width="200">
                    <template #default="scope">
                      <div class="action-buttons">
                        <ElButton
                          :type="scope.row.is_active ? 'warning' : 'success'"
                          size="small"
                          @click="toggleKeyStatus(scope.row)"
                        >
                          {{ scope.row.is_active ? '禁用' : '启用' }}
                        </ElButton>
                        <ElButton
                          type="info"
                          size="small"
                          @click="viewKeyDetails(scope.row)"
                        >
                          详情
                        </ElButton>
                        <ElButton
                          type="danger"
                          size="small"
                          @click="deleteKey(scope.row)"
                        >
                          删除
                        </ElButton>
                      </div>
                    </template>
                  </ElTableColumn>
                </ElTable>

                <!-- 分页 -->
                <div v-if="filteredKeys.length > 0" class="pagination-wrapper">
                  <ElPagination
                    v-model:current-page="keyPagination.current"
                    v-model:page-size="keyPagination.size"
                    :page-sizes="[10, 20, 50]"
                    :total="filteredKeys.length"
                    layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleKeySizeChange"
                    @current-change="handleKeyPageChange"
                  />
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 套餐状态 -->
          <div v-if="activeTab === 'plan'" class="tab-content">
            <h2 class="mb-4">套餐状态</h2>
            <ElCard>
              <div class="plan-status">
                <div class="plan-header">
                  <h4>{{ planInfo.plan_type }}</h4>
                  <ElTag :type="planInfo.has_active_plan ? 'success' : 'warning'">
                    {{ planInfo.has_active_plan ? '激活中' : '未激活' }}
                  </ElTag>
                </div>

                <div class="plan-usage mt-4">
                  <p>积分使用情况</p>
                  <ElProgress
                    :percentage="planInfo.usage_percentage"
                    :color="getProgressColor(planInfo.usage_percentage)"
                  />
                  <div class="usage-info mt-2">
                    <span>剩余: {{ planInfo.credits_remaining }}</span>
                    <span class="float-end">总计: {{ planInfo.total_credits }}</span>
                  </div>
                </div>
              </div>
            </ElCard>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElAvatar,
  ElIcon,
  ElProgress,
  ElMessage,
  ElMessageBox,
  ElInput,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElSkeleton,
  ElPagination
} from 'element-plus'
import {
  DataAnalysis as ElIconDataAnalysis,
  Key as ElIconKey,
  CreditCard as ElIconCreditCard,
  Setting as ElIconSetting,
  SwitchButton as ElIconSwitchButton,
  CircleCheck as ElIconCircleCheck,
  Plus as ElIconPlus,
  Coin as ElIconCoin,
  Timer as ElIconTimer,
  Box as ElIconBox,
  Refresh as ElIconRefresh,
  Search as ElIconSearch,
  CopyDocument as ElIconCopyDocument
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()

interface ApiKey {
  user_key_id: string
  key_name: string
  api_key: string
  is_active: boolean
  usage_count?: number
  last_used_at?: string
  created_at: string
}

const activeTab = ref('overview')
const apiKeys = ref<ApiKey[]>([])
const filteredKeys = ref<ApiKey[]>([])
const loadingKeys = ref(false)
const stats = reactive({
  totalKeys: 0,
  totalRequests: 0,
  creditsRemaining: 0,
  planDaysLeft: 0
})

const keyStats = reactive({
  total: 0,
  active: 0,
  used_today: 0,
  requests_total: 0
})

const keyFilters = reactive({
  search: '',
  status: '',
  usage: ''
})

const keyPagination = reactive({
  current: 1,
  size: 10
})

const planInfo = reactive({
  has_active_plan: false,
  plan_type: '免费套餐',
  credits_remaining: 0,
  total_credits: 0,
  usage_percentage: 0
})

const recentActivities = ref([
  { id: 1, description: '成功激活API密钥', time: '2分钟前' },
  { id: 2, description: '登录系统', time: '1小时前' },
  { id: 3, description: '更新个人信息', time: '1天前' }
])

const loadUserKeys = async () => {
  try {
    loadingKeys.value = true
    const response: any = await request.get('/api/v1/user-keys/')
    apiKeys.value = response.keys || []

    // 更新统计数据
    keyStats.total = apiKeys.value.length
    keyStats.active = apiKeys.value.filter(k => k.is_active).length
    keyStats.used_today = apiKeys.value.filter(k => {
      if (!k.last_used_at) return false
      const today = new Date().toDateString()
      const lastUsed = new Date(k.last_used_at).toDateString()
      return today === lastUsed
    }).length
    keyStats.requests_total = apiKeys.value.reduce((sum, k) => sum + (k.usage_count || 0), 0)

    stats.totalKeys = keyStats.total
    filterKeys()
  } catch (error) {
    console.error('获取密钥列表失败:', error)
    ElMessage.error('获取密钥列表失败')
  } finally {
    loadingKeys.value = false
  }
}

const loadPlanStatus = async () => {
  try {
    const response = await request.get('/api/v1/keys/plan-status')
    Object.assign(planInfo, response)
    stats.creditsRemaining = response.data.credits_remaining
  } catch (error) {
    console.error('获取套餐状态失败:', error)
  }
}

const toggleKeyStatus = async (key: any) => {
  try {
    await request.put(`/api/v1/keys/${key.id}/toggle`)
    key.is_active = !key.is_active
    ElMessage.success(`密钥已${key.is_active ? '启用' : '禁用'}`)
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteKey = async (key: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个密钥吗？', '确认删除', {
      type: 'warning'
    })

    await request.delete(`/api/v1/keys/${key.id}`)
    await loadUserKeys()
    ElMessage.success('密钥已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 新增的密钥管理方法
const refreshKeys = () => {
  loadUserKeys()
}

const filterKeys = () => {
  let filtered = [...apiKeys.value]

  if (keyFilters.search) {
    filtered = filtered.filter(key =>
      key.key_name.toLowerCase().includes(keyFilters.search.toLowerCase())
    )
  }

  if (keyFilters.status) {
    filtered = filtered.filter(key => {
      if (keyFilters.status === 'active') return key.is_active
      if (keyFilters.status === 'inactive') return !key.is_active
      return true
    })
  }

  if (keyFilters.usage) {
    filtered = filtered.filter(key => {
      if (keyFilters.usage === 'recent') {
        if (!key.last_used_at) return false
        const daysDiff = (Date.now() - new Date(key.last_used_at).getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 7 // 7天内使用过
      }
      if (keyFilters.usage === 'unused') return !key.last_used_at
      return true
    })
  }

  filteredKeys.value = filtered
}

const maskApiKey = (apiKey: string) => {
  if (!apiKey) return '-'
  if (apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
}

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey)
    ElMessage.success('API密钥已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const viewKeyDetails = (key: any) => {
  ElMessageBox.alert(
    `
    <div>
      <p><strong>密钥名称:</strong> ${key.key_name}</p>
      <p><strong>密钥ID:</strong> ${key.user_key_id}</p>
      <p><strong>API密钥:</strong> ${key.api_key}</p>
      <p><strong>状态:</strong> ${key.is_active ? '激活' : '禁用'}</p>
      <p><strong>使用次数:</strong> ${key.usage_count || 0}</p>
      <p><strong>创建时间:</strong> ${formatDate(key.created_at)}</p>
      <p><strong>最后使用:</strong> ${key.last_used_at ? formatDate(key.last_used_at) : '从未使用'}</p>
    </div>
    `,
    '密钥详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  )
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const now = Date.now()
  const past = new Date(dateStr).getTime()
  const diff = now - past

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return `${seconds}秒前`
}

const handleKeyPageChange = (page: number) => {
  keyPagination.current = page
}

const handleKeySizeChange = (size: number) => {
  keyPagination.size = size
  keyPagination.current = 1
}

onMounted(() => {
  loadUserKeys()
  loadPlanStatus()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f5f5f5;
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

.user-info {
  text-align: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
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

.sidebar-footer {
  position: absolute;
  bottom: 30px;
  left: 20px;
  right: 20px;
}

.main-content {
  padding: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  margin-right: 15px;
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
}

.stat-info p {
  margin: 0;
  color: #666;
}

.recent-activity {
  margin-top: 20px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #67c23a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.activity-content {
  flex: 1;
}

.plan-status {
  padding: 20px 0;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

/* 新增样式 */
.key-actions {
  display: flex;
  gap: 8px;
}

.key-stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 16px;
}

.key-stat-card .stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.key-stat-card .stat-label {
  color: #666;
  font-size: 0.9rem;
}

.filter-row {
  align-items: center;
}

.empty-keys {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-keys .empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 16px;
}

.key-name-cell {
  display: flex;
  flex-direction: column;
}

.key-id {
  font-size: 0.8rem;
  margin-top: 4px;
}

.api-key-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-key-text {
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.usage-count {
  font-weight: 600;
  color: #409eff;
}

.last-used {
  color: #67c23a;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  font-size: 0.8rem;
  padding: 4px 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f2f5;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .key-actions {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }

  .api-key-cell {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>