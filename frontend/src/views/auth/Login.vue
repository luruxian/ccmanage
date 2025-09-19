<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌展示区 (桌面端70%) -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <i class="fas fa-key"></i>
            </div>
            <h1 class="brand-title">CCManage</h1>
          </div>

          <div class="brand-slogan">
            <h2>欢迎回来</h2>
            <p class="lead">安全、高效的API密钥管理平台</p>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区 (桌面端30%) -->
      <div class="auth-section">
        <div class="auth-card">
          <!-- 主题切换按钮 -->
          <div class="theme-toggle">
            <button @click="toggleTheme" class="theme-btn" :title="themeStore.isDark ? '切换到浅色模式' : '切换到深色模式'">
              <i :class="themeStore.isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </div>

          <div class="auth-header">
            <h2 class="auth-title">欢迎回来</h2>
            <p class="auth-subtitle">登录到您的CCManage账户</p>
          </div>

          <ElForm
            :model="loginForm"
            :rules="loginRules"
            ref="loginFormRef"
            @submit.prevent="handleLogin"
            class="auth-form"
          >
            <ElFormItem prop="email">
              <ElInput
                v-model="loginForm.email"
                placeholder="邮箱地址"
                type="email"
                size="large"
                :prefix-icon="ElIconUser"
              />
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                v-model="loginForm.password"
                placeholder="密码"
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
                class="auth-submit-btn"
                :loading="loading"
                @click="handleLogin"
              >
                登录
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div class="auth-footer">
            <p class="auth-link">
              还没有账户？
              <router-link to="/register" class="link-primary">立即注册</router-link>
            </p>
            <router-link to="/forgot-password" class="link-muted">
              忘记密码？
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import { User as ElIconUser, Lock as ElIconLock } from '@element-plus/icons-vue'
import { useUserStore } from '../../store/user'
import { useThemeStore } from '../../store/theme'
import request from '../../utils/request'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const themeStore = useThemeStore()

const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  email: '',
  password: ''
})

const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 定义登录响应的类型
interface LoginResponse {
  user: {
    user_id: string
    email: string
    phone?: string
    is_active: boolean
    is_email_verified: boolean
    last_login_at?: string
    created_at: string
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

    const response: LoginResponse = await request.post('/api/v1/auth/login', {
      email: loginForm.email,
      password: loginForm.password
    })

    // 保存用户信息和token
    userStore.login({
      id: response.user.user_id,
      name: response.user.email,
      email: response.user.email,
      token: response.tokens.access_token,
      refreshToken: response.tokens.refresh_token
    })

    ElMessage.success('登录成功')

    // 跳转到控制台
    router.push('/dashboard')

  } catch (error: any) {
    console.error('登录失败:', error)

    if (error.response?.status === 401) {
      ElMessage.error('邮箱或密码错误')
    } else if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  themeStore.saveThemePreference()
}

onMounted(() => {
  themeStore.initializeTheme()

  // 从URL参数获取邮箱（验证成功后传递）
  const email = route.query.email as string
  const verified = route.query.verified as string

  if (email) {
    loginForm.email = email

    if (verified === 'true') {
      ElMessage.success('邮箱验证成功！请输入密码登录')
    }
  }
})
</script>

<style scoped>
.login-page {
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
}

.login-container {
  display: flex;
  height: 100vh;
}

/* 左侧品牌区域 (桌面端70%) */
.brand-section {
  flex: 0 0 70%;
  background: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: white;
  position: relative;
}

.brand-content {
  text-align: center;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.brand-logo {
  margin-bottom: 40px;
}

.logo-icon {
  width: 120px;
  height: 120px;
  background: #34495e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  border: 3px solid #3498db;
}

.logo-icon i {
  font-size: 48px;
  color: #3498db;
}

.brand-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -1px;
  color: white;
}

.brand-slogan {
  margin-bottom: 0;
}

.brand-slogan h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ecf0f1;
}

.brand-slogan .lead {
  font-size: 1.25rem;
  color: #bdc3c7;
  font-weight: 300;
}


/* 右侧登录区域 (桌面端30%) */
.auth-section {
  flex: 0 0 30%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
}

.auth-card {
  width: 100%;
  max-width: 400px;
  position: relative;
}

/* 主题切换按钮 */
.theme-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f8f9fa;
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.theme-btn:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.theme-btn i {
  font-size: 16px;
}

.auth-header {
  text-align: center;
  margin-bottom: 40px;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.auth-subtitle {
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
}

.auth-form {
  margin-bottom: 30px;
}

.auth-form .el-form-item {
  margin-bottom: 24px;
}

.auth-submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: #3498db;
  border: none;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
  transition: all 0.3s ease;
}

.auth-submit-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 152, 219, 0.5);
}

.auth-footer {
  text-align: center;
}

.auth-link {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.link-primary {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-primary:hover {
  color: #2980b9;
  text-decoration: underline;
}

.link-muted {
  color: #95a5a6;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.3s ease;
}

.link-muted:hover {
  color: #3498db;
  text-decoration: underline;
}

/* 平板端适配 (768px - 1024px) */
@media (max-width: 1024px) {
  .brand-section {
    flex: 0 0 60%;
    padding: 40px;
  }

  .auth-section {
    flex: 0 0 40%;
    padding: 40px 30px;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-slogan h2 {
    font-size: 1.5rem;
  }

  .feature-item {
    padding: 20px;
    margin-bottom: 30px;
  }
}

/* 移动端适配 (隐藏品牌区域) */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .brand-section {
    display: none;
  }

  .auth-section {
    flex: 1;
    min-height: 100vh;
    padding: 40px 20px;
    background: #f8f9fa;
    box-shadow: none;
  }

  .auth-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 40px 30px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid #e1e8ed;
  }

  .auth-title {
    color: #2c3e50;
  }

  .auth-subtitle {
    color: #5a6c7d;
  }
}

/* 小屏移动端 */
@media (max-width: 480px) {
  .auth-section {
    padding: 20px 15px;
  }

  .auth-card {
    padding: 30px 20px;
  }

  .auth-title {
    font-size: 1.5rem;
  }
}

/* 确保Element Plus组件样式 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e1e8ed;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: #3498db;
  box-shadow: 0 2px 12px rgba(52, 152, 219, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

:deep(.el-input__inner) {
  height: 48px;
  font-size: 15px;
}

:deep(.el-form-item__error) {
  margin-top: 8px;
}

/* Dark Theme Styles */
:global(.dark-theme) .login-page {
  background: #1a1a1a;
}

:global(.dark-theme) .brand-section {
  background: #0f1419;
}

:global(.dark-theme) .brand-title {
  color: #ffffff;
}

:global(.dark-theme) .brand-slogan h2 {
  color: #e1e8ed;
}

:global(.dark-theme) .brand-slogan .lead {
  color: #8b949e;
}


:global(.dark-theme) .auth-section {
  background: #161b22;
  box-shadow: -10px 0 30px rgba(0,0,0,0.3);
}

:global(.dark-theme) .auth-card {
  background: #0d1117;
  border: 1px solid #30363d;
}

:global(.dark-theme) .theme-btn {
  background: #21262d;
  color: #f0f6fc;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

:global(.dark-theme) .theme-btn:hover {
  background: #30363d;
}

:global(.dark-theme) .auth-title {
  color: #f0f6fc;
}

:global(.dark-theme) .auth-subtitle {
  color: #8b949e;
}

:global(.dark-theme) .auth-link {
  color: #8b949e;
}

:global(.dark-theme) .link-primary {
  color: #58a6ff;
}

:global(.dark-theme) .link-primary:hover {
  color: #79c0ff;
}

:global(.dark-theme) .link-muted {
  color: #6e7681;
}

:global(.dark-theme) .link-muted:hover {
  color: #58a6ff;
}

:global(.dark-theme) .auth-submit-btn {
  background: #238636;
  box-shadow: 0 4px 15px rgba(35, 134, 54, 0.4);
}

:global(.dark-theme) .auth-submit-btn:hover {
  background: #2ea043;
  box-shadow: 0 6px 20px rgba(35, 134, 54, 0.5);
}

/* Dark theme Element Plus overrides */
:global(.dark-theme) :deep(.el-input__wrapper) {
  background: #0d1117;
  border-color: #30363d;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

:global(.dark-theme) :deep(.el-input__wrapper:hover) {
  border-color: #58a6ff;
  box-shadow: 0 2px 12px rgba(88, 166, 255, 0.15);
}

:global(.dark-theme) :deep(.el-input__wrapper.is-focus) {
  border-color: #58a6ff;
  box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2);
}

:global(.dark-theme) :deep(.el-input__inner) {
  background: transparent;
  color: #f0f6fc;
}

:global(.dark-theme) :deep(.el-input__inner::placeholder) {
  color: #6e7681;
}

/* Mobile dark theme adjustments */
@media (max-width: 768px) {
  :global(.dark-theme) .auth-section {
    background: #0d1117;
  }

  :global(.dark-theme) .auth-card {
    background: #161b22;
    border: 1px solid #30363d;
  }
}
</style>