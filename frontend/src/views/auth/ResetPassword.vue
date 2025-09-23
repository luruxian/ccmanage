<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <!-- 左侧品牌展示区 (桌面端70%) -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h1 class="brand-title">agnets.app</h1>
          </div>

          <div class="brand-slogan">
            <h2>设置新密码</h2>
            <p class="lead">请设置一个安全的新密码</p>
          </div>
        </div>
      </div>

      <!-- 右侧重置密码表单区 (桌面端30%) -->
      <div class="auth-section">
        <div class="auth-card">
          <!-- 主题切换按钮 -->
          <div class="theme-toggle">
            <button @click="toggleTheme" class="theme-btn" :title="themeStore.isDark ? '切换到浅色模式' : '切换到深色模式'">
              <i :class="themeStore.isDark ? 'fas fa-sun' : 'fas fa-moon'"></i>
            </button>
          </div>

          <div class="auth-header">
            <h2 class="auth-title">重置密码</h2>
            <p class="auth-subtitle">为您的账户设置新密码</p>
          </div>

          <!-- 重置成功消息 -->
          <div v-if="resetSuccess" class="success-message">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h3>密码重置成功</h3>
            <p>您的密码已成功重置，现在可以使用新密码登录。</p>
            <ElButton type="primary" @click="goToLogin" class="success-btn">
              前往登录
            </ElButton>
          </div>

          <!-- 重置密码表单 -->
          <ElForm
            v-if="!resetSuccess"
            :model="resetForm"
            :rules="resetRules"
            ref="resetFormRef"
            @submit.prevent="handleResetPassword"
            class="auth-form"
          >
            <ElFormItem prop="email">
              <ElInput
                v-model="resetForm.email"
                placeholder="邮箱地址"
                type="email"
                size="large"
                :prefix-icon="ElIconMessage"
                readonly
              />
              <div class="form-help">
                <small class="text-muted">邮箱地址（不可修改）</small>
              </div>
            </ElFormItem>

            <ElFormItem prop="verification_code">
              <ElInput
                v-model="resetForm.verification_code"
                placeholder="请输入6位验证码"
                type="text"
                size="large"
                :prefix-icon="ElIconKey"
                maxlength="6"
              />
              <div class="form-help">
                <small class="text-muted">请输入邮件中的6位验证码</small>
              </div>
            </ElFormItem>

            <ElFormItem prop="new_password">
              <ElInput
                v-model="resetForm.new_password"
                placeholder="请输入新密码"
                type="password"
                size="large"
                :prefix-icon="ElIconLock"
                show-password
                @input="checkPasswordStrength"
              />
              <!-- 密码强度指示器 -->
              <div v-if="resetForm.new_password" class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="passwordStrength.class"
                    :style="{ width: passwordStrength.width }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrength.class">
                  {{ passwordStrength.text }}
                </span>
              </div>
            </ElFormItem>

            <ElFormItem prop="confirm_password">
              <ElInput
                v-model="resetForm.confirm_password"
                placeholder="请确认新密码"
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
                @click="handleResetPassword"
              >
                重置密码
              </ElButton>
            </ElFormItem>
          </ElForm>

          <div class="auth-footer">
            <router-link to="/login" class="back-link">
              <i class="fas fa-arrow-left"></i>
              返回登录
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
import { Message as ElIconMessage, Lock as ElIconLock, Key as ElIconKey } from '@element-plus/icons-vue'
import { useThemeStore } from '../../store/theme'
import request from '../../utils/request'

const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()

const loading = ref(false)
const resetSuccess = ref(false)
const resetFormRef = ref()

const resetForm = reactive({
  email: '',
  verification_code: '',
  new_password: '',
  confirm_password: ''
})

const passwordStrength = ref({
  width: '0%',
  class: '',
  text: ''
})

// 自定义密码确认验证器
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请确认密码'))
  } else if (value !== resetForm.new_password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verification_code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码必须是6位', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码必须是6位数字', trigger: 'blur' }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    { max: 128, message: '密码长度不能超过128位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 检查密码强度
const checkPasswordStrength = () => {
  const password = resetForm.new_password
  if (!password) {
    passwordStrength.value = { width: '0%', class: '', text: '' }
    return
  }

  let score = 0

  // 长度检查
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // 字符类型检查
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 2) {
    passwordStrength.value = {
      width: '30%',
      class: 'weak',
      text: '弱'
    }
  } else if (score <= 4) {
    passwordStrength.value = {
      width: '60%',
      class: 'medium',
      text: '中等'
    }
  } else {
    passwordStrength.value = {
      width: '100%',
      class: 'strong',
      text: '强'
    }
  }
}

const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    await request.post('/api/v1/auth/password-reset-confirm', {
      email: resetForm.email,
      verification_code: resetForm.verification_code,
      new_password: resetForm.new_password
    })

    resetSuccess.value = true
    ElMessage.success('密码重置成功')

  } catch (error: any) {
    console.error('密码重置失败:', error)

    if (error.response?.status === 400) {
      ElMessage.error('验证码无效或已过期')
    } else if (error.response?.data?.detail) {
      ElMessage.error(error.response.data.detail)
    } else {
      ElMessage.error('重置失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}

const toggleTheme = () => {
  themeStore.toggleTheme()
  themeStore.saveThemePreference()
}

onMounted(() => {
  // 从URL参数获取邮箱和验证码
  const email = route.query.email as string
  const code = route.query.code as string

  if (email) {
    resetForm.email = email
  }

  if (code) {
    resetForm.verification_code = code
  }

  // 如果没有邮箱参数，重定向到忘记密码页面
  if (!email) {
    ElMessage.warning('缺少必要参数，请重新申请密码重置')
    router.push('/forgot-password')
  }
})
</script>

<style scoped>
.reset-password-page {
  height: 100vh;
  background: #f8f9fa;
  overflow: hidden;
}

.reset-password-container {
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

/* 右侧表单区域 (桌面端30%) */
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
  line-height: 1.5;
}

.auth-form {
  margin-bottom: 30px;
}

.auth-form .el-form-item {
  margin-bottom: 24px;
}

.form-help {
  margin-top: 5px;
}

.form-help .text-muted {
  color: #6c757d;
  font-size: 12px;
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak {
  background: #dc3545;
}

.strength-fill.medium {
  background: #ffc107;
}

.strength-fill.strong {
  background: #28a745;
}

.strength-text {
  font-size: 12px;
  font-weight: 600;
  min-width: 30px;
}

.strength-text.weak {
  color: #dc3545;
}

.strength-text.medium {
  color: #ffc107;
}

.strength-text.strong {
  color: #28a745;
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

/* 成功消息样式 */
.success-message {
  text-align: center;
  padding: 30px 20px;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
  margin-bottom: 30px;
}

.success-icon {
  margin-bottom: 20px;
}

.success-icon i {
  font-size: 48px;
  color: #059669;
}

.success-message h3 {
  color: #065f46;
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: 600;
}

.success-message p {
  color: #047857;
  margin-bottom: 20px;
  line-height: 1.6;
}

.success-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.auth-footer {
  text-align: center;
}

.back-link {
  color: #7f8c8d;
  text-decoration: none;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #3498db;
  text-decoration: none;
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
}

/* 移动端适配 (隐藏品牌区域) */
@media (max-width: 768px) {
  .reset-password-container {
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

/* Element Plus组件样式 */
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

/* 只读输入框样式 */
:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f5f5;
  border-color: #dcdfe6;
  cursor: not-allowed;
}

/* Dark Theme Styles */
:global(.dark-theme) .reset-password-page {
  background: #1a1a1a;
}

:global(.dark-theme) .brand-section {
  background: #0f1419;
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

:global(.dark-theme) .form-help .text-muted {
  color: #8b949e;
}

:global(.dark-theme) .strength-bar {
  background: #30363d;
}

:global(.dark-theme) .success-message {
  background: #0d2818;
  border-color: #1e3a2e;
}

:global(.dark-theme) .success-message h3 {
  color: #22c55e;
}

:global(.dark-theme) .success-message p {
  color: #16a34a;
}

:global(.dark-theme) .back-link {
  color: #8b949e;
}

:global(.dark-theme) .back-link:hover {
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

:global(.dark-theme) :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #21262d;
  border-color: #30363d;
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