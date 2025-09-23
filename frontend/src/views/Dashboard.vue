<template>
  <div class="dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- 侧边栏 -->
        <div class="col-md-3 col-lg-2 sidebar">
          <div class="sidebar-content">

            <nav class="sidebar-nav">
              <a href="#" :class="['nav-item', { active: activeTab === 'getting-started' }]" @click="activeTab = 'getting-started'">
                <ElIcon><ElIconVideoPlay /></ElIcon>
                安装Claude Code
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'keys' }]" @click="activeTab = 'keys'">
                <ElIcon><ElIconKey /></ElIcon>
                API密钥
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'packages' }]" @click="activeTab = 'packages'">
                <ElIcon><ElIconList /></ElIcon>
                订阅一览
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'plan' }]" @click="activeTab = 'plan'">
                <ElIcon><ElIconCreditCard /></ElIcon>
                订阅状态
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'promotion' }]" @click="activeTab = 'promotion'">
                <ElIcon><ElIconTrendCharts /></ElIcon>
                推广计划
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'resources' }]" @click="activeTab = 'resources'">
                <ElIcon><ElIconReading /></ElIcon>
                资料中心
              </a>
              <a href="#" :class="['nav-item', { active: activeTab === 'settings' }]" @click="activeTab = 'settings'">
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
                  <ElTableColumn prop="package_name" label="套餐名称" min-width="150">
                    <template #default="scope">
                      <div class="key-name-cell">
                        <strong>{{ scope.row.package_name || '未知套餐' }}</strong>
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
                  <ElTableColumn label="操作" width="280">
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
                          type="primary"
                          size="small"
                          @click="viewUsageHistory(scope.row)"
                        >
                          使用履历
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

          <!-- 安装Claude Code -->
          <div v-if="activeTab === 'getting-started'" class="tab-content">
            <h2 class="mb-4">安装Claude Code</h2>
            <ElCard>
              <div class="getting-started-content">
                <div class="welcome-section">
                  <h3>欢迎使用Claude Code</h3>
                  <p class="text-muted">快速安装和配置您的AI编程工具</p>
                </div>

                <div class="quick-start-steps mt-4">
                  <div class="step-item">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>下载安装Claude Code</h4>
                      <p>从官方渠道下载并安装Claude Code扩展或客户端</p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>激活API密钥</h4>
                      <p>前往"API密钥"页面激活您的专属密钥</p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <h4>选择订阅计划</h4>
                      <p>在"订阅一览"中选择适合的计划</p>
                    </div>
                  </div>

                  <div class="step-item">
                    <div class="step-number">4</div>
                    <div class="step-content">
                      <h4>开始编程</h4>
                      <p>配置完成，开始使用Claude Code提升开发效率</p>
                    </div>
                  </div>
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 订阅一览 -->
          <div v-if="activeTab === 'packages'" class="tab-content">
            <h2 class="mb-4">订阅一览</h2>
            <div class="packages-content">
              <div class="packages-header mb-4">
                <p class="text-muted">浏览可用的订阅计划，选择最适合您的服务</p>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <ElCard class="package-card">
                    <template #header>
                      <div class="package-header">
                        <h4>基础版</h4>
                        <div class="package-price">
                          <span class="price">¥99</span>
                          <span class="period">/月</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 10,000 API调用/月</li>
                        <li>✓ 基础AI模型访问</li>
                        <li>✓ 邮件技术支持</li>
                        <li>✓ 基础文档访问</li>
                      </ul>
                      <ElButton type="primary" class="package-btn">选择计划</ElButton>
                    </div>
                  </ElCard>
                </div>

                <div class="col-md-4">
                  <ElCard class="package-card featured">
                    <template #header>
                      <div class="package-header">
                        <h4>专业版</h4>
                        <div class="package-badge">推荐</div>
                        <div class="package-price">
                          <span class="price">¥299</span>
                          <span class="period">/月</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 50,000 API调用/月</li>
                        <li>✓ 高级AI模型访问</li>
                        <li>✓ 优先技术支持</li>
                        <li>✓ 完整文档和教程</li>
                        <li>✓ 自定义集成支持</li>
                      </ul>
                      <ElButton type="primary" class="package-btn">选择计划</ElButton>
                    </div>
                  </ElCard>
                </div>

                <div class="col-md-4">
                  <ElCard class="package-card">
                    <template #header>
                      <div class="package-header">
                        <h4>企业版</h4>
                        <div class="package-price">
                          <span class="price">¥999</span>
                          <span class="period">/月</span>
                        </div>
                      </div>
                    </template>
                    <div class="package-content">
                      <ul class="package-features">
                        <li>✓ 无限 API调用</li>
                        <li>✓ 所有AI模型访问</li>
                        <li>✓ 24/7专属支持</li>
                        <li>✓ 定制化解决方案</li>
                        <li>✓ 专属客户经理</li>
                        <li>✓ SLA保证</li>
                      </ul>
                      <ElButton type="primary" class="package-btn">联系销售</ElButton>
                    </div>
                  </ElCard>
                </div>
              </div>

              <div class="packages-notice mt-4">
                <ElCard>
                  <div class="notice-content">
                    <h5>💡 选择提示</h5>
                    <p class="text-muted">
                      • 基础版适合个人开发者和小型项目<br>
                      • 专业版适合中小企业和团队开发<br>
                      • 企业版适合大型企业和高频使用场景<br>
                      • 所有计划都支持随时升级或降级
                    </p>
                  </div>
                </ElCard>
              </div>
            </div>
          </div>

          <!-- 订阅状态 -->
          <div v-if="activeTab === 'plan'" class="tab-content">
            <h2 class="mb-4">订阅状态</h2>
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

          <!-- 推广计划 -->
          <div v-if="activeTab === 'promotion'" class="tab-content">
            <h2 class="mb-4">推广计划</h2>
            <ElCard>
              <div class="promotion-content">
                <div class="promotion-header">
                  <h3>邀请好友，共享收益</h3>
                  <p class="text-muted">通过推广计划获得更多收益和优惠</p>
                </div>

                <div class="promotion-stats mt-4">
                  <div class="row">
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">0</div>
                        <div class="stat-label">邀请人数</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">¥0</div>
                        <div class="stat-label">累计收益</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="promotion-stat-card">
                        <div class="stat-number">¥0</div>
                        <div class="stat-label">本月收益</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="promotion-actions mt-4">
                  <ElButton type="primary">获取推广链接</ElButton>
                  <ElButton type="default">查看推广规则</ElButton>
                </div>

                <div class="promotion-notice mt-4">
                  <p class="text-muted">
                    <small>
                      ⚠️ 推广计划功能即将上线，敬请期待！
                    </small>
                  </p>
                </div>
              </div>
            </ElCard>
          </div>

          <!-- 资料中心 -->
          <div v-if="activeTab === 'resources'" class="tab-content">
            <h2 class="mb-4">资料中心</h2>
            <div class="row">
              <div class="col-md-6">
                <ElCard class="resource-card">
                  <template #header>
                    <div class="resource-header">
                      <h4>📖 使用文档</h4>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>详细的API文档和使用指南</p>
                    <ElButton type="text">查看文档</ElButton>
                  </div>
                </ElCard>
              </div>

              <div class="col-md-6">
                <ElCard class="resource-card">
                  <template #header>
                    <div class="resource-header">
                      <h4>🎥 视频教程</h4>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>快速上手Claude Code的视频教程</p>
                    <ElButton type="text">观看视频</ElButton>
                  </div>
                </ElCard>
              </div>

              <div class="col-md-6">
                <ElCard class="resource-card">
                  <template #header>
                    <div class="resource-header">
                      <h4>💬 社区论坛</h4>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>与其他开发者交流经验</p>
                    <ElButton type="text">访问论坛</ElButton>
                  </div>
                </ElCard>
              </div>

              <div class="col-md-6">
                <ElCard class="resource-card">
                  <template #header>
                    <div class="resource-header">
                      <h4>🤝 技术支持</h4>
                    </div>
                  </template>
                  <div class="resource-content">
                    <p>获得专业的技术支持服务</p>
                    <ElButton type="text">联系支持</ElButton>
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
  Key as ElIconKey,
  CreditCard as ElIconCreditCard,
  Setting as ElIconSetting,
  SwitchButton as ElIconSwitchButton,
  Plus as ElIconPlus,
  Box as ElIconBox,
  Refresh as ElIconRefresh,
  Search as ElIconSearch,
  CopyDocument as ElIconCopyDocument,
  VideoPlay as ElIconVideoPlay,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  Reading as ElIconReading
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

const activeTab = ref('keys')
const apiKeys = ref<ApiKey[]>([])
const filteredKeys = ref<ApiKey[]>([])
const loadingKeys = ref(false)

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


const loadUserKeys = async () => {
  try {
    loadingKeys.value = true
    const response: any = await request.get('/api/v1/keys/')
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
    Object.assign(planInfo, response.data)
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

const viewUsageHistory = (key: any) => {
  router.push(`/usage-history/${key.api_key}`)
}

const viewKeyDetails = (key: any) => {
  ElMessageBox.alert(
    `
    <div>
      <p><strong>套餐名称:</strong> ${key.package_name || '未知套餐'}</p>
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

/* 新增页面样式 */
.getting-started-content {
  padding: 20px 0;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.quick-start-steps {
  max-width: 600px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 20px;
  flex-shrink: 0;
}

.step-content h4 {
  margin-bottom: 8px;
  color: #2c3e50;
}

.step-content p {
  margin: 0;
  color: #666;
}

.promotion-content {
  padding: 20px 0;
}

.promotion-header {
  text-align: center;
  margin-bottom: 30px;
}

.promotion-header h3 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.promotion-stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  margin-bottom: 16px;
  border-left: 4px solid #27ae60;
}

.promotion-stat-card .stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 8px;
}

.promotion-stat-card .stat-label {
  color: #666;
  font-size: 0.9rem;
}

.promotion-actions {
  text-align: center;
}

.promotion-actions .el-button {
  margin: 0 10px;
}

.promotion-notice {
  text-align: center;
  padding: 15px;
  background: #fff3cd;
  border-radius: 8px;
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

.notice-content h5 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.notice-content p {
  margin: 0;
  line-height: 1.6;
}

/* 订阅一览页面样式 */
.packages-content {
  padding: 20px 0;
}

.packages-header {
  text-align: center;
}

.package-card {
  margin-bottom: 30px;
  border: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.package-card.featured {
  border: 2px solid #409eff;
  position: relative;
}

.package-header {
  text-align: center;
  padding: 10px 0;
  position: relative;
}

.package-header h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 1.5rem;
}

.package-badge {
  position: absolute;
  top: -15px;
  right: 20px;
  background: #409eff;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: bold;
}

.package-price {
  margin-top: 15px;
}

.package-price .price {
  font-size: 2.5rem;
  font-weight: bold;
  color: #409eff;
}

.package-price .period {
  font-size: 1rem;
  color: #666;
  margin-left: 5px;
}

.package-content {
  padding: 20px;
}

.package-features {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.package-features li {
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f5;
  color: #555;
  font-size: 0.95rem;
}

.package-features li:last-child {
  border-bottom: none;
}

.package-btn {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  font-weight: bold;
}

.packages-notice {
  margin-top: 40px;
}

.packages-notice .notice-content {
  text-align: left;
}

.packages-notice .notice-content h5 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.packages-notice .notice-content p {
  line-height: 1.8;
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