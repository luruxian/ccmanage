<template>
  <div class="key-activation">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="activation-card">
            <div class="text-center mb-4">
              <h2 class="fw-bold">API密钥激活</h2>
              <p class="text-muted">激活您的自定义API密钥</p>
            </div>

            <!-- 套餐状态检查 -->
            <ElAlert
              v-if="!planInfo.has_active_plan"
              title="需要激活套餐"
              type="warning"
              description="您需要先购买套餐才能激活API密钥"
              show-icon
              :closable="false"
              class="mb-4"
            />

            <ElForm
              :model="activationForm"
              :rules="activationRules"
              ref="activationFormRef"
              label-width="120px"
              v-if="planInfo.has_active_plan"
            >
              <ElFormItem label="密钥名称" prop="keyName">
                <ElInput
                  v-model="activationForm.keyName"
                  placeholder="为您的密钥起个名字"
                  size="large"
                />
              </ElFormItem>

              <ElFormItem label="自定义密钥" prop="customApiKey">
                <ElInput
                  v-model="activationForm.customApiKey"
                  placeholder="输入您的自定义API密钥"
                  size="large"
                  show-password
                />
                <div class="form-help">
                  <small class="text-muted">
                    这将是您在应用中使用的密钥，请妥善保管
                  </small>
                </div>
              </ElFormItem>

              <ElFormItem label="真实密钥" prop="realApiKey">
                <ElInput
                  v-model="activationForm.realApiKey"
                  placeholder="输入真实的API密钥"
                  size="large"
                  show-password
                />
                <div class="form-help">
                  <small class="text-muted">
                    这是您从API提供商处获得的真实密钥
                  </small>
                </div>
              </ElFormItem>

              <ElFormItem label="描述" prop="description">
                <ElInput
                  v-model="activationForm.description"
                  type="textarea"
                  :rows="3"
                  placeholder="密钥用途描述（可选）"
                />
              </ElFormItem>

              <ElFormItem>
                <ElButton
                  type="primary"
                  size="large"
                  style="width: 100%"
                  :loading="loading"
                  @click="handleActivation"
                >
                  激活密钥
                </ElButton>
              </ElFormItem>
            </ElForm>

            <!-- 套餐信息 -->
            <ElCard class="plan-info-card mt-4">
              <template #header>
                <h5>当前套餐状态</h5>
              </template>
              <div class="plan-details">
                <div class="detail-item">
                  <span>套餐类型:</span>
                  <ElTag :type="planInfo.has_active_plan ? 'success' : 'warning'">
                    {{ planInfo.plan_type }}
                  </ElTag>
                </div>
                <div class="detail-item">
                  <span>剩余积分:</span>
                  <strong>{{ planInfo.credits_remaining }}</strong>
                </div>
                <div class="detail-item">
                  <span>总积分:</span>
                  <strong>{{ planInfo.total_credits }}</strong>
                </div>
                <div class="detail-item">
                  <span>使用率:</span>
                  <ElProgress
                    :percentage="planInfo.usage_percentage"
                    :color="getProgressColor(planInfo.usage_percentage)"
                    style="width: 200px;"
                  />
                </div>
              </div>
            </ElCard>

            <div class="text-center mt-4">
              <router-link to="/dashboard" class="btn btn-outline-primary">
                返回控制台
              </router-link>
            </div>

            <!-- 激活成功对话框 -->
            <ElDialog
              v-model="showSuccessDialog"
              title="激活成功"
              width="500px"
              :show-close="false"
              :close-on-click-modal="false"
            >
              <div class="text-center">
                <ElIcon size="60" color="#67c23a" class="mb-3">
                  <ElIconCircleCheck />
                </ElIcon>
                <h4 class="mb-3">API密钥激活成功！</h4>

                <div class="key-info">
                  <p><strong>密钥名称:</strong> {{ activatedKeyInfo.keyName }}</p>
                  <p><strong>自定义密钥:</strong></p>
                  <ElInput
                    :value="activatedKeyInfo.customApiKey"
                    readonly
                    class="mb-3"
                  >
                    <template #append>
                      <ElButton @click="copyToClipboard(activatedKeyInfo.customApiKey)">
                        复制
                      </ElButton>
                    </template>
                  </ElInput>
                </div>

                <ElAlert
                  title="请妥善保管您的密钥"
                  type="warning"
                  description="密钥一旦丢失将无法找回，请务必保存在安全的地方"
                  show-icon
                  :closable="false"
                />
              </div>

              <template #footer>
                <ElButton type="primary" @click="goToDashboard">
                  前往管理
                </ElButton>
              </template>
            </ElDialog>
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
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElCard,
  ElTag,
  ElProgress,
  ElAlert,
  ElDialog,
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  CircleCheck as ElIconCircleCheck
} from '@element-plus/icons-vue'
import request from '../utils/request'

const router = useRouter()

const loading = ref(false)
const showSuccessDialog = ref(false)
const activationFormRef = ref()

const activationForm = reactive({
  keyName: '',
  customApiKey: '',
  realApiKey: '',
  description: ''
})

const activatedKeyInfo = reactive({
  keyName: '',
  customApiKey: ''
})

const planInfo = reactive({
  has_active_plan: false,
  plan_type: '免费套餐',
  credits_remaining: 0,
  total_credits: 0,
  usage_percentage: 0
})

const activationRules = {
  keyName: [
    { required: true, message: '请输入密钥名称', trigger: 'blur' },
    { min: 2, max: 50, message: '密钥名称长度为2-50字符', trigger: 'blur' }
  ],
  customApiKey: [
    { required: true, message: '请输入自定义API密钥', trigger: 'blur' },
    { min: 10, message: '自定义密钥长度不能少于10位', trigger: 'blur' }
  ],
  realApiKey: [
    { required: true, message: '请输入真实API密钥', trigger: 'blur' },
    { min: 10, message: '真实密钥长度不能少于10位', trigger: 'blur' }
  ]
}

const loadPlanStatus = async () => {
  try {
    const response = await request.get('/api/v1/keys/plan-status')
    Object.assign(planInfo, response)
  } catch (error) {
    console.error('获取套餐状态失败:', error)
    ElMessage.error('获取套餐状态失败')
  }
}

const handleActivation = async () => {
  if (!activationFormRef.value) return

  try {
    await activationFormRef.value.validate()

    if (!planInfo.has_active_plan) {
      ElMessage.warning('请先购买套餐')
      return
    }

    loading.value = true

    const response = await request.post('/api/v1/keys/activate', {
      custom_api_key: activationForm.customApiKey,
      real_api_key: activationForm.realApiKey,
      key_name: activationForm.keyName,
      description: activationForm.description
    })

    activatedKeyInfo.keyName = response.data.key_name
    activatedKeyInfo.customApiKey = response.data.custom_api_key

    showSuccessDialog.value = true

    // 重置表单
    activationFormRef.value.resetFields()

  } catch (error: any) {
    console.error('激活失败:', error)

    if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('激活失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const goToDashboard = () => {
  showSuccessDialog.value = false
  router.push('/dashboard')
}

onMounted(() => {
  loadPlanStatus()
})
</script>

<style scoped>
.key-activation {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 50px 0;
}

.activation-card {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.form-help {
  margin-top: 5px;
}

.plan-info-card {
  margin-top: 20px;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item span {
  color: #666;
}

.key-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.btn-outline-primary {
  border: 1px solid #409eff;
  color: #409eff;
  background: transparent;
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s;
}

.btn-outline-primary:hover {
  background: #409eff;
  color: white;
}
</style>