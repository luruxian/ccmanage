<template>
  <div class="tab-content">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>API密钥一览</h2>
      <div class="key-actions">
        <router-link to="/key-activation" class="btn btn-primary me-2">
          <ElIcon><ElIconPlus /></ElIcon>
          激活新密钥
        </router-link>
        <ElButton @click="$emit('refresh-keys')" :loading="loadingKeys">
          <ElIcon><ElIconRefresh /></ElIcon>
          刷新
        </ElButton>
      </div>
    </div>

    <!-- 密钥统计 -->
    <div class="key-stats-inline mb-4">
      <div class="stat-badge">
        <div class="stat-icon">
          <ElIcon><ElIconKey /></ElIcon>
        </div>
        <div class="stat-content">
          <span class="stat-number">{{ keyStats.active }}</span>
          <span class="stat-label">激活密钥</span>
        </div>
      </div>
    </div>

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
        <div class="custom-table">
          <div class="table-header">
            <div class="header-row">
              <div class="col-subscription">订阅名称</div>
              <div class="col-api-key">API密钥</div>
              <div class="col-status">状态</div>
              <div class="col-activation">激活时间</div>
              <div class="col-expire">过期时间</div>
              <div class="col-days">剩余天数</div>
              <div class="col-actions">操作</div>
            </div>
          </div>
          <div class="table-body">
            <div v-for="key in paginatedKeys" :key="key.user_key_id" class="key-item">
              <!-- 第一行：主要信息 -->
              <div class="main-row">
                <div class="col-subscription">
                  <div class="key-name-cell">
                    <strong>{{ key.package_name || '未知订阅' }}</strong>
                  </div>
                </div>
                <div class="col-api-key">
                  <div class="api-key-cell">
                    <code class="api-key-text">{{ maskApiKey(key.api_key) }}</code>
                    <ElButton size="small" text @click="copyApiKey(key.api_key)">
                      <ElIcon><ElIconCopyDocument /></ElIcon>
                    </ElButton>
                  </div>
                </div>
                <div class="col-status">
                  <ElTag :type="getStatusType(key.status)" size="small">
                    {{ getStatusText(key.status) }}
                  </ElTag>
                </div>
                <div class="col-activation">
                  <span v-if="key.activation_date" class="date-text">
                    {{ formatDateShort(key.activation_date) }}
                  </span>
                  <span v-else class="text-muted">未激活</span>
                </div>
                <div class="col-expire">
                  <span v-if="key.expire_date" class="date-text">
                    {{ formatDateShort(key.expire_date) }}
                  </span>
                  <span v-else class="text-muted">永久</span>
                </div>
                <div class="col-days">
                  <span v-if="key.remaining_days !== null"
                        :class="getRemainingDaysClass(key.remaining_days)">
                    {{ key.remaining_days }}天
                  </span>
                  <span v-else class="text-muted">永久</span>
                </div>
                <div class="col-actions">
                  <div class="action-buttons">
                    <ElButton
                      type="primary"
                      size="small"
                      @click="$emit('view-usage-history', key)"
                    >
                      履历
                    </ElButton>
                    <ElButton
                      type="success"
                      size="small"
                      @click="$emit('reset-credits', key)"
                      :disabled="!canResetCredits(key)"
                      style="margin-left: 4px;"
                    >
                      重置积分
                    </ElButton>
                    <ElButton
                      type="info"
                      size="small"
                      @click="$emit('download-config', key)"
                      style="margin-left: 4px;"
                    >
                      下载配置
                    </ElButton>
                  </div>
                </div>
              </div>
              <!-- 第二行：积分信息 -->
              <div class="credits-row">
                <div class="credits-content">
                  <div class="credits-info-container">
                    <div class="credits-basic">
                      <div class="credit-item">
                        <span class="credit-label">总积分：</span>
                        <span v-if="key.total_credits !== null" class="credit-value">
                          {{ key.total_credits }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </div>
                      <div class="credit-item">
                        <span class="credit-label">剩余积分：</span>
                        <span v-if="key.remaining_credits !== null"
                              class="credit-value"
                              :class="getRemainingCreditsClass(key.remaining_credits, key.total_credits)">
                          {{ key.remaining_credits }}
                        </span>
                        <span v-else class="text-muted">-</span>
                      </div>
                    </div>
                    <div v-if="key.total_credits && key.total_credits > 0" class="credits-progress">
                      <div class="progress-with-label">
                        <span class="progress-label">剩余积分</span>
                        <ElProgress
                          :percentage="Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)"
                          :color="getProgressColor(Math.round(((key.remaining_credits || 0) / key.total_credits) * 100))"
                          :stroke-width="6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  ElCard,
  ElButton,
  ElTag,
  ElIcon,
  ElProgress,
  ElMessage,
  ElSkeleton,
  ElPagination
} from 'element-plus'
import {
  Key as ElIconKey,
  Plus as ElIconPlus,
  Refresh as ElIconRefresh,
  CopyDocument as ElIconCopyDocument
} from '@element-plus/icons-vue'

interface ApiKey {
  id?: string
  user_key_id: string
  key_name: string
  api_key: string
  is_active: boolean
  usage_count?: number
  last_used_at?: string
  created_at: string
  package_name?: string
  activation_date?: string
  expire_date?: string
  remaining_days?: number
  status?: string
  total_credits?: number
  remaining_credits?: number
}

interface Props {
  apiKeys: ApiKey[]
  loadingKeys: boolean
  keyStats: {
    active: number
  }
}

interface Emits {
  (e: 'refresh-keys'): void
  (e: 'view-usage-history', key: ApiKey): void
  (e: 'reset-credits', key: ApiKey): void
  (e: 'download-config', key: ApiKey): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const keyPagination = reactive({
  current: 1,
  size: 10
})

const filteredKeys = computed(() => props.apiKeys)

const paginatedKeys = computed(() => {
  const start = (keyPagination.current - 1) * keyPagination.size
  const end = start + keyPagination.size
  return filteredKeys.value.slice(start, end)
})

const getProgressColor = (percentage: number) => {
  if (percentage > 50) return '#67c23a'  // 剩余积分多，绿色
  if (percentage > 20) return '#e6a23c'  // 剩余积分中等，橙色
  return '#f56c6c'  // 剩余积分少，红色
}

// 获取状态对应的标签类型
const getStatusType = (status?: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'expired':
      return 'danger'
    case 'inactive':
    default:
      return 'warning'
  }
}

// 获取状态对应的文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'active':
      return '激活'
    case 'expired':
      return '过期'
    case 'inactive':
    default:
      return '未激活'
  }
}

// 获取剩余天数的样式类
const getRemainingDaysClass = (days?: number) => {
  if (days === undefined || days === null) return 'text-muted'
  if (days <= 3) {
    return 'text-danger fw-bold'
  } else if (days <= 7) {
    return 'text-warning fw-bold'
  }
  return 'text-success'
}

// 获取剩余积分的样式类
const getRemainingCreditsClass = (remainingCredits?: number, totalCredits?: number) => {
  if (remainingCredits === undefined || totalCredits === undefined) return 'text-muted'
  if (!totalCredits || totalCredits <= 0) {
    return 'text-muted'
  }

  const percentage = (remainingCredits / totalCredits) * 100

  if (percentage <= 10) {
    return 'text-danger fw-bold'
  } else if (percentage <= 30) {
    return 'text-warning fw-bold'
  }
  return 'text-success'
}

// 检查是否可以重置积分
const canResetCredits = (key: any) => {
  // 检查是否有总积分设置
  if (!key.total_credits || key.total_credits <= 0) {
    return false
  }

  // 检查状态是否为激活
  if (key.status !== 'active') {
    return false
  }

  // 这里可以添加更多检查逻辑，比如今天是否已重置过
  // 但由于前端无法准确判断，主要依赖后端验证
  return true
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

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const handleKeyPageChange = (page: number) => {
  keyPagination.current = page
}

const handleKeySizeChange = (size: number) => {
  keyPagination.size = size
  keyPagination.current = 1
}
</script>