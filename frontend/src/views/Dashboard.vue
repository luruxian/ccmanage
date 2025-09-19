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
              <router-link to="/key-activation" class="btn btn-primary">
                <ElIcon><ElIconPlus /></ElIcon>
                激活新密钥
              </router-link>
            </div>

            <ElCard>
              <ElTable :data="apiKeys" stripe>
                <ElTableColumn prop="key_name" label="密钥名称" />
                <ElTableColumn prop="api_key" label="自定义密钥" show-overflow-tooltip />
                <ElTableColumn prop="is_active" label="状态">
                  <template #default="scope">
                    <ElTag :type="scope.row.is_active ? 'success' : 'danger'">
                      {{ scope.row.is_active ? '激活' : '禁用' }}
                    </ElTag>
                  </template>
                </ElTableColumn>
                <ElTableColumn prop="last_used_at" label="最后使用时间" />
                <ElTableColumn label="操作" width="200">
                  <template #default="scope">
                    <ElButton
                      :type="scope.row.is_active ? 'warning' : 'success'"
                      size="small"
                      @click="toggleKeyStatus(scope.row)"
                    >
                      {{ scope.row.is_active ? '禁用' : '启用' }}
                    </ElButton>
                    <ElButton
                      type="danger"
                      size="small"
                      @click="deleteKey(scope.row)"
                    >
                      删除
                    </ElButton>
                  </template>
                </ElTableColumn>
              </ElTable>
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
  ElMessageBox
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
  Timer as ElIconTimer
} from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'
import request from '../utils/request'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('overview')
const apiKeys = ref([])
const stats = reactive({
  totalKeys: 0,
  totalRequests: 0,
  creditsRemaining: 0,
  planDaysLeft: 0
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
    const response = await request.get('/api/v1/keys/')
    apiKeys.value = response.data.keys
    stats.totalKeys = response.data.total
  } catch (error) {
    console.error('获取密钥列表失败:', error)
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
</style>