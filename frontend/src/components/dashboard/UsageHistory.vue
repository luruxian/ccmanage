<template>
  <div class="tab-content">
    <div class="usage-history-section">
      <!-- 返回按钮 -->
      <div class="usage-header mb-4">
        <ElButton @click="$emit('back-to-keys')" type="text" class="back-btn">
          <ElIcon><ElIconArrowLeft /></ElIcon>
          返回API密钥管理
        </ElButton>
        <h2>使用履历</h2>
      </div>

      <!-- API Key基本信息 -->
      <ElCard class="mb-4" v-if="selectedApiKey">
        <template #header>
          <h4>
            <ElIcon><ElIconKey /></ElIcon>
            API密钥信息
          </h4>
        </template>
        <ElDescriptions :column="2" border>
          <ElDescriptionsItem label="订阅名称">
            {{ selectedApiKey.package_name || '未知订阅' }}
          </ElDescriptionsItem>
          <ElDescriptionsItem label="API密钥">
            <code class="api-key-display">{{ maskApiKey(selectedApiKey.api_key) }}</code>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="状态">
            <ElTag :type="selectedApiKey.is_active ? 'success' : 'danger'">
              {{ selectedApiKey.is_active ? '激活' : '禁用' }}
            </ElTag>
          </ElDescriptionsItem>
          <ElDescriptionsItem label="激活时间">
            {{ formatDate(selectedApiKey.activation_date) }}
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 使用记录 -->
      <ElCard>
        <template #header>
          <div class="d-flex justify-content-between align-items-center">
            <div class="records-header-info">
              <h4>
                <ElIcon><ElIconList /></ElIcon>
                使用记录
              </h4>
              <div class="total-requests-badge">
                <div class="badge-content">
                  <span class="badge-icon">
                    <ElIcon><ElIconTrendCharts /></ElIcon>
                  </span>
                  <div class="badge-text">
                    <span class="badge-label">总请求次数</span>
                    <span class="badge-value">{{ usageStats.total_requests || 0 }}</span>
                  </div>
                </div>
              </div>
            </div>
            <ElButton @click="$emit('refresh-usage-records')" :loading="loadingUsageRecords">
              <ElIcon><ElIconRefresh /></ElIcon>
              刷新
            </ElButton>
          </div>
        </template>

        <div v-if="loadingUsageRecords" class="text-center py-4">
          <ElSkeleton :rows="5" animated />
        </div>

        <div v-else>
          <ElTable :data="usageRecords" style="width: 100%">
            <ElTableColumn prop="request_timestamp" label="请求时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.request_timestamp) }}
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
                      :class="getUsageRecordRemainingCreditsClass(scope.row.remaining_credits)">
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
            <ElTableColumn prop="service" label="服务类型" width="200">
              <template #default="scope">
                <ElTag type="info" size="small">
                  {{ scope.row.service }}
                </ElTag>
              </template>
            </ElTableColumn>
          </ElTable>

          <!-- 分页 -->
          <div v-if="usageRecords.length > 0" class="pagination-wrapper">
            <ElPagination
              v-model:current-page="usagePagination.current"
              v-model:page-size="usagePagination.size"
              :page-sizes="[10, 20, 50]"
              :total="usagePagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="$emit('usage-size-change', $event)"
              @current-change="$emit('usage-page-change', $event)"
            />
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ElCard,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTag,
  ElIcon,
  ElSkeleton,
  ElPagination,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus'
import {
  Key as ElIconKey,
  Refresh as ElIconRefresh,
  List as ElIconList,
  TrendCharts as ElIconTrendCharts,
  ArrowLeft as ElIconArrowLeft
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
  selectedApiKey: ApiKey | null
  usageStats: {
    total_requests: number
    total_tokens: number
    total_credits_used: number
    unique_services: number
  }
  usageRecords: any[]
  loadingUsageRecords: boolean
  usagePagination: {
    current: number
    size: number
    total: number
  }
}

interface Emits {
  (e: 'back-to-keys'): void
  (e: 'refresh-usage-records'): void
  (e: 'usage-size-change', size: number): void
  (e: 'usage-page-change', page: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取使用记录剩余积分样式类（仅基于剩余积分值）
const getUsageRecordRemainingCreditsClass = (remainingCredits: number) => {
  if (remainingCredits <= 0) return 'text-danger'
  if (remainingCredits <= 10) return 'text-warning'
  return 'text-success'
}

const maskApiKey = (apiKey: string) => {
  if (!apiKey) return '-'
  if (apiKey.length <= 8) return apiKey
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4)
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}
</script>