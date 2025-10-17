<template>
  <div class="dashboard">
    <!-- 移动端侧边栏 -->
    <MobileSidebar
      :show-mobile-sidebar="showMobileSidebar"
      :active-tab="activeTab"
      @close="showMobileSidebar = false"
      @tab-change="setActiveTab"
    />

    <div class="container-fluid">
      <div class="row">
        <!-- 桌面端侧边栏 -->
        <PCSidebar
          :active-tab="activeTab"
          @tab-change="handleTabChange"
        />

        <!-- 主内容区 -->
        <div class="col-12 col-md-9 col-lg-10 main-content">
          <!-- 移动端顶部栏 -->
          <div class="mobile-header d-md-none">
            <button class="mobile-menu-btn" @click="showMobileSidebar = true">
              <i class="fas fa-bars"></i>
            </button>
            <div class="mobile-title">
              {{ getCurrentTabTitle() }}
            </div>
          </div>

          <!-- API密钥管理 -->
          <ApiKeysManagement
            v-if="activeTab === 'keys'"
            :api-keys="apiKeys"
            :loading-keys="loadingKeys"
            :key-stats="keyStats"
            @refresh-keys="refreshKeys"
            @view-usage-history="viewUsageHistory"
            @reset-credits="resetCredits"
            @download-config="downloadConfig"
          />

          <!-- 安装Claude Code -->
          <div v-if="activeTab === 'getting-started'" class="tab-content">
            <h2 class="mb-4">安装Claude Code</h2>

            <!-- 系统要求 -->
            <SystemRequirements />

            <!-- 开发工具安装指南（可折叠） -->
            <ElCollapse v-model="activeCollapseItems" class="mb-4">
              <!-- Node.js安装指南 -->
              <ElCollapseItem name="nodejs" title="📦 Node.js 安装指南">
                <NodeJsInstallation />
              </ElCollapseItem>

              <!-- Git安装指南 -->
              <ElCollapseItem name="git" title="🔧 Git 安装指南">
                <GitInstallation />
              </ElCollapseItem>
            </ElCollapse>

            <!-- Claude Code安装方法 -->
            <ClaudeCodeInstallation />

            <!-- Claude Code安装验证 -->
            <InstallationVerification />


            <!-- 使用指南 -->
            <UsageGuide />

            <!-- VS Code插件安装 -->
            <VSCodeExtension />
          </div>

          <!-- 订阅一览 -->
          <SubscriptionPlans
            v-if="activeTab === 'packages'"
            @day-card-click="handleDayCardClick"
            @week-card-click="handleWeekCardClick"
            @month-card-click="handleMonthCardClick"
          />


          <!-- 推广计划 -->
          <PromotionPlan
            v-if="activeTab === 'promotion'"
            @get-promotion-link="handleGetPromotionLink"
            @view-promotion-rules="handleViewPromotionRules"
          />

          <!-- 使用履历 -->
          <UsageHistory
            v-if="activeTab === 'usage-history'"
            :selected-api-key="selectedApiKey"
            :usage-stats="usageStats"
            :usage-records="usageRecords"
            :loading-usage-records="loadingUsageRecords"
            :usage-pagination="usagePagination"
            @back-to-keys="activeTab = 'keys'"
            @refresh-usage-records="refreshUsageRecords"
            @usage-size-change="handleUsageSizeChange"
            @usage-page-change="handleUsagePageChange"
          />

          <!-- 重置积分确认弹窗 -->
          <ResetCreditsDialog
            v-model="resetCreditsDialogVisible"
            :key-data="resetCreditsKey"
            :loading="resettingCredits"
            @confirm="confirmResetCredits"
            @cancel="handleResetCreditsCancel"
          />

          <!-- 资料中心 -->
          <ResourcesCenter
            v-if="activeTab === 'resources'"
            @go-to-best-practices="goToClaudeCodeBestPractices"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'
import {
  ElMessage,
  ElCollapse,
  ElCollapseItem
} from 'element-plus'
import ResetCreditsDialog from '../components/ResetCreditsDialog.vue'
import ResourcesCenter from '../components/ResourcesCenter.vue'
import PromotionPlan from '../components/PromotionPlan.vue'
import PCSidebar from '../components/dashboard/PCSidebar.vue'
import MobileSidebar from '../components/dashboard/MobileSidebar.vue'
import ApiKeysManagement from '../components/dashboard/ApiKeysManagement.vue'
import SubscriptionPlans from '../components/dashboard/SubscriptionPlans.vue'
import UsageHistory from '../components/dashboard/UsageHistory.vue'
import SystemRequirements from '../components/dashboard/SystemRequirements.vue'
import NodeJsInstallation from '../components/dashboard/NodeJsInstallation.vue'
import ClaudeCodeInstallation from '../components/dashboard/ClaudeCodeInstallation.vue'
import InstallationVerification from '../components/dashboard/InstallationVerification.vue'
import UsageGuide from '../components/dashboard/UsageGuide.vue'
import VSCodeExtension from '../components/dashboard/VSCodeExtension.vue'
import GitInstallation from '../components/dashboard/GitInstallation.vue'
import request from '../utils/request'
import '../styles/dashboard/index.css'

const router = useRouter()

// 控制折叠面板的展开项
const activeCollapseItems = ref<string[]>([])

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

const activeTab = ref('keys')
const apiKeys = ref<ApiKey[]>([])
const filteredKeys = ref<ApiKey[]>([])
const loadingKeys = ref(false)
const selectedApiKey = ref<ApiKey | null>(null)
const showMobileSidebar = ref(false)

// 重置积分弹窗相关
const resetCreditsDialogVisible = ref(false)
const resettingCredits = ref(false)
const resetCreditsKey = ref<ApiKey | null>(null)

const keyStats = reactive({
  active: 0
})



const planInfo = reactive({
  has_active_plan: false,
  plan_type: '免费套餐',
  credits_remaining: 0,
  total_credits: 0,
  usage_percentage: 0
})


// 使用履历相关数据
const usageStats = reactive({
  total_requests: 0,
  total_tokens: 0,
  total_credits_used: 0,
  unique_services: 0
})

const usageRecords = ref<any[]>([])
const availableServices = ref<string[]>([])
const loadingUsageStats = ref(false)
const loadingUsageRecords = ref(false)


const usagePagination = reactive({
  current: 1,
  size: 20,
  total: 0
})




const loadUserKeys = async () => {
  try {
    loadingKeys.value = true
    const response: any = await request.get('/api/v1/keys/')
    apiKeys.value = response.keys || []

    // 更新统计数据
    keyStats.active = apiKeys.value.filter(k => k.status === 'active').length

    filteredKeys.value = apiKeys.value
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
    // 设置默认值确保页面能正常显示
    Object.assign(planInfo, {
      has_active_plan: false,
      plan_type: '无订阅',
      credits_remaining: 0,
      total_credits: 0,
      usage_percentage: 0
    })
    // 不显示错误提示，避免对没有API key的用户造成困扰
  }
}

// 已删除禁用/启用按钮，此函数暂时保留
// const toggleKeyStatus = async (key: any) => {
//   try {
//     await request.put(`/api/v1/keys/${key.id}/toggle`)
//     key.is_active = !key.is_active
//     ElMessage.success(`密钥已${key.is_active ? '启用' : '禁用'}`)
//   } catch (error) {
//     ElMessage.error('操作失败')
//   }
// }



// 重置积分 - 打开确认弹窗
const resetCredits = (key: any) => {
  resetCreditsKey.value = key
  resetCreditsDialogVisible.value = true
}

// 确认重置积分
const confirmResetCredits = async () => {
  if (!resetCreditsKey.value) return

  try {
    resettingCredits.value = true

    // 检查key对象是否有有效的ID
    const keyId = resetCreditsKey.value.id || resetCreditsKey.value.user_key_id
    if (!keyId) {
      ElMessage.error('密钥ID无效，无法重置积分')
      return
    }

    console.log('重置积分请求 - 密钥ID:', keyId)
    const response = await request.put(`/api/v1/keys/${keyId}/reset-credits`)
    console.log('重置积分响应:', response)

    // 重新加载密钥列表以更新显示
    await loadUserKeys()

    // 安全地访问响应数据
    const message = response?.data?.message || '积分重置成功'
    ElMessage.success(message)

    // 关闭弹窗
    resetCreditsDialogVisible.value = false
    resetCreditsKey.value = null
  } catch (error: any) {
    console.error('重置积分失败:', error)

    // 改进错误处理
    let message = '重置失败'
    if (error?.response?.data?.detail) {
      message = error.response.data.detail
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    ElMessage.error(message)
  } finally {
    resettingCredits.value = false
  }
}

// 处理重置积分取消
const handleResetCreditsCancel = () => {
  resetCreditsKey.value = null
}

// 处理获取推广链接
const handleGetPromotionLink = () => {
  ElMessage.info('推广计划功能即将上线，敬请期待！')
}

// 处理查看推广规则
const handleViewPromotionRules = () => {
  ElMessage.info('推广规则功能即将上线，敬请期待！')
}

// 下载设置文件
const downloadConfig = async (key: any) => {
  try {
    // 检查key对象是否有有效的ID
    const keyId = key.id || key.user_key_id
    if (!keyId) {
      ElMessage.error('密钥ID无效，无法下载配置')
      return
    }

    console.log('下载配置请求 - 密钥ID:', keyId)
    const response: any = await request.get(`/api/v1/keys/${keyId}/download-config`)
    console.log('下载配置响应:', response)

    if (response.config && response.filename) {
      // 创建 settings.json
      const settingsBlob = new Blob([JSON.stringify(response.config, null, 2)], {
        type: 'application/json'
      })

      // 创建 config.json - 基于 settings_template.json 的结构
      const configData = {
        primaryApiKey: key.api_key
      }
      const configBlob = new Blob([JSON.stringify(configData, null, 2)], {
        type: 'application/json'
      })

      // 创建ZIP文件
      const zip = new JSZip()
      zip.file('settings.json', settingsBlob)
      zip.file('config.json', configBlob)

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({type: 'blob'})

      // 创建下载链接
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'claude-code-config.zip'
      document.body.appendChild(a)
      a.click()

      // 清理
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      ElMessage.success('配置文件下载成功，包含 settings.json 和 config.json')
    } else {
      ElMessage.error('下载失败：响应数据格式错误')
    }
  } catch (error: any) {
    console.error('下载配置失败:', error)

    // 改进错误处理
    let message = '下载设置文件失败'
    if (error?.response?.data?.detail) {
      message = error.response.data.detail
    } else if (error?.response?.data?.message) {
      message = error.response.data.message
    } else if (error?.message) {
      message = error.message
    }

    ElMessage.error(message)
  }
}

// 新增的密钥管理方法
const refreshKeys = () => {
  loadUserKeys()
}

const goToClaudeCodeBestPractices = () => {
  router.push('/claude-code-best-practices')
}

// 处理订阅卡片点击事件
const handleDayCardClick = () => {
  // 跳转到日卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}

const handleWeekCardClick = () => {
  // 跳转到周卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}

const handleMonthCardClick = () => {
  // 跳转到月卡购买页面
  window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.44016ac2aDwbw4&id=983395304846&categoryId=50023914', '_blank')
}



const viewUsageHistory = (key: any) => {
  // 在同一页面切换到使用履历标签
  activeTab.value = 'usage-history'
  selectedApiKey.value = key

  // 加载使用履历数据
  loadUsageStats()
  loadUsageRecords()
  loadAvailableServices()
}

// 已删除详情按钮，此函数暂时保留
// const viewKeyDetails = (key: any) => {
//   ElMessageBox.alert(
//     `
//     <div>
//       <p><strong>订阅名称:</strong> ${key.package_name || '未知订阅'}</p>
//       <p><strong>API密钥:</strong> ${key.api_key}</p>
//       <p><strong>状态:</strong> ${key.is_active ? '激活' : '禁用'}</p>
//       <p><strong>激活时间:</strong> ${formatDate(key.activation_date)}</p>
//       <p><strong>最后使用:</strong> ${key.last_used_at ? formatDate(key.last_used_at) : '从未使用'}</p>
//     </div>
//     `,
//     '密钥详情',
//     {
//       dangerouslyUseHTMLString: true,
//       confirmButtonText: '关闭'
//     }
//   )
// }



// 使用履历相关方法
const loadUsageStats = async () => {
  if (!selectedApiKey.value) return

  try {
    loadingUsageStats.value = true
    const params: any = {}

    const response: any = await request.get(`/api/v1/usage/stats`, {
      params: {
        api_key: selectedApiKey.value.api_key,
        ...params
      }
    })
    Object.assign(usageStats, response)
  } catch (error) {
    console.error('加载使用统计失败:', error)
    ElMessage.error('加载使用统计失败')
  } finally {
    loadingUsageStats.value = false
  }
}

const loadUsageRecords = async () => {
  if (!selectedApiKey.value) return

  try {
    loadingUsageRecords.value = true
    const params: any = {
      api_key: selectedApiKey.value.api_key,
      page: usagePagination.current,
      page_size: usagePagination.size
    }



    const response: any = await request.get('/api/v1/usage/history', { params })
    usageRecords.value = response.records || []
    usagePagination.total = response.total || 0
  } catch (error) {
    console.error('加载使用记录失败:', error)
    ElMessage.error('加载使用记录失败')
  } finally {
    loadingUsageRecords.value = false
  }
}

const loadAvailableServices = async () => {
  if (!selectedApiKey.value) return

  try {
    const response: any = await request.get('/api/v1/usage/services', {
      params: { api_key: selectedApiKey.value.api_key }
    })
    availableServices.value = response || []
  } catch (error) {
    console.error('加载服务类型失败:', error)
  }
}

// 移动端设置激活标签
const setActiveTab = (tab: string) => {
  activeTab.value = tab
  showMobileSidebar.value = false
}

// 获取当前标签页标题
const getCurrentTabTitle = () => {
  const titles: Record<string, string> = {
    'keys': 'API密钥',
    'getting-started': '安装Claude Code',
    'packages': '订阅一览',
    'promotion': '推广计划',
    'resources': '资料中心',
    'usage-history': '使用履历'
  }
  return titles[activeTab.value] || '控制台'
}

const refreshUsageRecords = () => {
  loadUsageRecords()
}


const handleUsagePageChange = (page: number) => {
  usagePagination.current = page
  loadUsageRecords()
}

const handleUsageSizeChange = (size: number) => {
  usagePagination.size = size
  usagePagination.current = 1
  loadUsageRecords()
}

// 处理标签页切换
const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

onMounted(() => {
  loadUserKeys()
  loadPlanStatus()

  // 检查URL参数中的tab参数
  const urlParams = new URLSearchParams(window.location.search)
  const tabParam = urlParams.get('tab')
  if (tabParam && ['keys', 'getting-started', 'packages', 'promotion', 'resources'].includes(tabParam)) {
    activeTab.value = tabParam
  }
})
</script>

