<template>
  <div class="key-activation">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="activation-card">
            <div class="text-center mb-4">
              <h2 class="fw-bold">用户Key激活</h2>
              <p class="text-muted">激活您的用户Key以使用服务</p>
            </div>

            <ElForm
              :model="activationForm"
              :rules="activationRules"
              ref="activationFormRef"
              label-width="120px"
            >
              <ElFormItem label="用户Key" prop="userKey">
                <ElInput
                  v-model="activationForm.userKey"
                  placeholder="请输入要激活的用户Key"
                  size="large"
                  show-password
                />
                <div class="form-help">
                  <small class="text-muted">
                    输入您获得的用户Key，格式如：sk-xxxxxxxx...
                  </small>
                </div>
              </ElFormItem>

              <ElFormItem>
                <ElButton
                  type="primary"
                  size="large"
                  style="width: 100%"
                  :loading="loading"
                  @click="handleActivation"
                >
                  激活用户Key
                </ElButton>
              </ElFormItem>
            </ElForm>

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
                <h4 class="mb-3">用户Key激活成功！</h4>

                <div class="key-info">
                  <p><strong>激活时间:</strong> {{ activatedKeyInfo.activationDate }}</p>
                  <p><strong>用户Key:</strong></p>
                  <ElInput
                    :value="activatedKeyInfo.userKey"
                    readonly
                    class="mb-3"
                  >
                    <template #append>
                      <ElButton @click="copyToClipboard(activatedKeyInfo.userKey)">
                        复制
                      </ElButton>
                    </template>
                  </ElInput>
                </div>

                <ElAlert
                  title="激活成功"
                  type="success"
                  description="您的用户Key已成功激活，现在可以使用服务了"
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
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
  userKey: ''
})

const activatedKeyInfo = reactive({
  userKey: '',
  activationDate: '',
  expireDate: '',
  credits: 0
})

const activationRules = {
  userKey: [
    { required: true, message: '请输入用户Key', trigger: 'blur' },
    { min: 10, message: '用户Key长度不能少于10位', trigger: 'blur' }
  ]
}

// 移除套餐状态检查相关代码

const handleActivation = async () => {
  if (!activationFormRef.value) return

  try {
    await activationFormRef.value.validate()

    loading.value = true

    await request.post('/api/v1/keys/activate-user-key', {
      user_key: activationForm.userKey
    })

    activatedKeyInfo.userKey = activationForm.userKey
    activatedKeyInfo.activationDate = new Date().toLocaleString('zh-CN')

    showSuccessDialog.value = true
    ElMessage.success('用户Key激活成功！')

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

const goToDashboard = () => {
  showSuccessDialog.value = false
  // 激活成功后用户肯定有激活的密钥，直接跳转到控制台
  router.push('/dashboard')
}

// 移除页面加载时的套餐状态检查
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