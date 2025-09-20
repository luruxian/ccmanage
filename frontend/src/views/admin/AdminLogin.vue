<template>
  <div class="admin-login-page">
    <div class="admin-container">
      <div class="admin-card">
        <!-- 头部标识 -->
        <div class="admin-header">
          <div class="admin-logo">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1 class="admin-title">管理员登录</h1>
          <p class="admin-subtitle">CCManage 系统管理中心</p>
        </div>

        <!-- 登录表单 -->
        <ElForm
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          @submit.prevent="handleLogin"
          class="admin-form"
        >
          <ElFormItem prop="username">
            <ElInput
              v-model="loginForm.username"
              placeholder="管理员用户名"
              type="text"
              size="large"
              :prefix-icon="ElIconUser"
            />
          </ElFormItem>

          <ElFormItem prop="password">
            <ElInput
              v-model="loginForm.password"
              placeholder="管理员密码"
              type="password"
              size="large"
              :prefix-icon="ElIconLock"
              show-password
            />
          </ElFormItem>

          <ElFormItem>
            <ElButton
              type="primary"
              size="large"
              class="admin-submit-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录管理中心
            </ElButton>
          </ElFormItem>
        </ElForm>

        <!-- 底部信息 -->
        <div class="admin-footer">
          <p class="warning-text">
            <i class="fas fa-exclamation-triangle"></i>
            仅限授权管理员访问
          </p>
          <router-link to="/login" class="back-link">
            返回用户登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { User as ElIconUser, Lock as ElIconLock } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import request from '../../utils/request'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入管理员用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度为3-50位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_-]+$/, message: '用户名只能包含字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入管理员密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

interface AdminLoginResponse {
  admin: {
    id: number
    username: string
    display_name?: string
    role: string
    is_active: boolean
    last_login_at?: string
    created_at: string
    updated_at: string
  }
  tokens: {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
  }
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const response: AdminLoginResponse = await request.post('/api/v1/admin/login', {
      username: loginForm.username,
      password: loginForm.password
    })

    // 保存管理员信息
    userStore.login({
      id: response.admin.id.toString(),
      name: response.admin.display_name || response.admin.username,
      email: response.admin.username, // 使用用户名作为email字段
      role: response.admin.role,
      token: response.tokens.access_token,
      refreshToken: response.tokens.refresh_token
    })

    ElMessage.success('管理员登录成功')

    // 跳转到管理员控制台
    router.push('/admin/dashboard')

  } catch (error: any) {
    console.error('管理员登录失败:', error)

    if (error.response?.status === 401) {
      ElMessage.error('用户名或密码错误')
    } else if (error.response?.status === 403) {
      ElMessage.error('账户已被禁用')
    } else if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.admin-container {
  width: 100%;
  max-width: 450px;
}

.admin-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.admin-header {
  text-align: center;
  margin-bottom: 40px;
}

.admin-logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.admin-logo i {
  font-size: 32px;
  color: white;
}

.admin-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.admin-subtitle {
  color: #7f8c8d;
  font-size: 1rem;
  margin: 0;
}

.admin-form {
  margin-bottom: 30px;
}

.admin-form .el-form-item {
  margin-bottom: 24px;
}

.admin-submit-btn {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.admin-submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.admin-footer {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.warning-text {
  color: #e74c3c;
  font-size: 14px;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.warning-text i {
  font-size: 16px;
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Element Plus样式覆盖 */
:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #667eea;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.el-input__inner) {
  height: 50px;
  font-size: 15px;
}

/* 移动端适配 */
@media (max-width: 480px) {
  .admin-login-page {
    padding: 10px;
  }

  .admin-card {
    padding: 30px 20px;
  }

  .admin-title {
    font-size: 1.5rem;
  }
}

/* 深色主题支持 */
:global(.dark-theme) .admin-card {
  background: rgba(22, 27, 34, 0.95);
  border: 1px solid rgba(48, 54, 61, 0.3);
}

:global(.dark-theme) .admin-title {
  color: #f0f6fc;
}

:global(.dark-theme) .admin-subtitle {
  color: #8b949e;
}

:global(.dark-theme) .admin-footer {
  border-top-color: #30363d;
}

:global(.dark-theme) :deep(.el-input__wrapper) {
  background: #0d1117;
  border-color: #30363d;
}

:global(.dark-theme) :deep(.el-input__inner) {
  background: transparent;
  color: #f0f6fc;
}
</style>